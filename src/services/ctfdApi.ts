interface CTFdResponse<T> {
  success: boolean;
  data: T;
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
}

interface Team {
  id: number;
  name: string;
  score: number;
  place: number;
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

class CTFdAPI {
  private baseURL = "/api/v1";

  private async getCSRFToken(): Promise<string | null> {
    // Check if already cached
    let token = (window as any).init?.csrfNonce;
    if (
      token &&
      token.length > 10 &&
      !token.includes("(") &&
      !token.includes("[")
    ) {
      console.log("[ctfdApi] Using cached CSRF token, length:", token.length);
      return token;
    }

    // Try to get from meta tag
    let metaTag = document.querySelector('meta[name="CSRF-Token"]');
    if (metaTag) {
      token = metaTag.getAttribute("content");
    }

    // Try alternative meta tag names that CTFd might use
    if (!token) {
      metaTag = document.querySelector('meta[name="csrf-token"]');
      if (metaTag) {
        token = metaTag.getAttribute("content");
      }
    }

    // Try to extract from existing page content (check if CTFd has forms with nonce)
    if (!token) {
      const nonceInput = document.querySelector('input[name="nonce"]');
      if (nonceInput) {
        token = (nonceInput as HTMLInputElement).value;
      }
    }

    // If still no token, try fetching the current page to get fresh HTML with CSRF
    if (!token) {
      try {
        console.log("[ctfdApi] Fetching fresh page for CSRF token...");
        const response = await fetch(window.location.href, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const html = await response.text();
          console.log("[ctfdApi] Got fresh HTML, searching for nonce...");

          // Use simple string parsing instead of regex to avoid pattern matching issues
          let token = null;

          // Look for nonce in form input (most common)
          const nonceStart = html.indexOf('name="nonce" value="');
          if (nonceStart > -1) {
            const valueStart = nonceStart + 'name="nonce" value="'.length;
            const valueEnd = html.indexOf('"', valueStart);
            if (valueEnd > valueStart) {
              token = html.substring(valueStart, valueEnd);
              if (token.length > 10) {
                console.log(
                  "[ctfdApi] Found nonce in form:",
                  token.substring(0, 8) + "...",
                );
              }
            }
          }

          // Try data-nonce attribute if form nonce not found
          if (!token || token.length < 10) {
            const dataNonceStart = html.indexOf('data-nonce="');
            if (dataNonceStart > -1) {
              const valueStart = dataNonceStart + 'data-nonce="'.length;
              const valueEnd = html.indexOf('"', valueStart);
              if (valueEnd > valueStart) {
                token = html.substring(valueStart, valueEnd);
                if (token.length > 10) {
                  console.log(
                    "[ctfdApi] Found data-nonce:",
                    token.substring(0, 8) + "...",
                  );
                }
              }
            }
          }

          if (token && token.length > 10) {
            // Cache the token
            (window as any).init = (window as any).init || {};
            (window as any).init.csrfNonce = token;
            return token;
          }
        }
      } catch (error) {
        console.warn("[ctfdApi] Failed to fetch page for CSRF token:", error);
      }
    }

    // Cache the token if found
    if (token) {
      (window as any).init = (window as any).init || {};
      (window as any).init.csrfNonce = token;
    }

    console.log("[ctfdApi] CSRF token:", token ? "Found" : "Missing");
    return token;
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

    // Add CSRF token to headers
    const csrfToken = await this.getCSRFToken();
    if (csrfToken) {
      headers["CSRF-Token"] = csrfToken;
      headers["X-CSRF-Token"] = csrfToken;
      headers["X-CSRFToken"] = csrfToken;
    }

    console.log(`[ctfdApi] ${options.method || "GET"} ${endpoint}`, {
      hasCSRF: !!csrfToken,
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
          console.error(
            `[ctfdApi] Request failed: ${response.status} ${response.statusText}`,
            errorData,
          );
        } catch {
          console.error(
            `[ctfdApi] Request failed: ${response.status} ${response.statusText}`,
          );
        }
        throw new Error(
          `API request failed: ${response.status}${errorData ? ": " + JSON.stringify(errorData) : ""}`,
        );
      }

      const data = await response.json();
      console.log(`[ctfdApi] ${endpoint} success:`, data.success);
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
    console.log("[ctfdApi] Submitting flag for challenge:", challengeId);
    console.log("[ctfdApi] Submission value:", submission);
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
  async getTeams(): Promise<CTFdResponse<Team[]>> {
    return this.request<Team[]>("/teams");
  }

  async getTeam(id: number): Promise<CTFdResponse<Team>> {
    return this.request<Team>(`/teams/${id}`);
  }

  // Users
  async getCurrentUser(): Promise<CTFdResponse<User>> {
    return this.request<User>("/users/me");
  }

  async getUser(id: number): Promise<CTFdResponse<User>> {
    return this.request<User>(`/users/${id}`);
  }

  // Config
  async getConfig(): Promise<CTFdResponse<any>> {
    return this.request("/configs");
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
    const nonce = await this.getCSRFToken();
    return this.request<Token>("/tokens", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        nonce: nonce,
      }),
    });
  }

  async deleteToken(id: number): Promise<CTFdResponse<any>> {
    const nonce = await this.getCSRFToken();
    return this.request(`/tokens/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ nonce: nonce }),
    });
  }
}

export const ctfdApi = new CTFdAPI();
export type { Challenge as ApiChallenge, ScoreboardEntry, Team, Token, User };
