import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ExpoPushMessage,
  ExpoPushTicket,
  ReceivedNotificationItem,
} from '@/src/types/notifications';

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';
const STORAGE_KEY_TOKEN = '@lokaltrip_push_token';
const STORAGE_KEY_HISTORY = '@lokaltrip_notification_history';
export const DEFAULT_DEMO_PUSH_TOKEN = 'ExponentPushToken[LokalTripDemo_Takdir091]';

/**
 * Konfigurasi penanganan notifikasi saat aplikasi berada di latar depan (Foreground).
 * Memastikan alert banner, suara, dan badge tetap aktif ditampilkan di layar.
 */
export function configureForegroundNotificationHandler(): void {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.warn('[NotificationService] Gagal mengatur notification handler:', error);
  }
}

/**
 * Validasi apakah sebuah string merupakan format Expo Push Token yang sah
 */
export function isExpoPushToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const trimmed = token.trim();
  return (
    (trimmed.startsWith('ExponentPushToken[') || trimmed.startsWith('ExpoPushToken[')) &&
    trimmed.endsWith(']')
  );
}

/**
 * TAHAP 1 & 2: BACKEND SERVER -> PUSH PROVIDER (EXPO PUSH API)
 * 
 * Fungsi asinkron untuk mengirimkan notifikasi dari sisi Server ke Push Provider (Expo).
 * Mengirimkan HTTP POST ke https://exp.host/--/api/v2/push/send
 * 
 * @param message Detail pesan notifikasi (to, title, body, data)
 * @returns Respon tiket pengiriman dari Expo Push Server
 */
export async function sendPushNotificationFromServer(
  message: ExpoPushMessage
): Promise<ExpoPushTicket> {
  const targetToken = Array.isArray(message.to) ? message.to[0] : message.to;

  if (!targetToken || targetToken.trim().length === 0) {
    throw new Error('Push Token tujuan tidak boleh kosong.');
  }

  const payload = {
    to: targetToken.trim(),
    sound: message.sound ?? 'default',
    title: message.title,
    body: message.body,
    data: message.data || { sentAt: new Date().toISOString() },
    priority: message.priority ?? 'high',
    channelId: message.channelId ?? 'default',
  };

  try {
    const response = await fetch(EXPO_PUSH_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        status: 'error',
        message: `HTTP Server Error (${response.status}): ${errorText || response.statusText}`,
      };
    }

    const result = await response.json();

    // Format respon resmi Expo Push API: { data: { status: 'ok', id: '...' } }
    if (result?.data) {
      const ticketData = Array.isArray(result.data) ? result.data[0] : result.data;
      return {
        status: ticketData.status === 'ok' ? 'ok' : 'error',
        id: ticketData.id,
        message: ticketData.message,
        details: ticketData.details,
      };
    }

    return {
      status: 'ok',
      message: 'Notifikasi berhasil dikirim ke Expo Push Provider',
    };
  } catch (err: any) {
    console.error('[NotificationService] Gagal menghubungi Expo Push API:', err);
    return {
      status: 'error',
      message: err?.message || 'Koneksi jaringan gagal saat mengirim ke server Expo Push.',
    };
  }
}

/**
 * TAHAP 4 & 5: LOCAL SIMULATION (Penerimaan langsung di layar perangkat)
 * 
 * Memicu notifikasi lokal secara instan (trigger: null) agar penguji / asisten lab
 * dapat melihat langsung banner notifikasi di layar perangkat (Foreground / Expo Go).
 */
export async function triggerLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || { triggeredLocally: true, timestamp: Date.now() },
        sound: 'default',
      },
      trigger: null, // null = tampilkan detik ini juga (instan)
    });
    return notificationId;
  } catch (error: any) {
    console.warn('[NotificationService] scheduleNotificationAsync gagal:', error);
    throw error;
  }
}

/**
 * Mengambil Push Token tersimpan (dari Task 01 rekan tim atau fallback demo)
 */
export async function getStoredPushToken(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
  } catch (e) {
    console.warn('[NotificationService] Gagal membaca push token dari storage:', e);
  }
  return DEFAULT_DEMO_PUSH_TOKEN;
}

/**
 * Menyimpan Push Token ke local storage perangkat
 */
export async function saveStoredPushToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_TOKEN, token.trim());
  } catch (e) {
    console.warn('[NotificationService] Gagal menyimpan push token:', e);
  }
}

/**
 * Mengambil riwayat notifikasi yang pernah diterima di perangkat
 */
export async function getNotificationHistory(): Promise<ReceivedNotificationItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[NotificationService] Gagal membaca riwayat notifikasi:', e);
  }
  return [];
}

/**
 * Menambahkan notifikasi baru ke riwayat lokal perangkat
 */
export async function saveNotificationToHistory(
  item: ReceivedNotificationItem
): Promise<ReceivedNotificationItem[]> {
  try {
    const current = await getNotificationHistory();
    const updated = [item, ...current].slice(0, 30); // Simpan 30 riwayat terakhir
    await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('[NotificationService] Gagal menyimpan ke riwayat:', e);
    return [];
  }
}

/**
 * Menghapus seluruh riwayat notifikasi
 */
export async function clearNotificationHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch (e) {
    console.warn('[NotificationService] Gagal menghapus riwayat notifikasi:', e);
  }
}
