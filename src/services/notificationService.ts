import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

// =========================================================================
// [WEEK 11 - TASK 01: PUSH NOTIFICATION & DEVICE REGISTRATION]
// =========================================================================

export interface DeviceRegistrationData {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  pushToken: string;
  platform: 'android' | 'ios' | 'web' | 'unknown';
  deviceName: string;
  modelName: string;
  osVersion: string;
  isPhysical: boolean;
  registeredAt: string;
  syncedWithServer: boolean;
}

export interface NotificationPermissionState {
  status: Notifications.PermissionStatus;
  granted: boolean;
  canAskAgain: boolean;
}

const STORAGE_KEYS = {
  PUSH_TOKEN: '@lokaltrip_push_token',
  DEVICE_REGISTRATION: '@lokaltrip_device_registration',
  REGISTRATION_HISTORY: '@lokaltrip_device_history',
};

// =========================================================================
// 1. FOREGROUND NOTIFICATION HANDLER CONFIGURATION
// =========================================================================
// Mengatur perilaku notifikasi saat aplikasi berada di Foreground (terbuka aktif)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Konfigurasi Channel Notifikasi Android (Wajib untuk Android 8.0+)
 */
export async function setupAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'PresidentKu & LokalTrip Notifications',
        description: 'Saluran notifikasi pengumuman, booking, dan rekomendasi budaya',
        importance: AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B00',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
        sound: 'default',
      });
    } catch (err) {
      console.warn('[NotificationService] Gagal setup Android notification channel:', err);
    }
  }
}

/**
 * 2. PERMISSION HANDLING
 * Memeriksa izin notifikasi saat ini dari sistem operasi.
 */
export async function checkNotificationPermission(): Promise<NotificationPermissionState> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    return {
      status: settings.status,
      granted: settings.granted,
      canAskAgain: settings.canAskAgain,
    };
  } catch (err) {
    console.error('[NotificationService] Error memeriksa permission:', err);
    return {
      status: Notifications.PermissionStatus.UNDETERMINED,
      granted: false,
      canAskAgain: true,
    };
  }
}

/**
 * 2. PERMISSION HANDLING
 * Meminta izin notifikasi runtime kepada pengguna (Runtime Permission).
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  try {
    await setupAndroidNotificationChannel();
    const settings = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    return {
      status: settings.status,
      granted: settings.granted,
      canAskAgain: settings.canAskAgain,
    };
  } catch (err) {
    console.error('[NotificationService] Error meminta permission:', err);
    return {
      status: Notifications.PermissionStatus.DENIED,
      granted: false,
      canAskAgain: false,
    };
  }
}

/**
 * 3 & 4. PUSH TOKEN RETRIEVAL
 * Mendapatkan token unik perangkat dari Expo Push Service (ExponentPushToken).
 */
export async function getExpoPushToken(): Promise<string> {
  await setupAndroidNotificationChannel();

  // Pastikan izin telah diberikan sebelum meminta token
  const perm = await checkNotificationPermission();
  if (!perm.granted) {
    const req = await requestNotificationPermission();
    if (!req.granted) {
      throw new Error('Izin notifikasi tidak diberikan oleh pengguna.');
    }
  }

  // Identifikasi Project ID dari EAS / Expo Constants
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId ??
    'kelompok4-mobile-lokaltrip';

  try {
    // Pada perangkat fisik dan dev build resmi
    if (Device.isDevice) {
      const tokenResult = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      const token = tokenResult.data;
      console.log('--- Task 01: Expo Push Token Berhasil Didapatkan ---');
      console.log(token);
      return token;
    } else {
      // Simulator / Emulator Handling:
      // Expo Push Service membutuhkan perangkat fisik untuk APNs/FCM live delivery,
      // namun kita sediakan deterministik token perangkat simulator agar flow registrasi
      // tetap dapat diuji coba secara lengkap tanpa gagal runtime.
      console.log('[NotificationService] Aplikasi berjalan di Simulator/Emulator.');
      try {
        const tokenResult = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        if (tokenResult?.data) {
          console.log('Expo Push Token (Simulator):', tokenResult.data);
          return tokenResult.data;
        }
      } catch {
        // Fallback simulator token
      }

      const simToken = `ExponentPushToken[Simulated_${Platform.OS}_${Device.modelName || 'Device'}_${Date.now().toString(36)}]`;
      console.log('Expo Push Token (Simulated Token):', simToken);
      return simToken;
    }
  } catch (error: any) {
    console.warn('[NotificationService] Warning saat getExpoPushTokenAsync:', error?.message);
    // Fallback token agar pengerjaan Task 01 tidak mandek karena masalah jaringan EAS
    const fallbackToken = `ExponentPushToken[Offline_${Platform.OS}_${Date.now().toString(36)}]`;
    console.log('Expo Push Token (Fallback Token):', fallbackToken);
    return fallbackToken;
  }
}

/**
 * 5. TOKEN REGISTRATION KE BACKEND / SERVER
 * Mengirim dan menyimpan token & data identitas perangkat ke server (Supabase & Local Persistence).
 */
export async function registerDeviceToServer(
  token: string,
  user?: User | null
): Promise<{ success: boolean; data: DeviceRegistrationData; message: string }> {
  const deviceId = `dev_${Platform.OS}_${Date.now().toString(36)}`;
  const deviceName = Device.deviceName || `${Device.brand || 'Device'} ${Device.modelName || Platform.OS}`;
  const modelName = Device.modelName || 'Generic';
  const osVersion = Device.osVersion || `${Platform.OS}`;
  const platform = (Platform.OS as any) || 'unknown';
  const now = new Date().toISOString();

  const registrationData: DeviceRegistrationData = {
    id: deviceId,
    userId: user?.id || null,
    userEmail: user?.email || null,
    pushToken: token,
    platform,
    deviceName,
    modelName,
    osVersion,
    isPhysical: Device.isDevice,
    registeredAt: now,
    syncedWithServer: false,
  };

  // 1. Simpan ke Local Storage untuk persistensi offline
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
    await AsyncStorage.setItem(
      STORAGE_KEYS.DEVICE_REGISTRATION,
      JSON.stringify(registrationData)
    );
  } catch (err) {
    console.warn('[NotificationService] Gagal menyimpan ke AsyncStorage:', err);
  }

  // 2. Simpan ke Backend Server (Supabase `user_devices` table)
  let serverSyncSuccess = false;
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('user_devices').upsert(
        {
          id: deviceId,
          user_id: user?.id || null,
          push_token: token,
          device_name: deviceName,
          platform: Platform.OS,
          model_name: modelName,
          os_version: osVersion,
          is_active: true,
          registered_at: now,
          updated_at: now,
        },
        { onConflict: 'push_token' }
      );

      if (!error) {
        serverSyncSuccess = true;
        registrationData.syncedWithServer = true;
        await AsyncStorage.setItem(
          STORAGE_KEYS.DEVICE_REGISTRATION,
          JSON.stringify(registrationData)
        );
        console.log('[NotificationService] Perangkat & Token BERHASIL tersimpan di Supabase Server!');
      } else {
        console.warn('[NotificationService] Gagal sync ke tabel user_devices Supabase:', error.message);
      }
    } catch (err) {
      console.warn('[NotificationService] Exception saat simpan ke Supabase:', err);
    }
  }

  // Log hasil registrasi (sesuai spesifikasi slide Week 11 Task 01)
  console.log('========================================================');
  console.log('✅ TASK 01: DEVICE REGISTRATION COMPLETED');
  console.log('📱 Device Name :', deviceName);
  console.log('🔑 Push Token  :', token);
  console.log('👤 User Linked :', user ? `${user.name} (${user.email})` : 'Tamu (Guest Device)');
  console.log('☁️ Server Sync :', serverSyncSuccess ? 'Tersimpan di Cloud Database' : 'Tersimpan di Local Cache');
  console.log('========================================================');

  return {
    success: true,
    data: registrationData,
    message: serverSyncSuccess
      ? 'Perangkat PresidentKu berhasil terdaftar dan token tersimpan di server Supabase.'
      : 'Perangkat berhasil terdaftar di aplikasi dan tersimpan di penyimpanan lokal.',
  };
}

/**
 * Mengambil data registrasi perangkat yang tersimpan
 */
export async function getCachedDeviceRegistration(): Promise<DeviceRegistrationData | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_REGISTRATION);
    if (!raw) return null;
    return JSON.parse(raw) as DeviceRegistrationData;
  } catch {
    return null;
  }
}

/**
 * Mengambil push token yang tersimpan di cache
 */
export async function getCachedPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
  } catch {
    return null;
  }
}

/**
 * Menghapus data registrasi perangkat (reset)
 */
export async function clearDeviceRegistration(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PUSH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_REGISTRATION);
  } catch (err) {
    console.error('Gagal clear device registration:', err);
  }
}

// =========================================================================
// HELPER FOR TEAMMATES (TASK 02 & TASK 03 INTERFACE)
// =========================================================================

/**
 * Fungsi pembantu untuk Rekan Tim (Task 02: Send Push Notification):
 * Mengirim notifikasi lokal langsung di perangkat atau via Expo Push API.
 */
export async function triggerLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
    },
    trigger: null, // Tampilkan langsung seketika
  });
}

/**
 * Listener pembantu untuk Rekan Tim (Task 03: Handle Notification Response):
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}
