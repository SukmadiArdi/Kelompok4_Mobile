import * as Network from 'expo-network';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  isOnline: boolean;
}

/**
 * Service untuk memantau status koneksi internet secara real-time.
 * Mengombinasikan modul native expo-network dengan ping verifikasi ke cloud.
 */
class NetworkService {
  private listeners: ((status: NetworkStatus) => void)[] = [];
  private currentStatus: NetworkStatus = {
    isConnected: true,
    isInternetReachable: true,
    isOnline: true,
  };

  /**
   * Memeriksa konektivitas internet secara aktual
   */
  async checkConnection(): Promise<NetworkStatus> {
    try {
      const state = await Network.getNetworkStateAsync();
      const isConnected = !!state.isConnected;
      const isReachable = state.isInternetReachable !== false;

      // Jika secara native terputus (airplane mode / wifi mati), langsung set offline
      if (!isConnected || !isReachable || state.type === Network.NetworkStateType.NONE) {
        const offlineStatus: NetworkStatus = {
          isConnected: false,
          isInternetReachable: false,
          isOnline: false,
        };
        this.currentStatus = offlineStatus;
        return offlineStatus;
      }

      // Verifikasi konektivitas internet aktif (Ping cepat ke public endpoint)
      let isReallyOnline = true;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);

        // Menggunakan endpoint generate_204 standar Android/iOS yang cepat dan hemat bandwidth
        const pingResp = await fetch('https://clients3.google.com/generate_204', {
          method: 'HEAD',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        isReallyOnline = pingResp.status >= 200 && pingResp.status < 400;
      } catch {
        // Fallback coba ping ke endpoint Supabase project
        try {
          const controller2 = new AbortController();
          const timeout2 = setTimeout(() => controller2.abort(), 2000);
          const sbUrl =
            (process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mxhldrdfsofbifxgwrht.supabase.co').replace(/\/+$/, '') +
            '/auth/v1/health';

          const sbResp = await fetch(sbUrl, { method: 'GET', signal: controller2.signal });
          clearTimeout(timeout2);
          isReallyOnline = sbResp.status < 500;
        } catch {
          isReallyOnline = false;
        }
      }

      const status: NetworkStatus = {
        isConnected: true,
        isInternetReachable: isReallyOnline,
        isOnline: isReallyOnline,
      };

      this.currentStatus = status;
      return status;
    } catch (e) {
      console.warn('[NetworkService] Gagal memeriksa status jaringan:', e);
      return this.currentStatus;
    }
  }

  /**
   * Mengambil status jaringan terakhir yang tersimpan di memori
   */
  getStatus(): NetworkStatus {
    return this.currentStatus;
  }

  /**
   * Mendaftarkan listener untuk pembaruan status jaringan
   */
  subscribe(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Mempublikasikan status baru ke seluruh listener
   */
  notify(status: NetworkStatus): void {
    this.currentStatus = status;
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        console.warn('[NetworkService] Error in listener callback:', err);
      }
    });
  }
}

export const networkService = new NetworkService();
export default networkService;
