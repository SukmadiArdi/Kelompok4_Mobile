import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { HiddenGem } from '../../types';
import { Colors } from '../../constants/Theme';

interface InteractiveMapProps {
  gems: HiddenGem[];
  selectedGem: HiddenGem | null;
  onSelectGem: (gem: HiddenGem) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  gems,
  selectedGem,
  onSelectGem,
}) => {
  const [activeRegion, setActiveRegion] = useState<string>('Semua');

  const regions = ['Semua', 'Jawa', 'Bali & Lombok', 'Nusa Tenggara', 'Sulawesi'];

  const filteredGems =
    activeRegion === 'Semua'
      ? gems
      : gems.filter((g) => g.region === activeRegion);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Mudah':
        return '#10B981';
      case 'Sedang':
        return '#F59E0B';
      case 'Menantang':
        return Colors.primary;
      default:
        return Colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Region Filter Bar */}
      <View style={styles.regionsContainer}>
        {regions.map((reg) => {
          const isActive = activeRegion === reg;
          return (
            <Pressable
              key={reg}
              onPress={() => setActiveRegion(reg)}
              style={[
                styles.regionPill,
                isActive && styles.regionPillActive,
              ]}>
              <Text
                style={[
                  styles.regionText,
                  isActive && styles.regionTextActive,
                ]}>
                {reg}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Visual Archipelago Canvas */}
      <View style={styles.mapCanvas}>
        {/* Ocean Background & Grid lines */}
        <View style={styles.gridLineHorizontal1} />
        <View style={styles.gridLineHorizontal2} />
        <View style={styles.gridLineVertical1} />
        <View style={styles.gridLineVertical2} />

        {/* Archipelago Island Silhouette Elements */}
        {/* Sumatra Island Silhouette */}
        <View style={[styles.islandShape, styles.islandSumatra]}>
          <Text style={styles.islandLabel}>SUMATERA</Text>
        </View>

        {/* Kalimantan Island Silhouette */}
        <View style={[styles.islandShape, styles.islandKalimantan]}>
          <Text style={styles.islandLabel}>KALIMANTAN</Text>
        </View>

        {/* Jawa Island Silhouette */}
        <View style={[styles.islandShape, styles.islandJawa]}>
          <Text style={styles.islandLabel}>JAWA</Text>
        </View>

        {/* Sulawesi Silhouette */}
        <View style={[styles.islandShape, styles.islandSulawesi]}>
          <Text style={styles.islandLabel}>SULAWESI</Text>
        </View>

        {/* Bali & Lombok & Sumba Silhouette */}
        <View style={[styles.islandShape, styles.islandNusaTenggara]}>
          <Text style={styles.islandLabel}>BALI & NTT</Text>
        </View>

        {/* Interactive Pin Markers */}
        {filteredGems.map((gem) => {
          const isSelected = selectedGem?.id === gem.id;
          const pinColor = getDifficultyColor(gem.difficulty);

          return (
            <Pressable
              key={gem.id}
              onPress={() => onSelectGem(gem)}
              style={[
                styles.markerWrapper,
                {
                  left: `${gem.mapCoords.xPercent}%`,
                  top: `${gem.mapCoords.yPercent}%`,
                },
              ]}>
              {isSelected && <View style={[styles.pulseRing, { borderColor: pinColor }]} />}
              <View
                style={[
                  styles.markerPin,
                  { backgroundColor: isSelected ? Colors.primaryDark : pinColor },
                  isSelected && styles.markerPinActive,
                ]}>
                <Ionicons
                  name={
                    gem.category === 'Air Terjun'
                      ? 'water'
                      : gem.category === 'Pantai Sunyi'
                      ? 'boat'
                      : gem.category === 'Kampung Adat'
                      ? 'home'
                      : 'compass'
                  }
                  size={14}
                  color="#FFF"
                />
              </View>

              {/* Mini pin label */}
              <View style={[styles.markerTitleBadge, isSelected && styles.markerTitleActive]}>
                <Text style={styles.markerTitleText} numberOfLines={1}>
                  {gem.name.split(':')[0]}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {/* Map Legend Overlay */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Tingkat Akses:</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Mudah</Text>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Sedang</Text>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Menantang</Text>
          </View>
        </View>

        {/* Coordinates Compass Badge */}
        <View style={styles.compassBadge}>
          <Ionicons name="navigate-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.compassText}>ID-GEO GPS</Text>
        </View>
      </View>

      {/* Floating Selected Gem Preview Card */}
      {selectedGem && (
        <Pressable
          onPress={() => router.push(`/gem/${selectedGem.id}`)}
          style={styles.previewCard}>
          <Image source={{ uri: selectedGem.image }} style={styles.previewImage} />
          <View style={styles.previewContent}>
            <View style={styles.previewHeader}>
              <View style={styles.previewCategory}>
                <Text style={styles.previewCategoryText}>{selectedGem.category}</Text>
              </View>
              <View style={styles.previewRating}>
                <Ionicons name="star" size={12} color={Colors.accent} />
                <Text style={styles.previewRatingText}>{selectedGem.rating}</Text>
              </View>
            </View>

            <Text style={styles.previewTitle} numberOfLines={1}>
              {selectedGem.name}
            </Text>

            <View style={styles.previewLocationRow}>
              <Ionicons name="location-sharp" size={12} color={Colors.primary} />
              <Text style={styles.previewLocationText} numberOfLines={1}>
                {selectedGem.city}, {selectedGem.province}
              </Text>
            </View>

            <View style={styles.previewFooter}>
              <Text style={styles.previewActionText}>Lihat Detail & Foto</Text>
              <Feather name="arrow-right" size={14} color={Colors.primary} />
            </View>
          </View>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  regionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  regionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  regionPillActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  regionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  regionTextActive: {
    color: '#FFF',
  },
  mapCanvas: {
    width: '100%',
    height: 320,
    backgroundColor: '#E6F0FA', // Soft tropical ocean blue
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#C7DCF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  // Map grid
  gridLineHorizontal1: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
  },
  gridLineVertical1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
  },
  gridLineVertical2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
  },

  // Island shapes stylized
  islandShape: {
    position: 'absolute',
    backgroundColor: '#D1E7D6', // Lush tropical vegetation green
    borderColor: '#A8D5B1',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  islandLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#3B6E4A',
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  islandSumatra: {
    top: '20%',
    left: '6%',
    width: 90,
    height: 130,
    borderRadius: 30,
    transform: [{ rotate: '-35deg' }],
  },
  islandKalimantan: {
    top: '18%',
    left: '36%',
    width: 95,
    height: 90,
    borderRadius: 24,
  },
  islandJawa: {
    top: '60%',
    left: '26%',
    width: 120,
    height: 34,
    borderRadius: 16,
    transform: [{ rotate: '-4deg' }],
  },
  islandSulawesi: {
    top: '22%',
    left: '64%',
    width: 60,
    height: 95,
    borderRadius: 20,
    transform: [{ rotate: '12deg' }],
  },
  islandNusaTenggara: {
    top: '64%',
    left: '52%',
    width: 105,
    height: 36,
    borderRadius: 14,
  },

  // Markers
  markerWrapper: {
    position: 'absolute',
    transform: [{ translateX: -18 }, { translateY: -18 }],
    alignItems: 'center',
    zIndex: 10,
  },
  pulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    opacity: 0.6,
    top: -4,
    left: -4,
  },
  markerPin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  markerPinActive: {
    transform: [{ scale: 1.2 }],
    borderWidth: 3,
  },
  markerTitleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 90,
  },
  markerTitleActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  markerTitleText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.text,
  },

  // Map Legend
  legendCard: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 6,
  },

  // Compass
  compassBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compassText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },

  // Floating Preview Card
  previewCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  previewImage: {
    width: 90,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  previewContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewCategory: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  previewCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  previewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  previewRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  previewLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewLocationText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
});

export default InteractiveMap;
