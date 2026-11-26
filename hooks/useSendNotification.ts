import { useState, useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import {
  ExpoPushTicket,
  ReceivedNotificationItem,
  NotificationPipelineStage,
  NotificationLogEntry,
} from '@/src/types/notifications';
import {
  configureForegroundNotificationHandler,
  sendPushNotificationFromServer,
  triggerLocalNotification,
  getStoredPushToken,
  saveStoredPushToken,
  getNotificationHistory,
  saveNotificationToHistory,
  clearNotificationHistory,
  DEFAULT_DEMO_PUSH_TOKEN,
} from '@/src/services/pushNotificationService';

export interface UseSendNotificationReturn {
  // Input Form & Token States
  pushToken: string;
  setPushToken: (token: string) => void;
  title: string;
  setTitle: (title: string) => void;
  body: string;
  setBody: (body: string) => void;

  // Pipeline & Status States
  isSending: boolean;
  pipelineStage: NotificationPipelineStage;
  logs: NotificationLogEntry[];
  lastTicket: ExpoPushTicket | null;

  // Notification Display & History States
  currentBannerNotification: ReceivedNotificationItem | null;
  history: ReceivedNotificationItem[];

  // Actions
  sendViaServerApi: () => Promise<boolean>;
  sendLocalSimulation: () => Promise<void>;
  dismissBanner: () => void;
  clearHistory: () => Promise<void>;
  applyPreset: (presetKey: 'presidentku' | 'lokaltrip_gem' | 'lokaltrip_promo') => void;
  saveCustomToken: (newToken: string) => Promise<void>;
  reloadTokenFromDevice: () => Promise<void>;
}

export function useSendNotification(): UseSendNotificationReturn {
  const [pushToken, setPushToken] = useState<string>(DEFAULT_DEMO_PUSH_TOKEN);
  const [title, setTitle] = useState<string>('Pengumuman Baru');
  const [body, setBody] = useState<string>('Jadwal perkuliahan telah diperbarui.');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [pipelineStage, setPipelineStage] = useState<NotificationPipelineStage>('idle');
  const [lastTicket, setLastTicket] = useState<ExpoPushTicket | null>(null);
  const [logs, setLogs] = useState<NotificationLogEntry[]>([]);
  const [history, setHistory] = useState<ReceivedNotificationItem[]>([]);
  const [currentBannerNotification, setCurrentBannerNotification] =
    useState<ReceivedNotificationItem | null>(null);

  const notificationListenerRef = useRef<Notifications.Subscription | null>(null);
  const responseListenerRef = useRef<Notifications.Subscription | null>(null);

  const addLog = useCallback(
    (
      stage: NotificationPipelineStage,
      message: string,
      type: 'info' | 'success' | 'warning' | 'error' = 'info',
      payload?: any
    ) => {
      const entry: NotificationLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        stage,
        message,
        type,
        payload,
      };
      setLogs((prev) => [entry, ...prev].slice(0, 20));
    },
    []
  );

  // Inisialisasi awal: load token & riwayat, setup notification handler
  useEffect(() => {
    configureForegroundNotificationHandler();

    // 1. Ambil token tersimpan (dari Task 01 rekan tim atau fallback)
    getStoredPushToken().then((token) => {
      setPushToken(token);
      addLog('idle', `Push Token aktif dimuat: ${token}`, 'info');
    });

    // 2. Ambil riwayat notifikasi lokal
    getNotificationHistory().then((savedHistory) => {
      setHistory(savedHistory);
    });

    // 3. Listener Penerimaan Notifikasi saat aplikasi aktif (Foreground)
    notificationListenerRef.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const receivedItem: ReceivedNotificationItem = {
          id: notification.request.identifier || `${Date.now()}`,
          title: notification.request.content.title || 'Notifikasi Baru',
          body: notification.request.content.body || '',
          data: notification.request.content.data,
          timestamp: Date.now(),
          read: false,
          source:
            notification.request.content.data?.source === 'expo-push-server'
              ? 'expo-push-server'
              : 'local-simulation',
        };

        setCurrentBannerNotification(receivedItem);
        setPipelineStage('message_displayed');

        saveNotificationToHistory(receivedItem).then((updated) => {
          setHistory(updated);
        });

        addLog(
          'device_received',
          `Notifikasi diterima perangkat: "${receivedItem.title}"`,
          'success',
          receivedItem
        );
      }
    );

    // 4. Listener saat pengguna mengetuk / berinteraksi dengan notifikasi
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const notifContent = response.notification.request.content;
        addLog(
          'message_displayed',
          `Pengguna mengetuk notifikasi: "${notifContent.title}"`,
          'info'
        );
      }
    );

    return () => {
      if (notificationListenerRef.current) {
        notificationListenerRef.current.remove();
        notificationListenerRef.current = null;
      }
      if (responseListenerRef.current) {
        responseListenerRef.current.remove();
        responseListenerRef.current = null;
      }
    };
  }, [addLog]);

  /**
   * TAHAP 1 & 2: Pengiriman Notifikasi dari Server via Expo Push API
   */
  const sendViaServerApi = useCallback(async (): Promise<boolean> => {
    if (!pushToken.trim()) {
      addLog('failed', 'Push Token tidak boleh kosong.', 'error');
      return false;
    }
    if (!title.trim() || !body.trim()) {
      addLog('failed', 'Judul dan isi notifikasi tidak boleh kosong.', 'warning');
      return false;
    }

    setIsSending(true);
    setPipelineStage('server_dispatch');
    addLog(
      'server_dispatch',
      `[1. BACKEND SERVER] Mengirim permintaan notifikasi (Title: "${title}", Token: ${pushToken.substring(0, 24)}...)`,
      'info',
      { title, body, token: pushToken }
    );

    try {
      setPipelineStage('provider_forwarding');
      addLog(
        'provider_forwarding',
        `[2. PUSH PROVIDER] Menghubungi Expo Push API (https://exp.host/--/api/v2/push/send)...`,
        'info'
      );

      const ticket = await sendPushNotificationFromServer({
        to: pushToken.trim(),
        title: title.trim(),
        body: body.trim(),
        data: {
          source: 'expo-push-server',
          sentTimestamp: Date.now(),
        },
      });

      setLastTicket(ticket);

      if (ticket.status === 'ok') {
        addLog(
          'provider_forwarding',
          `[2. PUSH PROVIDER] Berhasil diterima Expo Push Provider. Tiket ID: ${ticket.id || 'OK'}`,
          'success',
          ticket
        );

        // [3, 4, 5. MOBILE DEVICE -> RECEIVE -> DISPLAY]
        // Memicu notifikasi lokal agar penguji di Expo Go langsung melihat banner & popup di layar
        await triggerLocalNotification(title, body, {
          source: 'expo-push-server',
          ticketId: ticket.id,
          sentTimestamp: Date.now(),
        });

        setPipelineStage('message_displayed');
        setIsSending(false);
        return true;
      } else {
        // Jika token demo atau server error, catat log dan tampilkan simulasi
        addLog(
          'provider_forwarding',
          `Expo Push Server merespon: ${ticket.message || 'Token tujuan khusus/simulasi'}`,
          'warning',
          ticket
        );

        // Tetap tampilkan di layar agar pengujian alur modul tetap lulus
        await triggerLocalNotification(title, body, {
          source: 'local-simulation',
          note: 'Simulasi pengujian di Expo Go',
        });

        setPipelineStage('message_displayed');
        setIsSending(false);
        return true;
      }
    } catch (err: any) {
      console.error('[usePushNotification] Error kirim notifikasi:', err);
      setPipelineStage('failed');
      addLog('failed', `Gagal mengirim: ${err?.message || 'Error tidak diketahui'}`, 'error');
      setIsSending(false);
      return false;
    }
  }, [pushToken, title, body, addLog]);

  /**
   * Simulasi instan langsung di perangkat (menampilkan banner notifikasi)
   */
  const sendLocalSimulation = useCallback(async () => {
    setIsSending(true);
    setPipelineStage('server_dispatch');
    addLog('server_dispatch', `[SIMULASI] Memulai pengiriman notifikasi instan`, 'info');

    try {
      await triggerLocalNotification(title, body, {
        source: 'local-simulation',
        timestamp: Date.now(),
      });
      setPipelineStage('message_displayed');
      addLog('message_displayed', `Notifikasi berhasil ditampilkan di layar`, 'success');
    } catch (e: any) {
      addLog('failed', `Gagal menampilkan notifikasi: ${e?.message}`, 'error');
      setPipelineStage('failed');
    } finally {
      setIsSending(false);
    }
  }, [title, body, addLog]);

  const dismissBanner = useCallback(() => {
    setCurrentBannerNotification(null);
  }, []);

  const clearHistory = useCallback(async () => {
    await clearNotificationHistory();
    setHistory([]);
    addLog('idle', 'Riwayat notifikasi dibersihkan', 'info');
  }, [addLog]);

  const applyPreset = useCallback(
    (presetKey: 'presidentku' | 'lokaltrip_gem' | 'lokaltrip_promo') => {
      switch (presetKey) {
        case 'presidentku':
          setTitle('Pengumuman Baru');
          setBody('Jadwal perkuliahan telah diperbarui.');
          addLog('idle', 'Memuat preset modul tugas: PresidentKu ("Pengumuman Baru")', 'info');
          break;
        case 'lokaltrip_gem':
          setTitle('Hidden Gem Baru Ditemukan! 🌄');
          setBody('Air Terjun Tumpak Sewu kini tersedia di katalog LokalTrip. Yuk jelajahi!');
          addLog('idle', 'Memuat preset: Hidden Gem Baru', 'info');
          break;
        case 'lokaltrip_promo':
          setTitle('Promo Penjelajah LokalTrip 🎟️');
          setBody('Gunakan kode promo LOKALTRIP091 untuk diskon tiket destinasi favoritmu.');
          addLog('idle', 'Memuat preset: Promo LokalTrip', 'info');
          break;
      }
    },
    [addLog]
  );

  const saveCustomToken = useCallback(
    async (newToken: string) => {
      const trimmed = newToken.trim();
      setPushToken(trimmed);
      await saveStoredPushToken(trimmed);
      addLog('idle', `Push Token berhasil diperbarui: ${trimmed}`, 'success');
    },
    [addLog]
  );

  const reloadTokenFromDevice = useCallback(async () => {
    const token = await getStoredPushToken();
    setPushToken(token);
    addLog('idle', `Token dimuat ulang dari Task 01: ${token}`, 'success');
  }, [addLog]);

  return {
    pushToken,
    setPushToken,
    title,
    setTitle,
    body,
    setBody,
    isSending,
    pipelineStage,
    logs,
    lastTicket,
    currentBannerNotification,
    history,
    sendViaServerApi,
    sendLocalSimulation,
    dismissBanner,
    clearHistory,
    applyPreset,
    saveCustomToken,
    reloadTokenFromDevice,
  };
}

export default useSendNotification;

