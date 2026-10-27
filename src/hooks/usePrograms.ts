/**
 * Task 02 & Task 03 - Hook untuk Manajemen Alur State REST API:
 *
 * Alur Task 02 (Loading & Error):
 * Request > Loading > Error > Retry > Request Again
 *
 * Alur Task 03 (Handle Offline):
 * Request > No Internet > Offline State > User Feedback > Retry
 *
 * Langkah Pengujian:
 * Internet Aktif > Internet dimatikan > membuka halaman data > request gagal >
 * offline message muncul > internet diaktifkan kembali > retry > data berhasil dimuat
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Program } from '../types/program';
import { fetchPrograms, isNetworkError, ApiError } from '../services/programApi';

export type ProgramsFetchStatus = 'idle' | 'loading' | 'success' | 'error' | 'offline';

interface UseProgramsResult {
  programs: Program[];
  status: ProgramsFetchStatus;
  isLoading: boolean;
  isError: boolean;
  isOffline: boolean;
  isEmpty: boolean;
  errorMessage: string | null;
  retry: () => void;
  triggerOfflineSimulation: () => void;
  triggerErrorSimulation: () => void;
}

export function usePrograms(): UseProgramsResult {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [status, setStatus] = useState<ProgramsFetchStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Alur Request: Request -> Loading -> Success / Error / Offline
  const load = useCallback(async (simulationMode: 'none' | 'offline' | 'error' = 'none') => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      if (simulationMode === 'offline') {
        // Simulasi No Internet untuk pengujian dosen/praktikum Task 03
        await new Promise((resolve) => setTimeout(resolve, 350));
        throw new ApiError(
          'Koneksi internet terputus. Periksa jaringan Wi-Fi atau data seluler Anda.',
          undefined,
          true
        );
      }

      if (simulationMode === 'error') {
        // Simulasi 500 Server Error
        await new Promise((resolve) => setTimeout(resolve, 400));
        throw new ApiError('Gagal terhubung ke REST API (500 Server Error).', 500, false);
      }

      const data = await fetchPrograms();
      if (!isMountedRef.current) return;
      setPrograms(data);
      setStatus('success');
    } catch (err) {
      if (!isMountedRef.current) return;
      setPrograms([]);

      const isOfflineError =
        (err instanceof ApiError && err.isNetworkError) ||
        isNetworkError(err) ||
        (err instanceof Error &&
          (err.message.toLowerCase().includes('internet') ||
            err.message.toLowerCase().includes('terputus') ||
            err.message.toLowerCase().includes('network')));

      const fallbackMsg = isOfflineError
        ? 'Koneksi internet terputus. Periksa jaringan Wi-Fi atau data seluler Anda.'
        : 'Gagal memuat data dari server. Silakan coba lagi.';

      setErrorMessage(err instanceof Error ? err.message : fallbackMsg);
      setStatus(isOfflineError ? 'offline' : 'error');
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    Promise.resolve().then(() => load('none'));
    return () => {
      isMountedRef.current = false;
    };
  }, [load]);

  // Alur Retry: Offline/Error -> Retry (Klik Tombol) -> Request Again (Loading -> Success/Error)
  const retry = useCallback(() => {
    load('none');
  }, [load]);

  // Simulasi Offline (Task 03) untuk pengujian demonstrasi
  const triggerOfflineSimulation = useCallback(() => {
    load('offline');
  }, [load]);

  // Simulasi Error Server
  const triggerErrorSimulation = useCallback(() => {
    load('error');
  }, [load]);

  return {
    programs,
    status,
    isLoading: status === 'loading',
    isError: status === 'error',
    isOffline: status === 'offline',
    isEmpty: status === 'success' && programs.length === 0,
    errorMessage,
    retry,
    triggerOfflineSimulation,
    triggerErrorSimulation,
  };
}

export default usePrograms;
