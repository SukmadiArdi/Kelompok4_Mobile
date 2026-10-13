/**
 * Task 02 - REST API Service untuk data Program PresidenKu.
 *
 * Tanggung jawab:
 * - Melakukan HTTP GET ke REST API (fetch bawaan React Native, tanpa dependency baru).
 * - Menangani timeout, HTTP status error, dan error jaringan.
 * - Mengonversi JSON response menjadi Data Model (ProgramModel) —
 *   UI tidak pernah melakukan parsing JSON secara langsung.
 */

import * as SecureStore from 'expo-secure-store';
import { PROGRAMS_API_URL, API_TIMEOUT_MS, isApiConfigured } from './apiConfig';
import { Program, ProgramModel } from '../types/program';
import { supabase } from '../lib/supabase';

export class ApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/**
 * Wrapper fetch dengan timeout AbortController agar request tidak menggantung.
 * Membaca token dari Supabase Session / SecureStore dan menyisipkan Authorization: Bearer ${token}.
 * Menangani error 401 (Unauthorized) jika token tidak valid atau expired.
 */
async function httpGetJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let response: Response;
  try {
    // 1. Ambil token aktif via Supabase session atau fallback dari SecureStore (Task 02)
    let token: string | null = null;
    try {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token || null;
    } catch {
      // Abaikan jika offline / dev
    }

    if (!token) {
      token = await SecureStore.getItemAsync('access_token').catch(() => null);
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    // Sisipkan header Authorization jika token tersedia
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Log Request Headers untuk verifikasi pengujian terminal (Task 02)
    console.log("Request Headers:", headers);

    response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if ((err as Error)?.name === 'AbortError') {
      throw new ApiError(
        'Koneksi ke server terlalu lama (timeout). Periksa koneksi internet Anda lalu coba lagi.'
      );
    }
    throw new ApiError(
      'Gagal terhubung ke server. Periksa koneksi internet Anda lalu coba lagi.'
    );
  }
  clearTimeout(timeoutId);

  // Tangani error 401 (Unauthorized) jika token tidak valid atau expired
  if (response.status === 401) {
    await supabase.auth.signOut().catch(() => {});
    await SecureStore.deleteItemAsync('access_token').catch(() => {});
    throw new ApiError(
      'Sesi autentikasi telah berakhir atau token tidak valid (401 Unauthorized). Silakan login kembali.',
      401
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `Server merespons dengan error (${response.status}). Silakan coba lagi nanti.`,
      response.status
    );
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError('Format data dari server tidak valid (bukan JSON yang diharapkan).');
  }
}

// Mock Data Program Prioritas PresidenKu sesuai modul Task 03
const MOCK_PROGRAMS_RAW = [
  {
    id: 1,
    name: 'Program Pendidikan',
    description: 'Peningkatan kualitas pendidikan di Indonesia.',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&auto=format&fit=crop&q=80',
    status: 'active',
  },
  {
    id: 2,
    name: 'Program Lingkungan',
    description: 'Lingkungan yang lebih baik untuk masa depan.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80',
    status: 'active',
  },
  {
    id: 3,
    name: 'Program Kesehatan',
    description: 'Masyarakat sehat dan sejahtera.',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300&auto=format&fit=crop&q=80',
    status: 'active',
  },
];

/**
 * Ambil daftar program dari REST API.
 * Menerima beberapa bentuk response umum: array langsung, `{ data: [...] }`,
 * atau `{ results: [...] }` — semuanya dipetakan lewat ProgramModel.
 */
export async function fetchPrograms(): Promise<Program[]> {
  if (isApiConfigured()) {
    try {
      const json = await httpGetJson(PROGRAMS_API_URL);

      const list: unknown = Array.isArray(json)
        ? json
        : (json as Record<string, unknown>)?.data ??
          (json as Record<string, unknown>)?.results ??
          [];

      return ProgramModel.fromList(list);
    } catch (err) {
      console.warn('[programApi] Gagal fetch dari REST API, beralih ke fallback data:', err);
    }
  }

  // Simulasi latensi jaringan (300ms) agar loading state dan transisi UI teruji
  await new Promise((resolve) => setTimeout(resolve, 300));
  return ProgramModel.fromList(MOCK_PROGRAMS_RAW);
}

export default { fetchPrograms };
