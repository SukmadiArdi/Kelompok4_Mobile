/**
 * Task 02 - REST API Service untuk data Program PresidenKu.
 *
 * Tanggung jawab:
 * - Melakukan HTTP GET ke REST API (fetch bawaan React Native, tanpa dependency baru).
 * - Menangani timeout, HTTP status error, dan error jaringan.
 * - Mengonversi JSON response menjadi Data Model (ProgramModel) —
 *   UI tidak pernah melakukan parsing JSON secara langsung.
 */

import { PROGRAMS_API_URL, API_TIMEOUT_MS, isApiConfigured } from './apiConfig';
import { Program, ProgramModel } from '../types/program';

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
 */
async function httpGetJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
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

/**
 * Ambil daftar program dari REST API.
 * Menerima beberapa bentuk response umum: array langsung, `{ data: [...] }`,
 * atau `{ results: [...] }` — semuanya dipetakan lewat ProgramModel.
 */
export async function fetchPrograms(): Promise<Program[]> {
  if (!isApiConfigured()) {
    throw new ApiError(
      'Endpoint REST API belum dikonfigurasi. Isi EXPO_PUBLIC_API_BASE_URL pada file .env (salin dari .env.example), lalu restart aplikasi.'
    );
  }

  const json = await httpGetJson(PROGRAMS_API_URL);

  const list: unknown = Array.isArray(json)
    ? json
    : (json as Record<string, unknown>)?.data ??
      (json as Record<string, unknown>)?.results ??
      [];

  return ProgramModel.fromList(list);
}

export default { fetchPrograms };
