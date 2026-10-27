/**
 * RELIABLE API INTEGRATION (Task 01) & CONNECT TO REST API (Task 02)
 * REST API Service untuk data Program & Inisiatif Budaya LokalTrip.
 *
 * Tanggung jawab:
 * - Task 01 (Teman): Menangani status 2xx, 4xx, 5xx, network error, dan timeout (handleApiResponse & handleFetchError).
 * - Task 02 (Saya): Alur Loading, Error & Retry (Loading indicator, Error message, Retry button).
 * - Mengonversi JSON response menjadi Data Model (ProgramModel) — UI tidak melakukan parsing JSON secara langsung.
 */

import * as SecureStore from 'expo-secure-store';
import { PROGRAMS_API_URL, API_TIMEOUT_MS, isApiConfigured } from './apiConfig';
import { Program, ProgramModel } from '../types/program';
import { supabase } from '../lib/supabase';

export class ApiError extends Error {
  statusCode?: number;
  isNetworkError?: boolean;

  constructor(message: string, statusCode?: number, isNetworkError: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isNetworkError = isNetworkError;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Mendeteksi apakah error berasal dari jaringan, koneksi terputus, atau timeout (Task 01).
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError && error.isNetworkError) {
    return true;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    return (
      name === 'aborterror' ||
      (name === 'typeerror' && (msg.includes('network') || msg.includes('fetch'))) ||
      msg.includes('failed to fetch') ||
      msg.includes('network request failed') ||
      msg.includes('connection refused') ||
      msg.includes('offline') ||
      msg.includes('timed out') ||
      msg.includes('timeout')
    );
  }
  return false;
}

/**
 * Menangani kegagalan koneksi / Network Error pada catch block fetch (Task 01).
 */
export function handleFetchError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }

  if ((error as Error)?.name === 'AbortError') {
    throw new ApiError(
      'Koneksi ke server timeout (melebihi batas waktu). Periksa koneksi internet Anda lalu coba lagi.',
      undefined,
      true
    );
  }

  if (isNetworkError(error)) {
    throw new ApiError(
      'Koneksi internet terputus atau gagal terhubung ke server. Periksa jaringan Anda lalu coba lagi.',
      undefined,
      true
    );
  }

  throw new ApiError(
    (error as Error)?.message || 'Terjadi kesalahan saat memproses permintaan API.',
    undefined,
    false
  );
}

/**
 * Memvalidasi HTTP status code pada response fetch REST API (Task 01):
 * - Status 2xx: return data JSON
 * - Status 4xx (Client Error, misal 400, 401, 404): Lempar error informatif dengan status code
 * - Status 5xx (Server Error, misal 500, 503): Lempar error khusus gangguan server
 */
export async function handleApiResponse<T = unknown>(response: Response): Promise<T> {
  // 1. Status 2xx: return data JSON
  if (response.ok) {
    if (response.status === 204) {
      return {} as T;
    }
    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiError('Format data dari server tidak valid (bukan JSON yang diharapkan).');
    }
  }

  // Coba ambil pesan detail dari response body JSON jika tersedia
  let serverMessage = '';
  try {
    const errorBody = await response.json();
    serverMessage = errorBody?.message || errorBody?.error || '';
  } catch {
    // Body kosong atau bukan format JSON
  }

  const status = response.status;

  // Tangani 401 Unauthorized secara khusus (sesi berakhir)
  if (status === 401) {
    await supabase.auth.signOut().catch(() => {});
    await SecureStore.deleteItemAsync('access_token').catch(() => {});
    throw new ApiError(
      serverMessage ||
        'Sesi autentikasi telah berakhir atau token tidak valid (401 Unauthorized). Silakan login kembali.',
      401
    );
  }

  // 2. Tangani status 4xx (Client Error, misal 400, 401, 404)
  if (status >= 400 && status < 500) {
    let message = serverMessage;
    if (!message) {
      switch (status) {
        case 400:
          message = 'Permintaan tidak valid (400 Bad Request)';
          break;
        case 403:
          message = 'Akses ditolak (403 Forbidden)';
          break;
        case 404:
          message = 'Data tidak ditemukan (404 Not Found)';
          break;
        case 408:
          message = 'Waktu permintaan habis (408 Request Timeout)';
          break;
        case 409:
          message = 'Terjadi konflik pada data permintaan (409 Conflict)';
          break;
        case 422:
          message = 'Data yang dikirim tidak dapat diproses (422 Unprocessable Entity)';
          break;
        case 429:
          message = 'Terlalu banyak permintaan (429 Too Many Requests). Silakan coba lagi nanti.';
          break;
        default:
          message = `Permintaan klien tidak valid (${status} ${response.statusText || 'Client Error'})`;
      }
    }
    throw new ApiError(message, status);
  }

  // 3. Tangani status 5xx (Server Error, misal 500, 503)
  if (status >= 500 && status < 600) {
    let message = serverMessage;
    if (!message) {
      switch (status) {
        case 500:
          message = 'Server sedang mengalami gangguan (500 Internal Server Error)';
          break;
        case 502:
          message = 'Server gateway menerima respons tidak valid (502 Bad Gateway)';
          break;
        case 503:
          message = 'Server sedang tidak tersedia atau dalam pemeliharaan (503 Service Unavailable)';
          break;
        case 504:
          message = 'Waktu koneksi ke gateway server habis (504 Gateway Timeout)';
          break;
        default:
          message = `Server sedang mengalami gangguan (${status} ${response.statusText || 'Server Error'})`;
      }
    }
    throw new ApiError(message, status);
  }

  // Status error lainnya di luar 2xx, 4xx, 5xx
  throw new ApiError(
    serverMessage || `Terjadi kesalahan respons server (${status} ${response.statusText || 'Unknown Status'})`,
    status
  );
}

/**
 * Wrapper fetch dengan timeout AbortController agar request tidak menggantung.
 * Membaca token dari Supabase Session / SecureStore dan menyisipkan Authorization: Bearer ${token}.
 * Memvalidasi response status 2xx, 4xx, 5xx serta network error (Task 01).
 */
export async function httpGetJson(url: string): Promise<unknown> {
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
    console.log('Request Headers:', headers);

    response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (err) {
    clearTimeout(timeoutId);
    handleFetchError(err);
  }

  return await handleApiResponse(response);
}

// Mock Data Program & Inisiatif Budaya LokalTrip sesuai modul Task 03
const MOCK_PROGRAMS_RAW = [
  {
    id: 1,
    name: 'Revitalisasi Desa Wisata Adat',
    description: 'Pendampingan desa adat untuk pengembangan ekowisata berkelanjutan dan pelestarian kearifan lokal.',
    image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=500&auto=format&fit=crop&q=80',
    status: 'active',
  },
  {
    id: 2,
    name: 'Pemberdayaan Pengrajin Kriya & Batik',
    description: 'Dukungan pelatihan canting tulis, tenun ikat tradisional, serta digitalisasi etalase karya maestro pengrajin nusantara.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
    status: 'active',
  },
  {
    id: 3,
    name: 'Konservasi Hidden Gems Nusantara',
    description: 'Pemeliharaan ekosistem alam, proteksi spot tersembunyi, dan edukasi jejak nol sampah bagi penjelajah.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
    status: 'ongoing',
  },
  {
    id: 4,
    name: 'Sertifikasi Pemandu Wisata Budaya',
    description: 'Peningkatan kompetensi storytelling sejarah dan sertifikasi keamanan ramah wisatawan untuk pemandu lokal.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    status: 'completed',
  },
];

/**
 * Memeriksa konektivitas internet aktif ke gateway (Task 03 - Handle Offline).
 * Menggunakan probe HEAD request dengan timeout 2.5 detik.
 */
export async function checkInternetConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://clients3.google.com/generate_204', {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

/**
 * Ambil daftar program dari REST API (Task 01, Task 02 & Task 03).
 * Menerima beberapa bentuk response umum: array langsung, `{ data: [...] }`,
 * atau `{ results: [...] }` — semuanya dipetakan lewat ProgramModel.
 *
 * Menangani alur:
 * Request > No Internet > Offline State > User Feedback > Retry
 */
export async function fetchPrograms(
  fallbackOrOptions: boolean | { fallbackOnError?: boolean } = false
): Promise<Program[]> {
  const fallbackOnError =
    typeof fallbackOrOptions === 'boolean'
      ? fallbackOrOptions
      : Boolean(fallbackOrOptions?.fallbackOnError);

  // 1. Verifikasi konektivitas internet aktif (Task 03 - Handle Offline)
  const isOnline = await checkInternetConnection();
  if (!isOnline) {
    throw new ApiError(
      'Koneksi internet terputus. Periksa jaringan Wi-Fi atau data seluler Anda.',
      undefined,
      true
    );
  }

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
      console.warn('[programApi] Gagal fetch dari REST API:', err);
      if (fallbackOnError) {
        return ProgramModel.fromList(MOCK_PROGRAMS_RAW);
      }
      throw err;
    }
  }

  // Simulasi latensi jaringan (300ms) saat internet online
  await new Promise((resolve) => setTimeout(resolve, 300));
  return ProgramModel.fromList(MOCK_PROGRAMS_RAW);
}

export default {
  fetchPrograms,
  httpGetJson,
  isNetworkError,
  handleFetchError,
  handleApiResponse,
  checkInternetConnection,
};
