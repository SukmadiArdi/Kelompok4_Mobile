import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LokaltripCoordinates {
  latitude: number;
  longitude: number;
}

export interface UseLokaltripLocationReturn {
  location: LokaltripCoordinates | null;
  accuracy: number | null;
  address: string | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
}

/**
 * Format objek hasil reverse geocode menjadi string alamat yang mudah dibaca (jalan, kecamatan, kota, provinsi).
 */
export function formatGeocodedAddress(geo: Location.LocationGeocodedAddress): string {
  const streetName = geo.street || geo.name || '';
  const streetNo = geo.streetNumber ? ` No. ${geo.streetNumber}` : '';
  const road = streetName ? `${streetName}${streetNo}` : '';
  const district = geo.district || geo.subregion || '';
  const city = geo.city || '';
  const region = geo.region || '';

  const addressComponents = [road, district, city, region].filter(Boolean);

  if (addressComponents.length > 0) {
    return addressComponents.join(', ');
  }

  if (geo.formattedAddress) {
    return geo.formattedAddress;
  }

  return 'Alamat tidak teridentifikasi';
}

/**
 * Custom Hook untuk mendapatkan lokasi GPS dan Reverse Geocoding aplikasi LokalTrip.
 * 
 * Fitur:
 * - Meminta izin lokasi foreground (requestForegroundPermissionsAsync) & menangani penolakan (Deny).
 * - Mengambil koordinat GPS (getCurrentPositionAsync): latitude, longitude, dan accuracy (meter).
 * - Melakukan Reverse Geocoding (reverseGeocodeAsync) menjadi alamat ramah pengguna.
 * - Optimasi Baterai: Location.Accuracy.Balanced secara default, Location.Accuracy.High hanya saat refresh.
 * - Pembersihan memori & subscription: dibersihkan secara aman saat unmount.
 */
export function useLokaltripLocation(): UseLokaltripLocationReturn {
  const [location, setLocation] = useState<LokaltripCoordinates | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ref untuk melacak status mount komponen demi mencegah memory leak
  const isMountedRef = useRef<boolean>(true);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  /**
   * Mengambil posisi lokasi perangkat dengan akurasi yang dapat disesuaikan.
   */
  const getLocationData = useCallback(async (accuracyLevel: Location.Accuracy) => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Cek apakah layanan GPS aktif di perangkat
      const hasServices = await Location.hasServicesEnabledAsync();
      if (!hasServices) {
        if (isMountedRef.current) {
          setError('Layanan GPS perangkat tidak aktif. Mohon aktifkan GPS/Lokasi di pengaturan ponsel Anda.');
          setLoading(false);
        }
        return;
      }

      // 2. Minta izin akses lokasi foreground
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        if (isMountedRef.current) {
          setError('Izin akses lokasi ditolak. Silakan izinkan akses lokasi agar LokalTrip dapat menampilkan posisi Anda.');
          setLoading(false);
        }
        return;
      }

      // 3. Ambil posisi GPS dengan akurasi yang dioptimasi
      const position = await Location.getCurrentPositionAsync({
        accuracy: accuracyLevel,
      });

      if (!isMountedRef.current) return;

      const coords: LokaltripCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setLocation(coords);
      setAccuracy(position.coords.accuracy);

      // 4. Reverse Geocoding: ubah koordinat menjadi alamat lengkap
      try {
        const geocodedAddresses = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        if (isMountedRef.current) {
          if (geocodedAddresses && geocodedAddresses.length > 0) {
            const readableAddress = formatGeocodedAddress(geocodedAddresses[0]);
            setAddress(readableAddress);
          } else {
            setAddress('Alamat tidak dapat ditemukan untuk koordinat ini.');
          }
        }
      } catch (geoError: any) {
        console.warn('[useLokaltripLocation] Reverse geocode gagal:', geoError);
        if (isMountedRef.current) {
          setAddress('Gagal menerjemahkan koordinat menjadi alamat.');
        }
      }
    } catch (err: any) {
      console.error('[useLokaltripLocation] Gagal mengambil lokasi:', err);
      if (isMountedRef.current) {
        setError(err?.message || 'Terjadi kesalahan saat mengakses sensor GPS perangkat.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Mengambil lokasi awal saat komponen pertama kali dimuat.
   * Optimasi Baterai: Default menggunakan Accuracy.Balanced untuk menghemat daya.
   */
  useEffect(() => {
    isMountedRef.current = true;

    // Default: Balanced Accuracy (Hemat Baterai)
    getLocationData(Location.Accuracy.Balanced);

    // Cleanup subscription dan flag mounted saat unmount
    return () => {
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [getLocationData]);

  /**
   * Fungsi refresh manual saat pengguna menekan tombol "Ambil Lokasi".
   * Optimasi Baterai: Menggunakan Accuracy.High hanya atas permintaan pengguna (on-demand).
   */
  const refreshLocation = useCallback(async () => {
    await getLocationData(Location.Accuracy.High);
  }, [getLocationData]);

  return {
    location,
    accuracy,
    address,
    loading,
    error,
    refreshLocation,
  };
}

export default useLokaltripLocation;

