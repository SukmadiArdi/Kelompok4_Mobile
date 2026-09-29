import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/src/constants/Theme';
import { useApp } from '@/src/context/AppContext';
import { Header } from '@/src/components/common/Header';
import { SearchBar } from '@/src/components/common/SearchBar';
import { ExperienceCard } from '@/src/components/experiences/ExperienceCard';
import { GemCard } from '@/src/components/map/GemCard';
import { ProductCard } from '@/src/components/store/ProductCard';
import { BookingModal } from '@/src/components/experiences/BookingModal';
import { Experience } from '@/src/types';

export default function HomeScreen() {
  const { experiences, gems, products } = useApp();
  const [search, setSearch] = useState('');
  const [selectedExpForBooking, setSelectedExpForBooking] = useState<Experience | null>(null);

  // Filter based on search query
  const filteredExperiences = experiences.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGems = gems.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.location.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.artisan.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        {/* Search Bar */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari kelas batik, air terjun rahasia, tenun..."
        />

        {/* Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextContent}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={12} color={Colors.accent} />
              <Text style={styles.heroBadgeText}>Otentik & Berkelanjutan</Text>
            </View>
            <Text style={styles.heroTitle}>
              Jelajahi Jiwa{' '}
              <Text style={{ color: Colors.accent }}>Nusantara</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Tur budaya dengan pemandu lokal, temukan permata tersembunyi, dan
              dukung langsung pengrajin tradisi.
            </Text>
          </View>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&auto=format&fit=crop&q=80',
            }}
            style={styles.heroImage}
          />
        </View>

        {/* 3 Main Features Access Hub */}
        <View style={styles.featuresHub}>
          <Text style={styles.hubTitle}>3 Fitur Utama LokalTrip</Text>

          <View style={styles.featureCardsRow}>
            {/* Feature 1: Booking Experience */}
            <Pressable
              onPress={() => router.push('/experiences')}
              style={({ pressed }) => [
                styles.featureCard,
                { backgroundColor: '#FFF5F2', borderColor: '#FCD8CF' },
                pressed && styles.cardPressed,
              ]}>
              <View style={[styles.featureIconBox, { backgroundColor: Colors.primary }]}>
                <Ionicons name="calendar" size={20} color="#FFF" />
              </View>
              <Text style={styles.featureCardTitle}>Booking Experience</Text>
              <Text style={styles.featureCardDesc}>
                Wisata budaya & workshop dengan pemandu lokal
              </Text>
              <View style={styles.featureBadgeRow}>
                <Text style={[styles.featureLink, { color: Colors.primary }]}>
                  Pesan Tur
                </Text>
                <Feather name="arrow-right" size={12} color={Colors.primary} />
              </View>
            </Pressable>

            {/* Feature 2: Hidden Gems Map */}
            <Pressable
              onPress={() => router.push('/map')}
              style={({ pressed }) => [
                styles.featureCard,
                { backgroundColor: '#F0F9F4', borderColor: '#CDEBD7' },
                pressed && styles.cardPressed,
              ]}>
              <View style={[styles.featureIconBox, { backgroundColor: Colors.secondary }]}>
                <Ionicons name="map" size={20} color="#FFF" />
              </View>
              <Text style={styles.featureCardTitle}>Hidden Gems Map</Text>
              <Text style={styles.featureCardDesc}>
                Peta lokasi rahasia, tips, dan foto penjelajah
              </Text>
              <View style={styles.featureBadgeRow}>
                <Text style={[styles.featureLink, { color: Colors.secondary }]}>
                  Buka Peta
                </Text>
                <Feather name="arrow-right" size={12} color={Colors.secondary} />
              </View>
            </Pressable>

            {/* Feature 3: Artisan Store */}
            <Pressable
              onPress={() => router.push('/store')}
              style={({ pressed }) => [
                styles.featureCard,
                { backgroundColor: '#FEF9EE', borderColor: '#FCE7BD' },
                pressed && styles.cardPressed,
              ]}>
              <View style={[styles.featureIconBox, { backgroundColor: Colors.accent }]}>
                <Feather name="shopping-bag" size={20} color="#FFF" />
              </View>
              <Text style={styles.featureCardTitle}>Artisan Store</Text>
              <Text style={styles.featureCardDesc}>
                Marketplace kerajinan & cerita maestro pengrajin
              </Text>
              <View style={styles.featureBadgeRow}>
                <Text style={[styles.featureLink, { color: '#B45309' }]}>
                  Belanja Karya
                </Text>
                <Feather name="arrow-right" size={12} color="#B45309" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Section 1: Booking Experience Highlights */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Wisata Budaya & Workshop</Text>
              <Text style={styles.sectionSubtitle}>
                Pengalaman otentik didampingi pemandu berlisensi
              </Text>
            </View>
            <Pressable onPress={() => router.push('/experiences')}>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}>
            {filteredExperiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                horizontal={true}
                onBookPress={(item) => setSelectedExpForBooking(item)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Section 2: Hidden Gems Highlights */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Permata Tersembunyi</Text>
              <Text style={styles.sectionSubtitle}>
                Spot magis nusantara dengan review komunitas
              </Text>
            </View>
            <Pressable onPress={() => router.push('/map')}>
              <Text style={styles.seeAllText}>Buka Peta</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}>
            {filteredGems.map((gem) => (
              <GemCard key={gem.id} gem={gem} horizontal={true} />
            ))}
          </ScrollView>
        </View>

        {/* Section 3: Artisan Store Highlights */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Karya Seni Pengrajin Lokal</Text>
              <Text style={styles.sectionSubtitle}>
                Kerajinan otentik langsung dari desa budaya
              </Text>
            </View>
            <Pressable onPress={() => router.push('/store')}>
              <Text style={styles.seeAllText}>Ke Store</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} horizontal={true} />
            ))}
          </ScrollView>
        </View>

        {/* Community & Impact Mission Banner */}
        <View style={styles.impactCard}>
          <View style={styles.impactIconCircle}>
            <MaterialCommunityIcons name="hand-heart" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.impactTitle}>Dampak Nyata Setiap Perjalanan</Text>
          <Text style={styles.impactDesc}>
            100% pemesanan tur dan pembelian kerajinan di LokalTrip mengalir langsung
            untuk memperkuat ekonomi komunitas adat dan melestarikan budaya adiluhung Indonesia.
          </Text>
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <BookingModal
        visible={!!selectedExpForBooking}
        experience={selectedExpForBooking}
        onClose={() => setSelectedExpForBooking(null)}
        onSuccess={() => setSelectedExpForBooking(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  heroCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  heroTextContent: {
    flex: 1,
    paddingRight: 10,
    zIndex: 2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 28,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.82)',
    lineHeight: 17,
  },
  heroImage: {
    width: 95,
    height: 110,
    borderRadius: 14,
    opacity: 0.9,
  },
  featuresHub: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  hubTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  featureCardsRow: {
    gap: 10,
  },
  featureCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  featureCardDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  featureBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  impactCard: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  impactIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  impactDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
