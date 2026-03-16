import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface User {
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

  // Static archive: no backend authentication. Default to logged out state.
  useEffect(() => {
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  }, []);

  const login = async (name: string, password: string) => {
    // Authentication is disabled in archive mode.
    return {
      success: false,
      message: "Authentication disabled in archive mode",
    };
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    registrationCode?: string,
  ) => {
    // Registration disabled in archive mode.
    return { success: false, message: "Registration disabled in archive mode" };
  };

  const logout = async () => {
    // No-op in archive mode
    setUser(null);
    setIsAuthenticated(false);
    return Promise.resolve();
  };

  const checkAuthStatus = async () => {
    // No-op for archive mode
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
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
