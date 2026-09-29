import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Theme';
import { useApp } from '@/src/context/AppContext';
import { RatingStars } from '@/src/components/common/RatingStars';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const {
    products,
    addToCart,
    favoriteProductIds,
    toggleFavoriteProduct,
    cartCount,
  } = useApp();

  const product = products.find((p) => p.id === id) || products[0];
  const isFavorite = favoriteProductIds.includes(product.id);

  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/cart');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: product.image }} style={styles.heroImage} />

          {/* Top Actions */}
          <View style={styles.topActionRow}>
            <Pressable
              onPress={() => router.back()}
              style={styles.iconCircle}
              hitSlop={8}>
              <Feather name="arrow-left" size={20} color={Colors.text} />
            </Pressable>

            <View style={styles.rightActions}>
              <Pressable
                onPress={() => router.push('/cart')}
                style={styles.iconCircle}
                hitSlop={8}>
                <Feather name="shopping-bag" size={18} color={Colors.text} />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={() => toggleFavoriteProduct(product.id)}
                style={styles.iconCircle}
                hitSlop={8}>
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorite ? Colors.primary : Colors.text}
                />
              </Pressable>
            </View>
          </View>

          {/* Origin Badge */}
          <View style={styles.originBadge}>
            <Ionicons name="location-sharp" size={12} color="#FFF" />
            <Text style={styles.originBadgeText}>
              {product.artisan.village}, {product.artisan.city}
            </Text>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.contentBody}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>{product.category}</Text>
            <View style={styles.ratingBox}>
              <RatingStars rating={product.rating} />
              <Text style={styles.salesCount}>• {product.salesCount} Terjual</Text>
            </View>
          </View>

          <Text style={styles.title}>{product.name}</Text>

          {/* Pricing */}
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
            <View style={styles.stockPill}>
              <Text style={styles.stockText}>Sisa {product.stock} pcs</Text>
            </View>
          </View>

          {/* Maestro Artisan Profile Card */}
          <View style={styles.artisanCard}>
            <Image
              source={{ uri: product.artisan.avatar }}
              style={styles.artisanAvatar}
            />
            <View style={styles.artisanInfo}>
              <View style={styles.artisanNameRow}>
                <Text style={styles.artisanName}>{product.artisan.name}</Text>
                {product.artisan.verified && (
                  <MaterialCommunityIcons name="check-decagram" size={14} color={Colors.ocean} />
                )}
              </View>
              <Text style={styles.artisanCraft}>{product.artisan.craft}</Text>
              <Text style={styles.artisanYears}>
                {product.artisan.yearsExperience} Tahun Menjaga Warisan Leluhur
              </Text>
            </View>
          </View>

          {/* Artisan Story & Quote */}
          <View style={styles.storyCard}>
            <Text style={styles.storyTitle}>Kisah Pengrajin</Text>
            <Text style={styles.storyQuote}>{product.artisan.quote}</Text>
            <Text style={styles.storyText}>{product.artisan.story}</Text>
          </View>

          {/* Philosophy */}
          <Text style={styles.sectionHeader}>Filosofi Karya</Text>
          <Text style={styles.philosophyText}>{product.philosophy}</Text>

          {/* Materials & Specs */}
          <Text style={styles.sectionHeader}>Bahan Alami & Dimensi</Text>
          <View style={styles.specsCard}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Bahan Baku</Text>
              <Text style={styles.specVal}>{product.materials.join(', ')}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Dimensi</Text>
              <Text style={styles.specVal}>{product.dimensions}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Berat</Text>
              <Text style={styles.specVal}>{product.weight}</Text>
            </View>
          </View>

          {/* Quantity Stepper */}
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Jumlah Pembelian</Text>
            <View style={styles.stepperContainer}>
              <Pressable
                disabled={quantity <= 1}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={[styles.stepBtn, quantity <= 1 && styles.stepBtnDisabled]}>
                <Feather name="minus" size={16} color={Colors.text} />
              </Pressable>
              <Text style={styles.stepNum}>{quantity}</Text>
              <Pressable
                disabled={quantity >= product.stock}
                onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                style={[
                  styles.stepBtn,
                  quantity >= product.stock && styles.stepBtnDisabled,
                ]}>
                <Feather name="plus" size={16} color={Colors.text} />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Added to Cart Floating Toast */}
      {addedToast && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={18} color="#FFF" />
          <Text style={styles.toastText}>Berhasil ditambahkan ke Keranjang!</Text>
        </View>
      )}

      {/* Sticky Bottom Actions */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={handleAddToCart}
          style={({ pressed }) => [
            styles.cartBtn,
            pressed && styles.btnPressed,
          ]}>
          <Feather name="shopping-bag" size={18} color={Colors.primary} />
          <Text style={styles.cartBtnText}>+ Keranjang</Text>
        </Pressable>

        <Pressable
          onPress={handleBuyNow}
          style={({ pressed }) => [
            styles.buyBtn,
            pressed && styles.btnPressed,
          ]}>
          <Text style={styles.buyBtnText}>Beli Sekarang</Text>
          <Feather name="arrow-right" size={16} color="#FFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroContainer: {
    width: '100%',
    height: 290,
    position: 'relative',
    backgroundColor: Colors.surfaceSubtle,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topActionRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  rightActions: {
    flexDirection: 'row',
    gap: 10,
  },
  originBadge: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  originBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  contentBody: {
    padding: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  salesCount: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 28,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  stockPill: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
  },
  artisanCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  artisanAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  artisanInfo: {
    flex: 1,
  },
  artisanNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  artisanName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  artisanCraft: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  artisanYears: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  storyCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 20,
  },
  storyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  storyQuote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.primaryDark,
    marginBottom: 8,
    lineHeight: 18,
  },
  storyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 6,
    marginBottom: 10,
  },
  philosophyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  specsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    gap: 10,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  specVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    padding: 14,
    borderRadius: 14,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  stepNum: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  toastText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    flexDirection: 'row',
    gap: 12,
  },
  cartBtn: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FED7D0',
  },
  cartBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  buyBtn: {
    flex: 1.2,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnPressed: {
    opacity: 0.85,
  },
  buyBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
