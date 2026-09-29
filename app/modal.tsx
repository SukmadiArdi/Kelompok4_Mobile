import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/src/constants/Theme';

export default function ModalScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.logoBox}>
        <Ionicons name="compass" size={36} color={Colors.primary} />
      </View>

      <Text style={styles.title}>
        Lokal<Text style={{ color: Colors.primary }}>Trip</Text>
      </Text>
      <Text style={styles.version}>Versi 1.0.0 (Pratinjau UI)</Text>

      <Text style={styles.description}>
        Platform penjelajahan budaya dan wisata lokal nusantara yang menghubungkan
        wisatawan langsung dengan pemandu desa, destinasi alam tersembunyi, dan
        maestro pengrajin tangan Indonesia.
      </Text>

      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <Ionicons name="calendar" size={20} color={Colors.primary} />
          <View style={styles.featureTextCol}>
            <Text style={styles.featureTitle}>1. Booking Experience</Text>
            <Text style={styles.featureDesc}>
              Tur budaya & kelas kerajinan bersama pemandu lokal berlisensi.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="map" size={20} color={Colors.secondary} />
          <View style={styles.featureTextCol}>
            <Text style={styles.featureTitle}>2. Hidden Gems Map</Text>
            <Text style={styles.featureDesc}>
              Peta interaktif kepulauan dengan rekomendasi & ulasan penjelajah.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="shopping" size={20} color={Colors.accent} />
          <View style={styles.featureTextCol}>
            <Text style={styles.featureTitle}>3. Artisan Store</Text>
            <Text style={styles.featureDesc}>
              Marketplace kerajinan adiluhung otentik langsung dari desa pengrajin.
            </Text>
          </View>
        </View>
      </View>

      <Pressable onPress={() => router.back()} style={styles.closeBtn}>
        <Text style={styles.closeBtnText}>Tutup</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  version: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  featureList: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  closeBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
