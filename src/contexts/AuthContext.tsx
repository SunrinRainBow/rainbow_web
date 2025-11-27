import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "@/api/type";
import {
  logout as logoutApi,
  startGoogleLogin,
} from "@/api/auth/service";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Failed to parse stored auth data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const email = urlParams.get("email");
    const name = urlParams.get("name");
    const avatar = urlParams.get("avatar");

    if (token && email && window.location.pathname === "/auth/callback") {
      setIsLoading(true);

      const user: User = {
        email: decodeURIComponent(email),
        name: decodeURIComponent(name || ""),
        avatar: decodeURIComponent(avatar || ""),
      };

      setUser(user);
      setToken(token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      window.history.replaceState({}, document.title, "/auth/callback");

      setTimeout(() => {
        window.location.href = "/";
      }, 500);

      setIsLoading(false);
    }
  }, []);

  const login = () => {
    startGoogleLogin();
  };

  const logout = async () => {
    try {
      await logoutApi();
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
