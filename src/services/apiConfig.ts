/**
 * Konfigurasi REST API Backend Aplikasi
 *
 * URL base API diambil dari environment variable `EXPO_PUBLIC_API_BASE_URL`.
 */

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const API_BASE_URL: string = trimTrailingSlash(
  (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim()
);

/** Request timeout standar (ms) */
export const API_TIMEOUT_MS: number = 15000;

export const isApiConfigured = (): boolean => API_BASE_URL !== '';

export default {
  API_BASE_URL,
  API_TIMEOUT_MS,
  isApiConfigured,
};
