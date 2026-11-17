import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Theme';
import { NusantaraDestinationPoint } from '@/src/types';
import { useDestinationWeather } from '@/src/hooks/useDestinationWeather';

interface DestinationWeatherCardProps {
  /** Daftar destinasi yang bisa dipilih (opsional, misalnya di halaman Beranda) */
  destinations?: NusantaraDestinationPoint[];
  /** Koordinat default jika tidak menggunakan daftar pilihan */
  latitude?: number;
  longitude?: number;
  destinationName?: string;
  /** Style wrapper tambahan */
  compact?: boolean;
}

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

function formatForecastDay(dateStr: string, index: number): string {
  if (index === 0) return 'Hari Ini';
  if (index === 1) return 'Besok';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const monthIdx = Number(parts[1]) - 1;
  const dayNum = Number(parts[2]);
  const monthName = SHORT_MONTHS[monthIdx] || parts[1];
  return `${dayNum} ${monthName}`;
}

export const DestinationWeatherCard: React.FC<DestinationWeatherCardProps> = ({
  destinations,
  latitude = -7.7956,
  longitude = 110.3695,
  destinationName = 'Yogyakarta',
  compact = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeDest =
    destinations && destinations.length > 0
      ? destinations[selectedIndex] || destinations[0]
      : null;

  const activeLat = activeDest ? activeDest.lat : latitude;
  const activeLng = activeDest ? activeDest.lng : longitude;
  const activeName = activeDest ? activeDest.name : destinationName;

  const { weather, loading, error, refresh } = useDestinationWeather(
    activeLat,
    activeLng,
    activeName
  );

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <View style={styles.apiBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.apiBadgeText}>EXTERNAL API • OPEN-METEO</Text>
          </View>
          <Text style={styles.cardTitle}>Cuaca Destinasi {activeName}</Text>
        </View>

        <Pressable
          onPress={refresh}
          disabled={loading}
          hitSlop={8}
          style={({ pressed }) => [
            styles.refreshBtn,
            pressed && styles.pressed,
          ]}>
          <Ionicons
            name="refresh"
            size={16}
            color={loading ? Colors.textMuted : Colors.ocean}
          />
        </Pressable>
      </View>

      {/* Optional Nusantara Destination Selector */}
      {destinations && destinations.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}>
          {destinations.map((dest, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <Pressable
                key={dest.id}
                onPress={() => setSelectedIndex(idx)}
                style={[
                  styles.destPill,
                  isSelected && styles.destPillActive,
                ]}>
                <Text
                  style={[
                    styles.destPillText,
                    isSelected && styles.destPillTextActive,
                  ]}>
                  {dest.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Body States */}
      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="small" color={Colors.ocean} />
          <Text style={styles.stateText}>
            Mengambil data cuaca langsung untuk {activeName}...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Ionicons name="cloud-offline-outline" size={24} color={Colors.danger} />
          <Text style={styles.errorTitle}>Gagal Memuat Cuaca</Text>
          <Text style={styles.errorDesc}>{error}</Text>
          <Pressable
            onPress={refresh}
            style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}>
            <Ionicons name="refresh" size={14} color={Colors.surface} />
            <Text style={styles.retryBtnText}>Coba Lagi</Text>
          </Pressable>
        </View>
      ) : weather ? (
        <>
          {/* Current Weather Main Row */}
          <View style={styles.mainWeatherRow}>
            <View style={styles.tempGroup}>
              <View style={styles.weatherIconCircle}>
                <Ionicons
                  name={weather.weatherIcon as keyof typeof Ionicons.glyphMap}
                  size={28}
                  color={Colors.accent}
                />
              </View>
              <View>
                <Text style={styles.tempValue}>
                  {weather.temperatureC.toFixed(1)}°C
                </Text>
                <Text style={styles.weatherLabel}>{weather.weatherLabel}</Text>
              </View>
            </View>

            <View style={styles.metricsCol}>
              <View style={styles.metricItem}>
                <Ionicons name="water-outline" size={14} color={Colors.ocean} />
                <Text style={styles.metricText}>
                  Lembap {weather.humidityPercent}%
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Ionicons name="speedometer-outline" size={14} color={Colors.primary} />
                <Text style={styles.metricText}>
                  Angin {weather.windSpeedKmh} km/j
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.metricText}>
                  {weather.elevationM} mdpl ({weather.timezone})
                </Text>
              </View>
            </View>
          </View>

          {/* Travel Advice */}
          <View style={styles.adviceBox}>
            <Ionicons name="compass-outline" size={16} color={Colors.ocean} />
            <Text style={styles.adviceText}>{weather.travelAdvice}</Text>
          </View>

          {/* 3-Day Forecast Row */}
          {weather.dailyForecasts.length > 0 && (
            <View style={styles.forecastRow}>
              {weather.dailyForecasts.map((day, idx) => (
                <View key={day.date} style={styles.forecastItem}>
                  <Text style={styles.forecastDay}>
                    {formatForecastDay(day.date, idx)}
                  </Text>
                  <Text style={styles.forecastTemp}>
                    {Math.round(day.tempMinC)}° – {Math.round(day.tempMaxC)}°C
                  </Text>
                  <View style={styles.rainRow}>
                    <Ionicons name="rainy-outline" size={11} color={Colors.ocean} />
                    <Text style={styles.rainText}>{day.rainChancePercent}%</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 18,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardCompact: {
    marginHorizontal: 0,
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleBlock: {
    flex: 1,
  },
  apiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.success,
  },
  apiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.ocean,
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.oceanLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  pillsRow: {
    gap: 8,
    paddingBottom: 12,
  },
  destPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  destPillActive: {
    backgroundColor: Colors.oceanLight,
    borderColor: Colors.ocean,
  },
  destPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  destPillTextActive: {
    color: Colors.ocean,
    fontWeight: '700',
  },
  stateBox: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorBox: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: Colors.dangerLight,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.danger,
  },
  errorDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.surface,
  },
  mainWeatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  tempGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  weatherLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  metricsCol: {
    gap: 4,
    alignItems: 'flex-end',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  adviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.oceanLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  adviceText: {
    flex: 1,
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 16,
    fontWeight: '500',
  },
  forecastRow: {
    flexDirection: 'row',
    gap: 8,
  },
  forecastItem: {
    flex: 1,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  forecastDay: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  forecastTemp: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  rainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rainText: {
    fontSize: 10,
    color: Colors.ocean,
    fontWeight: '600',
  },
});

