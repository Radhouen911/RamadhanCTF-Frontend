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
  team_id?: number | null;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await ctfdApi.checkAuth();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // 403 is expected when not logged in — not a real error
      debugWarn("Auth check failed (expected when logged out):", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (name: string, password: string) => {
    try {
      const response = await ctfdApi.login(name, password);
      if (response.success && response.data) {
        const userData = await ctfdApi.checkAuth();
        setUser(userData || response.data);
        setIsAuthenticated(true);
        debugLog("[AuthContext] Login successful");
        return response;
      }
      throw new Error("Invalid username or password.");
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
      const response = await ctfdApi.register(
        name,
        email,
        password,
        registrationCode,
      );
      if (response.success && response.data) {
        const userData = await ctfdApi.checkAuth();
        setUser(userData || response.data);
        setIsAuthenticated(true);
        return response;
      }
      throw new Error("Registration failed. Please check your details and try again.");
    } catch (error) {
      console.error("[AuthContext] Register error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await ctfdApi.logout();
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
