import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/src/constants/Theme';
import { useApp } from '@/src/context/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import { Header } from '@/src/components/common/Header';
import { getFirebaseStatus } from '@/src/services/firebaseConfig';
import { GemCard } from '@/src/components/map/GemCard';
import { StorageManagerView } from '@/src/components/profile/StorageManagerView';

export default function ProfileScreen() {
  const { bookings, gems, savedGemIds } = useApp();
  const { user, isAuthenticated, logout, loginDemo, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'bookings' | 'saved' | 'storage' | 'firebase'>('bookings');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const savedGems = gems.filter((g) => savedGemIds.includes(g.id));
  const firebaseStatus = getFirebaseStatus();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleOpenEdit = () => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || '');
      setEditBio(user.bio || '');
      setIsEditModalOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Peringatan', 'Nama tidak boleh kosong.');
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await updateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        bio: editBio.trim(),
      });
      if (res.success) {
        setIsEditModalOpen(false);
        Alert.alert('Berhasil', 'Profil Anda berhasil diperbarui.');
      } else {
        Alert.alert('Gagal', res.message || 'Gagal menyimpan perubahan.');
      }
    } catch {
      Alert.alert('Gagal', 'Terjadi kesalahan sistem.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari akun Anda?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Keluar',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Profil Saya" showBack={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* State 1: Authenticated User */}
        {isAuthenticated && user ? (
          <>
            <View style={styles.userCard}>
              <Image
                source={{
                  uri:
                    user.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
                }}
                style={styles.userAvatar}
              />
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <MaterialCommunityIcons name="shield-check" size={16} color={Colors.primary} />
                </View>
                <Text style={styles.userEmail}>{user.email}</Text>
                {user.phone ? <Text style={styles.userPhone}>{user.phone}</Text> : null}
                <View style={styles.badgePill}>
                  <Ionicons name="compass" size={12} color={Colors.secondary} />
                  <Text style={styles.badgePillText}>
                    {user.badge || 'Penjelajah Budaya Nusantara'}
                  </Text>
                </View>
              </View>
            </View>

            {/* User Action Buttons (Edit Profile & Logout) */}
            <View style={styles.userActionsRow}>
              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={handleOpenEdit}
                activeOpacity={0.8}>
                <Feather name="edit-3" size={15} color={Colors.text} />
                <Text style={styles.actionBtnSecondaryText}>Edit Profil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtnDanger}
                onPress={handleLogout}
                activeOpacity={0.8}>
                <Feather name="log-out" size={15} color={Colors.danger} />
                <Text style={styles.actionBtnDangerText}>Keluar</Text>
              </TouchableOpacity>
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
                <Text style={styles.statVal}>{user.provider === 'firebase' ? 'Cloud' : 'Lokal'}</Text>
                <Text style={styles.statLbl}>Sesi Auth</Text>
              </View>
            </View>
          </>
        ) : (
          /* State 2: Guest / Logged Out */
          <View style={styles.guestCard}>
            <View style={styles.guestIconCircle}>
              <Ionicons name="person-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.guestTitle}>Selamat Datang di LokalTrip</Text>
            <Text style={styles.guestSubtitle}>
              Masuk atau buat akun untuk menyimpan destinasi rahasia favorit, reservasi lokakarya budaya, dan mengelola pesanan kriya Anda.
            </Text>

            <View style={styles.guestButtonsRow}>
              <TouchableOpacity
                style={styles.loginPrimaryBtn}
                onPress={() => router.push('/auth/login' as any)}
                activeOpacity={0.85}>
                <Feather name="log-in" size={16} color={Colors.surface} />
                <Text style={styles.loginPrimaryBtnText}>Masuk Akun</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerSecondaryBtn}
                onPress={() => router.push('/auth/register' as any)}
                activeOpacity={0.85}>
                <Feather name="user-plus" size={16} color={Colors.primary} />
                <Text style={styles.registerSecondaryBtnText}>Daftar Baru</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.guestDemoBtn}
              onPress={async () => {
                await loginDemo();
              }}
              activeOpacity={0.8}>
              <MaterialCommunityIcons name="lightning-bolt" size={16} color={Colors.accent} />
              <Text style={styles.guestDemoBtnText}>Masuk Cepat sebagai Demo (Arya Wibowo)</Text>
            </TouchableOpacity>
          </View>
        )}

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
            onPress={() => setActiveTab('storage')}
            style={[
              styles.switchBtn,
              activeTab === 'storage' && styles.switchBtnActive,
            ]}>
            <Text
              style={[
                styles.switchText,
                activeTab === 'storage' && styles.switchTextActive,
              ]}>
              Penyimpanan
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
              Status Auth & Cloud
            </Text>
          </Pressable>
        </View>

        {/* Tab 1: Bookings */}
        {activeTab === 'bookings' && (
          <View style={styles.sectionBody}>
            {bookings.length > 0 ? (
              bookings.map((b) => (
                <View key={b.id} style={styles.bookingCard}>
                  <View style={styles.bookingHeader}>
                    <View style={styles.bookingIdCol}>
                      <Text style={styles.bookingId}>ID: {b.id.toUpperCase()}</Text>
                      <Text style={styles.bookingDate}>Dipesan pada {b.createdAt}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{b.status}</Text>
                    </View>
                  </View>

                  <View style={styles.bookingMain}>
                    <Image source={{ uri: b.experienceImage }} style={styles.bookingImg} />
                    <View style={styles.bookingInfo}>
                      <Text style={styles.bookingTitle} numberOfLines={2}>
                        {b.experienceTitle}
                      </Text>
                      <View style={styles.bookingMetaRow}>
                        <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.bookingMetaText}>{b.date}</Text>
                      </View>
                      <View style={styles.bookingMetaRow}>
                        <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.bookingMetaText}>{b.timeSlot} WIB</Text>
                      </View>
                      <View style={styles.bookingMetaRow}>
                        <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
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

        {/* Tab 3: Storage Persistence Manager */}
        {activeTab === 'storage' && <StorageManagerView />}

        {/* Tab 4: Auth & Firebase Integration Status */}
        {activeTab === 'firebase' && (
          <View style={styles.sectionBody}>
            <View style={styles.firebaseCard}>
              <View style={styles.firebaseHeader}>
                <Ionicons name="logo-firebase" size={32} color="#FFA000" />
                <View style={styles.firebaseTitleCol}>
                  <Text style={styles.firebaseTitle}>Sistem Otentikasi & Firebase</Text>
                  <Text style={styles.firebaseStatusPill}>
                    {firebaseStatus.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.firebaseDesc}>
                LokalTrip mendukung otentikasi ganda: cloud sync via Firebase Authentication & Firestore, serta persistensi sesi lokal via AsyncStorage saat offline.
              </Text>

              {/* Current Auth Session Info */}
              <View style={styles.configInfoBox}>
                <Text style={styles.configInfoTitle}>Status Sesi Pengguna:</Text>
                <Text style={styles.configRow}>
                  • Status Login: <Text style={styles.codeText}>{isAuthenticated ? 'Sudah Masuk' : 'Tamu / Belum Masuk'}</Text>
                </Text>
                {user ? (
                  <>
                    <Text style={styles.configRow}>
                      • Nama Akun: <Text style={styles.codeText}>{user.name}</Text>
                    </Text>
                    <Text style={styles.configRow}>
                      • Email: <Text style={styles.codeText}>{user.email}</Text>
                    </Text>
                    <Text style={styles.configRow}>
                      • Provider: <Text style={styles.codeText}>{user.provider.toUpperCase()}</Text>
                    </Text>
                    <Text style={styles.configRow}>
                      • User ID: <Text style={styles.codeText}>{user.id}</Text>
                    </Text>
                  </>
                ) : null}
              </View>

              <View style={styles.configInfoBox}>
                <Text style={styles.configInfoTitle}>Konfigurasi Lingkungan (.env):</Text>
                <Text style={styles.configRow}>
                  • Project ID: <Text style={styles.codeText}>{firebaseStatus.projectId || 'demo-lokaltrip'}</Text>
                </Text>
                <Text style={styles.configRow}>
                  • Auth Domain: <Text style={styles.codeText}>EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN</Text>
                </Text>
                <Text style={styles.configRow}>
                  • Penyimpanan Sesi: <Text style={styles.codeText}>AsyncStorage & SecureStore Compatible</Text>
                </Text>
              </View>

              <View style={styles.firebaseTipBox}>
                <Feather name="info" size={16} color={Colors.ocean} />
                <Text style={styles.firebaseTipText}>
                  Saat Anda menambahkan Firebase API Key di file .env, aplikasi akan otomatis beralih ke sinkronisasi Firebase Cloud Auth tanpa perlu mengubah kode aplikasi.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profil</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Nama Lengkap</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Nama Lengkap"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Nomor Telepon / WhatsApp</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="0812-xxxx-xxxx"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Bio Singkat</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="Ceritakan tentang kecintaanmu pada budaya lokal"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditModalOpen(false)}>
                <Text style={styles.modalCancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, isSavingProfile && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}>
                {isSavingProfile ? (
                  <ActivityIndicator size="small" color={Colors.surface} />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
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
    marginBottom: 10,
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
  },
  userPhone: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
    marginBottom: 4,
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
    marginTop: 4,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
  },
  userActionsRow: {
    marginHorizontal: 20,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  actionBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  actionBtnDangerText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.danger,
  },
  guestCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  guestIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  guestSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  guestButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  loginPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginPrimaryBtnText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  registerSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingVertical: 12,
    borderRadius: 12,
  },
  registerSecondaryBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  guestDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
  },
  guestDemoBtnText: {
    fontSize: 12,
    color: Colors.earth,
    fontWeight: '600',
  },
  statsCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  statLbl: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
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
    color: Colors.primary,
    fontWeight: '800',
  },
  sectionBody: {
    marginHorizontal: 20,
    gap: 12,
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  bookingIdCol: {},
  bookingId: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
  },
  bookingDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
  },
  bookingMain: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  bookingImg: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  bookingInfo: {
    flex: 1,
    gap: 3,
  },
  bookingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  bookingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookingMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    gap: 4,
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  qrText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyState: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    gap: 12,
    marginBottom: 20,
  },
  modalInputGroup: {},
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.surface,
  },
});
