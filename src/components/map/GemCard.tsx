import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { HiddenGem } from '../../types';
import { Colors } from '../../constants/Theme';
import { useApp } from '../../context/AppContext';

interface GemCardProps {
  gem: HiddenGem;
  horizontal?: boolean;
}

export const GemCard: React.FC<GemCardProps> = ({ gem, horizontal = false }) => {
  const { savedGemIds, toggleBookmarkGem } = useApp();
  const isBookmarked = savedGemIds.includes(gem.id);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Mudah':
        return { bg: '#E8F5EE', text: '#1B4931' };
      case 'Sedang':
        return { bg: '#FEF3C7', text: '#B45309' };
      case 'Menantang':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      default:
        return { bg: Colors.surfaceSubtle, text: Colors.text };
    }
  };

  const diffColor = getDifficultyColor(gem.difficulty);

  const handleCardPress = () => {
    router.push(`/gem/${gem.id}`);
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
          <Image source={{ uri: gem.image }} style={styles.horizontalImage} />
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: diffColor.bg },
            ]}>
            <Text style={[styles.difficultyText, { color: diffColor.text }]}>
              {gem.difficulty}
            </Text>
          </View>
        </View>

        <View style={styles.horizontalContent}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={Colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {gem.city}
            </Text>
          </View>

          <Text style={styles.horizontalTitle} numberOfLines={2}>
            {gem.name}
          </Text>

          <View style={styles.horizontalFooter}>
            <View style={styles.metaStat}>
              <Ionicons name="heart" size={13} color={Colors.primary} />
              <Text style={styles.metaStatText}>{gem.likesCount}</Text>
            </View>
            <View style={styles.metaStat}>
              <Ionicons name="chatbubble-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.metaStatText}>{gem.reviewsCount}</Text>
            </View>
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
        <Image source={{ uri: gem.image }} style={styles.image} />
        
        {/* Badges on image */}
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{gem.category}</Text>
          </View>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: diffColor.bg },
            ]}>
            <Text style={[styles.difficultyText, { color: diffColor.text }]}>
              {gem.difficulty}
            </Text>
          </View>
        </View>

        {/* Bookmark Button */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            toggleBookmarkGem(gem.id);
          }}
          style={({ pressed }) => [
            styles.bookmarkBtn,
            pressed && styles.btnPressed,
          ]}
          hitSlop={8}>
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isBookmarked ? Colors.primary : Colors.text}
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={13} color={Colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {gem.location}, {gem.province}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {gem.name}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {gem.description}
        </Text>

        <View style={styles.bestTimePill}>
          <Feather name="sun" size={12} color={Colors.accent} />
          <Text style={styles.bestTimeText} numberOfLines={1}>
            {gem.bestTime}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.contributorBox}>
            <Image source={{ uri: gem.contributor.avatar }} style={styles.contributorAvatar} />
            <View>
              <Text style={styles.contributorName}>{gem.contributor.name}</Text>
              <Text style={styles.contributorDate}>{gem.contributor.badge}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={15} color={Colors.primary} />
              <Text style={styles.statNumber}>{gem.likesCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.statNumber}>{gem.reviewsCount}</Text>
            </View>
          </View>
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
    height: 200,
    position: 'relative',
    backgroundColor: Colors.surfaceSubtle,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
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
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  bestTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  bestTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  contributorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contributorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  contributorName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  contributorDate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },

  // Horizontal Variant
  horizontalCard: {
    width: 240,
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
    height: 130,
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
    lineHeight: 18,
    marginVertical: 4,
  },
  horizontalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  metaStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaStatText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});

export default GemCard;
