import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authAPI, tokenStorage } from '@/lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  subscription: string;
  credits: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!tokenStorage.getAccessToken()
  );

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['/auth/me'],
    queryFn: authAPI.me,
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (tokenStorage.getAccessToken()) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    await authAPI.login(email, password);
    setIsAuthenticated(true);
    await refetch();
  };

  const signup = async (email: string, username: string, password: string) => {
    await authAPI.signup(email, username, password);
  };

  const logout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
