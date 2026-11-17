/**
 * ============================================================================
 * LOKALTRIP GEOFENCING UTILITIES (Task 02 & Task 03B)
 * ============================================================================
 * Helper untuk menghitung jarak koordinat dengan rumus Haversine serta
 * mendeteksi status event masuk (Enter Event) ke area geofence destinasi wisata.
 * ============================================================================
 */

export interface GeofenceZone {
  id: string;
  name: string;
  category: string;
  location: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  radius: number; // Radius geofence dalam satuan meter (default: 500m)
  description?: string;
  image?: string;
}

export interface GeofenceDistanceItem {
  zone: GeofenceZone;
  distance: number; // Jarak dalam meter
  isInside: boolean;
}

export interface GeofenceCheckResult {
  isInsideGeofence: boolean;
  activeZone: GeofenceZone | null;
  distanceToActiveZone: number | null;
  nearestZone: GeofenceDistanceItem | null;
  allDistances: GeofenceDistanceItem[];
}

/**
 * Radius standar geofence destinasi wisata Lokaltrip (500 meter)
 */
export const DEFAULT_GEOFENCE_RADIUS_METERS = 500;

/**
 * Daftar koordinat area geofence destinasi wisata Lokaltrip
 * Diambil dan disinkronkan dari data Hidden Gems & Experiences Lokaltrip.
 */
export const GEOFENCE_ZONES: GeofenceZone[] = [
  {
    id: 'zone-mudal',
    name: 'Taman Sungai Mudal',
    category: 'Mata Air & Hutan Lembah',
    location: 'Banyunganti, Jatimulyo, Girimulyo',
    city: 'Kulon Progo',
    province: 'D.I. Yogyakarta',
    latitude: -7.7654,
    longitude: 110.1234,
    radius: DEFAULT_GEOFENCE_RADIUS_METERS,
    description: 'Mata air alami jernih bertingkat di lembah perbukitan Menoreh.',
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'zone-giriloyo',
    name: 'Desa Wisata Giriloyo',
    category: 'Kampung Adat & Budaya',
    location: 'Giriloyo, Wukirsari, Imogiri',
    city: 'Bantul',
    province: 'D.I. Yogyakarta',
    latitude: -7.8921,
    longitude: 110.3842,
    radius: DEFAULT_GEOFENCE_RADIUS_METERS,
    description: 'Pusat tradisi membatik canting klasik & pewarnaan alami sogan.',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'zone-kasap',
    name: 'Tebing Karang Kasap',
    category: 'Tebing & Sunrise',
    location: 'Desa Watukarung, Pringkuku',
    city: 'Pacitan',
    province: 'Jawa Timur',
    latitude: -8.2435,
    longitude: 110.9912,
    radius: DEFAULT_GEOFENCE_RADIUS_METERS,
    description: 'Gugusan pulau karang eksotis yang dijuluki Raja Ampat van Pacitan.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'zone-borobudur',
    name: 'Bukit Punthuk Setumbu & Borobudur',
    category: 'Sunrise & Heritage',
    location: 'Kurahan, Karangrejo, Borobudur',
    city: 'Magelang',
    province: 'Jawa Tengah',
    latitude: -7.6079,
    longitude: 110.1932,
    radius: DEFAULT_GEOFENCE_RADIUS_METERS,
    description: 'Pemandangan magis siluet Borobudur di tengah lautan kabut pagi.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'zone-senaru',
    name: 'Desa Adat Senaru & Rinjani',
    category: 'Kampung Adat & Hutan Bambu',
    location: 'Senaru, Bayan',
    city: 'Lombok Utara',
    province: 'Nusa Tenggara Barat',
    latitude: -8.3012,
    longitude: 116.4021,
    radius: DEFAULT_GEOFENCE_RADIUS_METERS,
    description: 'Pintu gerbang jalur utara Gunung Rinjani dengan arsitektur rumah adat Sasak kuno.',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'zone-tanggedu',
    name: 'Air Terjun Tanggedu',
    category: 'Air Terjun',
    location: 'Desa Tanggedu, Kanatang',
    city: 'Sumba Timur',
    province: 'Nusa Tenggara Timur',
    latitude: -9.5123,
    longitude: 120.0894,
    radius: DEFAULT_GEOFENCE_RADIUS_METERS,
    description: 'Canyon zamrud Sumba dengan formasi tebing kapur purba dan kolam toska.',
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'zone-uluwatu',
    name: 'Desa Adat Pecatu & Tebing Uluwatu',
    category: 'Tebing Sunset & Budaya',
    location: 'Pecatu, Kuta Selatan',
    city: 'Badung',
    province: 'Bali',
    latitude: -8.8291,
    longitude: 115.0849,
    radius: DEFAULT_GEOFENCE_RADIUS_METERS,
    description: 'Pertunjukan tari kecak sakral di atas tebing karang samudra Hindia.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'zone-ollon',
    name: 'Lembah Ollon',
    category: 'Hutan & Lembah',
    location: 'Bonggakaradeng',
    city: 'Tana Toraja',
    province: 'Sulawesi Selatan',
    latitude: -3.1234,
    longitude: 119.8211,
    radius: DEFAULT_GEOFENCE_RADIUS_METERS,
    description: 'Savana berbukit hijau di Toraja yang menawan laksana panorama Swiss.',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
  },
];

/**
 * Koordinat default untuk testing awal ketika props GPS masih null/kosong.
 * Mengacu ke Taman Sungai Mudal (Kulon Progo).
 */
export const DEFAULT_MAP_COORDINATES = {
  latitude: -7.7654,
  longitude: 110.1234,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

/**
 * Menghitung jarak lingkaran besar antara dua pasang koordinat
 * menggunakan Rumus Haversine.
 *
 * @param lat1 Latitude titik pertama (derajat desimal)
 * @param lon1 Longitude titik pertama (derajat desimal)
 * @param lat2 Latitude titik kedua (derajat desimal)
 * @param lon2 Longitude titik kedua (derajat desimal)
 * @returns Jarak dalam meter (m)
 */
export function calculateDistanceHaversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_METERS = 6371000; // Radius rata-rata bumi dalam meter

  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Memeriksa apakah koordinat tertentu berada di dalam radius geofence suatu destinasi.
 */
export function isInsideGeofence(
  userLat: number,
  userLng: number,
  zoneLat: number,
  zoneLng: number,
  radiusMeters: number = DEFAULT_GEOFENCE_RADIUS_METERS
): boolean {
  const distance = calculateDistanceHaversine(userLat, userLng, zoneLat, zoneLng);
  return distance <= radiusMeters;
}

/**
 * Memeriksa posisi pengguna terhadap seluruh daftar area geofence Lokaltrip.
 * Mengembalikan status apakah sedang berada di dalam geofence (Enter Event)
 * beserta data destinasi aktif dan jaraknya.
 */
export function checkGeofenceStatus(
  userLat: number,
  userLng: number,
  zones: GeofenceZone[] = GEOFENCE_ZONES
): GeofenceCheckResult {
  const allDistances: GeofenceDistanceItem[] = zones.map((zone) => {
    const distance = calculateDistanceHaversine(
      userLat,
      userLng,
      zone.latitude,
      zone.longitude
    );
    return {
      zone,
      distance,
      isInside: distance <= zone.radius,
    };
  });

  // Urutkan dari yang terdekat
  allDistances.sort((a, b) => a.distance - b.distance);

  const nearestZone = allDistances.length > 0 ? allDistances[0] : null;

  // Cari zona yang saat ini dimasuki (jarak <= radius)
  const insideZones = allDistances.filter((item) => item.isInside);

  if (insideZones.length > 0) {
    const active = insideZones[0];
    return {
      isInsideGeofence: true,
      activeZone: active.zone,
      distanceToActiveZone: active.distance,
      nearestZone,
      allDistances,
    };
  }

  return {
    isInsideGeofence: false,
    activeZone: null,
    distanceToActiveZone: nearestZone ? nearestZone.distance : null,
    nearestZone,
    allDistances,
  };
}

/**
 * Format representasi jarak yang ramah pengguna.
 * Contoh: 150 m atau 2.4 km
 */
export function formatDistance(meters: number | null | undefined): string {
  if (meters === null || meters === undefined || isNaN(meters)) {
    return '-';
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
