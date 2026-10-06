import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * STORAGE KEYS FOR LOCAL STORAGE (DATA BIASA UNTUK PENYIMPANAN PERANGKAT)
 * Digunakan untuk menyimpan data aplikasi biasa (non-sensitif) seperti:
 * - Keranjang belanja (Cart)
 * - Daftar favorit & bookmark (Saved Gems / Favorite Products)
 * - Riwayat pesanan (Bookings)
 * - Pengaturan & Preferensi Aplikasi (User Preferences)
 */
export const LOCAL_STORAGE_KEYS = {
  CART: '@lokaltrip_cart_v1',
  SAVED_GEMS: '@lokaltrip_saved_gems_v1',
  FAVORITE_PRODUCTS: '@lokaltrip_favorite_products_v1',
  BOOKINGS: '@lokaltrip_bookings_v1',
  USER_PREFERENCES: '@lokaltrip_user_preferences_v1',
} as const;

export type LocalStorageKey = typeof LOCAL_STORAGE_KEYS[keyof typeof LOCAL_STORAGE_KEYS];

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'id' | 'en';
  notificationsEnabled: boolean;
  offlineMode: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  language: 'id',
  notificationsEnabled: true,
  offlineMode: false,
};

/**
 * Service Helper untuk Local Storage (AsyncStorage)
 */
export const LocalStorage = {
  /**
   * Menyimpan data objek / array / string ke Local Storage
   */
  async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`[LocalStorage Error] Gagal menyimpan key "${key}":`, error);
      return false;
    }
  },

  /**
   * Mengambil data dari Local Storage dengan parsing JSON otomatis
   */
  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue !== null) {
        return JSON.parse(jsonValue) as T;
      }
      return defaultValue;
    } catch (error) {
      console.error(`[LocalStorage Error] Gagal membaca key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Menghapus key tertentu dari Local Storage
   */
  async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[LocalStorage Error] Gagal menghapus key "${key}":`, error);
      return false;
    }
  },

  /**
   * Menghapus semua data LokalTrip di Local Storage
   */
  async clearAllAppLocalData(): Promise<boolean> {
    try {
      const keys = Object.values(LOCAL_STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys as string[]);
      return true;
    } catch (error) {
      console.error('[LocalStorage Error] Gagal membersihkan local data:', error);
      return false;
    }
  },

  /**
   * Membaca seluruh data Local Storage aplikasi untuk kebutuhan debugging / pemantauan
   */
  async getAllStoredData(): Promise<Record<string, any>> {
    try {
      const keys = Object.values(LOCAL_STORAGE_KEYS);
      const pairs = await AsyncStorage.multiGet(keys as string[]);
      const result: Record<string, any> = {};
      pairs.forEach(([key, val]) => {
        if (val !== null) {
          try {
            result[key] = JSON.parse(val);
          } catch {
            result[key] = val;
          }
        } else {
          result[key] = null;
        }
      });
      return result;
    } catch (error) {
      console.error('[LocalStorage Error] Gagal mengambil snapshot data:', error);
      return {};
    }
  },
};
