import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Experience } from '../../types';
import { Colors } from '../../constants/Theme';
import { RatingStars } from '../common/RatingStars';

interface ExperienceCardProps {
  experience: Experience;
  onBookPress?: (experience: Experience) => void;
  horizontal?: boolean;
}

const FALLBACK_EXP_IMAGE =
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80';
const FALLBACK_GUIDE_AVATAR =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80';

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  onBookPress,
  horizontal = false,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const formatPrice = (price?: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price ?? 0);
  };

  const handleCardPress = () => {
    router.push(`/experience/${experience.id}`);
  };

  const displayImage = !imageError && experience.image ? experience.image : FALLBACK_EXP_IMAGE;
  const expTitle = experience.title || 'Pengalaman Budaya';
  const expCategory = experience.category || 'Workshop Seni';
  const expDuration = experience.duration || '2 Jam';
  const expLocation = experience.location || `${experience.city || 'Yogyakarta'}, ${experience.province || 'Indonesia'}`;
  const expRating = experience.rating ?? 4.8;
  const expReviewCount = experience.reviewCount ?? 0;
  const guideName = experience.guide?.name || 'Pemandu Lokal';
  const guideAvatar = experience.guide?.avatar || FALLBACK_GUIDE_AVATAR;
  const guideBadge = experience.guide?.badge || 'Pemandu Berlisensi';

  if (horizontal) {
    return (
      <Pressable
        onPress={handleCardPress}
        style={({ pressed }) => [
          styles.horizontalCard,
          pressed && styles.cardPressed,
        ]}>
        <View style={styles.horizontalImageContainer}>
          <Image
            source={{ uri: displayImage }}
            style={styles.horizontalImage}
            onError={() => setImageError(true)}
          />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{expCategory}</Text>
          </View>
        </View>

        <View style={styles.horizontalContent}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={Colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {experience.city || 'Yogyakarta'}, {experience.province || 'Indonesia'}
            </Text>
          </View>

          <Text style={styles.horizontalTitle} numberOfLines={2}>
            {expTitle}
          </Text>

          {experience.guide && (
            <View style={styles.guideMiniRow}>
              <Image source={{ uri: guideAvatar }} style={styles.guideMiniAvatar} />
              <Text style={styles.guideMiniName} numberOfLines={1}>
                {guideName}
              </Text>
              {experience.guide.verified && (
                <MaterialCommunityIcons name="check-decagram" size={13} color={Colors.ocean} />
              )}
            </View>
          )}

          <View style={styles.horizontalFooter}>
            <RatingStars rating={expRating} count={expReviewCount} />
            <Text style={styles.priceHighlight}>
              {formatPrice(experience.price)}
            </Text>
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
        <Image
          source={{ uri: displayImage }}
          style={styles.image}
          onError={() => setImageError(true)}
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{expCategory}</Text>
        </View>
        <View style={styles.durationBadge}>
          <Feather name="clock" size={11} color="#FFF" />
          <Text style={styles.durationBadgeText}>{expDuration}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={13} color={Colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {expLocation}
            </Text>
          </View>
          <RatingStars rating={expRating} count={expReviewCount} />
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {expTitle}
        </Text>

        {experience.guide && (
          <View style={styles.guideBox}>
            <Image source={{ uri: guideAvatar }} style={styles.guideAvatar} />
            <View style={styles.guideInfo}>
              <View style={styles.guideNameRow}>
                <Text style={styles.guideName}>{guideName}</Text>
                {experience.guide.verified && (
                  <MaterialCommunityIcons name="check-decagram" size={14} color={Colors.ocean} />
                )}
              </View>
              <Text style={styles.guideBadge} numberOfLines={1}>
                {guideBadge}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>Mulai dari</Text>
            <Text style={styles.priceValue}>
              {formatPrice(experience.price)}
              <Text style={styles.pricePer}> /org</Text>
            </Text>
          </View>

          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              if (onBookPress) {
                onBookPress(experience);
              } else {
                handleCardPress();
              }
            }}
            style={({ pressed }) => [
              styles.bookBtn,
              pressed && styles.bookBtnPressed,
            ]}>
            <Text style={styles.bookBtnText}>Booking</Text>
            <Feather name="arrow-right" size={14} color="#FFF" />
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
    opacity: 0.95,
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
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  guideBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    padding: 8,
    borderRadius: 12,
    marginBottom: 14,
    gap: 8,
  },
  guideAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  guideInfo: {
    flex: 1,
  },
  guideNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guideName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  guideBadge: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  pricePer: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  bookBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  bookBtnPressed: {
    opacity: 0.85,
  },
  bookBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Horizontal Card Variant (for Home carousel)
  horizontalCard: {
    width: 260,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  horizontalImageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  horizontalContent: {
    padding: 12,
  },
  horizontalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 19,
    marginVertical: 6,
  },
  guideMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  guideMiniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  guideMiniName: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  horizontalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  priceHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
});

export default ExperienceCard;
