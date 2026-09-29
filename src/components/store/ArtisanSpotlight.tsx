import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ArtisanProduct } from '../../types';
import { Colors } from '../../constants/Theme';

interface ArtisanSpotlightProps {
  products: ArtisanProduct[];
  onSelectArtisan?: (artisanId: string) => void;
}

export const ArtisanSpotlight: React.FC<ArtisanSpotlightProps> = ({ products }) => {
  // Extract distinct artisans
  const artisans = Array.from(
    new Map(products.map((p) => [p.artisan.id, p.artisan])).values()
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Maestro Pengrajin Lokal</Text>
          <Text style={styles.sectionSubtitle}>
            Kenali sosok di balik warisan budaya luhur nusantara
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}>
        {artisans.map((artisan) => (
          <View key={artisan.id} style={styles.artisanCard}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: artisan.avatar }} style={styles.avatar} />
              {artisan.verified && (
                <View style={styles.verifiedIcon}>
                  <MaterialCommunityIcons name="check-decagram" size={16} color={Colors.ocean} />
                </View>
              )}
            </View>

            <Text style={styles.artisanName}>{artisan.name}</Text>
            <Text style={styles.artisanCraft} numberOfLines={1}>
              {artisan.craft}
            </Text>

            <View style={styles.locationPill}>
              <Ionicons name="location-outline" size={11} color={Colors.primary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {artisan.village}, {artisan.city}
              </Text>
            </View>

            <Text style={styles.quoteText} numberOfLines={2}>
              {artisan.quote}
            </Text>

            <View style={styles.expBadge}>
              <Text style={styles.expBadgeText}>
                {artisan.yearsExperience} Tahun Berkarya
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 18,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollList: {
    paddingHorizontal: 20,
    gap: 14,
  },
  artisanCard: {
    width: 220,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  verifiedIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  artisanName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  artisanCraft: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  quoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
  },
  expBadge: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  expBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
  },
});

export default ArtisanSpotlight;
