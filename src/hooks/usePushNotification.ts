import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  checkNotificationPermission,
  requestNotificationPermission,
  getExpoPushToken,
  registerDeviceToServer,
  getCachedDeviceRegistration,
  clearDeviceRegistration,
  DeviceRegistrationData,
  NotificationPermissionState,
} from '../services/notificationService';

// =========================================================================
// [WEEK 11 - TASK 01: CUSTOM HOOK USE_PUSH_NOTIFICATION]
// =========================================================================

export interface UsePushNotificationReturn {
  pushToken: string | null;
  permission: NotificationPermissionState | null;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  deviceInfo: DeviceRegistrationData | null;
  requestPermissionAndRegister: () => Promise<DeviceRegistrationData | null>;
  refreshStatus: () => Promise<void>;
  resetRegistration: () => Promise<void>;
}

export function usePushNotification(): UsePushNotificationReturn {
  const { user } = useAuth();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermissionState | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceRegistrationData | null>(null);

  const isMountedRef = useRef<boolean>(true);

  /**
   * Muat status izin & registrasi saat hook pertama kali dipasang
   */
  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Cek izin notifikasi
      const permState = await checkNotificationPermission();
      if (isMountedRef.current) {
        setPermission(permState);
      }

      // 2. Cek apakah perangkat sudah pernah terdaftar sebelumnya
      const cached = await getCachedDeviceRegistration();
      if (isMountedRef.current) {
        if (cached && cached.pushToken) {
          setPushToken(cached.pushToken);
          setDeviceInfo(cached);
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
        }
      }
    } catch (err: any) {
      console.warn('[usePushNotification] Error saat refresh status:', err);
      if (isMountedRef.current) {
        setError(err?.message || 'Gagal memeriksa status notifikasi.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshStatus();
    return () => {
      isMountedRef.current = false;
    };
  }, [refreshStatus]);

  /**
   * ALUR TASK 01 LENGKAP:
   * PRESIDENTKU (App) -> REQUEST PERMISSION -> REGISTER DEVICE -> GET PUSH TOKEN -> SEND TOKEN TO SERVER
   */
  const requestPermissionAndRegister = useCallback(async (): Promise<DeviceRegistrationData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Request Permission
      const reqPerm = await requestNotificationPermission();
      if (isMountedRef.current) {
        setPermission(reqPerm);
      }

      if (!reqPerm.granted) {
        const msg = 'Izin notifikasi tidak diberikan. Harap aktifkan izin di pengaturan perangkat.';
        if (isMountedRef.current) {
          setError(msg);
        }
        Alert.alert('Izin Ditolak', msg);
        return null;
      }

      // 2. Get Push Token
      const token = await getExpoPushToken();
      if (isMountedRef.current) {
        setPushToken(token);
      }

      // 3. Register Device & Send Token to Server
      const result = await registerDeviceToServer(token, user);
      if (isMountedRef.current) {
        setDeviceInfo(result.data);
        setIsRegistered(true);
      }

      Alert.alert(
        'Registrasi Berhasil! 🎉',
        `Perangkat berhasil didaftarkan ke server.\n\nPush Token:\n${token.slice(0, 36)}...`
      );

      return result.data;
    } catch (err: any) {
      const errMsg = err?.message || 'Gagal mendaftarkan perangkat untuk notifikasi.';
      console.error('[usePushNotification] Error registrasi:', err);
      if (isMountedRef.current) {
        setError(errMsg);
      }
      Alert.alert('Registrasi Gagal', errMsg);
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user]);

  /**
   * Reset data token registrasi
   */
  const resetRegistration = useCallback(async () => {
    setIsLoading(true);
    try {
      await clearDeviceRegistration();
      if (isMountedRef.current) {
        setPushToken(null);
        setDeviceInfo(null);
        setIsRegistered(false);
      }
      Alert.alert('Direset', 'Data token perangkat telah dibersihkan.');
    } catch (err: any) {
      Alert.alert('Gagal', err?.message || 'Gagal mereset data.');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  return {
    pushToken,
    permission,
    isRegistered,
    isLoading,
    error,
    deviceInfo,
    requestPermissionAndRegister,
    refreshStatus,
    resetRegistration,
  };
}

export default usePushNotification;
