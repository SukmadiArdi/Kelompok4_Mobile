import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ArtisanProduct } from '../../types';
import { Colors } from '../../constants/Theme';
import { useApp } from '../../context/AppContext';

interface ProductCardProps {
  product: ArtisanProduct;
  horizontal?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  horizontal = false,
}) => {
  const { addToCart, favoriteProductIds, toggleFavoriteProduct } = useApp();
  const isFavorite = favoriteProductIds.includes(product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCardPress = () => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  if (horizontal) {
    return (
      <Pressable
        onPress={handleCardPress}
        style={({ pressed }) => [
          styles.horizontalCard,
          pressed && styles.cardPressed,
        ]}>
        <View style={styles.horizontalImageContainer}>
          <Image source={{ uri: product.image }} style={styles.horizontalImage} />
          <View style={styles.villageBadge}>
            <Text style={styles.villageText} numberOfLines={1}>
              {product.artisan.city}
            </Text>
          </View>
        </View>

        <View style={styles.horizontalContent}>
          <Text style={styles.horizontalTitle} numberOfLines={2}>
            {product.name}
          </Text>

          <View style={styles.artisanRow}>
            <Text style={styles.artisanName} numberOfLines={1}>
              oleh {product.artisan.name}
            </Text>
          </View>

          <View style={styles.horizontalFooter}>
            <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
            <Pressable
              onPress={handleAddToCart}
              style={({ pressed }) => [
                styles.addMiniBtn,
                pressed && styles.btnPressed,
              ]}
              hitSlop={8}>
              <Feather name="plus" size={14} color="#FFF" />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handleCardPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} />
        
        {/* Village & Artisan origin badge */}
        <View style={styles.villageBadge}>
          <Ionicons name="location-sharp" size={11} color="#FFF" />
          <Text style={styles.villageText}>
            {product.artisan.village}, {product.artisan.city}
          </Text>
        </View>

        {/* Favorite Button */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            toggleFavoriteProduct(product.id);
          }}
          style={({ pressed }) => [
            styles.favBtn,
            pressed && styles.btnPressed,
          ]}
          hitSlop={8}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? Colors.primary : Colors.text}
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryText}>{product.category}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={Colors.accent} />
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.salesText}>({product.salesCount} terjual)</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Artisan Story Snippet */}
        <View style={styles.artisanCard}>
          <Image source={{ uri: product.artisan.avatar }} style={styles.artisanAvatar} />
          <View style={styles.artisanInfo}>
            <View style={styles.artisanTitleRow}>
              <Text style={styles.artisanName}>{product.artisan.name}</Text>
              {product.artisan.verified && (
                <MaterialCommunityIcons name="check-decagram" size={12} color={Colors.ocean} />
              )}
            </View>
            <Text style={styles.artisanCraft} numberOfLines={1}>
              {product.artisan.craft}
            </Text>
          </View>
        </View>

        {/* Price & Add to Cart */}
        <View style={styles.footerRow}>
          <View>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
            <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
          </View>

          <Pressable
            onPress={handleAddToCart}
            style={({ pressed }) => [
              styles.addBtn,
              pressed && styles.btnPressed,
            ]}>
            <Feather name="shopping-bag" size={14} color="#FFF" />
            <Text style={styles.addBtnText}>Beli</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginHorizontal: 20,
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: Colors.surfaceSubtle,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  villageBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  villageText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  btnPressed: {
    opacity: 0.7,
  },
  content: {
    padding: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  salesText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 21,
    marginBottom: 10,
  },
  artisanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    padding: 8,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  artisanAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  artisanInfo: {
    flex: 1,
  },
  artisanTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  artisanName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  artisanCraft: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  originalPrice: {
    fontSize: 11,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Horizontal Card
  horizontalCard: {
    width: 200,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  horizontalImageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  horizontalContent: {
    padding: 10,
  },
  horizontalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 18,
    marginBottom: 4,
  },
  artisanRow: {
    marginBottom: 6,
  },
  horizontalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  addMiniBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProductCard;
