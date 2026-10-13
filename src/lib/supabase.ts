import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const memoryFallback: Record<string, string> = {};

/**
 * Adapter Expo SecureStore untuk Supabase Client Storage
 * Mendukung penyimpanan sesi JWT secara hardware-backed (Android KeyStore / iOS Keychain)
 * dengan fallback aman untuk platform Web.
 */
export const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return memoryFallback[key] || null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn(`[ExpoSecureStoreAdapter] Error reading key "${key}":`, e);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        memoryFallback[key] = value;
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn(`[ExpoSecureStoreAdapter] Error saving key "${key}":`, e);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        delete memoryFallback[key];
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn(`[ExpoSecureStoreAdapter] Error deleting key "${key}":`, e);
    }
  },
};

const supabaseUrl =
  (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim() ||
  'https://xyzcompany.supabase.co';

const supabaseAnonKey =
  (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim() ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key';

export const isSupabaseConfigured = (): boolean => {
  return (
    !!process.env.EXPO_PUBLIC_SUPABASE_URL &&
    !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('xyzcompany')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
