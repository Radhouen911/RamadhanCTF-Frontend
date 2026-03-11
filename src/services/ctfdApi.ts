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
  members?: Array<unknown>;
  members_count?: number;
  captain_id?: number;
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

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<CTFdResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    const nonce = (window as any).init?.csrfNonce || this.csrfToken;
    if (nonce) {
      headers["CSRF-Token"] = nonce;
      headers["X-CSRF-Token"] = nonce;
    }

    debugLog(`[ctfdApi] ${options.method || "GET"} ${endpoint}`, {
      hasCSRF: !!nonce,
      headers: Object.keys(headers),
      url: url,
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        // Try to get error details from response body
        let errorData;
        try {
          errorData = await response.json();
          if (!(endpoint === "/users/me" && response.status === 403)) {
            console.error(
              `[ctfdApi] Request failed: ${response.status} ${response.statusText}`,
              errorData,
            );
          }
        } catch {
          if (!(endpoint === "/users/me" && response.status === 403)) {
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
export type { Challenge as ApiChallenge, ScoreboardEntry, Team, Token, User };
