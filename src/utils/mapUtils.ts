import { Linking, Platform } from 'react-native';

/**
 * Membuka aplikasi peta (Google Maps di Android/Web, Apple Maps di iOS)
 * dengan rute/petunjuk arah ke destinasi koordinat tertentu.
 */
export const openDirections = (lat: number, lng: number, label?: string): void => {
  const destination = `${lat},${lng}`;
  const encodedLabel = encodeURIComponent(label || 'Destinasi LokalTrip');

  if (Platform.OS === 'web') {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    return;
  }

  const googleMapsAppUrl = Platform.select({
    ios: `comgooglemaps://?daddr=${destination}&directionsmode=driving`,
    android: `google.navigation:q=${destination}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
  });

  const universalWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&query=${encodedLabel}`;

  Linking.canOpenURL(googleMapsAppUrl)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(googleMapsAppUrl);
      }
      return Linking.openURL(universalWebUrl);
    })
    .catch(() => {
      void Linking.openURL(universalWebUrl);
    });
};

/**
 * Format koordinat derajat desimal ke format GPS DMS (Derajat, Menit, Detik)
 * Contoh: -8.2435, 110.9912 -> 8°14'36.6"S, 110°59'28.3"E
 */
export const formatCoordinatesDMS = (lat: number, lng: number): string => {
  const formatDMS = (deg: number, isLat: boolean): string => {
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
    const direction = isLat
      ? deg >= 0
        ? 'N'
        : 'S'
      : deg >= 0
      ? 'E'
      : 'W';

    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };

  return `${formatDMS(lat, true)}, ${formatDMS(lng, false)}`;
};
