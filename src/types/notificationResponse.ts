/**
 * [WEEK 11 - TASK 03: HANDLE NOTIFICATION RESPONSE & DEEP LINKING]
 * 
 * Kontrak tipe untuk menangani respon ketukan notifikasi (Notification Tap),
 * membaca data payload, menentukan halaman tujuan, dan melakukan navigasi.
 */

export type NotificationTargetType =
  | 'experience'
  | 'gem'
  | 'product'
  | 'announcement'
  | 'todos'
  | 'notifications'
  | 'custom';

/**
 * Struktur payload data yang disematkan dalam notifikasi
 */
export interface NotificationDataPayload {
  screen?: string;
  url?: string;
  targetRoute?: string;
  type?: NotificationTargetType;
  id?: string;
  experienceId?: string;
  gemId?: string;
  productId?: string;
  title?: string;
  body?: string;
  action?: string;
  sentAt?: string | number;
  [key: string]: any;
}

/**
 * Hasil resolusi rute navigasi dari payload notifikasi
 */
export interface ResolvedRouteInfo {
  route: string;
  label: string;
  type: NotificationTargetType;
  params?: Record<string, string>;
  description: string;
}

/**
 * Log aktivitas respon notifikasi saat pengguna mengetuk (User Taps)
 */
export interface NotificationResponseLog {
  id: string;
  timestamp: string;
  step: 'received' | 'tapped' | 'payload_read' | 'screen_identified' | 'navigated' | 'failed';
  title: string;
  route: string;
  payload: NotificationDataPayload;
}

/**
 * Tahapan alur Task 03 sesuai modul:
 * 1. NOTIFICATION RECEIVED (Aplikasi menerima notifikasi)
 * 2. USER TAPS (Pengguna menekan notifikasi)
 * 3. READ PAYLOAD (Data dari notifikasi dibaca)
 * 4. IDENTIFY SCREEN (Menentukan halaman tujuan)
 * 5. NAVIGATE TO PAGE (Aplikasi membuka halaman sesuai tujuan)
 */
export type ResponsePipelineStep =
  | 'idle'
  | 'notification_received'
  | 'user_taps'
  | 'read_payload'
  | 'identify_screen'
  | 'navigate_to_page'
  | 'completed';
