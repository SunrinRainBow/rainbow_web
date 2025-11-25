import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/api/type';
import { handleGoogleCallback, logout as logoutApi, startGoogleLogin } from '@/api/auth/service';

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
    throw new Error('useAuth must be used within an AuthProvider');
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

  // 초기 로드 시 localStorage에서 사용자 정보 및 토큰 복원
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  // OAuth 콜백 처리 (백엔드에서 리다이렉트된 경우)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    const name = urlParams.get('name');
    const avatar = urlParams.get('avatar');
    
    // 백엔드에서 리다이렉트된 경우 (토큰이 URL 파라미터로 전달됨)
    if (token && email && window.location.pathname === '/auth/callback') {
      setIsLoading(true);
      
      const user: User = {
        email: decodeURIComponent(email),
        name: decodeURIComponent(name || ''),
        avatar: decodeURIComponent(avatar || ''),
      };
      
      setUser(user);
      setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // URL에서 파라미터 제거
      window.history.replaceState({}, document.title, '/auth/callback');
      
      // 프로필 페이지로 리다이렉트
      setTimeout(() => {
        window.location.href = '/';
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
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      // 에러가 발생해도 로컬 상태는 초기화
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
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

