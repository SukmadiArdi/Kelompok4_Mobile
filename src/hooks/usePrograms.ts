/**
 * Task 02 - Hook untuk Manajemen Alur State REST API:
 * Request > Loading > Error > Retry > Request Again
 *
 * Tanggung Jawab (Task 2):
 * 1. Loading State (isLoading = true, memicu Loading Indicator)
 * 2. Error State (isError = true, memicu Error Message)
 * 3. Retry Flow (memanggil retry(), mengubah state ke Loading, dan Request Ulang)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Program } from '../types/program';
import { fetchPrograms } from '../services/programApi';

export type ProgramsFetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseProgramsResult {
  programs: Program[];
  status: ProgramsFetchStatus;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorMessage: string | null;
  retry: () => void;
  triggerErrorSimulation: () => void;
}

export function usePrograms(): UseProgramsResult {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [status, setStatus] = useState<ProgramsFetchStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Alur Request: Request -> Loading -> Success / Error
  const load = useCallback(async (isSimulatedError: boolean = false) => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      if (isSimulatedError) {
        // Simulasi error jaringan / server 500 untuk pengujian dosen
        await new Promise((resolve) => setTimeout(resolve, 400));
        throw new Error('Gagal terhubung ke REST API (500 Server Error / Jaringan Terputus).');
      }

      const data = await fetchPrograms();
      if (!isMountedRef.current) return;
      setPrograms(data);
      setStatus('success');
    } catch (err) {
      if (!isMountedRef.current) return;
      setPrograms([]);
      setErrorMessage(
        err instanceof Error ? err.message : 'Gagal memuat data dari server. Silakan coba lagi.'
      );
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    Promise.resolve().then(() => load(false));
    return () => {
      isMountedRef.current = false;
    };
  }, [load]);

  // Alur Retry: Error -> Retry (Klik Tombol) -> Request Again (Loading -> Success/Error)
  const retry = useCallback(() => {
    load(false);
  }, [load]);

  // Simulasi Error untuk pengujian demonstrasi
  const triggerErrorSimulation = useCallback(() => {
    load(true);
  }, [load]);

  return {
    programs,
    status,
    isLoading: status === 'loading',
    isError: status === 'error',
    isEmpty: status === 'success' && programs.length === 0,
    errorMessage,
    retry,
    triggerErrorSimulation,
  };
}

export default usePrograms;

