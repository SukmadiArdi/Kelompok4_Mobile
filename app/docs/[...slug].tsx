// Halaman detail dokumentasi dengan pola Catch-All Route
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PageButton from '@/components/pageButton';
import { pageStyles } from '@/styles';

// Data konten dokumentasi
const pages: Record<
  string,
  {
    title: string;
    description: string;
    content: string;
  }
> = {
  expo: {
    title: 'Expo',
    description: 'Framework untuk membuat aplikasi React Native.',
    content: 'Expo menyediakan tools untuk mempermudah pengembangan aplikasi React Native.',
  },
  'expo/router': {
    title: 'Expo Router',
    description: 'Sistem routing berbasis file.',
    content: 'Expo Router menggunakan struktur file dan folder sebagai sistem navigasi aplikasi.',
  },
  'expo/router/dynamic-route': {
    title: 'Dynamic Route',
    description: 'Route dengan parameter dinamis.',
    content: 'Dynamic route menggunakan [id] atau [slug] untuk menangkap parameter URL.',
  },
  'expo/router/catch-all': {
    title: 'Catch-All Route',
    description: 'Route yang menangkap banyak segment.',
    content: 'Catch-all route menggunakan [...slug] untuk menangkap beberapa segment URL sekaligus.',
  },
};

export default function DocsDetailPage() {
  // Inisialisasi router
  const router = useRouter();
  // Ambil parameter catch-all slug
  const { slug } = useLocalSearchParams();

  // Gabungkan array slug menjadi path string
  const path = Array.isArray(slug) ? slug.join('/') : slug;
  const page = pages[path || ''];

  if (!page) {
    return (
      <View style={pageStyles.container}>
        <Text style={pageStyles.title}>Page Not Found</Text>
        <Text style={{ color: 'red', fontSize: 16, marginBottom: 20 }}>
          Dokumentasi tidak ditemukan.
        </Text>
        {/* Navigasi kembali */}
        <PageButton title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={pageStyles.container}>
      <Text style={pageStyles.title}>{page.title}</Text>
      <Text style={pageStyles.description}>{page.description}</Text>

      <View style={pageStyles.card}>
        <Text style={pageStyles.cardTitle}>Description</Text>
        <Text>{page.content}</Text>
      </View>

      <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 5 }}>
        Current URL
      </Text>
      <Text style={{ color: '#666666', marginBottom: 20 }}>
        /docs/{path}
      </Text>

      {/* Navigasi kembali */}
      <PageButton title="Back" onPress={() => router.back()} />
    </ScrollView>
  );
}
