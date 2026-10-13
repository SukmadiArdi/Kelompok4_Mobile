import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { HiddenGem } from '../../types';
import { Colors } from '../../constants/Theme';
import { MapLeaflet, MapLeafletHandle } from './MapLeaflet';
import { openDirections, formatCoordinatesDMS } from '../../utils/mapUtils';

interface InteractiveMapProps {
  gems: HiddenGem[];
  selectedGem: HiddenGem | null;
  onSelectGem: (gem: HiddenGem) => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  gems,
  selectedGem,
  onSelectGem,
  onTouchStart,
  onTouchEnd,
}) => {
  const mapLeafletRef = useRef<MapLeafletHandle | null>(null);

  const [mapEngine, setMapEngine] = useState<'osm' | 'schematic'>('osm');
  const [tileLayer, setTileLayer] = useState<'streets' | 'satellite'>('streets');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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

  // Helper untuk proyeksi koordinat geografis ke kanvas skematik
  const getSchematicCoords = (gem: HiddenGem, index: number) => {
    const baseX =
      gem.mapCoords?.xPercent ??
      Math.max(8, Math.min(92, ((gem.mapCoords.lng - 95.0) / 46.0) * 100));
    const baseY =
      gem.mapCoords?.yPercent ??
      Math.max(12, Math.min(88, ((6.0 - gem.mapCoords.lat) / 17.0) * 100));

    const offsetX = index % 2 === 0 ? 0 : 3.5;
    const offsetY = index % 3 === 0 ? 0 : -3;

    return {
      x: Math.max(6, Math.min(94, baseX + offsetX)),
      y: Math.max(10, Math.min(90, baseY + offsetY)),
    };
  };

  const handleResetCenter = () => {
    mapLeafletRef.current?.resetView();
  };

  const currentMapHeight = isExpanded ? 500 : 340;

  return (
    <View style={styles.container}>
      {/* Top Map Engine Switcher & Expand Toggle */}
      <View style={styles.topControlRow}>
        <View style={styles.engineBar}>
          <Pressable
            onPress={() => setMapEngine('osm')}
            style={[
              styles.engineBtn,
              mapEngine === 'osm' && styles.engineBtnActive,
            ]}>
            <Ionicons
              name="earth"
              size={13}
              color={mapEngine === 'osm' ? '#FFF' : Colors.textSecondary}
            />
            <Text
              style={[
                styles.engineBtnText,
                mapEngine === 'osm' && styles.engineBtnTextActive,
              ]}>
              Peta Satelit / OSM
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMapEngine('schematic')}
            style={[
              styles.engineBtn,
              mapEngine === 'schematic' && styles.engineBtnActive,
            ]}>
            <MaterialCommunityIcons
              name="map-outline"
              size={13}
              color={mapEngine === 'schematic' ? '#FFF' : Colors.textSecondary}
            />
            <Text
              style={[
                styles.engineBtnText,
                mapEngine === 'schematic' && styles.engineBtnTextActive,
              ]}>
              Skematik
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setIsExpanded((prev) => !prev)}
            style={[
              styles.engineBtn,
              isExpanded && styles.expandBtnActive,
            ]}>
            <Feather
              name={isExpanded ? 'minimize-2' : 'maximize-2'}
              size={12}
              color={isExpanded ? '#FFF' : Colors.textSecondary}
            />
            <Text
              style={[
                styles.engineBtnText,
                isExpanded && styles.engineBtnTextActive,
              ]}>
              {isExpanded ? 'Normal' : 'Perbesar'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Map View Area */}
      <View
        style={[styles.mapFrame, { height: currentMapHeight }]}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onResponderGrant={onTouchStart}
        onResponderRelease={onTouchEnd}>
        {mapEngine === 'osm' ? (
          <View style={styles.osmContainer}>
            {/* Top Floating Overlay: Count Badge, Recenter Button, & Layer Switcher */}
            <View style={styles.mapTopOverlay}>
              <View style={styles.spotCountBadge}>
                <Ionicons name="location" size={13} color={Colors.primary} />
                <Text style={styles.spotCountText}>
                  {gems.length} Spot Terlihat
                </Text>
              </View>

              <View style={styles.rightFloatingActions}>
                <Pressable
                  onPress={handleResetCenter}
                  style={styles.recenterBtn}
                  hitSlop={6}
                  accessibilityLabel="Pusatkan Peta">
                  <Ionicons name="locate" size={13} color={Colors.primary} />
                  <Text style={styles.recenterBtnText}>Pusatkan</Text>
                </Pressable>

                <View style={styles.layerSwitcher}>
                  <Pressable
                    onPress={() => setTileLayer('streets')}
                    style={[
                      styles.layerBtn,
                      tileLayer === 'streets' && styles.layerBtnActive,
                    ]}>
                    <Ionicons
                      name="map"
                      size={11}
                      color={tileLayer === 'streets' ? '#FFF' : Colors.text}
                    />
                    <Text
                      style={[
                        styles.layerBtnText,
                        tileLayer === 'streets' && styles.layerBtnTextActive,
                      ]}>
                      Jalan
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setTileLayer('satellite')}
                    style={[
                      styles.layerBtn,
                      tileLayer === 'satellite' && styles.layerBtnActive,
                    ]}>
                    <Ionicons
                      name="globe-outline"
                      size={11}
                      color={tileLayer === 'satellite' ? '#FFF' : Colors.text}
                    />
                    <Text
                      style={[
                        styles.layerBtnText,
                        tileLayer === 'satellite' && styles.layerBtnTextActive,
                      ]}>
                      Satelit
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <MapLeaflet
              ref={mapLeafletRef}
              gems={gems}
              selectedGem={selectedGem}
              onSelectGem={onSelectGem}
              mapType={tileLayer}
              height={currentMapHeight}
            />
          </View>
        ) : (
          /* Schematic Vector Map */
          <View style={styles.mapCanvas}>
            {/* Ocean Grid lines */}
            <View style={styles.gridLineHorizontal1} />
            <View style={styles.gridLineHorizontal2} />
            <View style={styles.gridLineVertical1} />
            <View style={styles.gridLineVertical2} />

            {/* Archipelago Islands */}
            <View style={[styles.islandShape, styles.islandSumatra]}>
              <Text style={styles.islandLabel}>SUMATERA</Text>
            </View>
            <View style={[styles.islandShape, styles.islandKalimantan]}>
              <Text style={styles.islandLabel}>KALIMANTAN</Text>
            </View>
            <View style={[styles.islandShape, styles.islandJawa]}>
              <Text style={styles.islandLabel}>JAWA</Text>
            </View>
            <View style={[styles.islandShape, styles.islandSulawesi]}>
              <Text style={styles.islandLabel}>SULAWESI</Text>
            </View>
            <View style={[styles.islandShape, styles.islandNusaTenggara]}>
              <Text style={styles.islandLabel}>BALI & NTT</Text>
            </View>
            <View style={[styles.islandShape, styles.islandPapua]}>
              <Text style={styles.islandLabel}>PAPUA</Text>
            </View>

            {/* Schematic Markers */}
            {gems.map((gem, index) => {
              const isSelected = selectedGem?.id === gem.id;
              const pinColor = getDifficultyColor(gem.difficulty);
              const coords = getSchematicCoords(gem, index);

              return (
                <Pressable
                  key={gem.id}
                  onPress={() => onSelectGem(gem)}
                  style={[
                    styles.markerWrapper,
                    {
                      left: `${coords.x}%`,
                      top: `${coords.y}%`,
                    },
                  ]}>
                  {isSelected && (
                    <View
                      style={[styles.pulseRing, { borderColor: pinColor }]}
                    />
                  )}
                  <View
                    style={[
                      styles.markerPin,
                      {
                        backgroundColor: isSelected
                          ? Colors.primaryDark
                          : pinColor,
                      },
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

                  <View
                    style={[
                      styles.markerTitleBadge,
                      isSelected && styles.markerTitleActive,
                    ]}>
                    <Text
                      style={[
                        styles.markerTitleText,
                        isSelected && styles.markerTitleTextActive,
                      ]}
                      numberOfLines={1}>
                      {gem.name.split(':')[0]}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            {/* Map Legend */}
            <View style={styles.legendCard}>
              <Text style={styles.legendTitle}>Akses:</Text>
              <View style={styles.legendRow}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#10B981' }]}
                />
                <Text style={styles.legendText}>Mudah</Text>
                <View
                  style={[styles.legendDot, { backgroundColor: '#F59E0B' }]}
                />
                <Text style={styles.legendText}>Sedang</Text>
                <View
                  style={[styles.legendDot, { backgroundColor: Colors.primary }]}
                />
                <Text style={styles.legendText}>Menantang</Text>
              </View>
            </View>

            {/* Compass badge */}
            <View style={styles.compassBadge}>
              <Ionicons name="compass-outline" size={16} color={Colors.primary} />
              <Text style={styles.compassText}>GPS ID-GEO</Text>
            </View>
          </View>
        )}
      </View>

      {/* Selected Gem Floating Preview Card with Directions Button */}
      {selectedGem && (
        <View style={styles.previewCard}>
          <Pressable
            onPress={() => router.push(`/gem/${selectedGem.id}`)}
            style={styles.previewImageContainer}>
            <Image
              source={{ uri: selectedGem.image }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          </Pressable>

          <View style={styles.previewContent}>
            <View style={styles.previewHeader}>
              <View style={styles.previewCategory}>
                <Text style={styles.previewCategoryText}>
                  {selectedGem.category}
                </Text>
              </View>
              <View style={styles.previewRating}>
                <Ionicons name="star" size={12} color={Colors.accent} />
                <Text style={styles.previewRatingText}>
                  {selectedGem.rating.toFixed(2)}
                </Text>
              </View>
            </View>

            <Text
              style={styles.previewTitle}
              numberOfLines={1}
              onPress={() => router.push(`/gem/${selectedGem.id}`)}>
              {selectedGem.name}
            </Text>

            <View style={styles.previewLocationRow}>
              <Ionicons name="location-sharp" size={12} color={Colors.primary} />
              <Text style={styles.previewLocationText} numberOfLines={1}>
                {selectedGem.city}, {selectedGem.province}
              </Text>
            </View>

            {/* GPS Coordinates Badge */}
            <Text style={styles.coordsText}>
              🌐 {formatCoordinatesDMS(selectedGem.mapCoords.lat, selectedGem.mapCoords.lng)}
            </Text>

            {/* Action Buttons Row */}
            <View style={styles.actionButtonsRow}>
              <Pressable
                onPress={() =>
                  openDirections(
                    selectedGem.mapCoords.lat,
                    selectedGem.mapCoords.lng,
                    selectedGem.name
                  )
                }
                style={styles.directionsBtn}>
                <Ionicons name="navigate" size={12} color="#FFF" />
                <Text style={styles.directionsBtnText}>Petunjuk Arah</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push(`/gem/${selectedGem.id}`)}
                style={styles.detailBtn}>
                <Text style={styles.detailBtnText}>Lihat Detail</Text>
                <Feather name="arrow-right" size={12} color={Colors.primary} />
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  engineBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  engineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  engineBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  expandBtnActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  engineBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  engineBtnTextActive: {
    color: '#FFF',
  },
  mapFrame: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  osmContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mapTopOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 99,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  spotCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  rightFloatingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recenterBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  layerSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  layerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  layerBtnActive: {
    backgroundColor: Colors.primary,
  },
  layerBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text,
  },
  layerBtnTextActive: {
    color: '#FFF',
  },

  // Schematic Map
  mapCanvas: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E6F0FA',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLineHorizontal1: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
  },
  gridLineVertical1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
  },
  gridLineVertical2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
  },
  islandShape: {
    position: 'absolute',
    backgroundColor: '#D1E7D6',
    borderColor: '#A8D5B1',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  islandLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#3B6E4A',
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  islandSumatra: {
    top: '18%',
    left: '4%',
    width: 85,
    height: 120,
    borderRadius: 28,
    transform: [{ rotate: '-35deg' }],
  },
  islandKalimantan: {
    top: '16%',
    left: '32%',
    width: 90,
    height: 85,
    borderRadius: 22,
  },
  islandJawa: {
    top: '62%',
    left: '22%',
    width: 125,
    height: 32,
    borderRadius: 14,
    transform: [{ rotate: '-3deg' }],
  },
  islandSulawesi: {
    top: '20%',
    left: '60%',
    width: 55,
    height: 90,
    borderRadius: 18,
    transform: [{ rotate: '12deg' }],
  },
  islandNusaTenggara: {
    top: '65%',
    left: '50%',
    width: 100,
    height: 32,
    borderRadius: 12,
  },
  islandPapua: {
    top: '26%',
    left: '78%',
    width: 75,
    height: 70,
    borderRadius: 18,
  },

  // Markers
  markerWrapper: {
    position: 'absolute',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    alignItems: 'center',
    zIndex: 10,
  },
  pulseRing: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    opacity: 0.6,
    top: -5,
    left: -5,
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 3,
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
    marginTop: 2,
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
  markerTitleTextActive: {
    color: '#FFF',
  },
  legendCard: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendTitle: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 4,
  },
  compassBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
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
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },

  // Preview Card
  previewCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3,
    gap: 12,
  },
  previewImageContainer: {
    width: 95,
    height: 105,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
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
    fontWeight: '800',
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
  coordsText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  directionsBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  directionsBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
});

export default InteractiveMap;
