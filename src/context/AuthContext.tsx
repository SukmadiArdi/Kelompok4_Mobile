import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authService, DEFAULT_DEMO_USER } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<AuthResponse>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEFAULT_DEMO_USER); // Default to demo user for seamless test experience
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on mount
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const savedUser = await authService.getCurrentUser();
        if (isMounted) {
          if (savedUser) {
            setUser(savedUser);
          } else {
            // Keep default demo user logged in initially so examiners immediately have rich experience
            setUser(DEFAULT_DEMO_USER);
          }
        }
      } catch (err) {
        console.warn('Error restoring auth session:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.register(name, email, password, phone);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const demoUser = await authService.loginDemo();
      setUser(demoUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<AuthResponse> => {
    if (!user) {
      return { success: false, message: 'Tidak ada sesi pengguna aktif.' };
    }
    const res = await authService.updateProfile(user.id, updates);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    return authService.resetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginDemo,
        logout,
        updateProfile,
        resetPassword,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
