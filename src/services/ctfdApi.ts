/// <reference types="vite/client" />

interface PaginationMeta {
  page?: number;
  pages?: number;
  per_page?: number;
  total?: number;
  next?: string | null;
  prev?: string | null;
}

interface CTFdResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    [key: string]: unknown;
  };
}

interface Challenge {
  id: number;
  name: string;
  description: string;
  category: string;
  value: number;
  solved_by_me: boolean;
  requirements?: number[];
  solves?: number;
  type?: string;
  state?: string;
  max_attempts?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  score: number;
  place: number;
  team_id?: number | null;
}

interface Team {
  id: number;
  name: string;
  score: number;
  place: number;
  members?: Array<TeamMember | number>;
  members_count?: number;
  captain_id?: number;
  captain?: TeamMember | number | null;
  website?: string | null;
  affiliation?: string | null;
  country?: string | null;
  created?: string;
  hidden?: boolean;
  banned?: boolean;
}

interface TeamMember {
  id: number;
  name: string;
  email?: string;
  score?: number;
}

interface TeamSettingsUpdate {
  name?: string;
  password?: string;
  confirm?: string;
  website?: string;
  affiliation?: string;
  country?: string;
}

interface TeamInviteToken {
  token: string;
  url?: string;
}

interface ScoreboardEntry {
  account_id: number;
  name: string;
  score: number;
  place: number;
}

interface Token {
  id: number;
  value: string;
  description: string;
  created: string;
  expiration: string | null;
}

interface UserSolve {
  challenge_id?: number;
  challenge?: {
    id?: number;
    name?: string;
    category?: string;
    value?: number;
  };
  value?: number;
  date?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isDev = (import.meta as any).env?.DEV === true;
const debugLog = (...args: unknown[]) => {
  if (isDev) {
    console.log(...args);
  }
};

const debugWarn = (...args: unknown[]) => {
  if (isDev) {
    console.warn(...args);
  }
};

class CTFdAPI {
  private baseURL = "/api/v1";
  private csrfToken: string | null = null;

  private setCSRFToken(token: string | null): void {
    this.csrfToken = token;
    (window as any).init = (window as any).init || {};
    if (token) {
      (window as any).init.csrfNonce = token;
    }
  }

  private async getNonce(): Promise<string | null> {
    try {
      const response = await fetch("/", {
        method: "GET",
        credentials: "include",
      });
      const html = await response.text();
      const nonceMatch = html.match(/csrfNonce:\s*"([^"]+)"/);
      if (nonceMatch && nonceMatch[1]) {
        this.setCSRFToken(nonceMatch[1]);
        return nonceMatch[1];
      }
    } catch (error) {
      debugWarn("[ctfdApi] Failed to fetch fresh nonce:", error);
    }

    const fallback = (window as any).init?.csrfNonce || this.csrfToken || null;
    if (fallback) {
      this.setCSRFToken(fallback);
    }
    return fallback;
  }

  private async requestWebForm<T>(
    endpoint: string,
    data: Record<string, string>,
  ): Promise<CTFdResponse<T>> {
    const nonce = (await this.getNonce()) || "";
    const formData = new URLSearchParams();

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim().length > 0) {
        formData.append(key, value);
      }
    });

    if (nonce) {
      formData.append("nonce", nonce);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
      credentials: "include",
    });

    if (!response.ok && !response.redirected) {
      const text = await response.text();
      const errorMatch =
        text.match(/class="alert[^"]*alert-danger[^"]*"[^>]*>([^<]+)/i) ||
        text.match(/error[^>]*>([^<]+)/i);

      throw new Error(
        errorMatch?.[1]?.trim() ||
          `Request failed: ${response.status} ${response.statusText}`,
      );
    }

    return {
      success: true,
      data: {} as T,
    };
  }

  private async requestSettingsForm<T>(
    data: Record<string, string>,
  ): Promise<CTFdResponse<T>> {
    return this.requestWebForm<T>("/settings", data);
  }

  private normalizeTokenFromData(data: unknown): string | null {
    if (typeof data === "string" && data.trim().length > 0) {
      return data.trim();
    }

    if (Array.isArray(data)) {
      for (const item of data) {
        const fromItem = this.normalizeTokenFromData(item);
        if (fromItem) {
          return fromItem;
        }
      }
      return null;
    }

    if (data && typeof data === "object") {
      const candidateKeys = [
        "token",
        "value",
        "code",
        "invite",
        "invite_token",
      ];
      for (const key of candidateKeys) {
        const value = (data as Record<string, unknown>)[key];
        if (typeof value === "string" && value.trim().length > 0) {
          return value.trim();
        }
      }
    }

    return null;
  }

  private buildInviteUrl(token: string): string {
    return `${window.location.origin}/team?invite=${encodeURIComponent(token)}`;
  }

  private normalizeConfigMap(data: unknown): Record<string, unknown> {
    if (Array.isArray(data)) {
      return data.reduce<Record<string, unknown>>((acc, entry) => {
        if (entry && typeof entry === "object") {
          const key =
            "key" in entry
              ? entry.key
              : "name" in entry
                ? entry.name
                : undefined;
          const value = "value" in entry ? entry.value : undefined;
          if (typeof key === "string") {
            acc[key] = value;
          }
        }
        return acc;
      }, {});
    }

    if (data && typeof data === "object") {
      return data as Record<string, unknown>;
    }

    return {};
  }

  private async verifyTeamModeEnabled(): Promise<void> {
    const configResponse = await this.getConfig().catch(() => null);
    const config = this.normalizeConfigMap(configResponse?.data);

    const explicitTeamMode = config.team_mode;
    if (typeof explicitTeamMode === "boolean" && !explicitTeamMode) {
      throw new Error("Team mode is disabled in CTFd config.");
    }

    const rawMode = String(
      config.user_mode ?? config.team_mode ?? "",
    ).toLowerCase();
    if (rawMode && rawMode !== "teams" && rawMode !== "team") {
      throw new Error("CTFd is not running in team mode.");
    }
  }

  private async verifyTeamPermissions(teamId: number): Promise<void> {
    const meResponse = await this.getCurrentUser();
    const me = meResponse.data;

    if (!me?.id) {
      throw new Error("You must be authenticated to manage team invites.");
    }

    if (me.team_id !== teamId) {
      throw new Error("You can only generate invites for your own team.");
    }

    const teamResponse = await this.getTeam(teamId);
    const team = teamResponse.data;
    const captainId =
      typeof team?.captain_id === "number"
        ? team.captain_id
        : typeof team?.captain === "number"
          ? team.captain
          : team?.captain &&
              typeof team.captain === "object" &&
              typeof team.captain.id === "number"
            ? team.captain.id
            : null;

    if (captainId !== null && captainId !== me.id) {
      throw new Error("Only the team captain can generate invite tokens.");
    }
  }

  private async verifyInviteEndpointPath(
    teamId: number,
    nonce: string | null,
  ): Promise<string | null> {
    const candidatePaths = [
      `/teams/${teamId}/invites`,
      `/teams/${teamId}/invite`,
      `/teams/${teamId}/tokens`,
    ];

    for (const path of candidatePaths) {
      try {
        const response = await fetch(`${this.baseURL}${path}`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(nonce
              ? {
                  "CSRF-Token": nonce,
                  "X-CSRF-Token": nonce,
                }
              : {}),
          },
          body: JSON.stringify(nonce ? { nonce } : {}),
        });

        if (response.status === 404) {
          continue;
        }

        return path;
      } catch {
        continue;
      }
    }

    return null;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<CTFdResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    let nonce = (window as any).init?.csrfNonce || this.csrfToken;

    const buildHeaders = (currentNonce: string | null) => {
      const merged: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
      };

      if (currentNonce) {
        merged["CSRF-Token"] = currentNonce;
        merged["X-CSRF-Token"] = currentNonce;
      }

      return merged;
    };

    debugLog(`[ctfdApi] ${options.method || "GET"} ${endpoint}`, {
      hasCSRF: !!nonce,
      headers: Object.keys(buildHeaders(nonce)),
      url: url,
    });

    try {
      let response = await fetch(url, {
        ...options,
        headers: buildHeaders(nonce),
        credentials: "include",
      });

      if (response.status === 403 && endpoint !== "/users/me") {
        const freshNonce = await this.getNonce();
        const canRetry = Boolean(freshNonce && freshNonce !== nonce);

        if (canRetry) {
          nonce = freshNonce;
          response = await fetch(url, {
            ...options,
            headers: buildHeaders(nonce),
            credentials: "include",
          });
        }
      }

      if (!response.ok) {
        // Try to get error details from response body
        let errorData;
        try {
          errorData = await response.json();
          if (
            !(
              (endpoint === "/users/me" && response.status === 403) ||
              (endpoint === "/configs" && response.status === 403)
            )
          ) {
            console.error(
              `[ctfdApi] Request failed: ${response.status} ${response.statusText}`,
              errorData,
            );
          }
        } catch {
          if (
            !(
              (endpoint === "/users/me" && response.status === 403) ||
              (endpoint === "/configs" && response.status === 403)
            )
          ) {
            console.error(
              `[ctfdApi] Request failed: ${response.status} ${response.statusText}`,
            );
          }
        }
        throw new Error(
          `API request failed: ${response.status}${errorData ? ": " + JSON.stringify(errorData) : ""}`,
        );
      }

      const data = await response.json();
      debugLog(`[ctfdApi] ${endpoint} success:`, data.success);
      return data;
    } catch (error) {
      console.error(`[ctfdApi] Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Challenges
  async getChallenges(): Promise<CTFdResponse<Challenge[]>> {
    return this.request<Challenge[]>("/challenges");
  }

  async getChallenge(id: number): Promise<CTFdResponse<Challenge>> {
    return this.request<Challenge>(`/challenges/${id}`);
  }

  async submitFlag(
    challengeId: number,
    submission: string,
  ): Promise<CTFdResponse<any>> {
    debugLog("[ctfdApi] Submitting flag for challenge:", challengeId);
    return this.request("/challenges/attempt", {
      method: "POST",
      body: JSON.stringify({
        challenge_id: challengeId,
        submission: submission,
      }),
    });
  }

  // Scoreboard
  async getScoreboard(): Promise<CTFdResponse<ScoreboardEntry[]>> {
    return this.request<ScoreboardEntry[]>("/scoreboard");
  }

  async getScoreboardTop(
    count: number = 10,
  ): Promise<
    CTFdResponse<
      Record<
        string,
        {
          id: number;
          name: string;
          solves: Array<{
            challenge_id: number;
            account_id: number;
            value: number;
            date: string;
          }>;
        }
      >
    >
  > {
    return this.request(`/scoreboard/top/${count}`);
  }

  // Teams
  async getTeams(params?: {
    page?: number;
    perPage?: number;
  }): Promise<CTFdResponse<Team[]>> {
    const searchParams = new URLSearchParams();

    if (params?.page) {
      searchParams.set("page", String(params.page));
    }
    if (params?.perPage) {
      searchParams.set("per_page", String(params.perPage));
    }

    const suffix = searchParams.toString();
    return this.request<Team[]>(`/teams${suffix ? `?${suffix}` : ""}`);
  }

  async getTeam(id: number): Promise<CTFdResponse<Team>> {
    return this.request<Team>(`/teams/${id}`);
  }

  async createTeam(
    name: string,
    password?: string,
  ): Promise<CTFdResponse<Team>> {
    const nonce = await this.getNonce();
    const body: Record<string, string> = { name };
    if (password?.trim()) {
      body.password = password.trim();
    }
    if (nonce) {
      body.nonce = nonce;
    }

    try {
      await this.requestWebForm<Team>("/teams/new", {
        name,
        password: password?.trim() || "",
      });

      const me = await this.getCurrentUser();
      if (me.data?.team_id) {
        return this.getTeam(me.data.team_id);
      }

      throw new Error("Team created but membership could not be refreshed.");
    } catch (error) {
      try {
        return await this.request<Team>("/teams", {
          method: "POST",
          body: JSON.stringify(body),
        });
      } catch {
        throw error;
      }
    }
  }

  async joinTeam(options: {
    teamId?: number;
    teamName?: string;
    password?: string;
    inviteToken?: string;
  }): Promise<CTFdResponse<User>> {
    const nonce = await this.getNonce();

    if (options.inviteToken?.trim()) {
      const token = options.inviteToken.trim();
      const candidatePaths = [
        "/teams/invites/accept",
        "/teams/invites/join",
        "/teams/invites",
      ];

      for (const path of candidatePaths) {
        try {
          return await this.request<User>(path, {
            method: "POST",
            body: JSON.stringify(
              nonce
                ? { token, password: options.password, nonce }
                : { token, password: options.password },
            ),
          });
        } catch {
          continue;
        }
      }

      throw new Error("Invite token is not supported by this CTFd backend.");
    }

    if (options.teamName?.trim()) {
      try {
        await this.requestWebForm<User>("/teams/join", {
          name: options.teamName.trim(),
          password: options.password?.trim() || "",
        });

        const me = await this.getCurrentUser();
        return { success: true, data: me.data };
      } catch {}
    }

    if (typeof options.teamId === "number") {
      const body: Record<string, string | number> = { team_id: options.teamId };
      if (options.password?.trim()) {
        body.password = options.password.trim();
      }
      if (nonce) {
        body.nonce = nonce;
      }

      try {
        return await this.request<User>(`/teams/${options.teamId}/join`, {
          method: "POST",
          body: JSON.stringify(body),
        });
      } catch (error) {
        if (!options.teamName?.trim()) {
          throw error;
        }
      }
    }

    throw new Error(
      "Failed to join team. Please check team name and password.",
    );
  }

  async leaveTeam(teamId: number): Promise<CTFdResponse<any>> {
    const nonce = await this.getNonce();

    try {
      return await this.requestWebForm("/teams/leave", nonce ? { nonce } : {});
    } catch {
      return this.request(`/teams/${teamId}/leave`, {
        method: "POST",
        body: JSON.stringify(nonce ? { nonce } : {}),
      });
    }
  }

  async updateTeamSettings(
    teamId: number,
    settings: TeamSettingsUpdate,
  ): Promise<CTFdResponse<Team>> {
    const nonce = await this.getNonce();
    const body: Record<string, string> = {};

    if (settings.name !== undefined) {
      body.name = settings.name;
    }
    if (settings.password !== undefined) {
      body.password = settings.password;
    }
    if (settings.confirm !== undefined) {
      body.confirm = settings.confirm;
    }
    if (settings.website !== undefined) {
      body.website = settings.website;
    }
    if (settings.affiliation !== undefined) {
      body.affiliation = settings.affiliation;
    }
    if (settings.country !== undefined) {
      body.country = settings.country;
    }

    if (nonce) {
      body.nonce = nonce;
    }

    try {
      return await this.request<Team>(`/teams/${teamId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    } catch {
      await this.requestSettingsForm<Team>({
        name: settings.name || "",
        password: settings.password || "",
        confirm: settings.confirm || "",
        website: settings.website || "",
        affiliation: settings.affiliation || "",
        country: settings.country || "",
      });

      return this.getTeam(teamId);
    }
  }

  async transferTeamCaptain(
    teamId: number,
    captainId: number,
  ): Promise<CTFdResponse<Team>> {
    const nonce = await this.getNonce();
    try {
      return await this.request<Team>(`/teams/${teamId}`, {
        method: "PATCH",
        body: JSON.stringify(
          nonce ? { captain_id: captainId, nonce } : { captain_id: captainId },
        ),
      });
    } catch {
      await this.requestSettingsForm<Team>({
        captain_id: String(captainId),
      });
      return this.getTeam(teamId);
    }
  }

  async removeTeamMember(
    teamId: number,
    userId: number,
  ): Promise<CTFdResponse<any>> {
    const nonce = await this.getNonce();
    return this.request(`/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
      body: JSON.stringify(nonce ? { nonce } : {}),
    });
  }

  async disbandTeam(
    teamId: number,
    confirm?: string,
  ): Promise<CTFdResponse<any>> {
    const nonce = await this.getNonce();

    try {
      return await this.request(`/teams/${teamId}`, {
        method: "DELETE",
        body: JSON.stringify(nonce ? { nonce, confirm } : { confirm }),
      });
    } catch {
      try {
        return await this.requestWebForm(`/teams/${teamId}/delete`, {
          confirm: confirm || "",
        });
      } catch {
        return this.requestSettingsForm({
          confirm: confirm || "",
          disband: "true",
        });
      }
    }
  }

  async createTeamInviteToken(
    teamId: number,
  ): Promise<CTFdResponse<TeamInviteToken>> {
    await this.verifyTeamModeEnabled();
    await this.verifyTeamPermissions(teamId);

    const nonce = await this.getNonce();
    const verifiedPath = await this.verifyInviteEndpointPath(teamId, nonce);

    if (!verifiedPath) {
      throw new Error(
        "Invite token endpoints are unavailable (checked: /invites, /invite, /tokens). This CTFd v1 backend does not expose team invite-token APIs.",
      );
    }

    const response = await fetch(`${this.baseURL}${verifiedPath}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(nonce
          ? {
              "CSRF-Token": nonce,
              "X-CSRF-Token": nonce,
            }
          : {}),
      },
      body: JSON.stringify(nonce ? { nonce } : {}),
    });

    if (!response.ok) {
      throw new Error(
        `Invite token request failed: ${response.status} ${response.statusText}`,
      );
    }

    const parsed = (await response.json()) as CTFdResponse<unknown>;
    const token = this.normalizeTokenFromData(parsed.data);
    if (!token) {
      throw new Error(
        "Invite token response did not include a valid token value.",
      );
    }

    return {
      success: true,
      data: {
        token,
        url: this.buildInviteUrl(token),
      },
    };
  }

  // Users
  async getCurrentUser(): Promise<CTFdResponse<User>> {
    return this.request<User>("/users/me");
  }

  async login(name: string, password: string): Promise<CTFdResponse<User>> {
    try {
      const nonce = await this.getNonce();

      const formData = new URLSearchParams();
      formData.append("name", name);
      formData.append("password", password);
      if (nonce) {
        formData.append("nonce", nonce);
      }

      await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include",
      });

      await new Promise((resolve) => setTimeout(resolve, 200));

      try {
        const userResponse = await this.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          return { success: true, data: userResponse.data };
        }
      } catch {
        throw new Error("Your username or password is incorrect");
      }

      throw new Error("Your username or password is incorrect");
    } catch (error) {
      console.error("[ctfdApi] Login error:", error);
      throw error;
    }
  }

  async register(
    name: string,
    email: string,
    password: string,
    registrationCode?: string,
  ): Promise<CTFdResponse<User>> {
    try {
      const nonce = await this.getNonce();

      const formData = new URLSearchParams();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      if (registrationCode) {
        formData.append("registration_code", registrationCode);
      }
      if (nonce) {
        formData.append("nonce", nonce);
      }

      await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include",
      });

      await new Promise((resolve) => setTimeout(resolve, 200));

      try {
        const userResponse = await this.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          return { success: true, data: userResponse.data };
        }
      } catch {
        throw new Error("Registration failed. Please check your information.");
      }

      throw new Error("Registration failed. Please check your information.");
    } catch (error) {
      console.error("[ctfdApi] Registration error:", error);
      throw error;
    }
  }

  async getUser(id: number): Promise<CTFdResponse<User>> {
    return this.request<User>(`/users/${id}`);
  }

  async getUserSolves(id: number): Promise<CTFdResponse<UserSolve[]>> {
    return this.request<UserSolve[]>(`/users/${id}/solves`);
  }

  // Config
  async getConfig(): Promise<CTFdResponse<any>> {
    return this.request("/configs");
  }

  async checkAuth(): Promise<(User & { isAdmin: boolean }) | null> {
    try {
      const response = await this.getCurrentUser();
      if (response.success && response.data) {
        const isAdmin = await this.checkIsAdmin();
        return { ...response.data, isAdmin };
      }
      return null;
    } catch {
      return null;
    }
  }

  // Admin check
  async checkIsAdmin(): Promise<boolean> {
    try {
      // Try to access an admin-only endpoint
      const response = await fetch("/admin/statistics", {
        method: "GET",
        credentials: "include",
        redirect: "manual", // Don't follow redirects
      });
      // If we get 200, user is admin
      // If we get 302 (redirect to login), user is not admin
      // If we get 403, user is not admin
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Tokens
  async getTokens(): Promise<CTFdResponse<Token[]>> {
    return this.request<Token[]>("/tokens");
  }

  async generateToken(data: {
    description: string;
    expiration: string | null;
  }): Promise<CTFdResponse<Token>> {
    const isAdmin = await this.checkIsAdmin();
    if (!isAdmin) {
      throw new Error("Only admin users can generate CTF access tokens.");
    }

    const nonce = await this.getNonce();
    return this.request<Token>("/tokens", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        nonce: nonce,
      }),
    });
  }

  async deleteToken(id: number): Promise<CTFdResponse<any>> {
    const nonce = await this.getNonce();
    return this.request(`/tokens/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ nonce: nonce }),
    });
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      await fetch("/logout", {
        method: "GET",
        credentials: "include",
      });
      this.setCSRFToken(null);
      return { success: true };
    } catch (error) {
      console.error("[ctfdApi] Logout error:", error);
      throw error;
    }
  }
}

export const ctfdApi = new CTFdAPI();
export type {
  Challenge as ApiChallenge,
  ScoreboardEntry,
  Team,
  Token,
  User,
  UserSolve,
};
