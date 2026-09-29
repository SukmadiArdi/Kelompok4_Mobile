import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Theme';
import { useApp } from '@/src/context/AppContext';
import { Header } from '@/src/components/common/Header';
import { SearchBar } from '@/src/components/common/SearchBar';
import { CategoryPills } from '@/src/components/common/CategoryPills';
import { ExperienceCard } from '@/src/components/experiences/ExperienceCard';
import { BookingModal } from '@/src/components/experiences/BookingModal';
import { Experience } from '@/src/types';

export default function ExperiencesScreen() {
  const { experiences } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [bookingExperience, setBookingExperience] = useState<Experience | null>(null);

  const categories = [
    'Semua',
    'Workshop Seni',
    'Wisata Adat',
    'Kuliner Tradisi',
    'Alam & Petualangan',
  ];

  const filtered = experiences.filter((exp) => {
    const matchesCategory =
      selectedCategory === 'Semua' || exp.category === selectedCategory;
    const matchesSearch =
      exp.title.toLowerCase().includes(search.toLowerCase()) ||
      exp.location.toLowerCase().includes(search.toLowerCase()) ||
      exp.guide.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Title Header */}
        <View style={styles.titleSection}>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={12} color={Colors.primary} />
            <Text style={styles.badgeText}>Fitur 1: Pemandu Lokal Terverifikasi</Text>
          </View>
          <Text style={styles.pageTitle}>Booking Experience</Text>
          <Text style={styles.pageSubtitle}>
            Ikuti lokakarya seni adiluhung dan tur tradisi langsung bersama pemandu
            lokal berlisensi.
          </Text>
        </View>

        {/* Search */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari workshop, kota, atau nama pemandu..."
        />

        {/* Category Pills */}
        <CategoryPills
          categories={categories}
          activeCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Results Counter */}
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsCount}>
            Menampilkan <Text style={styles.boldText}>{filtered.length}</Text> Pengalaman Budaya
          </Text>
        </View>

        {/* Experiences List */}
        {filtered.length > 0 ? (
          filtered.map((exp) => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              onBookPress={(item) => setBookingExperience(item)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Tidak ada pengalaman ditemukan</Text>
            <Text style={styles.emptySubtitle}>
              Coba gunakan kata kunci pencarian lain atau ganti kategori.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Booking Sheet Modal */}
      <BookingModal
        visible={!!bookingExperience}
        experience={bookingExperience}
        onClose={() => setBookingExperience(null)}
        onSuccess={() => setBookingExperience(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  resultsInfo: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
