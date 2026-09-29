import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/src/constants/Theme';
import { useApp } from '@/src/context/AppContext';
import { Header } from '@/src/components/common/Header';
import { SearchBar } from '@/src/components/common/SearchBar';
import { CategoryPills } from '@/src/components/common/CategoryPills';
import { ProductCard } from '@/src/components/store/ProductCard';
import { ArtisanSpotlight } from '@/src/components/store/ArtisanSpotlight';

export default function StoreScreen() {
  const { products, cartCount, cartSubtotal } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = [
    'Semua',
    'Wastra & Batik',
    'Gerabah & Keramik',
    'Anyaman Bambu',
    'Ukiran Kayu',
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.artisan.name.toLowerCase().includes(search.toLowerCase()) ||
      p.artisan.village.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Title Header */}
        <View style={styles.titleSection}>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={12} color={Colors.accent} />
            <Text style={styles.badgeText}>Fitur 3: Kerajinan Autentik 100% Asli</Text>
          </View>
          <Text style={styles.pageTitle}>Artisan Store</Text>
          <Text style={styles.pageSubtitle}>
            Marketplace kerajinan tangan lokal. Beli karya langsung dari tangan
            pengrajin nusantara tanpa perantara.
          </Text>
        </View>

        {/* Search */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari kain tenun sumba, teko gerabah, patung kayu..."
        />

        {/* Category Pills */}
        <CategoryPills
          categories={categories}
          activeCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Maestro Artisan Spotlight */}
        <ArtisanSpotlight products={products} />

        {/* Product Catalog Section */}
        <View style={styles.catalogSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Etalase Kerajinan Pilihan</Text>
            <Text style={styles.sectionCount}>
              {filteredProducts.length} Produk Tersedia
            </Text>
          </View>

          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </View>
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <View style={styles.floatingCartBar}>
          <View style={styles.cartBarInfo}>
            <View style={styles.cartCountPill}>
              <Text style={styles.cartCountText}>{cartCount} Barang</Text>
            </View>
            <View>
              <Text style={styles.cartSubtotalLabel}>Total Keranjang</Text>
              <Text style={styles.cartSubtotalVal}>
                {formatPrice(cartSubtotal)}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/cart')}
            style={({ pressed }) => [
              styles.checkoutBtn,
              pressed && styles.btnPressed,
            ]}>
            <Text style={styles.checkoutBtnText}>Buka Keranjang</Text>
            <Feather name="arrow-right" size={16} color="#FFF" />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 90, // extra space for floating cart bar
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#B45309',
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
  catalogSection: {
    marginTop: 8,
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
  sectionCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    backgroundColor: Colors.text,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  cartBarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartCountPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cartCountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cartSubtotalLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  cartSubtotalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnPressed: {
    opacity: 0.85,
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
