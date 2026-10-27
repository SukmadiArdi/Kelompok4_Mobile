// Halaman utama dokumentasi materi modul 2
import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import PageButton from '@/components/pageButton';
import { pageStyles } from '@/styles';

export default function DocsPage() {
  // Inisialisasi router navigasi
  const router = useRouter();

  return (
    <View style={pageStyles.container}>
      <Text style={pageStyles.title}>Documentation</Text>
      <Text style={pageStyles.description}>Pilih materi yang ingin dipelajari.</Text>

      <View style={pageStyles.card}>
        <Text style={pageStyles.cardTitle}>Expo</Text>
        <Text>Framework untuk React Native.</Text>
      </View>

      {/* Navigasi router.push ke materi */}
      <PageButton
        title="Learn Expo"
        onPress={() => router.push('/docs/expo' as any)}
      />
      <PageButton
        title="Learn Expo Router"
        onPress={() => router.push('/docs/expo/router' as any)}
      />
      <PageButton
        title="Learn Dynamic Route"
        onPress={() => router.push('/docs/expo/router/dynamic-route' as any)}
      />
      <PageButton
        title="Learn Catch-All Route"
        onPress={() => router.push('/docs/expo/router/catch-all' as any)}
      />
      <PageButton
        title="Sensor Accelerometer (Task 02)"
        onPress={() => router.push('/sensor' as any)}
      />
      {/* Navigasi router.back */}
      <PageButton
        title="Back"
        onPress={() => router.back()}
      />
    </View>
  );
}
