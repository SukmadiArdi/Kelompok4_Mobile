import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Theme';
import { useLokaltripLocation } from '@/hooks/useLokaltripLocation';

export interface LocationInfoCardProps {
  style?: StyleProp<ViewStyle>;
  title?: string;
}

/**
 * Komponen UI Informasi Lokasi GPS & Reverse Geocoding LokalTrip.
 * 
 * Menampilkan:
 * - Titik koordinat Latitude & Longitude
 * - Akurasi sinyal GPS dalam meter (misal ±5.0 m)
 * - Alamat hasil Reverse Geocoding ("Alamat Saat Ini")
 * - Tombol "Ambil Lokasi" untuk pembaruan manual (High Accuracy)
 * - Penanganan state Loading & Pesan Error jika izin ditolak atau GPS mati.
 */
export function LocationInfoCard({
  style,
  title = 'Lokasi GPS & Geocoding',
}: LocationInfoCardProps) {
  const { location, accuracy, address, loading, error, refreshLocation } =
    useLokaltripLocation();

  // Format akurasi dalam meter (misal: ±4.5 m)
  const accuracyText =
    typeof accuracy === 'number'
      ? `±${accuracy.toFixed(1)} m`
      : 'Memperkirakan...';

  const isHighAccuracy = typeof accuracy === 'number' && accuracy <= 15;

  return (
    <View style={[styles.card, style]}>
      {/* Header Kartu */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <Ionicons name="navigate-circle" size={22} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>
              Deteksi posisi & alamat penjelajah LokalTrip
            </Text>
          </View>
        </View>

        {/* Status Badge GPS */}
        <View
          style={[
            styles.statusBadge,
            error ? styles.statusBadgeError : styles.statusBadgeActive,
          ]}
        >
          <View
            style={[
              styles.pulseDot,
              error ? styles.pulseDotError : styles.pulseDotActive,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              error ? styles.statusTextError : styles.statusTextActive,
            ]}
          >
            {error ? 'GPS OFFLINE' : loading ? 'MENCARI...' : 'GPS AKTIF'}
          </Text>
        </View>
      </View>

      {/* Banner Pesan Error (Izin Ditolak / GPS Mati) */}
      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={20} color={Colors.danger} />
          <View style={styles.errorTextWrapper}>
            <Text style={styles.errorTitle}>Gagal Mengakses GPS</Text>
            <Text style={styles.errorDesc}>{error}</Text>
          </View>
        </View>
      ) : null}

      {/* Konten Koordinat & Alamat */}
      {loading && !location ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>
            Menghubungkan ke satelit GPS & memetakan alamat...
          </Text>
        </View>
      ) : (
        <View style={styles.contentBody}>
          {/* Baris Koordinat (Latitude & Longitude) */}
          <View style={styles.coordsGrid}>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>LATITUDE</Text>
              <Text style={styles.coordValue} numberOfLines={1}>
                {location ? location.latitude.toFixed(6) : '—'}
              </Text>
            </View>

            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>LONGITUDE</Text>
              <Text style={styles.coordValue} numberOfLines={1}>
                {location ? location.longitude.toFixed(6) : '—'}
              </Text>
            </View>

            <View style={[styles.coordBox, styles.accuracyBox]}>
              <Text style={styles.coordLabel}>AKURASI</Text>
              <View style={styles.accuracyValueRow}>
                <Ionicons
                  name={isHighAccuracy ? 'shield-checkmark' : 'shield-outline'}
                  size={12}
                  color={isHighAccuracy ? Colors.secondary : Colors.accent}
                />
                <Text style={styles.accuracyValue} numberOfLines={1}>
                  {accuracyText}
                </Text>
              </View>
            </View>
          </View>

          {/* Kotak Alamat Hasil Reverse Geocoding */}
          <View style={styles.addressContainer}>
            <View style={styles.addressHeaderRow}>
              <Feather name="map-pin" size={14} color={Colors.primary} />
              <Text style={styles.addressHeaderTitle}>Alamat Saat Ini</Text>
            </View>
            <Text style={styles.addressText} numberOfLines={3}>
              {address || (loading ? 'Menerjemahkan koordinat ke alamat...' : 'Alamat belum terdeteksi')}
            </Text>
          </View>
        </View>
      )}

      {/* Footer & Tombol Aksi "Ambil Lokasi" */}
      <View style={styles.footerRow}>
        <View style={styles.batteryNotice}>
          <Ionicons name="battery-charging-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.batteryNoticeText}>
            Hemat Baterai (Balanced GPS)
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}
          activeOpacity={0.8}
          onPress={refreshLocation}
          disabled={loading}
          accessibilityLabel="Perbarui lokasi GPS dengan akurasi tinggi"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="locate" size={16} color="#FFFFFF" />
          )}
          <Text style={styles.refreshButtonText}>
            {loading ? 'Memperbarui...' : 'Ambil Lokasi'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCD8CF',
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statusBadgeActive: {
    backgroundColor: '#E8F5EE',
  },
  statusBadgeError: {
    backgroundColor: Colors.dangerLight,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pulseDotActive: {
    backgroundColor: Colors.secondary,
  },
  pulseDotError: {
    backgroundColor: Colors.danger,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  statusTextActive: {
    color: Colors.secondary,
  },
  statusTextError: {
    color: Colors.danger,
  },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
    gap: 10,
  },
  errorTextWrapper: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.danger,
    marginBottom: 2,
  },
  errorDesc: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  contentBody: {
    marginBottom: 12,
    gap: 10,
  },
  coordsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  coordBox: {
    flex: 1,
    backgroundColor: Colors.surfaceSubtle,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accuracyBox: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  coordLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  coordValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  accuracyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accuracyValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ocean,
  },
  addressContainer: {
    backgroundColor: '#FFFDF9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FCE7BD',
  },
  addressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  addressHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  addressText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  batteryNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  batteryNoticeText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  refreshButtonDisabled: {
    backgroundColor: '#FDBA74',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default LocationInfoCard;

