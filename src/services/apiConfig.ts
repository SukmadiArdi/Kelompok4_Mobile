/**
 * Task 02 - Konfigurasi REST API PresidenKu
 *
 * Endpoint TIDAK di-hardcode sembarangan. URL base API diambil dari environment
 * variable `EXPO_PUBLIC_API_BASE_URL` (diekspos oleh Expo/Metro saat build).
 *
 * CARA MENGISI:
 * 1. Salin `.env.example` menjadi `.env` (file .env tidak di-commit ke git).
 * 2. Isi dengan URL REST API yang disediakan pada tugas Anda, contoh:
 *      EXPO_PUBLIC_API_BASE_URL=https://api.contoh-resmi.go.id/v1
 *      EXPO_PUBLIC_PROGRAMS_ENDPOINT=/programs   (opsional, default: /programs)
 *
 * Jika variabel tidak diisi, aplikasi akan menampilkan error state yang jelas
 * (bukan crash, bukan data palsu) dan meminta pengguna mengisi konfigurasi API.
 */

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const API_BASE_URL: string = trimTrailingSlash(
  (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim()
);

export const PROGRAMS_ENDPOINT: string = (() => {
  const raw = (process.env.EXPO_PUBLIC_PROGRAMS_ENDPOINT ?? '/programs').trim();
  return raw.startsWith('/') ? raw : `/${raw}`;
})();

/** Request timeout standar (ms) agar loading state tidak menggantung selamanya. */
export const API_TIMEOUT_MS: number = 15000;

export const PROGRAMS_API_URL: string = API_BASE_URL
  ? `${API_BASE_URL}${PROGRAMS_ENDPOINT}`
  : '';

export const isApiConfigured = (): boolean => API_BASE_URL !== '';

export default {
  API_BASE_URL,
  PROGRAMS_ENDPOINT,
  PROGRAMS_API_URL,
  API_TIMEOUT_MS,
  isApiConfigured,
};
