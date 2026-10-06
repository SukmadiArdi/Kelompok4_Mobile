/**
 * ============================================================
 * LOKALTRIP API SERVICE — Penugasan: Mengambil Data dari API
 * ============================================================
 * File ini adalah "kerangka tugas" untuk teman Anda. Saat ini
 * seluruh fungsi mengembalikan data JSON lokal (mock) dengan
 * simulasi delay jaringan, sehingga UI sudah bisa berjalan
 * penuh tanpa backend.
 *
 * CARA MENGGANTIKAN DENGAN API ASLI (tugas teman):
 * 1. Tentukan base URL backend, misalnya:
 *      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
 *    lalu tambahkan EXPO_PUBLIC_API_BASE_URL=https://api.lokaltrip.id
 *    di file .env (lihat .env.example).
 * 2. Ganti isi setiap fungsi `return await localFetch(...)`
 *    menjadi `return await request(...)`, contoh:
 *
 *      export async function getExperiences(): Promise<Experience[]> {
 *        return request<Experience[]>('/experiences');
 *      }
 *
 * 3. Kontrak response API WAJIB sama dengan tipe di
 *    `src/types/index.ts` (Experience, HiddenGem, ArtisanProduct, Booking).
 *
 * Endpoint yang sebaiknya disediakan backend:
 *    GET /experiences          -> Experience[]
 *    GET /experiences/:id      -> Experience
 *    GET /gems                 -> HiddenGem[]
 *    GET /gems/:id             -> HiddenGem
 *    GET /products             -> ArtisanProduct[]
 *    GET /products/:id         -> ArtisanProduct
 *    POST /bookings            -> Booking   (body: createBookingPayload)
 *    GET /bookings?userId=     -> Booking[]
 * ============================================================
 */

import { Experience, HiddenGem, ArtisanProduct, Booking } from '../types';
import experiencesJson from '../data/experiences.json';
import hiddenGemsJson from '../data/hidden-gems.json';
import artisanProductsJson from '../data/artisan-products.json';
import { INITIAL_BOOKINGS } from '../data/mockData';

// Base URL API (isi lewat .env ketika backend sudah siap).
// NOTE: Jangan impor 'expo-constants' di file ini supaya data layer tetap
// bisa dipakai/dites tanpa dependensi native. Saat dirakit oleh Metro/Expo,
// `process.env.EXPO_PUBLIC_*` akan otomatis di-inline dari file .env.
declare const process: { env: Record<string, string | undefined> };
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

const SIMULATED_NETWORK_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper generic untuk memanggil REST API.
 * Belum dipakai — ini yang akan digunakan teman saat API siap.
 */
export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText} (${path})`);
  }
  return (await res.json()) as T;
}

/** Mock loader: ambil data JSON lokal + simulasi delay jaringan. */
async function localFetch<T>(collection: T[]): Promise<T[]> {
  await delay(SIMULATED_NETWORK_DELAY_MS);
  return collection;
}

// ---------- EXPERIENCES ----------
export async function getExperiences(): Promise<Experience[]> {
  // TODO (API): return request<Experience[]>('/experiences');
  return localFetch(experiencesJson as Experience[]);
}

export async function getExperienceById(id: string): Promise<Experience | undefined> {
  // TODO (API): return request<Experience>(`/experiences/${id}`);
  const all = await localFetch(experiencesJson as Experience[]);
  return all.find((e) => e.id === id);
}

// ---------- HIDDEN GEMS ----------
export async function getHiddenGems(): Promise<HiddenGem[]> {
  // TODO (API): return request<HiddenGem[]>('/gems');
  return localFetch(hiddenGemsJson as HiddenGem[]);
}

export async function getHiddenGemById(id: string): Promise<HiddenGem | undefined> {
  // TODO (API): return request<HiddenGem>(`/gems/${id}`);
  const all = await localFetch(hiddenGemsJson as HiddenGem[]);
  return all.find((g) => g.id === id);
}

// ---------- ARTISAN PRODUCTS ----------
export async function getArtisanProducts(): Promise<ArtisanProduct[]> {
  // TODO (API): return request<ArtisanProduct[]>('/products');
  return localFetch(artisanProductsJson as ArtisanProduct[]);
}

export async function getArtisanProductById(id: string): Promise<ArtisanProduct | undefined> {
  // TODO (API): return request<ArtisanProduct>(`/products/${id}`);
  const all = await localFetch(artisanProductsJson as ArtisanProduct[]);
  return all.find((p) => p.id === id);
}

// ---------- BOOKINGS ----------
export async function getBookings(): Promise<Booking[]> {
  // TODO (API): return request<Booking[]>(`/bookings?userId=${userId}`);
  return localFetch(INITIAL_BOOKINGS);
}

export interface CreateBookingPayload {
  experienceId: string;
  date: string;
  timeSlot: string;
  guestsCount: number;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  // TODO (API):
  // return request<Booking>('/bookings', {
  //   method: 'POST',
  //   body: JSON.stringify(payload),
  // });
  await delay(SIMULATED_NETWORK_DELAY_MS);
  const experience = (experiencesJson as Experience[]).find((e) => e.id === payload.experienceId);
  if (!experience) throw new Error(`Pengalaman tidak ditemukan: ${payload.experienceId}`);
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
