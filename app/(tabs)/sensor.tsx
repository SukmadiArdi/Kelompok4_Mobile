import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Vibration,
  Alert,
  DimensionValue,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Accelerometer } from 'expo-sensors';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Theme';
import { Header } from '@/src/components/common/Header';
import { AccelerometerDisplay } from '@/components/AccelerometerDisplay';

// =========================================================================
// [MODUL PRAKTIKUM - SENSOR ACCELEROMETER: TASK 01, 02 & 03 COMBINED]
// - Task 01: Connect App to Sensor & Basic Listener
// - Task 02: Display Sensor Data Real-Time UI & Line Chart History
// - Task 03: Shake Detection & Vibration Interaction
// =========================================================================

type SensorSubscription = {
  remove: () => void;
};

interface SensorCoordinates {
  x: number;
  y: number;
  z: number;
}

export default function SensorScreen() {
  // 1. State data koordinat sensor
  const [sensorData, setSensorData] = useState<SensorCoordinates>({ x: 0, y: 0, z: 0 });
  const [history, setHistory] = useState<SensorCoordinates[]>([]);
  const [showAdvancedDisplay, setShowAdvancedDisplay] = useState<boolean>(true);

  // 2. State status guncangan (shaking)
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // 3. State ketersediaan sensor, izin, dan loading
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(true);

  // 4. Ref untuk menghindari spam Alert / loop closure pada listener
  const isShakingRef = useRef<boolean>(false);
  const lastShakeTimeRef = useRef<number>(0);

  // 5. Ambang batas (threshold) guncangan sesuai spesifikasi modul Task 03
  const threshold = 1.5;

  useEffect(() => {
    let subscription: SensorSubscription | null = null;

    const setupSensor = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // Cek ketersediaan hardware Accelerometer
        const available = await Accelerometer.isAvailableAsync();
        setIsAvailable(available);

        if (!available) {
          setErrorMessage(
            'Sensor Accelerometer tidak terdeteksi pada perangkat atau emulator ini.'
          );
          setIsLoading(false);
          return;
        }

        // Cek dan minta izin sensor
        let perm = await Accelerometer.getPermissionsAsync();
        if (!perm.granted && perm.canAskAgain) {
          perm = await Accelerometer.requestPermissionsAsync();
        }
        setPermissionGranted(perm.granted);

        if (!perm.granted) {
          setErrorMessage('Izin akses sensor gerak (Accelerometer) belum diberikan.');
          setIsLoading(false);
          return;
        }

        // Atur interval pembacaan menjadi 100ms
        Accelerometer.setUpdateInterval(100);

        // Pasang listener Accelerometer dengan logika deteksi guncangan (Task 03)
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          setSensorData({ x, y, z });

          // Hitung total percepatan (magnitude)
          const magnitude = Math.sqrt(x * x + y * y + z * z);

          // Evaluasi ambang batas gerakan
          if (magnitude > threshold) {
            console.log(
              `Accelerometer: x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)} <- Gerakan terdeteksi`
            );

            const now = Date.now();
            // Cegah spam Alert dengan memeriksa isShakingRef dan debounce waktu
            if (!isShakingRef.current && now - lastShakeTimeRef.current > 1500) {
              isShakingRef.current = true;
              lastShakeTimeRef.current = now;
              setIsShaking(true);

              // Picu getaran perangkat selama 500ms
              Vibration.vibrate(500);

              // Tampilkan notifikasi pop-up Alert
              Alert.alert('Goyang Terdeteksi!', 'Perangkat digerakkan', [
                {
                  text: 'OK',
                  onPress: () => {
                    // Reset ref setelah konfirmasi
                    isShakingRef.current = false;
                    setIsShaking(false);
                  },
                },
              ]);
            }
          } else {
            console.log(
              `Accelerometer: x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}`
            );

            // Jika sebelumnya berstatus shaking dan getaran sudah mereda
            if (isShakingRef.current && Date.now() - lastShakeTimeRef.current > 600) {
              isShakingRef.current = false;
              setIsShaking(false);
            }
          }

          // Simpan riwayat data (maksimal 15 data terakhir untuk grafik Task 02)
          setHistory((prev) => {
            const next = [...prev, { x, y, z }];
            return next.length > 15 ? next.slice(-15) : next;
          });
        });

        setIsListening(true);
      } catch (err: any) {
        console.error('Error saat inisialisasi Accelerometer:', err);
        setErrorMessage(
          err?.message || 'Terjadi kesalahan saat menginisialisasi sensor.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isListening) {
      setupSensor();
    }

    // Cleanup listener saat unmount untuk mencegah memory leak
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isListening]);

  // Fungsi toggle listener aktif / jeda
  const toggleListening = () => {
    setIsListening((prev) => !prev);
  };

  // Fungsi simulasi goyangan (berguna saat pengujian di Android Emulator tanpa sensor fisik)
  const triggerSimulatedShake = () => {
    const simX = 1.25;
    const simY = 1.15;
    const simZ = 0.85;
    setSensorData({ x: simX, y: simY, z: simZ });
    setHistory((prev) => {
      const next = [...prev, { x: simX, y: simY, z: simZ }];
      return next.length > 15 ? next.slice(-15) : next;
    });

    console.log(
      `Accelerometer: x=${simX.toFixed(2)}, y=${simY.toFixed(2)}, z=${simZ.toFixed(2)} <- Gerakan terdeteksi (Simulasi)`
    );

    isShakingRef.current = true;
    lastShakeTimeRef.current = Date.now();
    setIsShaking(true);
    Vibration.vibrate(500);

    Alert.alert('Goyang Terdeteksi!', 'Perangkat digerakkan (Simulasi)', [
      {
        text: 'OK',
        onPress: () => {
          isShakingRef.current = false;
          setIsShaking(false);
        },
      },
    ]);
  };

  // Fungsi minta ulang izin sensor
  const handleRequestPermission = async () => {
    try {
      const perm = await Accelerometer.requestPermissionsAsync();
      setPermissionGranted(perm.granted);
      if (perm.granted) {
        setErrorMessage(null);
        setIsListening(true);
      } else {
        setErrorMessage('Izin sensor tetap ditolak oleh pengguna.');
      }
    } catch (err: any) {
      console.error('Error requesting permission:', err);
      setErrorMessage('Gagal meminta izin sensor.');
    }
  };

  // Perhitungan persentase visualisasi bar
  const getProgressPercent = (val: number): DimensionValue => {
    const clamped = Math.max(-2, Math.min(2, val));
    return `${Math.round(((clamped + 2) / 4) * 100)}%` as DimensionValue;
  };

  const currentMagnitude = Math.sqrt(
    sensorData.x * sensorData.x +
    sensorData.y * sensorData.y +
    sensorData.z * sensorData.z
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Badge Task & Status Koneksi */}
        <View style={styles.badgeRow}>
          <View style={styles.taskBadge}>
            <Text style={styles.taskBadgeText}>TASK 03 • SHAKE DETECTION</Text>
          </View>

          <TouchableOpacity
            onPress={toggleListening}
            style={[
              styles.connectionPill,
              isListening ? styles.connectionPillActive : styles.connectionPillInactive,
            ]}>
            <View
              style={[
                styles.connectionDot,
                isListening ? styles.connectionDotActive : styles.connectionDotInactive,
              ]}
            />
            <Text
              style={[
                styles.connectionText,
                isListening ? styles.connectionTextActive : styles.connectionTextInactive,
              ]}>
              {isListening ? 'Sensor 100ms' : 'Dijeda'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. HEADER & INSTRUKSI DINAMIS (Normal vs Saat Digerakkan) */}
        {isShaking ? (
          // Saat Digerakkan (isShaking = true)
          <View style={styles.shakeAlertBanner}>
            <View style={styles.shakeAlertContent}>
              <View style={styles.shakeIconBubble}>
                <Ionicons name="phone-portrait" size={28} color="#DC2626" />
                <View style={styles.shakeWaveIcon}>
                  <MaterialCommunityIcons name="vibrate" size={18} color="#DC2626" />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.shakeAlertTitle}>Goyang Terdeteksi!</Text>
                <Text style={styles.shakeAlertDesc}>
                  Magnitude: {currentMagnitude.toFixed(2)} &gt; {threshold} • Getaran aktif (500ms)
                </Text>
              </View>
            </View>
          </View>
        ) : (
          // Saat Normal (!isShaking)
          <View style={styles.normalHeaderCard}>
            <View style={styles.sensorIconContainer}>
              <Ionicons name="hardware-chip-outline" size={36} color={Colors.ocean} />
            </View>
            <Text style={styles.pageTitle}>Sensor Accelerometer</Text>
            <Text style={styles.pageSubtitle}>
              Goyangkan perangkat untuk melihat nilai sensor.
            </Text>
          </View>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Memeriksa sensor accelerometer...</Text>
          </View>
        )}

        {/* Peringatan Sensor Tidak Tersedia / Permission Ditolak */}
        {!isLoading && (!isAvailable || permissionGranted === false || errorMessage) && (
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={22} color={Colors.danger} />
              <Text style={styles.warningTitle}>Peringatan Akses Hardware</Text>
            </View>
            <Text style={styles.warningDesc}>
              {errorMessage ||
                (!isAvailable
                  ? 'Sensor Accelerometer tidak terdeteksi pada emulator/perangkat ini.'
                  : 'Izin akses sensor gerak diperlukan.')}
            </Text>

            {permissionGranted === false && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRequestPermission}>
                <Ionicons name="shield-checkmark" size={16} color="#FFF" />
                <Text style={styles.retryButtonText}>Minta Ulang Izin Sensor</Text>
              </TouchableOpacity>
            )}

            {!isAvailable && (
              <View style={styles.emulatorHint}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.emulatorHintText}>
                  Tip: Gunakan tombol <Text style={styles.boldText}>Simulasi Goyang</Text> di bawah atau aktifkan{' '}
                  <Text style={styles.boldText}>Virtual Sensors</Text> di emulator Android.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 2. KARTU NILAI REAL-TIME (3 KOTAK: X, Y, Z) */}
        <View style={styles.coordinatesSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeaderTitle}>Nilai Real-Time Sumbu</Text>
            <Text style={styles.magnitudeBadge}>
              Mag: {currentMagnitude.toFixed(2)}
            </Text>
          </View>

          <View style={styles.axisGrid}>
            {/* Kotak Sumbu X (Merah) */}
            <View style={[styles.axisBox, styles.axisBoxX]}>
              <View style={styles.axisHeader}>
                <Text style={[styles.axisLabel, { color: '#DC2626' }]}>Sumbu X</Text>
                <View style={[styles.axisDot, { backgroundColor: '#DC2626' }]} />
              </View>
              <Text style={[styles.axisValueText, { color: '#B91C1C' }]}>
                {sensorData.x.toFixed(2)}
              </Text>
              <Text style={styles.axisUnit}>m/s²</Text>
              <View style={styles.miniBarBg}>
                <View
                  style={[
                    styles.miniBarFill,
                    {
                      width: getProgressPercent(sensorData.x),
                      backgroundColor: '#EF4444',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Kotak Sumbu Y (Hijau) */}
            <View style={[styles.axisBox, styles.axisBoxY]}>
              <View style={styles.axisHeader}>
                <Text style={[styles.axisLabel, { color: '#059669' }]}>Sumbu Y</Text>
                <View style={[styles.axisDot, { backgroundColor: '#059669' }]} />
              </View>
              <Text style={[styles.axisValueText, { color: '#047857' }]}>
                {sensorData.y.toFixed(2)}
              </Text>
              <Text style={styles.axisUnit}>m/s²</Text>
              <View style={styles.miniBarBg}>
                <View
                  style={[
                    styles.miniBarFill,
                    {
                      width: getProgressPercent(sensorData.y),
                      backgroundColor: '#10B981',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Kotak Sumbu Z (Biru) */}
            <View style={[styles.axisBox, styles.axisBoxZ]}>
              <View style={styles.axisHeader}>
                <Text style={[styles.axisLabel, { color: '#0284C7' }]}>Sumbu Z</Text>
                <View style={[styles.axisDot, { backgroundColor: '#0284C7' }]} />
              </View>
              <Text style={[styles.axisValueText, { color: '#0369A1' }]}>
                {sensorData.z.toFixed(2)}
              </Text>
              <Text style={styles.axisUnit}>m/s²</Text>
              <View style={styles.miniBarBg}>
                <View
                  style={[
                    styles.miniBarFill,
                    {
                      width: getProgressPercent(sensorData.z),
                      backgroundColor: '#0284C7',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 3. INDIKATOR STATUS BAWAH (Status Pill / Badge) */}
        <View style={styles.statusPillContainer}>
          {isShaking ? (
            // Saat digerakkan (isShaking = true)
            <View style={[styles.statusPill, styles.statusPillActive]}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.statusPillTextActive}>Getaran aktif!</Text>
            </View>
          ) : (
            // Saat normal (!isShaking)
            <View style={[styles.statusPill, styles.statusPillNormal]}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.statusPillTextNormal}>Siap mendeteksi...</Text>
            </View>
          )}
        </View>

        {/* Tombol Uji Coba Simulasi Goyang (Sangat membantu dosen/evaluator di emulator PC) */}
        <TouchableOpacity
          onPress={triggerSimulatedShake}
          activeOpacity={0.8}
          style={styles.simulateShakeBtn}>
          <MaterialCommunityIcons name="vibrate" size={20} color="#FFF" />
          <Text style={styles.simulateShakeBtnText}>
            Uji Coba: Simulasi Goyang Perangkat
          </Text>
        </TouchableOpacity>

        {/* Visualisasi Grafik & Indikator Lanjutan (Integrasi Task 02) */}
        <View style={styles.task02Section}>
          <TouchableOpacity
            style={styles.task02ToggleHeader}
            activeOpacity={0.7}
            onPress={() => setShowAdvancedDisplay((prev) => !prev)}>
            <View style={styles.task02ToggleLeft}>
              <Ionicons name="analytics" size={18} color={Colors.primary} />
              <Text style={styles.task02Title}>Grafik & Visualisasi Sensor (Task 02)</Text>
            </View>
            <Feather
              name={showAdvancedDisplay ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {showAdvancedDisplay && (
            <View style={styles.task02Content}>
              <AccelerometerDisplay sensorData={sensorData} history={history} />
            </View>
          )}
        </View>

        {/* Ringkasan Teknis Modul Task 03 */}
        <View style={styles.techDetailsCard}>
          <View style={styles.techDetailsHeader}>
            <Feather name="info" size={16} color={Colors.primary} />
            <Text style={styles.techDetailsTitle}>Parameter Deteksi Task 03</Text>
          </View>
          <View style={styles.techDetailsList}>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>Rumus Magnitude:</Text>
              <Text style={styles.techValue}>√(x² + y² + z²)</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>Ambang Batas (Threshold):</Text>
              <Text style={styles.techValue}>{threshold} m/s²</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>Durasi Getaran:</Text>
              <Text style={styles.techValue}>Vibration.vibrate(500) [500ms]</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>Anti-Spam Alert Guard:</Text>
              <Text style={styles.techValue}>isShakingRef & lastShakeTimeRef</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 14,
  },
  taskBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  taskBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  connectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  connectionPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  connectionPillInactive: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  connectionDotActive: {
    backgroundColor: '#10B981',
  },
  connectionDotInactive: {
    backgroundColor: '#94A3B8',
  },
  connectionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  connectionTextActive: {
    color: '#059669',
  },
  connectionTextInactive: {
    color: '#64748B',
  },

  // 1. Header Normal & Shake Banner
  normalHeaderCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sensorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Banner Saat Guncangan Terdeteksi
  shakeAlertBanner: {
    backgroundColor: '#FFE4E6',
    borderWidth: 1.5,
    borderColor: '#FDA4AF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 18,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  shakeAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  shakeIconBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shakeWaveIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FECDD3',
    borderRadius: 10,
    padding: 2,
  },
  shakeAlertTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: -0.3,
  },
  shakeAlertDesc: {
    fontSize: 12,
    color: '#BE123C',
    marginTop: 2,
    fontWeight: '500',
  },

  // 2. Tampilan Kartu 3 Kotak Nilai Sumbu
  coordinatesSection: {
    marginBottom: 18,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  magnitudeBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  axisGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  axisBox: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  axisBoxX: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  axisBoxY: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  axisBoxZ: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  axisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  axisLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  axisDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  axisValueText: {
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  axisUnit: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
    marginBottom: 8,
  },
  miniBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // 3. Status Pill Bawah
  statusPillContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillNormal: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusPillActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#6EE7B7',
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusPillTextNormal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  statusPillTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
  },

  // Tombol Simulasi Shake
  simulateShakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.ocean,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 18,
    shadowColor: Colors.ocean,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  simulateShakeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Kartu Loading & Warning
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
  },
  warningDesc: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
    marginBottom: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emulatorHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  emulatorHintText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.text,
  },

  // Ringkasan Teknis
  techDetailsCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  techDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  techDetailsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  techDetailsList: {
    gap: 6,
  },
  techItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  techLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  techValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  task02Section: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  task02ToggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surfaceSubtle,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  task02ToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  task02Title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  task02Content: {
    paddingVertical: 8,
  },
});
