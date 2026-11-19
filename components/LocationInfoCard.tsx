import React, { useState } from 'react';
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
  defaultExpanded?: boolean;
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
 * - Mode Collapsible/Expandable yang fleksibel & hemat ruang layar.
 */
export function LocationInfoCard({
  style,
  title = 'Lokasi GPS & Geocoding',
  defaultExpanded = false,
}: LocationInfoCardProps) {
  const { location, accuracy, address, loading, error, refreshLocation } =
    useLokaltripLocation();

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Format akurasi dalam meter (misal: ±4.5 m)
  const accuracyText =
    typeof accuracy === 'number'
      ? `±${accuracy.toFixed(1)} m`
      : 'Memperkirakan...';

  const isHighAccuracy = typeof accuracy === 'number' && accuracy <= 15;

  return (
    <View style={[styles.card, style]}>
      {/* Header Kartu - Dapat diklik untuk membuka/menutup rincian */}
      <TouchableOpacity
        style={styles.headerRow}
        activeOpacity={0.7}
        onPress={() => setIsExpanded((prev) => !prev)}
        accessibilityLabel="Buka atau tutup rincian koordinat GPS"
      >
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <Ionicons name="navigate-circle" size={22} color={Colors.primary} />
          </View>
          <View style={styles.titleTextCol}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {isExpanded
                ? 'Deteksi posisi & alamat penjelajah LokalTrip'
                : address || 'Ketuk untuk rincian koordinat'}
            </Text>
          </View>
        </View>

        {/* Status Badge GPS & Toggle Chevron */}
        <View style={styles.headerRightCol}>
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

          <View style={styles.chevronCircle}>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={Colors.textSecondary}
            />
          </View>
        </View>
      </TouchableOpacity>

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

      {/* Ringkasan Singkat Saat Mode Ringkas (Collapsed) */}
      {!isExpanded && !error && (
        <View style={styles.compactRow}>
          <View style={styles.compactInfoCol}>
            <View style={styles.compactPinRow}>
              <Feather name="map-pin" size={12} color={Colors.primary} />
              <Text style={styles.compactAddressText} numberOfLines={1}>
                {address || (loading ? 'Menerjemahkan koordinat...' : 'Koordinat terdeteksi')}
              </Text>
            </View>
            <Text style={styles.compactCoordsText}>
              {location
                ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)} • ${accuracyText}`
                : 'Menunggu sinyal satelit GPS...'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.compactRefreshBtn, loading && styles.refreshButtonDisabled]}
            activeOpacity={0.8}
            onPress={refreshLocation}
            disabled={loading}
            accessibilityLabel="Perbarui lokasi GPS"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="locate" size={13} color="#FFFFFF" />
            )}
            <Text style={styles.compactRefreshBtnText}>
              {loading ? '...' : 'Ambil'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Konten Lengkap Saat Mode Diperluas (Expanded) */}
      {isExpanded && (
        <>
          {loading && !location ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>
                Menghubungkan ke satelit GPS & memetakan alamat...
              </Text>
            </View>
          ) : (
            <View style={styles.contentBody}>
              {/* Baris Koordinat (Latitude, Longitude & Akurasi) */}
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCD8CF',
    marginVertical: 8,
    marginHorizontal: 20,
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
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    marginRight: 8,
  },
  titleTextCol: {
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  headerRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chevronCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 10,
    gap: 4,
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
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusTextActive: {
    color: Colors.secondary,
  },
  statusTextError: {
    color: Colors.danger,
  },
  // Compact Mode Styles
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    gap: 8,
  },
  compactInfoCol: {
    flex: 1,
  },
  compactPinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactAddressText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  compactCoordsText: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  compactRefreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  compactRefreshBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  // Error Box
  errorBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    alignItems: 'flex-start',
    gap: 8,
  },
  errorTextWrapper: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
    marginBottom: 2,
  },
  errorDesc: {
    fontSize: 11,
    color: '#991B1B',
    lineHeight: 15,
  },
  // Loading Container
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  contentBody: {
    marginTop: 12,
    marginBottom: 8,
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
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accuracyBox: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  coordLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Colors.textMuted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  coordValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  accuracyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  accuracyValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.ocean,
  },
  addressContainer: {
    backgroundColor: '#FFFDF9',
    borderRadius: 12,
    padding: 11,
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
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  addressText: {
    fontSize: 12.5,
    color: Colors.text,
    lineHeight: 17,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 4,
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
    paddingVertical: 7,
    paddingHorizontal: 12,
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
    fontSize: 12,
    fontWeight: '700',
  },
});

export default LocationInfoCard;

