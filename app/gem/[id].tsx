import React, { useState, useEffect } from 'react';
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
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Theme';
import { useApp } from '@/src/context/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import { RatingStars } from '@/src/components/common/RatingStars';
import { openDirections, formatCoordinatesDMS } from '@/src/utils/mapUtils';
import { imagePickerService } from '@/src/services/imagePickerService';
import { hybridStorageService } from '@/src/services/hybridStorageService';
import { ImageSourcePickerModal } from '@/src/components/common/ImageSourcePickerModal';

export default function GemDetailScreen() {
  const { id } = useLocalSearchParams();
  const { gems, savedGemIds, toggleBookmarkGem, addGemReview, isOnline } = useApp();
  const { user } = useAuth();

  const gem = gems.find((g) => g.id === id) || gems[0];
  const isBookmarked = savedGemIds.includes(gem.id);

  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState<{ uri: string; base64?: string } | null>(null);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
      }
    }, 50);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [id]);

  // Navigasi kembali dengan canGoBack
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/map');
    }
  };

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

  const handleOpenReviewModal = () => {
    if (user && !reviewerName) {
      setReviewerName(user.name);
    }
    setShowReviewModal(true);
  };

  const handlePickReviewPhotoCamera = async () => {
    const res = await imagePickerService.takePhotoFromCamera({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      includeBase64: true,
    });
    if (!res.canceled && res.uri) {
      setReviewPhoto({ uri: res.uri, base64: res.base64 });
    }
  };

  const handlePickReviewPhotoGallery = async () => {
    const res = await imagePickerService.pickImageFromGallery({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      includeBase64: true,
    });
    if (!res.canceled && res.uri) {
      setReviewPhoto({ uri: res.uri, base64: res.base64 });
    }
  };

  const handleSubmitReview = async () => {
    if (!isOnline) {
      Alert.alert(
        'Perangkat Offline',
        'Koneksi internet diperlukan untuk memproses pengiriman ulasan & foto. Silakan hubungkan kembali internet Anda.'
      );
      return;
    }

    if (!newComment.trim()) {
      Alert.alert('Peringatan', 'Komentar ulasan wajib diisi.');
      return;
    }

    setIsSubmittingReview(true);
    let uploadedPhotos: string[] = [];

    try {
      if (reviewPhoto) {
        const uploadRes = await hybridStorageService.uploadImage({
          uri: reviewPhoto.uri,
          base64: reviewPhoto.base64,
          folder: 'reviews',
          fileName: `visit_${gem.id}_${Date.now()}.jpg`,
        });
        if (uploadRes.success && uploadRes.url) {
          uploadedPhotos.push(uploadRes.url);
        }
      }

      addGemReview(gem.id, {
        user: reviewerName.trim() || user?.name || 'Penjelajah LokalTrip',
        avatar:
          user?.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        rating: newRating,
        comment: newComment.trim(),
        photos: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
      });

      setNewComment('');
      setReviewPhoto(null);
      setShowReviewModal(false);

      if (uploadedPhotos.length > 0) {
        Alert.alert(
          'Ulasan & Foto Berhasil Dikirim',
          'Bukti kunjungan Anda berhasil diverifikasi dan tersimpan di penyimpanan!'
        );
      }
    } catch (err: any) {
      console.error('Error saat submit review:', err);
      Alert.alert('Gagal', 'Terjadi kesalahan saat memposting ulasan.');
    } finally {
      setIsSubmittingReview(false);
    }
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
            {/* Tombol kembali */}
            <Pressable
              onPress={handleBack}
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

          {/* Location & GPS Navigation Card */}
          <View style={styles.locationMapCard}>
            <View style={styles.locationCardHeader}>
              <View style={styles.locationIconBox}>
                <Ionicons name="location-sharp" size={20} color={Colors.primary} />
              </View>
              <View style={styles.locationHeaderText}>
                <Text style={styles.locationCardTitle}>Titik Koordinat & Akses GPS</Text>
                <Text style={styles.locationCardCoords}>
                  🌐 {formatCoordinatesDMS(gem.mapCoords.lat, gem.mapCoords.lng)}
                </Text>
              </View>
            </View>

            <Text style={styles.locationCardAddress}>
              {gem.location}, {gem.city}, {gem.province}
            </Text>

            <View style={styles.locationBtnRow}>
              <Pressable
                onPress={() => openDirections(gem.mapCoords.lat, gem.mapCoords.lng, gem.name)}
                style={styles.openMapsBtn}>
                <Ionicons name="navigate" size={15} color="#FFF" />
                <Text style={styles.openMapsBtnText}>Buka Petunjuk Arah (Google Maps)</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/(tabs)/map')}
                style={styles.openInAppMapBtn}>
                <Ionicons name="map-outline" size={15} color={Colors.secondary} />
                <Text style={styles.openInAppMapBtnText}>Buka di Hidden Gems Map</Text>
              </Pressable>
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
              onPress={handleOpenReviewModal}
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

                {/* Proof of Visit Photos */}
                {rev.photos && rev.photos.length > 0 && (
                  <View style={styles.reviewPhotosContainer}>
                    <View style={styles.verifiedProofBadge}>
                      <Ionicons name="camera-reverse" size={12} color="#059669" />
                      <Text style={styles.verifiedProofBadgeText}>Bukti Kunjungan Terverifikasi</Text>
                    </View>
                    <View style={styles.reviewPhotosRow}>
                      {rev.photos.map((photoUrl, photoIdx) => (
                        <TouchableOpacity
                          key={photoIdx}
                          onPress={() => setPreviewPhotoUrl(photoUrl)}
                          activeOpacity={0.8}
                          style={styles.reviewPhotoThumbWrapper}>
                          <Image source={{ uri: photoUrl }} style={styles.reviewPhotoThumb} />
                          <View style={styles.zoomIconBadge}>
                            <Ionicons name="scan-outline" size={11} color="#FFF" />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
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

            {/* Proof of Visit Attachment */}
            <Text style={styles.inputLabel}>Bukti Kunjungan / Foto Spot (Opsional)</Text>
            {reviewPhoto ? (
              <View style={styles.photoPreviewCard}>
                <Image source={{ uri: reviewPhoto.uri }} style={styles.photoPreviewImage} />
                <View style={styles.photoPreviewMeta}>
                  <View style={styles.photoReadyBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#059669" />
                    <Text style={styles.photoReadyText}>Foto Kunjungan Terlampir</Text>
                  </View>
                  <Text style={styles.photoNoticeText}>
                    Tersimpan via Hybrid Supabase / Local Storage
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => setReviewPhoto(null)}
                  disabled={isSubmittingReview}
                  hitSlop={8}>
                  <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addPhotoCardBtn}
                onPress={() => setIsPhotoPickerOpen(true)}
                disabled={isSubmittingReview}
                activeOpacity={0.75}>
                <View style={styles.addPhotoIconCircle}>
                  <Ionicons name="camera-outline" size={20} color={Colors.primary} />
                </View>
                <View style={styles.addPhotoTextCol}>
                  <Text style={styles.addPhotoBtnTitle}>Ambil / Unggah Foto Kunjungan</Text>
                  <Text style={styles.addPhotoBtnSub}>Jepret langsung via kamera atau ambil dari galeri</Text>
                </View>
                <Feather name="plus" size={18} color={Colors.primary} />
              </TouchableOpacity>
            )}

            <Pressable
              onPress={handleSubmitReview}
              style={[
                styles.submitReviewBtn,
                !isOnline && styles.submitReviewBtnDisabled,
                isSubmittingReview && { opacity: 0.7 },
              ]}
              disabled={isSubmittingReview}>
              {isSubmittingReview ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons
                    name={isOnline ? 'send-outline' : 'cloud-offline-outline'}
                    size={16}
                    color="#FFF"
                  />
                  <Text style={styles.submitReviewText}>
                    {isOnline ? 'Kirim Ulasan' : 'Offline - Butuh Koneksi Internet'}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Review Image Source Picker Modal */}
      <ImageSourcePickerModal
        visible={isPhotoPickerOpen}
        onClose={() => setIsPhotoPickerOpen(false)}
        onSelectCamera={handlePickReviewPhotoCamera}
        onSelectGallery={handlePickReviewPhotoGallery}
        title="Unggah Bukti Kunjungan"
        subtitle="Ambil foto pemandangan di lokasi via kamera atau pilih foto dari galeri"
      />

      {/* Fullscreen Photo Zoom Modal */}
      <Modal
        visible={!!previewPhotoUrl}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewPhotoUrl(null)}>
        <View style={styles.fullscreenBackdrop}>
          <TouchableOpacity
            style={styles.closeFullscreenBtn}
            onPress={() => setPreviewPhotoUrl(null)}
            hitSlop={10}>
            <Feather name="x" size={24} color="#FFF" />
          </TouchableOpacity>
          {previewPhotoUrl && (
            <Image
              source={{ uri: previewPhotoUrl }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
          <View style={styles.fullscreenBottomBar}>
            <Ionicons name="shield-checkmark" size={16} color="#34D399" />
            <Text style={styles.fullscreenBottomText}>Bukti Kunjungan Terverifikasi Komunitas</Text>
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
  locationMapCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    elevation: 2,
  },
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  locationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationHeaderText: {
    flex: 1,
  },
  locationCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  locationCardCoords: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  locationCardAddress: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 18,
  },
  locationBtnRow: {
    flexDirection: 'column',
    gap: 8,
  },
  openMapsBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  openMapsBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  openInAppMapBtn: {
    backgroundColor: Colors.secondaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(27, 73, 49, 0.2)',
  },
  openInAppMapBtnText: {
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: '700',
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
  submitReviewBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitReviewText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Proof of Visit styles
  reviewPhotosContainer: {
    marginTop: 10,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  verifiedProofBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  verifiedProofBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  reviewPhotosRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  reviewPhotoThumbWrapper: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  reviewPhotoThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  zoomIconBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    padding: 2,
  },

  // Modal Attachment styles
  photoPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    gap: 12,
  },
  photoPreviewImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  photoPreviewMeta: {
    flex: 1,
  },
  photoReadyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  photoReadyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  photoNoticeText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  removePhotoBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  addPhotoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoTextCol: {
    flex: 1,
  },
  addPhotoBtnTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  addPhotoBtnSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  // Fullscreen Preview styles
  fullscreenBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFullscreenBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 25,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: '90%',
    height: '70%',
  },
  fullscreenBottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fullscreenBottomText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
