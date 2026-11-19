import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import MapView, { Marker, Circle, Region } from 'react-native-maps';
import {
  GeofenceZone,
  GEOFENCE_ZONES,
  DEFAULT_MAP_COORDINATES,
  checkGeofenceStatus,
  formatDistance,
} from '../utils/geofencing';

export interface LokaltripMapViewProps {
  /**
   * Latitude posisi pengguna saat ini (dari hook GPS / device).
   * Jika null/undefined, akan menggunakan koordinat default destinasi wisata.
   */
  userLatitude?: number | null;
  /**
   * Longitude posisi pengguna saat ini (dari hook GPS / device).
   * Jika null/undefined, akan menggunakan koordinat default destinasi wisata.
   */
  userLongitude?: number | null;
  /**
   * Callback ketika pengguna memasuki batas radius geofence (Enter Event).
   */
  onEnterGeofence?: (zone: GeofenceZone) => void;
  /**
   * Callback ketika pengguna keluar dari batas radius geofence (Exit Event).
   */
  onExitGeofence?: (zone: GeofenceZone) => void;
  /**
   * Daftar area geofence kustom (opsional, default: GEOFENCE_ZONES).
   */
  customZones?: GeofenceZone[];
  /**
   * Style container kustom untuk peta.
   */
  style?: StyleProp<ViewStyle>;
}

export const LokaltripMapView: React.FC<LokaltripMapViewProps> = ({
  userLatitude,
  userLongitude,
  onEnterGeofence,
  onExitGeofence,
  customZones = GEOFENCE_ZONES,
  style,
}) => {
  const mapRef = useRef<MapView | null>(null);

  // Responsivitas tinggi layar & toggle expand
  const { height: screenHeight } = useWindowDimensions();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const dynamicMapHeight = isExpanded
    ? Math.min(screenHeight * 0.65, 540)
    : Math.min(Math.max(screenHeight * 0.44, 320), 440);

  // State simulasi koordinat (untuk pengujian demo tanpa berpindah lokasi fisik)
  const [simulatedLat, setSimulatedLat] = useState<number | null>(null);
  const [simulatedLng, setSimulatedLng] = useState<number | null>(null);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState<number>(0);
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(true);

  // Target destinasi untuk simulasi masuk/keluar
  const targetZone = customZones[selectedZoneIndex] || customZones[0];

  // Koordinat efektif yang sedang digunakan (prioritas: Simulasi > Props GPS > Default)
  const effectiveLat = simulatedLat ?? userLatitude ?? DEFAULT_MAP_COORDINATES.latitude;
  const effectiveLng = simulatedLng ?? userLongitude ?? DEFAULT_MAP_COORDINATES.longitude;

  // Evaluasi status geofence menggunakan rumus Haversine
  const geofenceResult = useMemo(() => {
    return checkGeofenceStatus(effectiveLat, effectiveLng, customZones);
  }, [effectiveLat, effectiveLng, customZones]);

  // Ref untuk melacak perubahan status enter/exit geofence
  const prevInsideZoneIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentZone = geofenceResult.activeZone;
    const currentZoneId = currentZone ? currentZone.id : null;
    const prevZoneId = prevInsideZoneIdRef.current;

    if (currentZone && currentZoneId !== prevZoneId) {
      // Enter Event terpicu!
      setIsBannerVisible(true);
      if (onEnterGeofence) {
        onEnterGeofence(currentZone);
      }
    } else if (!currentZone && prevZoneId) {
      // Exit Event terpicu!
      const previousZone = customZones.find((z) => z.id === prevZoneId);
      if (previousZone && onExitGeofence) {
        onExitGeofence(previousZone);
      }
    }

    prevInsideZoneIdRef.current = currentZoneId;
  }, [geofenceResult.activeZone, customZones, onEnterGeofence, onExitGeofence]);

  // Handler: Pusatkan kamera peta ke posisi pengguna saat ini
  const handleCenterToUser = () => {
    if (mapRef.current) {
      const region: Region = {
        latitude: effectiveLat,
        longitude: effectiveLng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
      mapRef.current.animateToRegion(region, 600);
    }
  };

  // Handler: Simulasi masuk ke dalam radius area destinasi (Enter Event demo)
  const handleSimulateEnterArea = () => {
    // Geser koordinat ke ~80 meter dari titik tengah destinasi (pasti masuk radius 500m)
    const insideLat = targetZone.latitude + 0.0006;
    const insideLng = targetZone.longitude + 0.0006;

    setSimulatedLat(insideLat);
    setSimulatedLng(insideLng);
    setIsBannerVisible(true);

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: insideLat,
          longitude: insideLng,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        },
        700
      );
    }
  };

  // Handler: Simulasi keluar dari radius area destinasi (Exit Event demo)
  const handleSimulateExitArea = () => {
    // Geser koordinat ke ~1.8 km dari destinasi (di luar radius 500m)
    const outsideLat = targetZone.latitude + 0.016;
    const outsideLng = targetZone.longitude + 0.016;

    setSimulatedLat(outsideLat);
    setSimulatedLng(outsideLng);

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: outsideLat,
          longitude: outsideLng,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        700
      );
    }
  };

  // Handler: Reset koordinat simulasi kembali ke GPS asli
  const handleResetSimulation = () => {
    setSimulatedLat(null);
    setSimulatedLng(null);
    const realLat = userLatitude ?? DEFAULT_MAP_COORDINATES.latitude;
    const realLng = userLongitude ?? DEFAULT_MAP_COORDINATES.longitude;

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: realLat,
          longitude: realLng,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        600
      );
    }
  };

  // Ganti destinasi target untuk pengujian simulasi
  const handleNextTargetZone = () => {
    const nextIdx = (selectedZoneIndex + 1) % customZones.length;
    setSelectedZoneIndex(nextIdx);
    const nextZone = customZones[nextIdx];
    if (mapRef.current && nextZone) {
      mapRef.current.animateToRegion(
        {
          latitude: nextZone.latitude,
          longitude: nextZone.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        600
      );
    }
  };

  return (
    <View style={[styles.container, { height: dynamicMapHeight }, style]}>
      {/* =================================================================== */}
      {/* 1. MAPVIEW UTAMA DENGAN MARKER & GEOFENCE CIRCLE                    */}
      {/* =================================================================== */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: effectiveLat,
          longitude: effectiveLng,
          latitudeDelta: DEFAULT_MAP_COORDINATES.latitudeDelta,
          longitudeDelta: DEFAULT_MAP_COORDINATES.longitudeDelta,
        }}
        showsUserLocation={false} // Kami render marker pengguna kustom agar visual konsisten
        showsMyLocationButton={false}
      >
        {/* Render Lingkaran Geofencing (Radius 500 meter) - Task 03B */}
        {customZones.map((zone) => {
          const isUserInsideThisZone =
            geofenceResult.isInsideGeofence &&
            geofenceResult.activeZone?.id === zone.id;

          return (
            <Circle
              key={`geofence-circle-${zone.id}`}
              center={{
                latitude: zone.latitude,
                longitude: zone.longitude,
              }}
              radius={zone.radius}
              strokeWidth={isUserInsideThisZone ? 3 : 2}
              strokeColor={
                isUserInsideThisZone ? '#10B981' : 'rgba(29, 78, 216, 0.75)'
              }
              fillColor={
                isUserInsideThisZone
                  ? 'rgba(16, 185, 129, 0.25)'
                  : 'rgba(29, 78, 216, 0.12)'
              }
            />
          );
        })}

        {/* Render Marker Destinasi Wisata - Task 02 */}
        {customZones.map((zone) => {
          const isUserInsideThisZone =
            geofenceResult.isInsideGeofence &&
            geofenceResult.activeZone?.id === zone.id;

          return (
            <Marker
              key={`dest-marker-${zone.id}`}
              coordinate={{
                latitude: zone.latitude,
                longitude: zone.longitude,
              }}
              title={zone.name}
              description={`${zone.category} • Radius Geofence: ${zone.radius}m`}
            >
              <View
                style={[
                  styles.destMarkerBadge,
                  isUserInsideThisZone && styles.destMarkerBadgeActive,
                ]}
              >
                <Ionicons
                  name={isUserInsideThisZone ? 'checkmark-circle' : 'trail-sign'}
                  size={16}
                  color="#FFFFFF"
                />
              </View>
            </Marker>
          );
        })}

        {/* Render Marker Posisi Pengguna */}
        <Marker
          coordinate={{
            latitude: effectiveLat,
            longitude: effectiveLng,
          }}
          title="Lokasi Anda"
          description={
            geofenceResult.isInsideGeofence
              ? `Di dalam area ${geofenceResult.activeZone?.name}`
              : 'Di luar area geofence wisata'
          }
          zIndex={999}
        >
          <View style={styles.userMarkerOuter}>
            <View
              style={[
                styles.userMarkerPulse,
                geofenceResult.isInsideGeofence && styles.userMarkerPulseActive,
              ]}
            />
            <View
              style={[
                styles.userMarkerCenter,
                geofenceResult.isInsideGeofence && styles.userMarkerCenterActive,
              ]}
            >
              <Ionicons name="navigate" size={13} color="#FFFFFF" />
            </View>
          </View>
        </Marker>
      </MapView>

      {/* =================================================================== */}
      {/* 2. FEEDBACK BANNER INTERAKTIF (ENTER GEOFENCE EVENT)                */}
      {/* =================================================================== */}
      {geofenceResult.isInsideGeofence &&
        geofenceResult.activeZone &&
        isBannerVisible && (
          <View style={styles.enterBannerWrapper}>
            <View style={styles.enterBanner}>
              <View style={styles.bannerIconBox}>
                <Ionicons name="sparkles" size={22} color="#10B981" />
              </View>

              <View style={styles.bannerContent}>
                <View style={styles.bannerHeaderRow}>
                  <Text style={styles.bannerTagText}>ENTER EVENT AKTIF</Text>
                  <Text style={styles.bannerRadiusText}>
                    Radius {geofenceResult.activeZone.radius}m
                  </Text>
                </View>

                <Text style={styles.bannerTitleText} numberOfLines={1}>
                  Anda masuk area wisata {geofenceResult.activeZone.name}!
                </Text>

                <Text style={styles.bannerDescText} numberOfLines={1}>
                  {geofenceResult.activeZone.location},{' '}
                  {geofenceResult.activeZone.city}
                </Text>

                <View style={styles.bannerDistanceRow}>
                  <Feather name="navigation" size={12} color="#059669" />
                  <Text style={styles.bannerDistanceText}>
                    Jarak ke titik sentral:{' '}
                    {formatDistance(geofenceResult.distanceToActiveZone)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.bannerCloseBtn}
                onPress={() => setIsBannerVisible(false)}
                hitSlop={8}
                accessibilityLabel="Tutup notifikasi"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        )}

      {/* =================================================================== */}
      {/* 3. STATUS BAR GEOFENCE (DI LUAR AREA)                               */}
      {/* =================================================================== */}
      {!geofenceResult.isInsideGeofence && (
        <View style={styles.outsideStatusBadge}>
          <Ionicons name="radio-outline" size={14} color="#64748B" />
          <Text style={styles.outsideStatusText}>
            Di luar area wisata • Terdekat:{' '}
            <Text style={{ fontWeight: '700', color: '#1E293B' }}>
              {geofenceResult.nearestZone?.zone.name || 'Destinasi'}
            </Text>{' '}
            ({formatDistance(geofenceResult.nearestZone?.distance)})
          </Text>
        </View>
      )}

      {/* =================================================================== */}
      {/* 4. FLOATING MAP CONTROLS (EXPAND/COLLAPSE & LOKASI SAYA)            */}
      {/* =================================================================== */}
      <View style={styles.mapControlsColumn}>
        <TouchableOpacity
          style={styles.mapToolBtn}
          activeOpacity={0.8}
          onPress={() => setIsExpanded((prev) => !prev)}
          accessibilityLabel={isExpanded ? 'Perkecil tampilan peta' : 'Perbesar tampilan peta'}
        >
          <Ionicons
            name={isExpanded ? 'contract-outline' : 'expand-outline'}
            size={18}
            color="#1E293B"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mapToolBtn}
          activeOpacity={0.8}
          onPress={handleCenterToUser}
          accessibilityLabel="Pusatkan kembali kamera ke pengguna"
        >
          <Ionicons name="locate" size={20} color="#1D4ED8" />
        </TouchableOpacity>
      </View>

      {/* =================================================================== */}
      {/* 5. TOOLBAR KONTROL SIMULASI GEOFENCE (TASK 03B DEMO)                */}
      {/* =================================================================== */}
      <View style={styles.simulationControlCard}>
        <View style={styles.simHeaderRow}>
          <View style={styles.simTitleGroup}>
            <Ionicons name="hardware-chip-outline" size={16} color="#1D4ED8" />
            <Text style={styles.simTitleText}>
              Simulasi Geofence: {targetZone.name}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.switchTargetBtn}
            onPress={handleNextTargetZone}
            activeOpacity={0.7}
          >
            <Text style={styles.switchTargetText}>Ganti Target ❯</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.simButtonRow}>
          {/* Tombol Simulasi Masuk Area (Memicu Enter Event) */}
          <TouchableOpacity
            style={[
              styles.simActionBtn,
              styles.simEnterBtn,
              geofenceResult.isInsideGeofence && styles.simBtnDisabled,
            ]}
            onPress={handleSimulateEnterArea}
            activeOpacity={0.8}
          >
            <Ionicons name="enter-outline" size={16} color="#FFFFFF" />
            <Text style={styles.simEnterBtnText}>Simulasi Masuk Area</Text>
          </TouchableOpacity>

          {/* Tombol Simulasi Keluar Area (Memicu Exit Event) */}
          <TouchableOpacity
            style={[styles.simActionBtn, styles.simExitBtn]}
            onPress={handleSimulateExitArea}
            activeOpacity={0.8}
          >
            <Ionicons name="exit-outline" size={16} color="#1E293B" />
            <Text style={styles.simExitBtnText}>Keluar Area</Text>
          </TouchableOpacity>

          {/* Tombol Reset Koordinat ke GPS */}
          {simulatedLat !== null && (
            <TouchableOpacity
              style={styles.simResetBtn}
              onPress={handleResetSimulation}
              activeOpacity={0.7}
              accessibilityLabel="Reset ke posisi GPS"
            >
              <Ionicons name="refresh" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        {simulatedLat !== null && (
          <Text style={styles.simStatusIndicator}>
            Mode Simulasi Aktif ({effectiveLat.toFixed(4)}, {effectiveLng.toFixed(4)})
          </Text>
        )}
      </View>
    </View>
  );
};

export default LokaltripMapView;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  // Marker Pengguna
  userMarkerOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(29, 78, 216, 0.25)',
  },
  userMarkerPulseActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
  },
  userMarkerCenter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1D4ED8',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  userMarkerCenterActive: {
    backgroundColor: '#10B981',
  },
  // Marker Destinasi
  destMarkerBadge: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  destMarkerBadgeActive: {
    backgroundColor: '#10B981',
    transform: [{ scale: 1.15 }],
  },
  // Enter Event Feedback Banner
  enterBannerWrapper: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  enterBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerContent: {
    flex: 1,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  bannerTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  bannerRadiusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  bannerTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  bannerDescText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  bannerDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerDistanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  bannerCloseBtn: {
    padding: 4,
    marginLeft: 6,
  },
  // Outside Status Badge
  outsideStatusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 9,
  },
  outsideStatusText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  // Floating Map Controls (Resize & Locate)
  mapControlsColumn: {
    position: 'absolute',
    right: 14,
    bottom: 126,
    gap: 8,
    zIndex: 10,
  },
  mapToolBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  // Toolbar Kontrol Simulasi
  simulationControlCard: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 10,
  },
  simHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  simTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  simTitleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  switchTargetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  switchTargetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  simButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simActionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  simEnterBtn: {
    backgroundColor: '#10B981',
  },
  simEnterBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  simExitBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  simExitBtnText: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '600',
  },
  simBtnDisabled: {
    opacity: 0.6,
  },
  simResetBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simStatusIndicator: {
    marginTop: 6,
    fontSize: 10,
    color: '#059669',
    textAlign: 'center',
    fontWeight: '600',
  },
});
