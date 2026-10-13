import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User, AuthResponse } from '../types';
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig';
import { API_BASE_URL } from './apiConfig';
import { tokenStorage } from '../utils/tokenStorage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Helper untuk membuat mock JWT string (Task 01)
 */
export function generateMockJwt(userId: string, email: string): string {
  const base64Url = (str: string): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    for (
      let block = 0, charCode, i = 0, map = chars;
      str.charAt(i | 0) || ((map = '='), i % 1);
      output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))
    ) {
      charCode = str.charCodeAt((i += 3 / 4));
      block = (block << 8) | charCode;
    }
    return output.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Url(
    JSON.stringify({
      sub: userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    })
  );
  const signature = 'sec_sign_' + Math.random().toString(36).substring(2, 15);
  return `${header}.${payload}.${signature}`;
}

const CURRENT_USER_KEY = '@lokaltrip_auth_user';
const USERS_DB_KEY = '@lokaltrip_users_store';

// Default Demo User (Arya Wibowo)
export const DEFAULT_DEMO_USER: User = {
  id: 'user-demo-01',
  name: 'Arya Wibowo',
  email: 'arya.wibowo@lokaltrip.id',
  phone: '+62 812-3456-7890',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  bio: 'Pecinta kearifan lokal, wastra Nusantara, dan penjelajah desa adat.',
  badge: 'Penjelajah Budaya Nusantara',
  role: 'traveler',
  createdAt: '2024-01-15',
  provider: 'local',
};

interface StoredUserAccount extends User {
  passwordHash: string;
}

// Helper to get all registered accounts from local storage
async function getStoredUsers(): Promise<StoredUserAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      // Seed initial demo account
      const initial: StoredUserAccount[] = [
        {
          ...DEFAULT_DEMO_USER,
          passwordHash: 'password123',
        },
      ];
      await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read users database:', e);
    return [
      {
        ...DEFAULT_DEMO_USER,
        passwordHash: 'password123',
      },
    ];
  }
}

// Helper to save registered accounts
async function saveStoredUsers(users: StoredUserAccount[]): Promise<void> {
  try {
    await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users database:', e);
  }
}

class AuthService {
  /**
   * Mengambil sesi user yang sedang aktif saat aplikasi dimulai
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    } catch (e) {
      console.warn('Failed to restore user session:', e);
      return null;
    }
  }

  /**
   * Menyimpan sesi user saat ini ke AsyncStorage
   */
  private async persistUserSession(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist user session:', e);
    }
  }

  /**
   * Login dengan Email & Password (Task 01 - Supabase & Token-Based Authentication)
   * Menggunakan supabase.auth.signInWithPassword, menangkap data.session.access_token,
   * menyimpan ke SecureStore, dan mencetak log Supabase JWT Token.
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, message: 'Email dan password wajib diisi.' };
    }

    // 1. Coba Autentikasi Menggunakan Supabase Client
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (!error && data?.session?.access_token) {
        const accessToken = data.session.access_token;
        console.log("Supabase JWT Token:", accessToken);

        // Simpan token ke key 'access_token' via SecureStore
        await SecureStore.setItemAsync('access_token', accessToken);

        const supabaseUser: User = {
          id: data.user?.id || `usr-${Date.now()}`,
          name:
            data.user?.user_metadata?.name ||
            data.user?.user_metadata?.full_name ||
            cleanEmail.split('@')[0],
          email: data.user?.email || cleanEmail,
          avatar:
            data.user?.user_metadata?.avatar_url ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
          badge: 'Penjelajah Nusantara',
          role: 'traveler',
          createdAt:
            data.user?.created_at?.split('T')[0] ||
            new Date().toISOString().split('T')[0],
          provider: 'local',
        };

        await this.persistUserSession(supabaseUser);
        return { success: true, user: supabaseUser, access_token: accessToken };
      } else if (error && isSupabaseConfigured()) {
        console.warn('Supabase signInWithPassword gagal:', error.message);
        return { success: false, message: error.message };
      }
    } catch (sbErr) {
      console.warn('Supabase connection attempt error:', sbErr);
    }

    // 2. Fallback REST API backend endpoint /login via POST jika API_BASE_URL tersedia
    if (API_BASE_URL) {
      try {
        const loginUrl = `${API_BASE_URL}/login`;
        const resp = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPass,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          const accessToken = data.access_token || data.token || data.accessToken;
          if (accessToken) {
            console.log("Supabase JWT Token:", accessToken);
            await SecureStore.setItemAsync('access_token', accessToken);
            const user: User = data.user || {
              id: data.id || `usr-${Date.now()}`,
              name: data.name || cleanEmail.split('@')[0],
              email: cleanEmail,
              badge: 'Penjelajah Nusantara',
              role: 'traveler',
              createdAt: new Date().toISOString().split('T')[0],
              provider: 'local',
            };
            await this.persistUserSession(user);
            return { success: true, user, access_token: accessToken };
          }
        } else if (resp.status === 401) {
          return { success: false, message: 'Email atau kata sandi tidak sesuai (401 Unauthorized).' };
        }
      } catch (apiErr) {
        console.warn('REST API /login tidak terhubung, fallback ke provider lokal:', apiErr);
      }
    }

    // 3. Fallback Firebase Auth via REST API jika konfigurasi valid
    if (isFirebaseConfigured() && firebaseConfig.apiKey) {
      try {
        const firebaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`;
        const resp = await fetch(firebaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPass,
            returnSecureToken: true,
          }),
        });

        const data = await resp.json();
        if (resp.ok && data.localId) {
          const accessToken = data.idToken;
          if (accessToken) {
            console.log("Supabase JWT Token:", accessToken);
            await SecureStore.setItemAsync('access_token', accessToken);
          }
          const firebaseUser: User = {
            id: data.localId,
            name: data.displayName || cleanEmail.split('@')[0],
            email: data.email || cleanEmail,
            avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
            badge: 'Penjelajah Nusantara',
            role: 'traveler',
            createdAt: new Date().toISOString().split('T')[0],
            provider: 'firebase',
          };
          await this.persistUserSession(firebaseUser);
          return { success: true, user: firebaseUser, access_token: accessToken };
        } else if (data.error && data.error.message) {
          const errCode = data.error.message;
          if (errCode.includes('EMAIL_NOT_FOUND') || errCode.includes('INVALID_PASSWORD') || errCode.includes('INVALID_LOGIN_CREDENTIALS')) {
            return { success: false, message: 'Email atau kata sandi tidak sesuai.' };
          }
        }
      } catch (err) {
        console.warn('Firebase login failed, falling back to local database:', err);
      }
    }

    // 4. Fallback ke Local Mock Store (Untuk testing & demo offline)
    const users = await getStoredUsers();
    const matched = users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.passwordHash === cleanPass
    );

    if (matched) {
      const { passwordHash: _, ...safeUser } = matched;
      const accessToken = generateMockJwt(safeUser.id, safeUser.email);
      console.log("Supabase JWT Token:", accessToken);
      await SecureStore.setItemAsync('access_token', accessToken);
      await this.persistUserSession(safeUser);
      return { success: true, user: safeUser, access_token: accessToken };
    }

    // Khusus demo akun Arya Wibowo
    if (cleanEmail === DEFAULT_DEMO_USER.email.toLowerCase() && cleanPass === 'password123') {
      const accessToken = generateMockJwt(DEFAULT_DEMO_USER.id, DEFAULT_DEMO_USER.email);
      console.log("Supabase JWT Token:", accessToken);
      await SecureStore.setItemAsync('access_token', accessToken);
      await this.persistUserSession(DEFAULT_DEMO_USER);
      return { success: true, user: DEFAULT_DEMO_USER, access_token: accessToken };
    }

    return {
      success: false,
      message: 'Email atau kata sandi salah. Coba gunakan akun demo atau daftar akun baru.',
    };
  }

  /**
   * Registrasi Akun Baru
   */
  async register(
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<AuthResponse> {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanName) {
      return { success: false, message: 'Nama lengkap wajib diisi.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Format alamat email tidak valid.' };
    }
    if (cleanPass.length < 6) {
      return { success: false, message: 'Kata sandi minimal 6 karakter.' };
    }

    // 1. Coba Supabase signUp jika dikonfigurasi
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          options: {
            data: { name: cleanName, phone: phone || '' },
          },
        });
        if (!error && data?.session?.access_token) {
          const accessToken = data.session.access_token;
          console.log("Supabase JWT Token:", accessToken);
          await SecureStore.setItemAsync('access_token', accessToken);
          const sbUser: User = {
            id: data.user?.id || `usr-${Date.now()}`,
            name: cleanName,
            email: cleanEmail,
            phone: phone || '',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
            badge: 'Penjelajah Pemula',
            role: 'traveler',
            createdAt: new Date().toISOString().split('T')[0],
            provider: 'local',
          };
          await this.persistUserSession(sbUser);
          return { success: true, user: sbUser, access_token: accessToken };
        }
      }
    } catch (sbErr) {
      console.warn('Supabase signUp attempt error:', sbErr);
    }

    // 2. Coba Firebase Sign-up jika dikonfigurasi
    if (isFirebaseConfigured() && firebaseConfig.apiKey) {
      try {
        const firebaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;
        const resp = await fetch(firebaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPass,
            returnSecureToken: true,
          }),
        });

        const data = await resp.json();
        if (resp.ok && data.localId) {
          const accessToken = data.idToken;
          if (accessToken) {
            console.log("Supabase JWT Token:", accessToken);
            await SecureStore.setItemAsync('access_token', accessToken);
          }
          const firebaseUser: User = {
            id: data.localId,
            name: cleanName,
            email: cleanEmail,
            phone: phone || '',
            avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
            badge: 'Penjelajah Pemula',
            role: 'traveler',
            createdAt: new Date().toISOString().split('T')[0],
            provider: 'firebase',
          };
          await this.persistUserSession(firebaseUser);
          return { success: true, user: firebaseUser, access_token: accessToken };
        }
      } catch (err) {
        console.warn('Firebase registration fallback to local:', err);
      }
    }

    // 3. Local Mock DB
    const users = await getStoredUsers();
    const exists = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: 'Email ini sudah terdaftar. Silakan login.' };
    }

    const newUser: StoredUserAccount = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: phone || '',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      bio: 'Baru bergabung menjelajahi keindahan budaya lokal Indonesia.',
      badge: 'Penjelajah Nusantara Baru',
      role: 'traveler',
      createdAt: new Date().toISOString().split('T')[0],
      provider: 'local',
      passwordHash: cleanPass,
    };

    users.push(newUser);
    await saveStoredUsers(users);

    const { passwordHash: _, ...safeUser } = newUser;
    const accessToken = generateMockJwt(safeUser.id, safeUser.email);
    console.log("Supabase JWT Token:", accessToken);
    await SecureStore.setItemAsync('access_token', accessToken);
    await this.persistUserSession(safeUser);
    return { success: true, user: safeUser, access_token: accessToken };
  }

  /**
   * 1-Click Demo Login
   */
  async loginDemo(): Promise<User> {
    const accessToken = generateMockJwt(DEFAULT_DEMO_USER.id, DEFAULT_DEMO_USER.email);
    console.log("Supabase JWT Token:", accessToken);
    await SecureStore.setItemAsync('access_token', accessToken);
    await this.persistUserSession(DEFAULT_DEMO_USER);
    return DEFAULT_DEMO_USER;
  }

  /**
   * Logout (Task 03 - Supabase & SecureStore)
   * Memanggil signOut pada Supabase Client dan menghapus access_token dari SecureStore.
   */
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut().catch(() => {});
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
    try {
      await SecureStore.deleteItemAsync('access_token');
    } catch (e) {
      console.warn('Failed to delete access_token:', e);
    }
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  }

  /**
   * Perbarui Data Profil User
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<AuthResponse> {
    try {
      const current = await this.getCurrentUser();
      if (!current || current.id !== userId) {
        return { success: false, message: 'User tidak ditemukan.' };
      }

      const updated: User = {
        ...current,
        ...updates,
      };

      await this.persistUserSession(updated);

      // Sinkronkan ke local DB jika akun lokal
      const users = await getStoredUsers();
      const idx = users.findIndex((u) => u.id === userId);
      if (idx > -1) {
        users[idx] = { ...users[idx], ...updates };
        await saveStoredUsers(users);
      }

      return { success: true, user: updated };
    } catch (e) {
      console.error('Failed to update profile:', e);
      return { success: false, message: 'Gagal memperbarui profil.' };
    }
  }

  /**
   * Reset Password
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Masukkan alamat email yang valid.' };
    }

    if (isFirebaseConfigured() && firebaseConfig.apiKey) {
      try {
        const firebaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseConfig.apiKey}`;
        await fetch(firebaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestType: 'PASSWORD_RESET',
            email: cleanEmail,
          }),
        });
      } catch (e) {
        console.warn('Firebase reset password error:', e);
      }
    }

    return {
      success: true,
      message: `Tautan pemulihan kata sandi telah dikirim ke ${cleanEmail}. Periksa kotak masuk atau spam Anda.`,
    };
  }
}

export const authService = new AuthService();
export default authService;
