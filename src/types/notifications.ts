/**
 * Definisi Tipe & Interface untuk Push Notification (Task 02)
 * Alur: Backend Server -> Push Provider (Expo) -> Mobile Device -> Receive -> Display
 */

/**
 * Payload pengiriman notifikasi dari server ke Expo Push API
 * Endpoint: POST https://exp.host/--/api/v2/push/send
 */
export interface ExpoPushMessage {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
  badge?: number;
  channelId?: string;
  subtitle?: string;
}

/**
 * Respon tiket pengiriman dari Expo Push Server
 */
export interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?:
      | 'DeviceNotRegistered'
      | 'InvalidCredentials'
      | 'MessageTooBig'
      | 'MessageRateExceeded'
      | string;
  };
}

/**
 * Struktur data notifikasi yang diterima di perangkat (Client Device)
 */
export interface ReceivedNotificationItem {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: number;
  read: boolean;
  source: 'expo-push-server' | 'local-simulation';
}

/**
 * Tahapan alur pengiriman push notification sesuai modul tugas:
 * 1. BACKEND SERVER (Mengirim request)
 * 2. PUSH PROVIDER (FCM / Expo memproses)
 * 3. MOBILE DEVICE (Penerima token aktif)
 * 4. RECEIVE NOTIFICATION (Perangkat menangkap pesan)
 * 5. DISPLAY MESSAGE (Pesan tampil di layar)
 */
export type NotificationPipelineStage =
  | 'idle'
  | 'server_dispatch'
  | 'provider_forwarding'
  | 'device_received'
  | 'message_displayed'
  | 'failed';

export interface NotificationLogEntry {
  id: string;
  timestamp: string;
  stage: NotificationPipelineStage;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  payload?: any;
}

