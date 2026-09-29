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
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/src/constants/Theme';
import { useApp } from '@/src/context/AppContext';
import { Header } from '@/src/components/common/Header';
import { getFirebaseStatus } from '@/src/services/firebaseConfig';
import { GemCard } from '@/src/components/map/GemCard';

export default function ProfileScreen() {
  const { bookings, gems, savedGemIds } = useApp();
  const [activeTab, setActiveTab] = useState<'bookings' | 'saved' | 'firebase'>('bookings');

  const savedGems = gems.filter((g) => savedGemIds.includes(g.id));
  const firebaseStatus = getFirebaseStatus();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Profil Saya" showBack={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
            }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>Arya Wibowo</Text>
              <MaterialCommunityIcons name="shield-check" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.userEmail}>arya.wibowo@lokaltrip.id</Text>
            <View style={styles.badgePill}>
              <Ionicons name="compass" size={12} color={Colors.secondary} />
              <Text style={styles.badgePillText}>Penjelajah Budaya Nusantara</Text>
            </View>
          </View>
        </View>

        {/* User Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{bookings.length}</Text>
            <Text style={styles.statLbl}>Booking Aktif</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{savedGemIds.length}</Text>
            <Text style={styles.statLbl}>Gems Disimpan</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>3</Text>
            <Text style={styles.statLbl}>Ulasan Dibuat</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <Pressable
            onPress={() => setActiveTab('bookings')}
            style={[
              styles.switchBtn,
              activeTab === 'bookings' && styles.switchBtnActive,
            ]}>
            <Text
              style={[
                styles.switchText,
                activeTab === 'bookings' && styles.switchTextActive,
              ]}>
              Riwayat Booking ({bookings.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('saved')}
            style={[
              styles.switchBtn,
              activeTab === 'saved' && styles.switchBtnActive,
            ]}>
            <Text
              style={[
                styles.switchText,
                activeTab === 'saved' && styles.switchTextActive,
              ]}>
              Tersimpan ({savedGems.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('firebase')}
            style={[
              styles.switchBtn,
              activeTab === 'firebase' && styles.switchBtnActive,
            ]}>
            <Text
              style={[
                styles.switchText,
                activeTab === 'firebase' && styles.switchTextActive,
              ]}>
              Firebase Status
            </Text>
          </Pressable>
        </View>

        {/* Tab 1: Bookings List */}
        {activeTab === 'bookings' && (
          <View style={styles.sectionBody}>
            {bookings.length > 0 ? (
              bookings.map((b) => (
                <View key={b.id} style={styles.bookingCard}>
                  <View style={styles.bookingHeader}>
                    <View style={styles.statusPill}>
                      <Ionicons name="checkmark-circle" size={14} color={Colors.secondary} />
                      <Text style={styles.statusText}>{b.status}</Text>
                    </View>
                    <Text style={styles.bookingId}>#{b.id.slice(-6)}</Text>
                  </View>

                  <View style={styles.bookingBody}>
                    <Image source={{ uri: b.experienceImage }} style={styles.bookingImage} />
                    <View style={styles.bookingDetails}>
                      <Text style={styles.bookingTitle} numberOfLines={2}>
                        {b.experienceTitle}
                      </Text>
                      <View style={styles.bookingMetaRow}>
                        <Ionicons name="calendar-outline" size={12} color={Colors.primary} />
                        <Text style={styles.bookingMetaText}>
                          {b.date} • {b.timeSlot}
                        </Text>
                      </View>
                      <View style={styles.bookingMetaRow}>
                        <Ionicons name="person-outline" size={12} color={Colors.textSecondary} />
                        <Text style={styles.bookingMetaText}>
                          {b.guestsCount} Peserta (Pemandu: {b.guideName})
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.bookingFooter}>
                    <View>
                      <Text style={styles.totalPriceLabel}>Total Pembayaran</Text>
                      <Text style={styles.totalPriceVal}>{formatPrice(b.totalPrice)}</Text>
                    </View>

                    <View style={styles.qrSimulator}>
                      <MaterialCommunityIcons name="qrcode" size={24} color={Colors.text} />
                      <Text style={styles.qrText}>E-Tiket Siap</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>Belum ada riwayat booking</Text>
                <Text style={styles.emptySubtitle}>
                  Jelajahi tur dan lokakarya budaya di tab Booking.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Tab 2: Saved Hidden Gems */}
        {activeTab === 'saved' && (
          <View style={styles.sectionBody}>
            {savedGems.length > 0 ? (
              savedGems.map((gem) => <GemCard key={gem.id} gem={gem} />)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="bookmark-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>Belum ada permata tersimpan</Text>
                <Text style={styles.emptySubtitle}>
                  Klik ikon bookmark pada destinasi rahasia untuk menyimpannya di sini.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Tab 3: Firebase Integration Status */}
        {activeTab === 'firebase' && (
          <View style={styles.sectionBody}>
            <View style={styles.firebaseCard}>
              <View style={styles.firebaseHeader}>
                <Ionicons name="logo-firebase" size={32} color="#FFA000" />
                <View style={styles.firebaseTitleCol}>
                  <Text style={styles.firebaseTitle}>Integrasi Firebase</Text>
                  <Text style={styles.firebaseStatusPill}>
                    {firebaseStatus.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.firebaseDesc}>
                Arsitektur backend LokalTrip telah disiapkan dengan Firebase SDK (Firestore,
                Authentication, dan Cloud Storage).
              </Text>

              <View style={styles.configInfoBox}>
                <Text style={styles.configInfoTitle}>Konfigurasi Aktif:</Text>
                <Text style={styles.configRow}>
                  • Project ID: <Text style={styles.codeText}>{firebaseStatus.projectId}</Text>
                </Text>
                <Text style={styles.configRow}>
                  • Penyimpanan Data: <Text style={styles.codeText}>Local Reactive Mock Store</Text>
                </Text>
                <Text style={styles.configRow}>
                  • Status Env: <Text style={styles.codeText}>EXPO_PUBLIC_FIREBASE_* Ready</Text>
                </Text>
              </View>

              <View style={styles.firebaseTipBox}>
                <Feather name="info" size={16} color={Colors.ocean} />
                <Text style={styles.firebaseTipText}>
                  Saat Anda menambahkan Firebase API Key di file .env, aplikasi akan
                  otomatis beralih ke sinkronisasi Cloud Firestore tanpa mengubah kode UI.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  userCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
  },
  statsCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLbl: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    marginHorizontal: 20,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  switchBtnActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  switchText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  switchTextActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  sectionBody: {
    paddingTop: 4,
  },
  bookingCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
  },
  bookingId: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  bookingBody: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  bookingImage: {
    width: 68,
    height: 68,
    borderRadius: 10,
  },
  bookingDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  bookingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 18,
    marginBottom: 4,
  },
  bookingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  bookingMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  bookingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  totalPriceLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  totalPriceVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  qrSimulator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  qrText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  firebaseCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  firebaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  firebaseTitleCol: {
    flex: 1,
  },
  firebaseTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  firebaseStatusPill: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 2,
  },
  firebaseDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  configInfoBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  configInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  configRow: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  codeText: {
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  firebaseTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.oceanLight,
    padding: 12,
    borderRadius: 12,
  },
  firebaseTipText: {
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 16,
    flex: 1,
  },
});
