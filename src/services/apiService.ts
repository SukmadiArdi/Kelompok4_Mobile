/**
 * ============================================================
 * LOKALTRIP API SERVICE — DTO Mapping & REST API Integration
 * ============================================================
 * Mengikuti konsep Task 02: CONNECT TO REST API
 * 
 * Alur Proses:
 * Mobile App -> REQUEST (Fetch) -> REST API -> JSON -> PARSE -> DATA MODEL (DTO Mapping) -> UI State
 * 
 * Fitur:
 * - DTO interfaces & mappers untuk sanitasi dan transformasi payload REST API
 * - Mendukung live fetch jika EXPO_PUBLIC_API_BASE_URL / EXPO_PUBLIC_API_URL diatur di .env
 * - Otomatis fallback ke mock data lokal jika API backend offline/gagal
 * ============================================================
 */

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
  process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    'https://api.lokaltrip.id/v1'
);

const SIMULATED_DELAY_MS = 350;
const FETCH_TIMEOUT_MS = 6000;

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
 * Helper request HTTP dengan timeout untuk operasi aman
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Helper request HTTP standar dengan timeout 10 detik
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
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
    bio?: string;
  };
  highlights?: string[];
  included?: string[];
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
  image?: string;
  gallery?: string[];
  description?: string;
  likes_count?: number;
  likesCount?: number;
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
  artisan?: {
    id?: string;
    name?: string;
    craft?: string;
    village?: string;
    city?: string;
    province?: string;
    avatar?: string;
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
      tripsCount: 150,
      languages: ['Indonesia'],
      bio: item.guide?.bio || 'Pemandu lokal berpengalaman mendampingi tur budaya.',
      verified: true,
    },
    highlights: item.highlights || ['Pengalaman autentik', 'Didampingi instruktur ahli'],
    included: item.included || ['Alat & Bahan', 'Sertifikat'],
    schedule: [{ time: '09:00', activity: 'Sesi Pembelajaran & Praktek' }],
    availableSlots: ['09:00 WIB', '13:30 WIB'],
    description: item.description || 'Lokakarya budaya interaktif bersama praktisi lokal.',
    maxParticipants: 10,
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
    tips: ['Bawa air minum yang cukup', 'Gunakan sepatu trekking'],
    etiquette: ['Jaga kebersihan dan bawa kembali sampah Anda'],
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
    reviewsCount: 15,
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
    reviews: [],
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
      story: 'Melestarikan warisan seni turun-temurun dengan bahan ramah lingkungan.',
      avatar:
        item.artisan?.avatar ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      bannerImage:
        'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800&auto=format&fit=crop&q=80',
      yearsExperience: item.artisan?.yearsExperience || item.artisan?.years_experience || 10,
      verified: item.artisan?.verified ?? true,
      quote: item.artisan?.quote || '"Karya tangan, cermin ketulusan."',
    },
    philosophy:
      item.philosophy || item.description || 'Dibuat dengan dedikasi dan teknik tradisional khas Nusantara.',
    materials: ['Bahan Alami Tradisional'],
    dimensions: 'Standar Kriya',
    weight: '500 gram',
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

/**
 * Mengambil data Experience dari REST API
 */
export async function fetchExperiencesApi(): Promise<ApiFetchResult<Experience[]>> {
  try {
    const url = `${API_BASE_URL}/experiences`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      throw new Error('API response format is not an array');
    }

    // Mapping DTO ke UI Model
    const mapped = rawData.map(mapDtoToExperience);
    return { data: mapped, isFromApi: true };
  } catch (err: any) {
    console.warn(
      `[ApiService] fetchExperiencesApi failed (${err.message}). Menggunakan fallback data mock.`
    );
    return {
      data: (experiencesJson as Experience[]) || MOCK_EXPERIENCES,
      isFromApi: false,
      error: err.message,
    };
  }
}

/**
 * Mengambil data Hidden Gems dari REST API
 */
export async function fetchHiddenGemsApi(): Promise<ApiFetchResult<HiddenGem[]>> {
  try {
    const url = `${API_BASE_URL}/gems`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      throw new Error('API response format is not an array');
    }

    const mapped = rawData.map(mapDtoToHiddenGem);
    return { data: mapped, isFromApi: true };
  } catch (err: any) {
    console.warn(
      `[ApiService] fetchHiddenGemsApi failed (${err.message}). Menggunakan fallback data mock.`
    );
    return {
      data: (hiddenGemsJson as HiddenGem[]) || MOCK_HIDDEN_GEMS,
      isFromApi: false,
      error: err.message,
    };
  }
}

/**
 * Mengambil data Artisan Products dari REST API
 */
export async function fetchArtisanProductsApi(): Promise<ApiFetchResult<ArtisanProduct[]>> {
  try {
    const url = `${API_BASE_URL}/products`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      throw new Error('API response format is not an array');
    }

    const mapped = rawData.map(mapDtoToArtisanProduct);
    return { data: mapped, isFromApi: true };
  } catch (err: any) {
    console.warn(
      `[ApiService] fetchArtisanProductsApi failed (${err.message}). Menggunakan fallback data mock.`
    );
    return {
      data: (artisanProductsJson as ArtisanProduct[]) || MOCK_ARTISANS,
      isFromApi: false,
      error: err.message,
    };
  }
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
  };
}

/* =========================================================================
 * 4. ENDPOINT INDIVIDUAL & OPERASI CRUD (Kompatibilitas origin/main & useApi)
 * ========================================================================= */

/**
 * Mengambil semua daftar experience/wisata budaya
 * Endpoint: GET /experiences
 */
export async function getExperiences(): Promise<Experience[]> {
  if (API_BASE_URL) {
    try {
      const raw = await request<any[]>('/experiences');
      if (Array.isArray(raw)) {
        return raw.map(mapDtoToExperience);
      }
      return raw as Experience[];
    } catch (err) {
      console.warn('[LokalTrip API] Gagal fetch /experiences, fallback ke mock:', err);
    }
  }
  await delay(SIMULATED_DELAY_MS);
  return (experiencesJson as Experience[]) || MOCK_EXPERIENCES;
}

/**
 * Mengambil detail 1 experience berdasarkan ID
 * Endpoint: GET /experiences/:id
 */
export async function getExperienceById(id: string): Promise<Experience | undefined> {
  if (API_BASE_URL) {
    try {
      const raw = await request<any>(`/experiences/${id}`);
      return raw ? mapDtoToExperience(raw) : undefined;
    } catch (err) {
      console.warn(`[LokalTrip API] Gagal fetch /experiences/${id}, fallback ke mock:`, err);
    }
  }
  await delay(SIMULATED_DELAY_MS);
  return ((experiencesJson as Experience[]) || MOCK_EXPERIENCES).find((item) => item.id === id);
}

/**
 * Mengambil semua data hidden gems
 * Endpoint: GET /gems
 */
export async function getHiddenGems(): Promise<HiddenGem[]> {
  if (API_BASE_URL) {
    try {
      const raw = await request<any[]>('/gems');
      if (Array.isArray(raw)) {
        return raw.map(mapDtoToHiddenGem);
      }
      return raw as HiddenGem[];
    } catch (err) {
      console.warn('[LokalTrip API] Gagal fetch /gems, fallback ke mock:', err);
    }
  }
  await delay(SIMULATED_DELAY_MS);
  return (hiddenGemsJson as HiddenGem[]) || MOCK_HIDDEN_GEMS;
}

/**
 * Mengambil detail 1 hidden gem berdasarkan ID
 * Endpoint: GET /gems/:id
 */
export async function getHiddenGemById(id: string): Promise<HiddenGem | undefined> {
  if (API_BASE_URL) {
    try {
      const raw = await request<any>(`/gems/${id}`);
      return raw ? mapDtoToHiddenGem(raw) : undefined;
    } catch (err) {
      console.warn(`[LokalTrip API] Gagal fetch /gems/${id}, fallback ke mock:`, err);
    }
  }
  await delay(SIMULATED_DELAY_MS);
  return ((hiddenGemsJson as HiddenGem[]) || MOCK_HIDDEN_GEMS).find((item) => item.id === id);
}

/**
 * Mengambil seluruh katalog produk UMKM pengrajin lokal
 * Endpoint: GET /products
 */
export async function getArtisanProducts(): Promise<ArtisanProduct[]> {
  if (API_BASE_URL) {
    try {
      const raw = await request<any[]>('/products');
      if (Array.isArray(raw)) {
        return raw.map(mapDtoToArtisanProduct);
      }
      return raw as ArtisanProduct[];
    } catch (err) {
      console.warn('[LokalTrip API] Gagal fetch /products, fallback ke mock:', err);
    }
  }
  await delay(SIMULATED_DELAY_MS);
  return (artisanProductsJson as ArtisanProduct[]) || MOCK_ARTISANS;
}

/**
 * Mengambil detail 1 produk pengrajin berdasarkan ID
 * Endpoint: GET /products/:id
 */
export async function getArtisanProductById(id: string): Promise<ArtisanProduct | undefined> {
  if (API_BASE_URL) {
    try {
      const raw = await request<any>(`/products/${id}`);
      return raw ? mapDtoToArtisanProduct(raw) : undefined;
    } catch (err) {
      console.warn(`[LokalTrip API] Gagal fetch /products/${id}, fallback ke mock:`, err);
    }
  }
  await delay(SIMULATED_DELAY_MS);
  return ((artisanProductsJson as ArtisanProduct[]) || MOCK_ARTISANS).find((item) => item.id === id);
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
