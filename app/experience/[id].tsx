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
import { BookingModal } from '@/src/components/experiences/BookingModal';

export default function ExperienceDetailScreen() {
  const { id } = useLocalSearchParams();
  const { experiences } = useApp();
  const [showBookingModal, setShowBookingModal] = useState(false);

  const experience = experiences.find((e) => e.id === id) || experiences[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Hero Image Container */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: experience.image }} style={styles.heroImage} />
          
          {/* Top Bar Floating Actions */}
          <View style={styles.topActionRow}>
            <Pressable
              onPress={() => router.back()}
              style={styles.iconCircle}
              hitSlop={8}>
              <Feather name="arrow-left" size={20} color={Colors.text} />
            </Pressable>

            <View style={styles.rightActions}>
              <Pressable style={styles.iconCircle} hitSlop={8}>
                <Feather name="share-2" size={18} color={Colors.text} />
              </Pressable>
              <Pressable style={styles.iconCircle} hitSlop={8}>
                <Ionicons name="heart-outline" size={20} color={Colors.primary} />
              </Pressable>
            </View>
          </View>

          {/* Category Chip */}
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{experience.category}</Text>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentBody}>
          {/* Location & Rating */}
          <View style={styles.metaRow}>
            <View style={styles.locationPill}>
              <Ionicons name="location-sharp" size={14} color={Colors.primary} />
              <Text style={styles.locationText}>
                {experience.location}, {experience.province}
              </Text>
            </View>
            <RatingStars rating={experience.rating} count={experience.reviewCount} />
          </View>

          <Text style={styles.title}>{experience.title}</Text>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <Feather name="clock" size={16} color={Colors.primary} />
              <Text style={styles.metricVal}>{experience.duration}</Text>
              <Text style={styles.metricLbl}>Durasi</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Ionicons name="people-outline" size={18} color={Colors.secondary} />
              <Text style={styles.metricVal}>Maks. {experience.maxParticipants} Org</Text>
              <Text style={styles.metricLbl}>Ukuran Grup</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <MaterialCommunityIcons name="translate" size={18} color={Colors.accent} />
              <Text style={styles.metricVal}>ID / EN</Text>
              <Text style={styles.metricLbl}>Bahasa</Text>
            </View>
          </View>

          {/* Guide Card */}
          <View style={styles.guideCard}>
            <Image source={{ uri: experience.guide.avatar }} style={styles.guideAvatar} />
            <View style={styles.guideInfo}>
              <View style={styles.guideNameRow}>
                <Text style={styles.guideName}>{experience.guide.name}</Text>
                {experience.guide.verified && (
                  <MaterialCommunityIcons name="check-decagram" size={16} color={Colors.ocean} />
                )}
              </View>
              <Text style={styles.guideBadge}>{experience.guide.badge}</Text>
              <Text style={styles.guideBio}>{experience.guide.bio}</Text>
              <View style={styles.guideTripsRow}>
                <Ionicons name="star" size={12} color={Colors.accent} />
                <Text style={styles.guideRating}>{experience.guide.rating}</Text>
                <Text style={styles.guideTrips}>• {experience.guide.tripsCount} tur selesai</Text>
              </View>
            </View>
          </View>

          {/* Deskripsi */}
          <Text style={styles.sectionHeader}>Tentang Pengalaman Ini</Text>
          <Text style={styles.descriptionText}>{experience.description}</Text>

          {/* Highlights */}
          <Text style={styles.sectionHeader}>Sorotan Aktivitas</Text>
          <View style={styles.highlightsBox}>
            {experience.highlights.map((hl, idx) => (
              <View key={idx} style={styles.highlightItem}>
                <Ionicons name="sparkles" size={14} color={Colors.primary} />
                <Text style={styles.highlightText}>{hl}</Text>
              </View>
            ))}
          </View>

          {/* Itinerary Schedule */}
          <Text style={styles.sectionHeader}>Jadwal Rangkaian Acara</Text>
          <View style={styles.scheduleBox}>
            {experience.schedule.map((item, idx) => (
              <View key={idx} style={styles.scheduleItem}>
                <View style={styles.timePill}>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <View style={styles.timelineDot} />
                <Text style={styles.activityText}>{item.activity}</Text>
              </View>
            ))}
          </View>

          {/* What's Included */}
          <Text style={styles.sectionHeader}>Fasilitas Termasuk</Text>
          <View style={styles.includedGrid}>
            {experience.included.map((inc, idx) => (
              <View key={idx} style={styles.includedItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />
                <Text style={styles.includedText}>{inc}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPriceLbl}>Harga per orang</Text>
          <Text style={styles.bottomPriceVal}>
            {formatPrice(experience.price)}
          </Text>
        </View>

        <Pressable
          onPress={() => setShowBookingModal(true)}
          style={({ pressed }) => [
            styles.bottomBookBtn,
            pressed && styles.btnPressed,
          ]}>
          <Text style={styles.bottomBookBtnText}>Booking Sekarang</Text>
          <Feather name="arrow-right" size={16} color="#FFF" />
        </Pressable>
      </View>

      {/* Booking Modal */}
      <BookingModal
        visible={showBookingModal}
        experience={experience}
        onClose={() => setShowBookingModal(false)}
        onSuccess={() => setShowBookingModal(false)}
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
    paddingBottom: 100,
  },
  heroContainer: {
    width: '100%',
    height: 280,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryChip: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryChipText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  contentBody: {
    padding: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 28,
    marginBottom: 16,
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 4,
  },
  metricLbl: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  guideCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  guideAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  guideBadge: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 1,
    marginBottom: 4,
  },
  guideBio: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  guideTripsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guideRating: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  guideTrips: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 6,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  highlightsBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    gap: 10,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  highlightText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
  scheduleBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    gap: 14,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timePill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 54,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  activityText: {
    fontSize: 12,
    color: Colors.text,
    flex: 1,
  },
  includedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  includedText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  bottomPriceLbl: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  bottomPriceVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  bottomBookBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
  },
  btnPressed: {
    opacity: 0.85,
  },
  bottomBookBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
