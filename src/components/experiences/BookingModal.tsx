import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Experience } from '../../types';
import { Colors } from '../../constants/Theme';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface BookingModalProps {
  visible: boolean;
  experience: Experience | null;
  onClose: () => void;
  onSuccess?: (bookingId: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  experience,
  onClose,
  onSuccess,
}) => {
  const { createBooking } = useApp();
  const { user, isAuthenticated } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>('Besok, 24 Okt');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');

  if (!experience) return null;

  const dates = [
    { label: 'Besok, 24 Okt', day: 'Kam', date: '24' },
    { label: 'Jumat, 25 Okt', day: 'Jum', date: '25' },
    { label: 'Sabtu, 26 Okt', day: 'Sab', date: '26' },
    { label: 'Minggu, 27 Okt', day: 'Min', date: '27' },
    { label: 'Senin, 28 Okt', day: 'Sen', date: '28' },
  ];

  const currentSlot = selectedSlot || experience.availableSlots[0];
  const totalPrice = experience.price * guestsCount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleConfirm = () => {
    const booking = createBooking(
      experience,
      selectedDate,
      currentSlot,
      guestsCount
    );
    setConfirmedBookingId(booking.id);
    setIsSuccess(true);

    if (onSuccess) {
      onSuccess(booking.id);
    }
  };

  const handleFinish = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          <View style={styles.dragIndicator} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTextCol}>
              <Text style={styles.sheetTitle}>Booking Pengalaman</Text>
              <Text style={styles.sheetSubtitle} numberOfLines={1}>
                {experience.title}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Feather name="x" size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {isSuccess ? (
            /* Success State */
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
              </View>
              <Text style={styles.successTitle}>Booking Berhasil Dikonfirmasi!</Text>
              <Text style={styles.successDesc}>
                Tiket dan rincian pemandu telah dikirim ke akun Anda. Pemandu{' '}
                <Text style={{ fontWeight: '700' }}>{experience.guide.name}</Text> akan
                menghubungi Anda sebelum jadwal dimulai.
              </Text>

              <View style={styles.receiptCard}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Kode Booking</Text>
                  <Text style={styles.receiptVal}>{confirmedBookingId}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Jadwal</Text>
                  <Text style={styles.receiptVal}>{selectedDate} • {currentSlot}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Peserta</Text>
                  <Text style={styles.receiptVal}>{guestsCount} Orang</Text>
                </View>
                <View style={[styles.receiptRow, styles.receiptRowTotal]}>
                  <Text style={styles.receiptTotalLabel}>Total Bayar</Text>
                  <Text style={styles.receiptTotalVal}>{formatPrice(totalPrice)}</Text>
                </View>
              </View>

              <Pressable onPress={handleFinish} style={styles.confirmBtn}>
                <Text style={styles.confirmBtnText}>Lihat di Riwayat Booking</Text>
              </Pressable>
            </View>
          ) : (
            /* Form State */
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Guide Info Pill */}
              <View style={styles.guideSnippet}>
                <MaterialCommunityIcons name="shield-check" size={18} color={Colors.secondary} />
                <Text style={styles.guideSnippetText}>
                  Didampingi langsung oleh{' '}
                  <Text style={{ fontWeight: '700', color: Colors.text }}>
                    {experience.guide.name}
                  </Text>{' '}
                  ({experience.guide.badge})
                </Text>
              </View>

              {/* 1. Pilih Tanggal */}
              <Text style={styles.sectionLabel}>1. Pilih Tanggal Wisata</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.datesRow}>
                {dates.map((d) => {
                  const isSelected = selectedDate === d.label;
                  return (
                    <Pressable
                      key={d.label}
                      onPress={() => setSelectedDate(d.label)}
                      style={[
                        styles.dateCard,
                        isSelected && styles.dateCardSelected,
                      ]}>
                      <Text
                        style={[
                          styles.dateDay,
                          isSelected && styles.dateTextSelected,
                        ]}>
                        {d.day}
                      </Text>
                      <Text
                        style={[
                          styles.dateNum,
                          isSelected && styles.dateTextSelected,
                        ]}>
                        {d.date}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* 2. Pilih Jam / Sesi */}
              <Text style={styles.sectionLabel}>2. Pilih Slot Waktu</Text>
              <View style={styles.slotsRow}>
                {experience.availableSlots.map((slot) => {
                  const isSelected = currentSlot === slot;
                  return (
                    <Pressable
                      key={slot}
                      onPress={() => setSelectedSlot(slot)}
                      style={[
                        styles.slotPill,
                        isSelected && styles.slotPillSelected,
                      ]}>
                      <Feather
                        name="clock"
                        size={14}
                        color={isSelected ? '#FFF' : Colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.slotText,
                          isSelected && styles.slotTextSelected,
                        ]}>
                        {slot}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* 3. Jumlah Peserta */}
              <Text style={styles.sectionLabel}>3. Jumlah Peserta</Text>
              <View style={styles.guestCounterCard}>
                <View>
                  <Text style={styles.guestTitle}>Peserta Lokal / Wisatawan</Text>
                  <Text style={styles.guestSub}>
                    Maksimal {experience.maxParticipants} orang per sesi
                  </Text>
                </View>
                <View style={styles.stepperRow}>
                  <Pressable
                    disabled={guestsCount <= 1}
                    onPress={() => setGuestsCount((prev) => Math.max(1, prev - 1))}
                    style={[
                      styles.stepBtn,
                      guestsCount <= 1 && styles.stepBtnDisabled,
                    ]}>
                    <Feather
                      name="minus"
                      size={16}
                      color={guestsCount <= 1 ? Colors.textMuted : Colors.text}
                    />
                  </Pressable>

                  <Text style={styles.stepNum}>{guestsCount}</Text>

                  <Pressable
                    disabled={guestsCount >= experience.maxParticipants}
                    onPress={() =>
                      setGuestsCount((prev) =>
                        Math.min(experience.maxParticipants, prev + 1)
                      )
                    }
                    style={[
                      styles.stepBtn,
                      guestsCount >= experience.maxParticipants &&
                        styles.stepBtnDisabled,
                    ]}>
                    <Feather
                      name="plus"
                      size={16}
                      color={
                        guestsCount >= experience.maxParticipants
                          ? Colors.textMuted
                          : Colors.text
                      }
                    />
                  </Pressable>
                </View>
              </View>

              {/* What's included preview */}
              <View style={styles.inclusionBox}>
                <Text style={styles.inclusionTitle}>Sudah Termasuk:</Text>
                {experience.included.slice(0, 3).map((item, idx) => (
                  <View key={idx} style={styles.inclusionItem}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.secondary} />
                    <Text style={styles.inclusionText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Traveler Account Card */}
              <View style={styles.travelerInfoCard}>
                <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.travelerNameText}>
                    {isAuthenticated && user ? user.name : 'Tamu LokalTrip'}
                  </Text>
                  <Text style={styles.travelerEmailText}>
                    {isAuthenticated && user ? user.email : 'Belum masuk akun (Mode Tamu)'}
                  </Text>
                </View>
                {isAuthenticated && (
                  <View style={styles.authVerifiedPill}>
                    <Text style={styles.authVerifiedText}>Akun Aktif</Text>
                  </View>
                )}
              </View>
              {/* Footer Summary & Action */}
              <View style={styles.footerSummary}>
                <View>
                  <Text style={styles.summaryLabel}>Total Pembayaran</Text>
                  <Text style={styles.summaryVal}>{formatPrice(totalPrice)}</Text>
                  <Text style={styles.summaryBreakdown}>
                    {guestsCount} x {formatPrice(experience.price)}
                  </Text>
                </View>

                <Pressable
                  onPress={handleConfirm}
                  style={({ pressed }) => [
                    styles.confirmBtn,
                    pressed && styles.btnPressed,
                  ]}>
                  <Text style={styles.confirmBtnText}>Konfirmasi</Text>
                  <Feather name="arrow-right" size={16} color="#FFF" />
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTextCol: {
    flex: 1,
    marginRight: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  guideSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  guideSnippetText: {
    fontSize: 12,
    color: Colors.secondary,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
    marginTop: 6,
  },
  datesRow: {
    gap: 10,
    paddingBottom: 14,
  },
  dateCard: {
    width: 64,
    height: 68,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  dateNum: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  dateTextSelected: {
    color: '#FFF',
  },
  slotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  slotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSubtle,
  },
  slotPillSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  slotText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  slotTextSelected: {
    color: '#FFF',
  },
  guestCounterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  guestSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepperRow: {
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
  inclusionBox: {
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFEBE4',
  },
  inclusionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  inclusionText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  travelerInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  travelerNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  travelerEmailText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  authVerifiedPill: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  authVerifiedText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.secondary,
  },
  footerSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  summaryVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  summaryBreakdown: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnPressed: {
    opacity: 0.85,
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Success State
  successContainer: {
    padding: 24,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  receiptRowTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
  receiptTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  receiptTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
});

export default BookingModal;
