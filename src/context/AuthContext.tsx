import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { User, AuthResponse } from '../types';
import { authService, generateMockJwt } from '../services/authService';
import { supabase } from '../lib/supabase';

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
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on mount
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        // Cek sesi aktif Supabase atau fallback SecureStore
        let token: string | null = null;
        try {
          const { data } = await supabase.auth.getSession();
          token = data.session?.access_token || null;
        } catch {
          // Abaikan jika offline / dev
        }

        if (!token) {
          token = await SecureStore.getItemAsync('access_token').catch(() => null);
        }

        const savedUser = await authService.getCurrentUser();
        if (isMounted) {
          if (token && savedUser) {
            setUser(savedUser);
            setIsAuthenticated(true);
          } else if (savedUser) {
            // Sinkronisasi access_token jika akun telah tersimpan
            const mockToken = generateMockJwt(savedUser.id, savedUser.email);
            await SecureStore.setItemAsync('access_token', mockToken).catch(() => {});
            setUser(savedUser);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.warn('Error restoring auth session:', err);
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
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

  /**
   * Login (Task 01 - Supabase & Token-Based Authentication)
   * Menyimpan access_token ke SecureStore, memperbarui isAuthenticated, dan log token
   */
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.user) {
        if (res.access_token) {
          console.log("Supabase JWT Token:", res.access_token);
          await SecureStore.setItemAsync('access_token', res.access_token).catch(() => {});
        }
        setUser(res.user);
        setIsAuthenticated(true);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register (Task 01)
   */
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
        if (res.access_token) {
          console.log("Supabase JWT Token:", res.access_token);
          await SecureStore.setItemAsync('access_token', res.access_token).catch(() => {});
        }
        setUser(res.user);
        setIsAuthenticated(true);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 1-Click Demo Login
   */
  const loginDemo = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const demoUser = await authService.loginDemo();
      setUser(demoUser);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout (Task 03 - Supabase Session Management & Logout)
   * 1. Panggil await supabase.auth.signOut()
   * 2. Menghapus access_token dari storage: await SecureStore.deleteItemAsync("access_token")
   * 3. Mereset state isAuthenticated menjadi false
   * 4. Log console.log("Status token setelah logout:", null)
   * 5. Mengarahkan navigasi kembali ke halaman Login (router.replace("/login"))
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut().catch((err) => {
        console.warn('Supabase signOut error:', err);
      });
      await SecureStore.deleteItemAsync('access_token').catch((err) => {
        console.warn('Gagal menghapus access_token:', err);
      });
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      console.log("Status token setelah logout:", null);
      router.replace('/login' as any);
    } catch (err) {
      console.error('Logout error:', err);
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
        isAuthenticated,
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
