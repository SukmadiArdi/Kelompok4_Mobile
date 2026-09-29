import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * STORAGE KEYS FOR SECURE STORAGE (DATA SENSITIF TERENKRIPSI)
 * Digunakan untuk menyimpan data sensitif yang membutuhkan keamanan tinggi seperti:
 * - Token Otentikasi (JWT / Session Token)
 * - Kredensial Pengguna / Password Hash
 * - PIN Keamanan Transaksi
 * - Secret Key / API Token Sensitif
 */
export const SECURE_STORAGE_KEYS = {
  AUTH_TOKEN: 'lokaltrip_sec_auth_token_v1',
  USER_CREDENTIALS: 'lokaltrip_sec_user_creds_v1',
  SECURITY_PIN: 'lokaltrip_sec_pin_v1',
  PAYMENT_KEY: 'lokaltrip_sec_payment_key_v1',
} as const;

export type SecureStorageKey = typeof SECURE_STORAGE_KEYS[keyof typeof SECURE_STORAGE_KEYS];

export interface SecureUserSession {
  userId: string;
  email: string;
  authToken: string;
  loginTimestamp: string;
  isBiometricEnabled: boolean;
}

// Fallback in-memory store for platforms where SecureStore is unavailable (e.g. Web dev mode)
const memoryStoreFallback: Record<string, string> = {};

/**
 * Helper Service untuk Secure Storage (Expo SecureStore / Android KeyStore / iOS Keychain)
 */
export const SecureStorage = {
  /**
   * Memeriksa apakah Secure Storage tersedia di perangkat
   */
  async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    try {
      return await SecureStore.isAvailableAsync();
    } catch {
      return false;
    }
  },

  /**
   * Menyimpan data sensitif secara terenkripsi
   */
  async setItem(key: string, value: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        memoryStoreFallback[key] = value;
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem(key, btoa(encodeURIComponent(value)));
        }
        return true;
      }

      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      return true;
    } catch (error) {
      console.error(`[SecureStorage Error] Gagal menyimpan key sensitif "${key}":`, error);
      return false;
    }
  },

  /**
   * Mengambil data sensitif terenkripsi
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (memoryStoreFallback[key]) {
          return memoryStoreFallback[key];
        }
        if (typeof window !== 'undefined' && window.sessionStorage) {
          const encoded = window.sessionStorage.getItem(key);
          if (encoded) {
            return decodeURIComponent(atob(encoded));
          }
        }
        return null;
      }

      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`[SecureStorage Error] Gagal membaca key sensitif "${key}":`, error);
      return null;
    }
  },

  /**
   * Menghapus data sensitif terenkripsi berdasarkan key
   */
  async deleteItem(key: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        delete memoryStoreFallback[key];
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.removeItem(key);
        }
        return true;
      }

      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error(`[SecureStorage Error] Gagal menghapus key sensitif "${key}":`, error);
      return false;
    }
  },

  /**
   * Menyimpan Auth Token (JWT / OAuth Token)
   */
  async saveAuthToken(token: string): Promise<boolean> {
    return await SecureStorage.setItem(SECURE_STORAGE_KEYS.AUTH_TOKEN, token);
  },

  /**
   * Mengambil Auth Token yang tersimpan
   */
  async getAuthToken(): Promise<string | null> {
    return await SecureStorage.getItem(SECURE_STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Menghapus Auth Token (Logout)
   */
  async removeAuthToken(): Promise<boolean> {
    return await SecureStorage.deleteItem(SECURE_STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Menyimpan Sesi User Sensitif (Objek JSON yang dienkripsi)
   */
  async saveUserSession(session: SecureUserSession): Promise<boolean> {
    return await SecureStorage.setItem(
      SECURE_STORAGE_KEYS.USER_CREDENTIALS,
      JSON.stringify(session)
    );
  },

  /**
   * Mengambil Sesi User Sensitif
   */
  async getUserSession(): Promise<SecureUserSession | null> {
    const raw = await SecureStorage.getItem(SECURE_STORAGE_KEYS.USER_CREDENTIALS);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SecureUserSession;
    } catch {
      return null;
    }
  },

  /**
   * Menghapus seluruh sesi sensitif pengguna
   */
  async clearAllSecureSession(): Promise<boolean> {
    const keys = Object.values(SECURE_STORAGE_KEYS);
    let success = true;
    for (const key of keys) {
      const res = await SecureStorage.deleteItem(key);
      if (!res) success = false;
    }
    return success;
  },

  /**
   * Mengambil snapshot seluruh data sensitif (untuk UI inspeksi & verifikasi enkripsi)
   */
  async getSecureStorageSnapshot(): Promise<Record<string, string | null>> {
    const keys = Object.values(SECURE_STORAGE_KEYS);
    const result: Record<string, string | null> = {};
    for (const key of keys) {
      result[key] = await SecureStorage.getItem(key);
    }
    return result;
  },
};
