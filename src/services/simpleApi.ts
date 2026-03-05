// Simple API client without CSRF tokens - for testing
class SimpleAPI {
  private baseURL = "/api/v1";

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    console.log(`[SimpleAPI] ${options.method || 'GET'} ${endpoint}`, { 
      headers: Object.keys(headers)
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Important for session-based auth
      });

      console.log(`[SimpleAPI] Response: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const text = await response.text();
        console.log(`[SimpleAPI] Error response body:`, text);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[SimpleAPI] Success:`, data);
      return data;
    } catch (error) {
      console.error(`[SimpleAPI] Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Test endpoints without CSRF
  async getCurrentUser() {
    return this.request("/users/me");
  }

  async getConfig() {
    return this.request("/configs");
  }
  
  async getChallenges() {
    return this.request("/challenges");
  }
}

export const simpleApi = new SimpleAPI();

// Add to window for testing
(window as any).testAPI = simpleApi;