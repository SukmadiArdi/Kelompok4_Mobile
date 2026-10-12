import { Experience, HiddenGem, ArtisanProduct, Booking } from '../types';
import experiencesJson from './experiences.json';
import hiddenGemsJson from './hidden-gems.json';
import artisanProductsJson from './artisan-products.json';

/**
 * ============================================================
 * LOKALTRIP DATA SOURCE (JSON-backed)
 * ============================================================
 * Semua data aplikasi kini tersimpan sebagai file JSON murni:
 *   - ./experiences.json      -> daftar pengalaman wisata lokal
 *   - ./hidden-gems.json      -> daftar hidden gems & peta koordinat
 *   - ./artisan-products.json -> produk pengrajin untuk toko
 *
 * TUGAN TEMAN (API FETCHING):
 * Ganti sumber data di bawah ini dengan fetch dari REST API backend,
 * contoh:
 *
 *   export async function getExperiences(): Promise<Experience[]> {
 *     const res = await fetch(`${API_BASE_URL}/experiences`);
 *     if (!res.ok) throw new Error('Gagal memuat pengalaman');
 *     return res.json();
 *   }
 *
 * Kontrak / bentuk response API harus sama persis dengan struktur
 * tipe TypeScript di `src/types/index.ts` agar UI tidak perlu diubah.
 * ============================================================
 */

export const MOCK_EXPERIENCES: Experience[] = experiencesJson as Experience[];
export const MOCK_HIDDEN_GEMS: HiddenGem[] = hiddenGemsJson as HiddenGem[];
export const MOCK_ARTISANS: ArtisanProduct[] = artisanProductsJson as ArtisanProduct[];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book-101',
    experienceId: 'exp-1',
    experienceTitle: 'Membatik Canting Klasik & Pewarnaan Alami Sogan',
    experienceImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    location: 'Desa Wisata Giriloyo, Bantul',
    date: '15 Oktober 2026',
    timeSlot: '09:00 WIB',
    guestsCount: 2,
    totalPrice: 370000,
    status: 'Dikonfirmasi',
    guideName: 'Ibu Siti Mulyani',
    createdAt: '2026-09-20',
  },
];
