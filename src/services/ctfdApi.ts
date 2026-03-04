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

class CTFdAPI {
  private baseURL = "/api/v1";

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<CTFdResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Get CSRF token from window.init (set by Jinja template)
    const csrfToken = (window as any).init?.csrfNonce;
    if (csrfToken) {
      headers["CSRF-Token"] = csrfToken;
      headers["X-CSRF-Token"] = csrfToken;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
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

  async submitFlag(challengeId: number, submission: string): Promise<CTFdResponse<any>> {
    return this.request("/challenges/attempt", {
      method: "POST",
      body: JSON.stringify({
        challenge_id: challengeId,
        submission: submission,
        nonce: (window as any).init?.csrfNonce,
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
}

export const ctfdApi = new CTFdAPI();
