/**
 * Task 02 - Hook untuk mengambil data program dari REST API.
 * Memisahkan tanggung jawab: UI memanggil hook ini, hook memakai service,
 * service mengembalikan Data Model — bukan JSON mentah.
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
}

export function usePrograms(): UseProgramsResult {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [status, setStatus] = useState<ProgramsFetchStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchPrograms();
      if (!isMountedRef.current) return;
      setPrograms(data);
      setStatus('success');
    } catch (err) {
      if (!isMountedRef.current) return;
      setPrograms([]);
      setErrorMessage(
        err instanceof Error ? err.message : 'Gagal memuat data. Silakan coba lagi.'
      );
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    // Status 'loading' sudah diset saat initial state; di sini kita hanya
    // menghidupkan request asynchronous (semua setState terjadi di callback
    // async, tidak pernah synchronously di body effect).
    Promise.resolve().then(load);
    return () => {
      isMountedRef.current = false;
    };
  }, [load]);

  const retry = useCallback(() => {
    // Set state dipicu dari event handler pengguna — aman & idiomatik.
    setStatus('loading');
    setErrorMessage(null);
    load();
  }, [load]);

  return {
    programs,
    status,
    isLoading: status === 'loading',
    isError: status === 'error',
    isEmpty: status === 'success' && programs.length === 0,
    errorMessage,
    retry,
  };
}

export default usePrograms;
