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

      <View style={[pageStyles.card, { marginTop: 8 }]}>
        <Text style={pageStyles.cardTitle}>Tugas Praktik Week 8/9</Text>
        <Text>Aplikasi Todo List Asynchronous (GET, POST, PATCH, DELETE API).</Text>
      </View>

      <PageButton
        title="Buka Todo List Async (Week 8/9)"
        onPress={() => {
          router.dismissAll();
          setTimeout(() => {
            router.navigate('/(tabs)/todos' as any);
          }, 100);
        }}
      />

      {/* Navigasi router.back */}
      <PageButton
        title="Back"
        onPress={() => router.back()}
      />
    </View>
  );
}
