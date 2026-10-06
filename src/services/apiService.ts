/**
 * ============================================================
 * LOKALTRIP API SERVICE — Panduan & Kontrak REST API
 * ============================================================
 * Pembagian Peran:
 * - Anda: Menentukan endpoint, format data request/response, dan fungsi pemanggil API.
 * - Rekan Anda: Memanggil fungsi ini di layar UI (komponen) dan menampilkan datanya.
 *
 * Fitur:
 * - Mendukung live fetch jika EXPO_PUBLIC_API_BASE_URL diatur di .env.
 * - Otomatis fallback ke mock data lokal jika API backend belum terhubung/offline,
 *   sehingga rekan Anda tetap bisa mengembangkan dan menguji tampilan UI langsung.
 * ============================================================
 */

import { Experience, HiddenGem, ArtisanProduct, Booking } from '../types';
import experiencesJson from '../data/experiences.json';
import hiddenGemsJson from '../data/hidden-gems.json';
import artisanProductsJson from '../data/artisan-products.json';
import { INITIAL_BOOKINGS } from '../data/mockData';

// Mengambil Base URL dari environment variable (.env)
declare const process: { env: Record<string, string | undefined> };
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');

const SIMULATED_DELAY_MS = 350;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/**
 * Helper request HTTP standar dengan timeout 10 detik
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new ApiError(`HTTP Error: ${res.status} ${res.statusText}`, res.status);
    }
    return (await res.json()) as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error)?.name === 'AbortError') {
      throw new ApiError('Koneksi timeout. Periksa internet atau server Anda.');
    }
    throw error;
  }
}

// =========================================================================
// 1. EXPERIENCES (Workshop & Wisata Budaya)
// =========================================================================

/**
 * Mengambil semua daftar experience/wisata budaya
 * Endpoint: GET /experiences
 */
export async function getExperiences(): Promise<Experience[]> {
  if (API_BASE_URL) {
    try {
      return await request<Experience[]>('/experiences');
    } catch (err) {
      console.warn('[LokalTrip API] Gagal fetch /experiences, fallback ke mock:', err);
    }
  }
  await delay(SIMULATED_DELAY_MS);
  return experiencesJson as Experience[];
}

/**
 * Mengambil detail 1 experience berdasarkan ID
 * Endpoint: GET /experiences/:id
 */
export async function getExperienceById(id: string): Promise<Experience | undefined> {
  if (API_BASE_URL) {
    try {
      return await request<Experience>(`/experiences/${id}`);
    } catch (err) {
      console.warn(`[LokalTrip API] Gagal fetch /experiences/${id}, fallback ke mock:`, err);
    }
  }
  await delay(SIMULATED_DELAY_MS);
  return (experiencesJson as Experience[]).find((item) => item.id === id);
}

// =========================================================================
// 2. HIDDEN GEMS (Destinasi Wisata Tersembunyi & Peta)
// =========================================================================

/**
 * Mengambil semua data hidden gems
 * Endpoint: GET /gems
 */
export async function getHiddenGems(): Promise<HiddenGem[]> {
  if (API_BASE_URL) {
    try {
      return await request<HiddenGem[]>('/gems');
    } catch (err) {
      console.warn('[LokalTrip API] Gagal fetch /gems, fallback ke mock:', err);
    }
  }
  await delay(SIMULATED_DELAY_MS);
  return hiddenGemsJson as HiddenGem[];
}

/**
 * Mengambil detail 1 hidden gem berdasarkan ID
 * Endpoint: GET /gems/:id
 */
export async function getHiddenGemById(id: string): Promise<HiddenGem | undefined> {
  if (API_BASE_URL) {
    try {
      return await request<HiddenGem>(`/gems/${id}`);
    } catch (err) {
      console.warn(`[LokalTrip API] Gagal fetch /gems/${id}, fallback ke mock:`, err);
    }
  }
  await delay(SIMULATED_DELAY_MS);
  return (hiddenGemsJson as HiddenGem[]).find((item) => item.id === id);
}

// =========================================================================
// 3. ARTISAN PRODUCTS (Marketplace Produk Seni & Kerajinan)
// =========================================================================

/**
 * Mengambil seluruh katalog produk UMKM pengrajin lokal
 * Endpoint: GET /products
 */
export async function getArtisanProducts(): Promise<ArtisanProduct[]> {
  if (API_BASE_URL) {
    try {
      return await request<ArtisanProduct[]>('/products');
    } catch (err) {
      console.warn('[LokalTrip API] Gagal fetch /products, fallback ke mock:', err);
    }
  }
  await delay(SIMULATED_DELAY_MS);
  return artisanProductsJson as ArtisanProduct[];
}

/**
 * Mengambil detail 1 produk pengrajin berdasarkan ID
 * Endpoint: GET /products/:id
 */
export async function getArtisanProductById(id: string): Promise<ArtisanProduct | undefined> {
  if (API_BASE_URL) {
    try {
      return await request<ArtisanProduct>(`/products/${id}`);
    } catch (err) {
      console.warn(`[LokalTrip API] Gagal fetch /products/${id}, fallback ke mock:`, err);
    }
  }
  await delay(SIMULATED_DELAY_MS);
  return (artisanProductsJson as ArtisanProduct[]).find((item) => item.id === id);
}

// =========================================================================
// 4. BOOKINGS (Pesanan & Transaksi)
// =========================================================================

/**
 * Mengambil daftar tiket/booking user
 * Endpoint: GET /bookings
 */
export async function getBookings(userId?: string): Promise<Booking[]> {
  if (API_BASE_URL) {
    try {
      const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      return await request<Booking[]>(`/bookings${query}`);
    } catch (err) {
      console.warn('[LokalTrip API] Gagal fetch /bookings, fallback ke mock:', err);
    }
  }
  await delay(SIMULATED_DELAY_MS);
  return INITIAL_BOOKINGS;
}

export interface CreateBookingPayload {
  experienceId: string;
  date: string;
  timeSlot: string;
  guestsCount: number;
}

/**
 * Membuat reservasi booking baru
 * Endpoint: POST /bookings
 */
export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  if (API_BASE_URL) {
    try {
      return await request<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('[LokalTrip API] Gagal POST /bookings, fallback ke mock creation:', err);
    }
  }

  await delay(SIMULATED_DELAY_MS);
  const experience = (experiencesJson as Experience[]).find((e) => e.id === payload.experienceId);
  if (!experience) {
    throw new Error(`Pengalaman tidak ditemukan: ${payload.experienceId}`);
  }

  return {
    id: `book-${Date.now()}`,
    experienceId: experience.id,
    experienceTitle: experience.title,
    experienceImage: experience.image,
    location: experience.location,
    date: payload.date,
    timeSlot: payload.timeSlot,
    guestsCount: payload.guestsCount,
    totalPrice: experience.price * payload.guestsCount,
    status: 'Menunggu',
    guideName: experience.guide.name,
    createdAt: new Date().toISOString().split('T')[0],
  };
}
