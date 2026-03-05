import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { ctfdApi } from "../../services/ctfdApi";

interface User {
  id: number;
  name: string;
  email: string;
  score?: number;
  place?: number;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (name: string, password: string) => Promise<any>;
  register: (
    name: string,
    email: string,
    password: string,
    registrationCode?: string,
  ) => Promise<any>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper function to get CSRF token
  const getCSRFToken = async (): Promise<string | null> => {
    // Check if already cached
    let token = (window as any).init?.csrfNonce;
    if (token) {
      return token;
    }
    
    // Try to get from meta tag
    let metaTag = document.querySelector('meta[name="CSRF-Token"]');
    if (metaTag) {
      token = metaTag.getAttribute('content');
    }
    
    // Try alternative meta tag names
    if (!token) {
      metaTag = document.querySelector('meta[name="csrf-token"]');
      if (metaTag) {
        token = metaTag.getAttribute('content');
      }
    }
    
    // Try to extract from form inputs
    if (!token) {
      const nonceInput = document.querySelector('input[name="nonce"]');
      if (nonceInput) {
        token = (nonceInput as HTMLInputElement).value;
      }
    }
    
    // If still no token, try fetching the current page
    if (!token) {
      try {
        const response = await fetch(window.location.href, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const html = await response.text();
          
          // Try to find nonce input field using string parsing
          let nonceStart = html.indexOf('name="nonce" value="');
          if (nonceStart > -1) {
            const valueStart = nonceStart + 'name="nonce" value="'.length;
            const valueEnd = html.indexOf('"', valueStart);
            if (valueEnd > valueStart) {
              token = html.substring(valueStart, valueEnd);
              if (token && token.length > 10) {
                console.log('[AuthContext] Found CSRF token in page HTML:', token.substring(0, 8) + '...');
              }
            }
          }

          // Try data-nonce attribute if not found
          if (!token) {
            nonceStart = html.indexOf('data-nonce="');
            if (nonceStart > -1) {
              const valueStart = nonceStart + 'data-nonce="'.length;
              const valueEnd = html.indexOf('"', valueStart);
              if (valueEnd > valueStart) {
                token = html.substring(valueStart, valueEnd);
                if (token && token.length > 10) {
                  console.log('[AuthContext] Found CSRF token in data-nonce:', token.substring(0, 8) + '...');
                }
              }
            }
          }

          // Try csrf_token in meta tag if not found
          if (!token) {
            nonceStart = html.indexOf('name="csrf-token" content="');
            if (nonceStart > -1) {
              const valueStart = nonceStart + 'name="csrf-token" content="'.length;
              const valueEnd = html.indexOf('"', valueStart);
              if (valueEnd > valueStart) {
                token = html.substring(valueStart, valueEnd);
                if (token && token.length > 10) {
                  console.log('[AuthContext] Found CSRF token in meta tag:', token.substring(0, 8) + '...');
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn('[AuthContext] Failed to fetch CSRF token:', error);
      }
    }
    
    // Cache the token if found
    if (token) {
      (window as any).init = (window as any).init || {};
      (window as any).init.csrfNonce = token;
    }
    
    return token;
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await ctfdApi.getCurrentUser();
      if (userData.success && userData.data) {
        setUser(userData.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (name: string, password: string) => {
    try {
      console.log("[AuthContext] Login attempt for user:", name);

      const nonce = await getCSRFToken();
      console.log("[AuthContext] CSRF nonce:", nonce ? 'Found' : 'Missing');

      if (!nonce) {
        console.error("[AuthContext] No CSRF nonce available! Login will likely fail.");
      }

      const formData = new URLSearchParams();
      formData.append("name", name);
      formData.append("password", password);
      if (nonce) {
        formData.append("nonce", nonce);
      }

      console.log("[AuthContext] Submitting login form with nonce:", nonce);

      const loginHeaders: Record<string, string> = {
        "Content-Type": "application/x-www-form-urlencoded",
      };

      // Add CSRF nonce as headers too
      if (nonce) {
        loginHeaders["CSRF-Token"] = nonce;
        loginHeaders["X-CSRF-Token"] = nonce;
      }

      const response = await fetch("/login", {
        method: "POST",
        headers: loginHeaders,
        body: formData,
        credentials: "include",
      });

      console.log("[AuthContext] Login response status:", response.status);

      if (!response.ok) {
        throw new Error("Login failed");
      }

      // Wait for session to be established
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Re-check auth to get full user data
      const userData = await ctfdApi.getCurrentUser();
      if (userData.success && userData.data) {
        setUser(userData.data);
        setIsAuthenticated(true);
        console.log("[AuthContext] Login successful");
        return userData;
      } else {
        throw new Error("Failed to load user data after login");
      }
    } catch (error) {
      console.error("[AuthContext] Login error:", error);
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    registrationCode?: string,
  ) => {
    try {
      console.log("[AuthContext] Register attempt for user:", name);

      const nonce = await getCSRFToken();
      console.log("[AuthContext] CSRF nonce for register:", nonce ? 'Found' : 'Missing');

      if (!nonce) {
        console.error("[AuthContext] No CSRF nonce available! Registration will likely fail.");
      }

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

      const registerHeaders: Record<string, string> = {
        "Content-Type": "application/x-www-form-urlencoded",
      };

      // Add CSRF nonce as headers too
      if (nonce) {
        registerHeaders["CSRF-Token"] = nonce;
        registerHeaders["X-CSRF-Token"] = nonce;
      }

      const response = await fetch("/register", {
        method: "POST",
        headers: registerHeaders,
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      // Wait for session to be established
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Re-check auth to get full user data
      const userData = await ctfdApi.getCurrentUser();
      if (userData.success && userData.data) {
        setUser(userData.data);
        setIsAuthenticated(true);
        return userData;
      } else {
        throw new Error("Failed to load user data after registration");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("/logout", {
        method: "GET",
        credentials: "include",
      });
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear state anyway
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
