export type ExperienceCategory = 'Semua' | 'Workshop Seni' | 'Wisata Adat' | 'Kuliner Tradisi' | 'Alam & Petualangan';

export interface Guide {
  id: string;
  name: string;
  avatar: string;
  badge: string;
  rating: number;
  tripsCount: number;
  languages: string[];
  bio: string;
  verified: boolean;
}

export interface Experience {
  id: string;
  title: string;
  category: 'Workshop Seni' | 'Wisata Adat' | 'Kuliner Tradisi' | 'Alam & Petualangan';
  location: string;
  city: string;
  province: string;
  price: number;
  duration: string;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  guide: Guide;
  highlights: string[];
  included: string[];
  schedule: { time: string; activity: string }[];
  availableSlots: string[];
  description: string;
  maxParticipants: number;
}

export type GemDifficulty = 'Mudah' | 'Sedang' | 'Menantang';
export type GemCategory = 'Semua' | 'Air Terjun' | 'Tebing & Sunrise' | 'Kampung Adat' | 'Pantai Sunyi' | 'Hutan & Lembah';

export interface GemReview {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  photos?: string[];
}

export interface HiddenGem {
  id: string;
  name: string;
  category: 'Air Terjun' | 'Tebing & Sunrise' | 'Kampung Adat' | 'Pantai Sunyi' | 'Hutan & Lembah';
  region: 'Semua' | 'Jawa' | 'Bali & Lombok' | 'Nusa Tenggara' | 'Sumatera' | 'Sulawesi';
  location: string;
  city: string;
  province: string;
  difficulty: GemDifficulty;
  bestTime: string;
  tips: string[];
  etiquette: string[];
  mapCoords: {
    lat: number;
    lng: number;
    xPercent: number; // 0-100 for interactive visual canvas
    yPercent: number; // 0-100 for interactive visual canvas
  };
  image: string;
  gallery: string[];
  likesCount: number;
  reviewsCount: number;
  rating: number;
  contributor: {
    name: string;
    avatar: string;
    badge: string;
    date: string;
  };
  description: string;
  reviews: GemReview[];
  isBookmarked?: boolean;
}

export type ProductCategory = 'Semua' | 'Wastra & Batik' | 'Gerabah & Keramik' | 'Anyaman Bambu' | 'Ukiran Kayu' | 'Aksesoris Etnik';

export interface Artisan {
  id: string;
  name: string;
  craft: string;
  village: string;
  city: string;
  province: string;
  story: string;
  avatar: string;
  bannerImage: string;
  yearsExperience: number;
  verified: boolean;
  quote: string;
}

export interface ArtisanProduct {
  id: string;
  name: string;
  category: 'Wastra & Batik' | 'Gerabah & Keramik' | 'Anyaman Bambu' | 'Ukiran Kayu' | 'Aksesoris Etnik';
  price: number;
  originalPrice?: number;
  rating: number;
  salesCount: number;
  stock: number;
  image: string;
  images: string[];
  artisan: Artisan;
  philosophy: string;
  materials: string[];
  dimensions: string;
  weight: string;
  isFavorite?: boolean;
}

export interface CartItem {
  product: ArtisanProduct;
  quantity: number;
  selectedVariant?: string;
}

export interface Booking {
  id: string;
  experienceId: string;
  experienceTitle: string;
  experienceImage: string;
  location: string;
  date: string;
  timeSlot: string;
  guestsCount: number;
  totalPrice: number;
  status: 'Dikonfirmasi' | 'Selesai' | 'Menunggu';
  guideName: string;
  createdAt: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  badge?: string;
  role?: 'traveler' | 'artisan' | 'guide';
  createdAt: string;
  provider: 'local' | 'firebase';
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}
