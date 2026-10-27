import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const TOKEN_KEY = 'access_token';

// In-memory fallback jika dijalankan di environment web yang tidak mendukung SecureStore
const memoryStoreFallback: Record<string, string> = {};

/**
 * Utility Token Storage menggunakan SecureStore
 * Task 01 - Token-Based Authentication
 */
export const tokenStorage = {
  /**
   * Simpan token: SecureStore.setItemAsync("access_token", token)
   */
  async saveToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      memoryStoreFallback[TOKEN_KEY] = token;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(TOKEN_KEY, token);
      }
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  /**
   * Ambil token: SecureStore.getItemAsync("access_token")
   */
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(TOKEN_KEY);
        if (stored) return stored;
      }
      return memoryStoreFallback[TOKEN_KEY] || null;
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  /**
   * Hapus token: SecureStore.deleteItemAsync("access_token")
   */
  async deleteToken(): Promise<void> {
    if (Platform.OS === 'web') {
      delete memoryStoreFallback[TOKEN_KEY];
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(TOKEN_KEY);
      }
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  /**
   * Method alias untuk kepatuhan spesifikasi Task 01:
   * SecureStore.setItemAsync("access_token", token)
   */
  async setItemAsync(keyOrToken: string, maybeToken?: string): Promise<void> {
    const token = maybeToken !== undefined ? maybeToken : keyOrToken;
    return tokenStorage.saveToken(token);
  },

  /**
   * Method alias untuk kepatuhan spesifikasi Task 01:
   * SecureStore.getItemAsync("access_token")
   */
  async getItemAsync(_key?: string): Promise<string | null> {
  async getItemAsync(key?: string): Promise<string | null> {
    return tokenStorage.getToken();
  },

  /**
   * Method alias untuk kepatuhan spesifikasi Task 01:
   * SecureStore.deleteItemAsync("access_token")
   */
  async deleteItemAsync(_key?: string): Promise<void> {
  async deleteItemAsync(key?: string): Promise<void> {
    return tokenStorage.deleteToken();
  },
};

export const saveToken = tokenStorage.saveToken;
export const getToken = tokenStorage.getToken;
export const deleteToken = tokenStorage.deleteToken;
export const removeToken = tokenStorage.deleteToken;

export default tokenStorage;
