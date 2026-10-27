import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { AccelerometerDisplay } from '@/components/AccelerometerDisplay';

/**
 * SensorScreen (app/sensor.tsx)
 * 
 * Modul Praktikum: Sensor Accelerometer
 * - Task 01: Setup & Basic Listener Accelerometer
 * - Task 02: Display Sensor Data Real-Time UI
 */
export default function SensorScreen() {
  // =========================================================================
  // --- TASK 01: SENSOR LISTENER ---
  // =========================================================================
  const [sensorData, setSensorData] = useState({ x: 0, y: 0, z: 0 });
  const [history, setHistory] = useState<{ x: number; y: number; z: number }[]>([]);

  useEffect(() => {
    // 1. Atur interval pembaruan ke 100 milidetik (100ms)
    Accelerometer.setUpdateInterval(100);

    // 2. Pasang listener Accelerometer
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      // Simpan data terbaru ke state sensorData
      setSensorData({ x, y, z });

      // Cetak log ke console sesuai spesifikasi modul
      console.log(
        `Accelerometer: x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}`
      );

      // Simpan riwayat data (maksimal 15 data terakhir untuk visualisasi grafik Task 02)
      setHistory((prev) => {
        const next = [...prev, { x, y, z }];
        return next.length > 15 ? next.slice(-15) : next;
      });
    });

    // 3. Cleanup listener saat komponen unmount
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  // =========================================================================
  // --- TASK 02: UI DISPLAY SENSOR DATA ---
  // =========================================================================
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navigation Bar / Tombol Kembali */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/' as any);
            }
          }}
          activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>

      {/* Konten Display Real-Time Sensor Data */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <AccelerometerDisplay
          sensorData={sensorData}
          history={history}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
});
