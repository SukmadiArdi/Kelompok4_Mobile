/**
 * ============================================================
 * LOKALTRIP API SERVICE — DTO Mapping & REST API Integration
 * ============================================================
 * Mengikuti konsep:
 * - RELIABLE API INTEGRATION (Task 01: Handle API Error - HTTP Status Code & Network Error)
 * - CONNECT TO REST API (Task 02: DTO Mapping & Token-Based Auth)
 * 
 * Alur Penanganan Error (Task 01):
 * - Periksa response.ok & status code
 * - Status 2xx: Parse dan return data JSON
 * - Status 4xx (Client Error, 400, 401, 404): Lempar ApiError informatif beserta status code
 * - Status 5xx (Server Error, 500, 503): Lempar ApiError khusus gangguan server
 * - Catch block: Mendeteksi kegagalan koneksi / Network Error (offline / timeout / connection refused)
 * ============================================================
 */

import * as SecureStore from 'expo-secure-store';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Experience, HiddenGem, ArtisanProduct, Booking } from '../types';
import {
  MOCK_EXPERIENCES,
  MOCK_HIDDEN_GEMS,
  MOCK_ARTISANS,
  INITIAL_BOOKINGS,
} from '../data/mockData';
import experiencesJson from '../data/experiences.json';
import hiddenGemsJson from '../data/hidden-gems.json';
import artisanProductsJson from '../data/artisan-products.json';

// Mengambil Base URL dari environment variable (.env)
declare const process: { env: Record<string, string | undefined> };
const trimTrailingSlashes = (url: string): string => {
  let end = url.length;
  while (end > 0 && url.charCodeAt(end - 1) === 47) {
    end--;
  }
  return url.slice(0, end);
};

export const API_BASE_URL = trimTrailingSlashes(
  (process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL || '').trim()
);

const SIMULATED_DELAY_MS = 350;
const FETCH_TIMEOUT_MS = 6000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
      msg.includes('network request failed') ||
      msg.includes('network error') ||
      msg.includes('failed to fetch') ||
      msg.includes('koneksi') ||
      msg.includes('connection') ||
      msg.includes('connect') ||
      msg.includes('econnrefused') ||
      msg.includes('enotfound') ||
      msg.includes('internet') ||
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
 * - Status 5xx (Server Error, misal 500, 503): Lempar error khusus
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
 * Helper request HTTP dengan timeout untuk operasi aman.
 * Membaca token dari Supabase Session / SecureStore dan menyisipkan header Authorization: Bearer ${token} (Task 02).
 * Mencetak log Request Headers sebelum fetch.
 * Menangani error jaringan pada catch block (Task 01).
 */
export async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  // 1. Ambil token aktif via Supabase session atau fallback dari SecureStore (Task 02)
  let token: string | null = null;
  try {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token || null;
  } catch {
    // Abaikan error jika offline
  }

  if (!token) {
    token = await SecureStore.getItemAsync('access_token').catch(() => null);
  }

  const customHeaders = (options.headers as Record<string, string>) || {};
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...customHeaders,
  };

  // Sisipkan header Authorization jika token tersedia
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Log Request Headers untuk verifikasi terminal (Task 02)
  console.log("Request Headers:", headers);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    handleFetchError(error);
  }
}

/**
 * Helper request HTTP standar dengan timeout 10 detik.
 * Membaca token dari Supabase Session / SecureStore dan menyisipkan header Authorization: Bearer ${token} (Task 02).
 * Mencetak log Request Headers sebelum fetch.
 * Memvalidasi response status 2xx, 4xx, 5xx serta network error (Task 01).
 */
export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  // 1. Ambil token aktif via Supabase session atau fallback dari SecureStore (Task 02)
  let token: string | null = null;
  try {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token || null;
  } catch {
    // Abaikan error jika offline
  }

  if (!token) {
    token = await SecureStore.getItemAsync('access_token').catch(() => null);
  }

  const customHeaders = (options?.headers as Record<string, string>) || {};
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Sisipkan header Authorization jika token tersedia
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Log Request Headers untuk verifikasi terminal (Task 02)
  console.log("Request Headers:", headers);

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    handleFetchError(error);
  }

  return await handleApiResponse<T>(res);
}

/* =====================================================================
 * 1. DATA TRANSFER OBJECT (DTO) INTERFACES (Pola Task 02)
 * Model data mentah seperti yang dikirimkan oleh server REST API
 * ===================================================================== */

export interface ExperienceApiDto {
  id: string | number;
  title?: string;
  name?: string; // Variasi nama field dari REST API
  category?: string;
  location?: string;
  city?: string;
  province?: string;
  price?: number | string;
  duration?: string;
  rating?: number | string;
  review_count?: number;
  reviewCount?: number;
  image?: string;
  images?: string[];
  description?: string;
  guide?: {
    id?: string;
    name?: string;
    avatar?: string;
    badge?: string;
    rating?: number;
    tripsCount?: number;
    languages?: string[];
    bio?: string;
    verified?: boolean;
  };
  highlights?: string[];
  included?: string[];
  schedule?: { time: string; activity: string }[];
  available_slots?: string[];
  availableSlots?: string[];
  max_participants?: number;
  maxParticipants?: number;
}

export interface HiddenGemApiDto {
  id: string | number;
  name?: string;
  title?: string;
  category?: string;
  region?: string;
  location?: string;
  city?: string;
  province?: string;
  difficulty?: string;
  best_time?: string;
  bestTime?: string;
  tips?: string[];
  etiquette?: string[];
  image?: string;
  gallery?: string[];
  description?: string;
  likes_count?: number;
  likesCount?: number;
  reviews_count?: number;
  reviewsCount?: number;
  rating?: number | string;
  map_coords?: {
    lat?: number;
    lng?: number;
    xPercent?: number;
    yPercent?: number;
  };
  mapCoords?: {
    lat?: number;
    lng?: number;
    xPercent?: number;
    yPercent?: number;
  };
  contributor?: {
    name?: string;
    avatar?: string;
    badge?: string;
    date?: string;
  };
  reviews?: HiddenGem['reviews'];
}

export interface ArtisanProductApiDto {
  id: string | number;
  name?: string;
  title?: string;
  category?: string;
  price?: number | string;
  original_price?: number | string;
  originalPrice?: number | string;
  rating?: number | string;
  sales_count?: number;
  salesCount?: number;
  stock?: number;
  image?: string;
  images?: string[];
  description?: string;
  philosophy?: string;
  materials?: string[];
  dimensions?: string;
  weight?: string;
  artisan?: {
    id?: string;
    name?: string;
    craft?: string;
    village?: string;
    city?: string;
    province?: string;
    story?: string;
    avatar?: string;
    bannerImage?: string;
    quote?: string;
    yearsExperience?: number;
    years_experience?: number;
    verified?: boolean;
  };
}

/* =====================================================================
 * 2. DTO MAPPERS (TRANSFORMASI JSON API -> UI DATA MODEL)
 * Pola Task 02: Memetakan hanya field yang dibutuhkan UI & safe fallback
 * ===================================================================== */

export function mapDtoToExperience(item: ExperienceApiDto): Experience {
  return {
    id: String(item.id ?? `exp-${Date.now()}`),
    title: item.title || item.name || 'Pengalaman Budaya Lokal',
    category: (item.category as any) || 'Workshop Seni',
    location: item.location || 'Yogyakarta',
    city: item.city || 'Yogyakarta',
    province: item.province || 'D.I. Yogyakarta',
    price: Number(item.price) || 150000,
    duration: item.duration || '2 Jam',
    rating: Number(item.rating) || 4.8,
    reviewCount: item.reviewCount || item.review_count || 10,
    image:
      item.image ||
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    images:
      item.images && item.images.length > 0
        ? item.images
        : [
            item.image ||
              'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
          ],
    guide: {
      id: item.guide?.id || 'guide-default',
      name: item.guide?.name || 'Pemandu Berlisensi',
      avatar:
        item.guide?.avatar ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      badge: item.guide?.badge || 'Pemandu Lokal Berlisensi',
      rating: Number(item.guide?.rating) || 4.9,
      tripsCount: item.guide?.tripsCount ?? 150,
      languages: item.guide?.languages || ['Indonesia'],
      bio: item.guide?.bio || 'Pemandu lokal berpengalaman mendampingi tur budaya.',
      verified: item.guide?.verified ?? true,
    },
    highlights: item.highlights || ['Pengalaman autentik', 'Didampingi instruktur ahli'],
    included: item.included || ['Alat & Bahan', 'Sertifikat'],
    schedule: item.schedule || [{ time: '09:00', activity: 'Sesi Pembelajaran & Praktek' }],
    availableSlots: item.availableSlots || item.available_slots || ['09:00 WIB', '13:30 WIB'],
    description: item.description || 'Lokakarya budaya interaktif bersama praktisi lokal.',
    maxParticipants: item.maxParticipants ?? item.max_participants ?? 10,
  };
}

export function mapDtoToHiddenGem(item: HiddenGemApiDto): HiddenGem {
  const coords = item.mapCoords || item.map_coords || {};
  return {
    id: String(item.id ?? `gem-${Date.now()}`),
    name: item.name || item.title || 'Destinasi Tersembunyi',
    category: (item.category as any) || 'Air Terjun',
    region: (item.region as any) || 'Jawa',
    location: item.location || 'Indonesia',
    city: item.city || 'Kulon Progo',
    province: item.province || 'D.I. Yogyakarta',
    difficulty: (item.difficulty as any) || 'Sedang',
    bestTime: item.bestTime || item.best_time || '07:00 - 11:00 WIB',
    tips: item.tips || ['Bawa air minum yang cukup', 'Gunakan sepatu trekking'],
    etiquette: item.etiquette || ['Jaga kebersihan dan bawa kembali sampah Anda'],
    mapCoords: {
      lat: Number(coords.lat) || -7.8013,
      lng: Number(coords.lng) || 110.3644,
      xPercent: Number(coords.xPercent) || 50,
      yPercent: Number(coords.yPercent) || 50,
    },
    image:
      item.image ||
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80',
    gallery:
      item.gallery && item.gallery.length > 0
        ? item.gallery
        : [
            item.image ||
              'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80',
          ],
    likesCount: item.likesCount || item.likes_count || 120,
    reviewsCount: item.reviewsCount || item.reviews_count || 15,
    rating: Number(item.rating) || 4.85,
    contributor: {
      name: item.contributor?.name || 'Komunitas Penjelajah',
      avatar:
        item.contributor?.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      badge: item.contributor?.badge || 'Penjelajah Nusantara',
      date: item.contributor?.date || 'Baru saja',
    },
    description: item.description || 'Destinasi indah dengan panorama alami yang masih asri.',
    reviews: item.reviews || [],
  };
}

export function mapDtoToArtisanProduct(item: ArtisanProductApiDto): ArtisanProduct {
  return {
    id: String(item.id ?? `prod-${Date.now()}`),
    name: item.name || item.title || 'Kerajinan Nusantara',
    category: (item.category as any) || 'Wastra & Batik',
    price: Number(item.price) || 150000,
    originalPrice:
      item.originalPrice || item.original_price
        ? Number(item.originalPrice || item.original_price)
        : undefined,
    rating: Number(item.rating) || 4.9,
    salesCount: item.salesCount || item.sales_count || 25,
    stock: item.stock !== undefined ? Number(item.stock) : 10,
    image:
      item.image ||
      'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800&auto=format&fit=crop&q=80',
    images:
      item.images && item.images.length > 0
        ? item.images
        : [
            item.image ||
              'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800&auto=format&fit=crop&q=80',
          ],
    artisan: {
      id: item.artisan?.id || 'artisan-default',
      name: item.artisan?.name || 'Pengrajin Lokal',
      craft: item.artisan?.craft || 'Kriya Tradisional',
      village: item.artisan?.village || 'Desa Pengrajin',
      city: item.artisan?.city || 'Yogyakarta',
      province: item.artisan?.province || 'D.I. Yogyakarta',
      story:
        item.artisan?.story ||
        'Melestarikan warisan seni turun-temurun dengan bahan ramah lingkungan.',
      avatar:
        item.artisan?.avatar ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      bannerImage:
        item.artisan?.bannerImage ||
        'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800&auto=format&fit=crop&q=80',
      yearsExperience: item.artisan?.yearsExperience || item.artisan?.years_experience || 10,
      verified: item.artisan?.verified ?? true,
      quote: item.artisan?.quote || '"Karya tangan, cermin ketulusan."',
    },
    philosophy:
      item.philosophy || item.description || 'Dibuat dengan dedikasi dan teknik tradisional khas Nusantara.',
    materials: item.materials || ['Bahan Alami Tradisional'],
    dimensions: item.dimensions || 'Standar Kriya',
    weight: item.weight || '500 gram',
  };
}

/* =====================================================================
 * 3. API FETCH FUNCTIONS (ASYNC/AWAIT & ERROR HANDLING DENGAN FALLBACK)
 * Pola Task 02: Request -> Parse JSON -> DTO Mapping -> Return Data
 * ===================================================================== */

export interface ApiFetchResult<T> {
  data: T;
  isFromApi: boolean;
  error?: string;
}

interface CollectionFetchConfig<TDto, TModel> {
  tableName: 'experiences' | 'gems' | 'products';
  endpoint: string;
  mapper: (item: TDto) => TModel;
  fallbackData: TModel[];
  label: string;
}

/**
 * Helper terpusat untuk mengambil koleksi data:
 * 1. Jika Supabase terkonfigurasi (.env), ambil dari tabel Supabase via PostgREST.
 * 2. Jika EXPO_PUBLIC_API_BASE_URL terkonfigurasi, ambil dari REST API eksternal.
 * 3. Jika belum dikonfigurasi, gunakan data lokal tanpa error network.
 */
async function fetchCollectionWithFallback<TDto, TModel>({
  tableName,
  endpoint,
  mapper,
  fallbackData,
  label,
}: CollectionFetchConfig<TDto, TModel>): Promise<ApiFetchResult<TModel[]>> {
  // 1. Prioritas utama: Supabase Cloud Database
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) {
        throw new ApiError(error.message);
      }
      if (!Array.isArray(data) || data.length === 0) {
        console.warn(
          `[Supabase] Tabel "${tableName}" kosong. Menggunakan fallback data lokal.`
        );
        return { data: fallbackData, isFromApi: false };
      }
      return { data: (data as TDto[]).map(mapper), isFromApi: true };
    } catch (err: any) {
      console.warn(
        `[ApiService] ${label} via Supabase failed (${err.message}). Menggunakan fallback data mock.`
      );
      await delay(SIMULATED_DELAY_MS);
      return { data: fallbackData, isFromApi: false, error: err.message };
    }
  }

  // 2. Alternatif: Custom REST API jika EXPO_PUBLIC_API_BASE_URL diisi
  if (API_BASE_URL) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetchWithTimeout(url);
      const rawData = await handleApiResponse<TDto[]>(response);

      if (!Array.isArray(rawData)) {
        throw new ApiError('Format respons dari API bukan berupa array');
      }

      return { data: rawData.map(mapper), isFromApi: true };
    } catch (err: any) {
      console.warn(
        `[ApiService] ${label} failed (${err.message}). Menggunakan fallback data mock.`
      );
      await delay(SIMULATED_DELAY_MS);
      return { data: fallbackData, isFromApi: false, error: err.message };
    }
  }

  // 3. Mode Offline / Local Data Model tanpa request ke host placeholder
  await delay(SIMULATED_DELAY_MS);
  return { data: fallbackData, isFromApi: false };
}

/**
 * Mengambil data Experience dari Supabase / REST API
 */
export async function fetchExperiencesApi(): Promise<ApiFetchResult<Experience[]>> {
  return fetchCollectionWithFallback<ExperienceApiDto, Experience>({
    tableName: 'experiences',
    endpoint: '/experiences',
    mapper: mapDtoToExperience,
    fallbackData: (experiencesJson as Experience[]) || MOCK_EXPERIENCES,
    label: 'fetchExperiencesApi',
  });
}

/**
 * Mengambil data Hidden Gems dari Supabase / REST API
 */
export async function fetchHiddenGemsApi(): Promise<ApiFetchResult<HiddenGem[]>> {
  return fetchCollectionWithFallback<HiddenGemApiDto, HiddenGem>({
    tableName: 'gems',
    endpoint: '/gems',
    mapper: mapDtoToHiddenGem,
    fallbackData: (hiddenGemsJson as HiddenGem[]) || MOCK_HIDDEN_GEMS,
    label: 'fetchHiddenGemsApi',
  });
}

/**
 * Mengambil data Artisan Products dari Supabase / REST API
 */
export async function fetchArtisanProductsApi(): Promise<ApiFetchResult<ArtisanProduct[]>> {
  return fetchCollectionWithFallback<ArtisanProductApiDto, ArtisanProduct>({
    tableName: 'products',
    endpoint: '/products',
    mapper: mapDtoToArtisanProduct,
    fallbackData: (artisanProductsJson as ArtisanProduct[]) || MOCK_ARTISANS,
    label: 'fetchArtisanProductsApi',
  });
}

/**
 * Fetch seluruh data aplikasi secara paralel
 */
export async function fetchAllAppDataApi() {
  const [expResult, gemResult, prodResult] = await Promise.all([
    fetchExperiencesApi(),
    fetchHiddenGemsApi(),
    fetchArtisanProductsApi(),
  ]);

  return {
    experiences: expResult.data,
    gems: gemResult.data,
    products: prodResult.data,
    isLiveFromApi: expResult.isFromApi || gemResult.isFromApi || prodResult.isFromApi,
    error: expResult.error || gemResult.error || prodResult.error,
  };
}

/* =========================================================================
 * 4. ENDPOINT INDIVIDUAL & OPERASI CRUD (Kompatibilitas origin/main & useApi)
 * ========================================================================= */

async function fetchByIdWithFallback<TDto, TModel extends { id: string }>(
  id: string,
  config: CollectionFetchConfig<TDto, TModel>
): Promise<TModel | undefined> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from(config.tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) {
        return config.mapper(data as TDto);
      }
    } catch (err) {
      console.warn(
        `[LokalTrip Supabase] Gagal fetch ${config.tableName}/${id}, fallback ke mock:`,
        err
      );
    }
  }
  if (API_BASE_URL) {
    try {
      const raw = await request<TDto>(`${config.endpoint}/${id}`);
      return raw ? config.mapper(raw) : undefined;
    } catch (err) {
      console.warn(
        `[LokalTrip API] Gagal fetch ${config.endpoint}/${id}, fallback ke mock:`,
        err
      );
    }
  }
  await delay(SIMULATED_DELAY_MS);
  return config.fallbackData.find((item) => item.id === id);
}

/**
 * Mengambil semua daftar experience/wisata budaya
 * Endpoint: GET /experiences
 */
export async function getExperiences(): Promise<Experience[]> {
  const result = await fetchExperiencesApi();
  return result.data;
}

/**
 * Mengambil detail 1 experience berdasarkan ID
 * Endpoint: GET /experiences/:id
 */
export async function getExperienceById(id: string): Promise<Experience | undefined> {
  return fetchByIdWithFallback<ExperienceApiDto, Experience>(id, {
    tableName: 'experiences',
    endpoint: '/experiences',
    mapper: mapDtoToExperience,
    fallbackData: (experiencesJson as Experience[]) || MOCK_EXPERIENCES,
    label: 'getExperienceById',
  });
}

/**
 * Mengambil semua data hidden gems
 * Endpoint: GET /gems
 */
export async function getHiddenGems(): Promise<HiddenGem[]> {
  const result = await fetchHiddenGemsApi();
  return result.data;
}

/**
 * Mengambil detail 1 hidden gem berdasarkan ID
 * Endpoint: GET /gems/:id
 */
export async function getHiddenGemById(id: string): Promise<HiddenGem | undefined> {
  return fetchByIdWithFallback<HiddenGemApiDto, HiddenGem>(id, {
    tableName: 'gems',
    endpoint: '/gems',
    mapper: mapDtoToHiddenGem,
    fallbackData: (hiddenGemsJson as HiddenGem[]) || MOCK_HIDDEN_GEMS,
    label: 'getHiddenGemById',
  });
}

/**
 * Mengambil seluruh katalog produk UMKM pengrajin lokal
 * Endpoint: GET /products
 */
export async function getArtisanProducts(): Promise<ArtisanProduct[]> {
  const result = await fetchArtisanProductsApi();
  return result.data;
}

/**
 * Mengambil detail 1 produk pengrajin berdasarkan ID
 * Endpoint: GET /products/:id
 */
export async function getArtisanProductById(id: string): Promise<ArtisanProduct | undefined> {
  return fetchByIdWithFallback<ArtisanProductApiDto, ArtisanProduct>(id, {
    tableName: 'products',
    endpoint: '/products',
    mapper: mapDtoToArtisanProduct,
    fallbackData: (artisanProductsJson as ArtisanProduct[]) || MOCK_ARTISANS,
    label: 'getArtisanProductById',
  });
}

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
  const experience = ((experiencesJson as Experience[]) || MOCK_EXPERIENCES).find(
    (e) => e.id === payload.experienceId
  );
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

/* =========================================================================
 * 5. AUTH & SECURE TOKEN ENDPOINTS (Task 01 & Task 02)
 * ========================================================================= */

export interface LoginResponseDto {
  access_token: string;
  user?: any;
  message?: string;
}

/**
 * Endpoint Login (Task 01)
 * Mengirimkan email & password via method POST ke /login
 * Menangkap response access_token (JWT string) dan menyimpannya ke SecureStore.
 */
export async function loginApi(email: string, password: string): Promise<LoginResponseDto> {
  if (!API_BASE_URL) {
    throw new ApiError('EXPO_PUBLIC_API_BASE_URL belum dikonfigurasi di .env');
  }
  const url = `${API_BASE_URL}/login`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email: email.trim(), password: password.trim() }),
    });
  } catch (error) {
    handleFetchError(error);
  }

  const data = await handleApiResponse<any>(response);
  const token = data.access_token || data.token || data.accessToken;
  if (!token) {
    throw new ApiError('Response dari server tidak memuat access_token');
  }

  // Simpan token ke SecureStore (Task 01)
  await SecureStore.setItemAsync('access_token', token);

  return {
    access_token: token,
    user: data.user,
    message: data.message,
  };
}

/**
 * Utility untuk membaca Authorization header dengan Bearer token (Task 02)
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  let token: string | null = null;
  try {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token || null;
  } catch {}
  if (!token) {
    token = await SecureStore.getItemAsync('access_token').catch(() => null);
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
}

