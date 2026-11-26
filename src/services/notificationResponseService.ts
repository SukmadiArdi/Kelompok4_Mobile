import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NotificationDataPayload,
  ResolvedRouteInfo,
  NotificationResponseLog,
} from '@/src/types/notificationResponse';

const STORAGE_KEY_RESPONSE_HISTORY = '@lokaltrip_response_history';

/**
 * LANGKAH 3 & 4: READ PAYLOAD & IDENTIFY SCREEN
 * 
 * Membaca payload data notifikasi dan menentukan halaman tujuan (Deep Linking)
 * yang sesuai dalam aplikasi LokalTrip / PresidentKu.
 */
export function resolveTargetRoute(data?: NotificationDataPayload): ResolvedRouteInfo {
  if (!data) {
    return {
      route: '/(tabs)',
      label: 'Beranda Utama LokalTrip',
      type: 'custom',
      description: 'Payload kosong, navigasi ke Beranda',
    };
  }

  // 1. Cek rute eksplisit via `screen`, `url`, atau `targetRoute`
  const explicitRoute = data.screen || data.url || data.targetRoute;
  if (explicitRoute && typeof explicitRoute === 'string') {
    const cleanRoute = explicitRoute.trim();
    if (cleanRoute.startsWith('/gem/')) {
      return {
        route: cleanRoute,
        label: 'Detail Hidden Gem',
        type: 'gem',
        description: `Membuka spot hidden gem: ${cleanRoute}`,
      };
    }
    if (cleanRoute.startsWith('/experience/')) {
      return {
        route: cleanRoute,
        label: 'Detail Pengalaman Budaya',
        type: 'experience',
        description: `Membuka aktivitas wisata budaya: ${cleanRoute}`,
      };
    }
    if (cleanRoute.startsWith('/product/')) {
      return {
        route: cleanRoute,
        label: 'Detail Produk Artisan Store',
        type: 'product',
        description: `Membuka katalog karya pengrajin: ${cleanRoute}`,
      };
    }
    if (cleanRoute === '/(tabs)/todos' || cleanRoute === '/todos') {
      return {
        route: '/(tabs)/todos',
        label: 'Todo List Async (Week 8/9)',
        type: 'todos',
        description: 'Membuka modul penugasan Todo List Async',
      };
    }
    if (cleanRoute === '/notifications') {
      return {
        route: '/notifications',
        label: 'Pusat Pengumuman & Notifikasi (PresidentKu)',
        type: 'announcement',
        description: 'Membuka hub notifikasi dan pengumuman',
      };
    }
    return {
      route: cleanRoute,
      label: 'Halaman Kustom',
      type: 'custom',
      description: `Membuka rute: ${cleanRoute}`,
    };
  }

  // 2. Cek berdasarkan entitas ID spesifik (gemId, experienceId, productId)
  if (data.gemId || data.type === 'gem') {
    const id = data.gemId || data.id || 'gem-1';
    return {
      route: `/gem/${id}`,
      label: 'Detail Hidden Gem',
      type: 'gem',
      description: `Navigasi ke hidden gem dengan ID: ${id}`,
    };
  }

  if (data.experienceId || data.type === 'experience') {
    const id = data.experienceId || data.id || 'exp-1';
    return {
      route: `/experience/${id}`,
      label: 'Detail Pengalaman Budaya',
      type: 'experience',
      description: `Navigasi ke pengalaman budaya dengan ID: ${id}`,
    };
  }

  if (data.productId || data.type === 'product') {
    const id = data.productId || data.id || 'prod-1';
    return {
      route: `/product/${id}`,
      label: 'Detail Produk Artisan Store',
      type: 'product',
      description: `Navigasi ke produk pengrajin dengan ID: ${id}`,
    };
  }

  if (data.type === 'announcement' || data.action === 'announcement') {
    return {
      route: '/notifications',
      label: 'Pengumuman PresidentKu',
      type: 'announcement',
      description: 'Membuka pengumuman akademik PresidentKu',
    };
  }

  if (data.type === 'todos') {
    return {
      route: '/(tabs)/todos',
      label: 'Todo List Async',
      type: 'todos',
      description: 'Membuka halaman Todo List Async',
    };
  }

  // 3. Fallback jika tidak ada informasi spesifik
  return {
    route: '/(tabs)',
    label: 'Beranda LokalTrip',
    type: 'custom',
    description: 'Rute default beranda',
  };
}

/**
 * LANGKAH 5: NAVIGATE TO PAGE
 * 
 * Melakukan navigasi ke halaman tujuan menggunakan Expo Router
 * dan mencatat aktivitas ke riwayat respon notifikasi.
 */
export async function executeNotificationNavigation(
  payload: NotificationDataPayload,
  sourceTitle: string = 'Notifikasi'
): Promise<ResolvedRouteInfo> {
  const target = resolveTargetRoute(payload);

  // Catat ke penyimpanan riwayat ketukan
  const logEntry: NotificationResponseLog = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString('id-ID'),
    step: 'navigated',
    title: sourceTitle,
    route: target.route,
    payload,
  };

  try {
    const existingRaw = await AsyncStorage.getItem(STORAGE_KEY_RESPONSE_HISTORY);
    const existing: NotificationResponseLog[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [logEntry, ...existing].slice(0, 20);
    await AsyncStorage.setItem(STORAGE_KEY_RESPONSE_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[NotificationResponseService] Gagal menyimpan log ketukan:', err);
  }

  // Lakukan navigasi Expo Router dengan sedikit jeda agar transisi halus
  setTimeout(() => {
    try {
      router.push(target.route as any);
    } catch (navError) {
      console.error('[NotificationResponseService] Gagal navigasi:', navError);
    }
  }, 100);

  return target;
}

/**
 * Mengambil riwayat aktivitas respon notifikasi yang tersimpan
 */
export async function getResponseHistory(): Promise<NotificationResponseLog[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_RESPONSE_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Membersihkan riwayat respon notifikasi
 */
export async function clearResponseHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY_RESPONSE_HISTORY);
  } catch (err) {
    console.warn('[NotificationResponseService] Gagal membersihkan riwayat respon:', err);
  }
}
