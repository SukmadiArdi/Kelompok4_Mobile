import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export interface SensorData {
  x: number;
  y: number;
  z: number;
}

export interface AccelerometerDisplayProps {
  /**
   * Data sensor dari Task 01 (opsional).
   * Jika tidak disediakan, komponen ini akan mengaktifkan listener internal (standalone).
   */
  sensorData?: SensorData;
  /**
   * Riwayat data untuk visualisasi grafik (opsional).
   */
  history?: SensorData[];
}

export const AccelerometerDisplay: React.FC<AccelerometerDisplayProps> = ({
  sensorData: propSensorData,
  history: propHistory,
}) => {
  // =========================================================================
  // --- TASK 01: SENSOR LISTENER (FONDASI & STANDALONE FALLBACK) ---
  // =========================================================================
  const [internalSensorData, setInternalSensorData] = useState<SensorData>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [internalHistory, setInternalHistory] = useState<SensorData[]>([]);

  useEffect(() => {
    // Jika sensorData sudah dipassing via props (misal dari page Task 01),
    // jangan buat listener ganda.
    if (propSensorData !== undefined) return;

    // Atur interval pembaruan ke 100ms
    Accelerometer.setUpdateInterval(100);

    // Pasang listener sensor Accelerometer
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      setInternalSensorData({ x, y, z });

      // Format cetak console log sesuai standar modul:
      console.log(
        `Accelerometer: x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}`
      );

      // Simpan maksimal 15 riwayat data terakhir untuk visualisasi grafik
      setInternalHistory((prev) => {
        const next = [...prev, { x, y, z }];
        return next.length > 15 ? next.slice(-15) : next;
      });
    });

    // Cleanup listener saat unmount
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, [propSensorData]);

  // =========================================================================
  // --- TASK 02: UI DISPLAY SENSOR DATA ---
  // =========================================================================
  // Defensive Rendering: Fallback aman ke 0 jika data bernilai undefined/null
  const activeData: SensorData = propSensorData ?? internalSensorData;
  const xVal = activeData?.x ?? 0;
  const yVal = activeData?.y ?? 0;
  const zVal = activeData?.z ?? 0;

  // Riwayat data aktif (maksimal 15 item)
  const activeHistory: SensorData[] = propHistory ?? internalHistory;

  // Hitung total percepatan (magnitude vector: √(x² + y² + z²))
  const magnitude = Math.sqrt(xVal * xVal + yVal * yVal + zVal * zVal);

  return (
    <View style={styles.container}>
      {/* 1. HEADER SECTION */}
      <View style={styles.headerSection}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.title}>Accelerometer</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE (100ms)</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Data sensor secara real-time</Text>
      </View>

      {/* 2. 3 KARTU INDIKATOR SUMBU (ROW LAYOUT) */}
      <View style={styles.rowLayout}>
        {/* Kotak X (Merah) */}
        <View style={[styles.axisCard, styles.cardX]}>
          <Text style={[styles.axisLabel, styles.labelX]}>X</Text>
          <Text style={[styles.axisValue, styles.valueX]}>
            {xVal.toFixed(2)}
          </Text>
          <Text style={[styles.axisUnit, styles.unitX]}>m/s²</Text>
        </View>

        {/* Kotak Y (Hijau) */}
        <View style={[styles.axisCard, styles.cardY]}>
          <Text style={[styles.axisLabel, styles.labelY]}>Y</Text>
          <Text style={[styles.axisValue, styles.valueY]}>
            {yVal.toFixed(2)}
          </Text>
          <Text style={[styles.axisUnit, styles.unitY]}>m/s²</Text>
        </View>

        {/* Kotak Z (Biru) */}
        <View style={[styles.axisCard, styles.cardZ]}>
          <Text style={[styles.axisLabel, styles.labelZ]}>Z</Text>
          <Text style={[styles.axisValue, styles.valueZ]}>
            {zVal.toFixed(2)}
          </Text>
          <Text style={[styles.axisUnit, styles.unitZ]}>m/s²</Text>
        </View>
      </View>

      {/* 3. BAGIAN DETAIL NILAI JELAS (SESUAI CONTOH KODE MODUL) */}
      <View style={styles.detailCard}>
        <View style={styles.detailHeaderRow}>
          <Text style={styles.detailSectionTitle}>Detail Pembacaan Sensor</Text>
          <Text style={styles.detailRateText}>Interval: 100ms</Text>
        </View>

        {/* Total Percepatan (Magnitude) dengan aksen warna #0F62FE */}
        <View style={styles.magnitudeBox}>
          <View>
            <Text style={styles.magnitudeLabel}>Total Percepatan (|a|)</Text>
            <Text style={styles.magnitudeFormula}>√(x² + y² + z²)</Text>
          </View>
          <View style={styles.magnitudeValueContainer}>
            <Text style={styles.magnitudeValue}>{magnitude.toFixed(2)}</Text>
            <Text style={styles.magnitudeUnit}>g-force</Text>
          </View>
        </View>

        {/* Indikator Level Keseimbangan Real-Time Sumbu X, Y, Z */}
        <View style={styles.levelBarsContainer}>
          {/* Level Sumbu X */}
          <View style={styles.levelRow}>
            <Text style={[styles.levelLabel, styles.labelX]}>X</Text>
            <View style={styles.levelTrack}>
              <View
                style={[
                  styles.levelFill,
                  styles.fillX,
                  {
                    width: `${Math.min(Math.abs(xVal) * 50, 100)}%`,
                    alignSelf: xVal >= 0 ? 'flex-start' : 'flex-end',
                  },
                ]}
              />
            </View>
            <Text style={styles.levelValueText}>{xVal.toFixed(2)}</Text>
          </View>

          {/* Level Sumbu Y */}
          <View style={styles.levelRow}>
            <Text style={[styles.levelLabel, styles.labelY]}>Y</Text>
            <View style={styles.levelTrack}>
              <View
                style={[
                  styles.levelFill,
                  styles.fillY,
                  {
                    width: `${Math.min(Math.abs(yVal) * 50, 100)}%`,
                    alignSelf: yVal >= 0 ? 'flex-start' : 'flex-end',
                  },
                ]}
              />
            </View>
            <Text style={styles.levelValueText}>{yVal.toFixed(2)}</Text>
          </View>

          {/* Level Sumbu Z */}
          <View style={styles.levelRow}>
            <Text style={[styles.levelLabel, styles.labelZ]}>Z</Text>
            <View style={styles.levelTrack}>
              <View
                style={[
                  styles.levelFill,
                  styles.fillZ,
                  {
                    width: `${Math.min(Math.abs(zVal) * 50, 100)}%`,
                    alignSelf: zVal >= 0 ? 'flex-start' : 'flex-end',
                  },
                ]}
              />
            </View>
            <Text style={styles.levelValueText}>{zVal.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* 4. VISUALISASI GRAFIK PERUBAHAN NILAI (NILAI TAMBAH UI) */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeaderRow}>
          <Text style={styles.chartTitle}>Grafik Perubahan Nilai</Text>
          <Text style={styles.chartHistoryCount}>
            {activeHistory.length > 0 ? `${activeHistory.length} data terakhir` : 'Menunggu data...'}
          </Text>
        </View>

        {/* Legenda Warna: X (Merah), Y (Hijau), Z (Biru) */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.fillX]} />
            <Text style={styles.legendText}>X (Merah)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.fillY]} />
            <Text style={styles.legendText}>Y (Hijau)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.fillZ]} />
            <Text style={styles.legendText}>Z (Biru)</Text>
          </View>
        </View>

        {/* Visualisasi Bar Real-Time tanpa library chart eksternal */}
        <View style={styles.chartContainer}>
          <View style={styles.chartBarsRow}>
            {activeHistory.length === 0 ? (
              <View style={styles.emptyChartBox}>
                <Text style={styles.emptyChartText}>
                  Gerakkan perangkat untuk melihat grafik respons sensor
                </Text>
              </View>
            ) : (
              activeHistory.map((item, idx) => {
                // Skala tinggi bar (rentang nilai |g| dari 0 sampai ~2g)
                const heightX = Math.min(Math.max(Math.abs(item.x ?? 0) * 35, 4), 60);
                const heightY = Math.min(Math.max(Math.abs(item.y ?? 0) * 35, 4), 60);
                const heightZ = Math.min(Math.max(Math.abs(item.z ?? 0) * 35, 4), 60);

                return (
                  <View key={`hist-${idx}`} style={styles.barGroup}>
                    <View style={styles.barPillar}>
                      <View
                        style={[
                          styles.miniBar,
                          styles.fillX,
                          { height: heightX },
                        ]}
                      />
                    </View>
                    <View style={styles.barPillar}>
                      <View
                        style={[
                          styles.miniBar,
                          styles.fillY,
                          { height: heightY },
                        ]}
                      />
                    </View>
                    <View style={styles.barPillar}>
                      <View
                        style={[
                          styles.miniBar,
                          styles.fillZ,
                          { height: heightZ },
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Garis Dasar Baseline Grafik */}
          <View style={styles.chartBaseline} />
          <View style={styles.chartFooterRow}>
            <Text style={styles.chartAxisLabel}>Terdahulu</Text>
            <Text style={styles.chartAxisLabel}>Terkini</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// =========================================================================
// STYLING TASK 02 — CLEAN, MODERN & DEFENSIVE LAYOUT
// =========================================================================
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 20,
  },

  // 1. Header Section
  headerSection: {
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '400',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },

  // 2. 3 Kartu Indikator Sumbu (Row Layout)
  rowLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  axisCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  axisLabel: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  axisValue: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 2,
  },
  axisUnit: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Skema Warna Indikator Sumbu
  // Kotak X (Merah)
  cardX: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  labelX: {
    color: '#EF4444',
  },
  valueX: {
    color: '#EF4444',
  },
  unitX: {
    color: '#EF4444',
  },
  fillX: {
    backgroundColor: '#EF4444',
  },

  // Kotak Y (Hijau)
  cardY: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  labelY: {
    color: '#10B981',
  },
  valueY: {
    color: '#10B981',
  },
  unitY: {
    color: '#10B981',
  },
  fillY: {
    backgroundColor: '#10B981',
  },

  // Kotak Z (Biru)
  cardZ: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  labelZ: {
    color: '#3B82F6',
  },
  valueZ: {
    color: '#3B82F6',
  },
  unitZ: {
    color: '#3B82F6',
  },
  fillZ: {
    backgroundColor: '#3B82F6',
  },

  // 3. Detail Pembacaan Sensor
  detailCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  detailRateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  magnitudeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0F62FE',
    marginBottom: 16,
  },
  magnitudeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  magnitudeFormula: {
    fontSize: 11,
    color: '#60A5FA',
    marginTop: 2,
  },
  magnitudeValueContainer: {
    alignItems: 'flex-end',
  },
  magnitudeValue: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0F62FE', // Warna aksen sesuai panduan modul
  },
  magnitudeUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
  },

  // Level Bars (Indikator Keseimbangan Sumbu)
  levelBarsContainer: {
    gap: 8,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelLabel: {
    width: 18,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  levelTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  levelFill: {
    height: '100%',
    borderRadius: 4,
  },
  levelValueText: {
    width: 44,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'right',
  },

  // 4. Visualisasi Grafik Perubahan Nilai
  chartCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  chartHistoryCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  // Legenda Warna
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 14,
    marginBottom: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },

  // Area Bar Chart Real-Time
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
    paddingBottom: 4,
  },
  emptyChartBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
  },
  emptyChartText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  barGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    flex: 1,
    justifyContent: 'center',
  },
  barPillar: {
    width: 4,
    height: 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  miniBar: {
    width: 4,
    borderRadius: 2,
  },
  chartBaseline: {
    height: 2,
    backgroundColor: '#CBD5E1',
    marginTop: 4,
    marginBottom: 6,
    borderRadius: 1,
  },
  chartFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartAxisLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

export default AccelerometerDisplay;
