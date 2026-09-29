import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Theme';
import { useApp } from '@/src/context/AppContext';
import { RatingStars } from '@/src/components/common/RatingStars';

export default function GemDetailScreen() {
  const { id } = useLocalSearchParams();
  const { gems, savedGemIds, toggleBookmarkGem, addGemReview } = useApp();

  const gem = gems.find((g) => g.id === id) || gems[0];
  const isBookmarked = savedGemIds.includes(gem.id);

  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');

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

  const handleSubmitReview = () => {
    if (!newComment.trim()) return;
    addGemReview(gem.id, {
      user: reviewerName.trim() || 'Penjelajah LokalTrip',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      rating: newRating,
      comment: newComment,
    });
    setNewComment('');
    setShowReviewModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Main Photo */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: gem.gallery[selectedPhotoIdx] || gem.image }}
            style={styles.heroImage}
          />

          {/* Top Actions */}
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
              <Pressable
                onPress={() => toggleBookmarkGem(gem.id)}
                style={styles.iconCircle}
                hitSlop={8}>
                <Ionicons
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={isBookmarked ? Colors.primary : Colors.text}
                />
              </Pressable>
            </View>
          </View>

          {/* Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{gem.category}</Text>
            </View>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: diffColor.bg },
              ]}>
              <Text style={[styles.difficultyText, { color: diffColor.text }]}>
                Akses: {gem.difficulty}
              </Text>
            </View>
          </View>
        </View>

        {/* Thumbnail Gallery Row */}
        {gem.gallery.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbList}>
            {gem.gallery.map((photo, idx) => (
              <Pressable
                key={idx}
                onPress={() => setSelectedPhotoIdx(idx)}
                style={[
                  styles.thumbWrapper,
                  selectedPhotoIdx === idx && styles.thumbSelected,
                ]}>
                <Image source={{ uri: photo }} style={styles.thumbImage} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Body Content */}
        <View style={styles.contentBody}>
          <View style={styles.metaRow}>
            <View style={styles.locationPill}>
              <Ionicons name="location-sharp" size={14} color={Colors.primary} />
              <Text style={styles.locationText}>
                {gem.location}, {gem.province}
              </Text>
            </View>
            <RatingStars rating={gem.rating} count={gem.reviewsCount} />
          </View>

          <Text style={styles.title}>{gem.name}</Text>

          {/* Contributor Card */}
          <View style={styles.contributorBox}>
            <Image source={{ uri: gem.contributor.avatar }} style={styles.contributorAvatar} />
            <View style={styles.contributorInfo}>
              <Text style={styles.contributorName}>
                Ditemukan oleh {gem.contributor.name}
              </Text>
              <Text style={styles.contributorBadge}>
                {gem.contributor.badge} • Diperbarui {gem.contributor.date}
              </Text>
            </View>
          </View>

          {/* Best Visiting Time Highlight */}
          <View style={styles.bestTimeCard}>
            <Feather name="sun" size={20} color={Colors.accent} />
            <View style={styles.bestTimeInfo}>
              <Text style={styles.bestTimeTitle}>Waktu Terbaik Berkunjung</Text>
              <Text style={styles.bestTimeDesc}>{gem.bestTime}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionHeader}>Cerita Destinasi</Text>
          <Text style={styles.descriptionText}>{gem.description}</Text>

          {/* Community Tips */}
          <Text style={styles.sectionHeader}>Tips Komunitas Penjelajah</Text>
          <View style={styles.tipsBox}>
            {gem.tips.map((tip, idx) => (
              <View key={idx} style={styles.tipItem}>
                <Ionicons name="bulb-outline" size={16} color={Colors.primary} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Local Etiquette */}
          <Text style={styles.sectionHeader}>Etika & Norma Adat Setempat</Text>
          <View style={styles.etiquetteBox}>
            {gem.etiquette.map((et, idx) => (
              <View key={idx} style={styles.etiquetteItem}>
                <MaterialCommunityIcons name="shield-outline" size={16} color={Colors.secondary} />
                <Text style={styles.etiquetteText}>{et}</Text>
              </View>
            ))}
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsHeaderRow}>
            <Text style={styles.sectionHeader}>
              Ulasan Pengguna ({gem.reviews.length})
            </Text>
            <Pressable
              onPress={() => setShowReviewModal(true)}
              style={styles.addReviewBtn}>
              <Feather name="edit-3" size={13} color={Colors.primary} />
              <Text style={styles.addReviewBtnText}>Tulis Ulasan</Text>
            </Pressable>
          </View>

          {gem.reviews.length > 0 ? (
            gem.reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewUserRow}>
                  <Image source={{ uri: rev.avatar }} style={styles.reviewAvatar} />
                  <View style={styles.reviewUserInfo}>
                    <Text style={styles.reviewUserName}>{rev.user}</Text>
                    <Text style={styles.reviewDate}>{rev.date}</Text>
                  </View>
                  <RatingStars rating={rev.rating} size={11} showText={false} />
                </View>
                <Text style={styles.reviewComment}>{rev.comment}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyReviewBox}>
              <Text style={styles.emptyReviewText}>
                Belum ada ulasan untuk destinasi ini. Jadilah yang pertama memberikan ulasan!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Write Review Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showReviewModal}
        onRequestClose={() => setShowReviewModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tulis Ulasan</Text>
              <Pressable onPress={() => setShowReviewModal(false)} hitSlop={8}>
                <Feather name="x" size={20} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.starPickerRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setNewRating(star)}
                  style={{ padding: 4 }}>
                  <Ionicons
                    name={star <= newRating ? 'star' : 'star-outline'}
                    size={32}
                    color={Colors.accent}
                  />
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Nama Anda</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nama penjelajah..."
              value={reviewerName}
              onChangeText={setReviewerName}
            />

            <Text style={styles.inputLabel}>Komentar & Pengalaman</Text>
            <TextInput
              style={[styles.modalInput, styles.modalArea]}
              placeholder="Ceritakan kondisi jalan, keindahan spot, keramahan warga..."
              multiline
              numberOfLines={4}
              value={newComment}
              onChangeText={setNewComment}
            />

            <Pressable onPress={handleSubmitReview} style={styles.submitReviewBtn}>
              <Text style={styles.submitReviewText}>Kirim Ulasan</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
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
  badgeRow: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
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
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  thumbList: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  thumbWrapper: {
    width: 60,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbSelected: {
    borderColor: Colors.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    marginBottom: 14,
  },
  contributorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  contributorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  contributorInfo: {
    flex: 1,
  },
  contributorName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  contributorBadge: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bestTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.accentLight,
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  bestTimeInfo: {
    flex: 1,
  },
  bestTimeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  bestTimeDesc: {
    fontSize: 13,
    color: '#78350F',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  tipsBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
  etiquetteBox: {
    backgroundColor: Colors.secondaryLight,
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    gap: 10,
  },
  etiquetteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  etiquetteText: {
    fontSize: 13,
    color: Colors.secondary,
    flex: 1,
    lineHeight: 18,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addReviewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  reviewDate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  reviewComment: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  emptyReviewBox: {
    padding: 20,
    alignItems: 'center',
  },
  emptyReviewText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Review Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  starPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.text,
    backgroundColor: Colors.surfaceSubtle,
    marginBottom: 14,
  },
  modalArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitReviewBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitReviewText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
