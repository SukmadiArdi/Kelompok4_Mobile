import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Theme';
import { useApp } from '@/src/context/AppContext';

export const StorageManagerView: React.FC = () => {
  const {
    cartCount,
    savedGemIds,
    favoriteProductIds,
    userPreferences,
    updateUserPreferences,
    userSession,
    securityPin,
    saveUserSession,
    clearUserSession,
    saveSecurityPin,
    clearLocalStorageData,
    clearSecureStorageData,
    storageSnapshot,
    refreshStorageSnapshot,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'local' | 'secure'>('local');
  const [showTokenSecret, setShowTokenSecret] = useState<boolean>(false);
  const [inputPin, setInputPin] = useState<string>('');
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  // Handle Save New PIN to Secure Storage
  const handleUpdatePin = async () => {
    if (!inputPin || inputPin.length < 4) {
      Alert.alert('PIN Tidak Valid', 'Masukkan minimal 4 digit angka PIN.');
      return;
    }
    const success = await saveSecurityPin(inputPin);
    if (success) {
      Alert.alert('🔒 Secure Store Berhasil', `PIN Keamanan baru (${inputPin}) berhasil disimpan terenkripsi di KeyStore/Keychain!`);
      setInputPin('');
    } else {
      Alert.alert('Gagal', 'Gagal menyimpan PIN ke Secure Storage.');
    }
  };

  // Handle Simulate Login & Save Token
  const handleSimulateLogin = async () => {
    const randomId = Math.floor(100000 + Math.random() * 900000);
    const mockSession = {
      userId: `usr_${randomId}`,
      email: `user.${randomId}@lokaltrip.id`,
      authToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_${randomId}_encrypted`,
      loginTimestamp: new Date().toLocaleTimeString('id-ID'),
      isBiometricEnabled: true,
    };
    const success = await saveUserSession(mockSession);
    if (success) {
      Alert.alert('🔒 Sesi Sensitif Disimpan', 'Auth Token JWT & Sesi Login baru berhasil disimpan secara terenkripsi!');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await clearUserSession();
    Alert.alert('🚪 Logout Selesai', 'Token Otentikasi dan data sesi sensitif telah dihapus dari Secure Storage.');
  };

  return (
    <View style={styles.container}>
      {/* Top Sub-Tab Switcher */}
      <View style={styles.subTabContainer}>
        <Pressable
          onPress={() => setActiveSubTab('local')}
          style={[styles.subTabBtn, activeSubTab === 'local' && styles.subTabBtnActive]}>
          <Ionicons
            name="hardware-chip-outline"
            size={16}
            color={activeSubTab === 'local' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.subTabText,
              activeSubTab === 'local' && styles.subTabTextActive,
            ]}>
            Local Storage (Biasa)
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveSubTab('secure')}
          style={[styles.subTabBtn, activeSubTab === 'secure' && styles.subTabBtnActive]}>
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={activeSubTab === 'secure' ? '#16A34A' : Colors.textSecondary}
          />
          <Text
            style={[
              styles.subTabText,
              activeSubTab === 'secure' && styles.subTabTextActiveSecure,
            ]}>
            Secure Storage (Enkripsi)
          </Text>
        </Pressable>
      </View>

      {/* LOCAL STORAGE SECTION */}
      {activeSubTab === 'local' && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircleLocal}>
              <Ionicons name="archive-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.headerTitleCol}>
              <Text style={styles.cardTitle}>Local Storage (Data Perangkat)</Text>
              <Text style={styles.cardBadgeLocal}>@react-native-async-storage/async-storage</Text>
            </View>
          </View>

          <Text style={styles.description}>
            Local Storage digunakan untuk menyimpan data aplikasi non-sensitif yang terus bertahan
            (persistent) saat aplikasi ditutup atau di-restart.
          </Text>

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{cartCount}</Text>
              <Text style={styles.metricLbl}>Item Keranjang</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{savedGemIds.length}</Text>
              <Text style={styles.metricLbl}>Gems Disimpan</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{favoriteProductIds.length}</Text>
              <Text style={styles.metricLbl}>Favorit Produk</Text>
            </View>
          </View>

          {/* Preference Toggles (Interactive Local Storage) */}
          <Text style={styles.sectionHeading}>Pengaturan Local (User Preferences):</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Mode Gelap / Tema</Text>
              <Text style={styles.settingSub}>Simpan mode tampilan ke local storage</Text>
            </View>
            <Switch
              value={userPreferences.theme === 'dark'}
              onValueChange={(val) =>
                updateUserPreferences({ theme: val ? 'dark' : 'light' })
              }
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={userPreferences.theme === 'dark' ? Colors.primary : '#fff'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Notifikasi Promo & Trip</Text>
              <Text style={styles.settingSub}>Status izin notifikasi lokal</Text>
            </View>
            <Switch
              value={userPreferences.notificationsEnabled}
              onValueChange={(val) =>
                updateUserPreferences({ notificationsEnabled: val })
              }
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={userPreferences.notificationsEnabled ? Colors.primary : '#fff'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Mode Hemat Data / Offline Cache</Text>
              <Text style={styles.settingSub}>Cache offline destinasi rahasia</Text>
            </View>
            <Switch
              value={userPreferences.offlineMode}
              onValueChange={(val) => updateUserPreferences({ offlineMode: val })}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={userPreferences.offlineMode ? Colors.primary : '#fff'}
            />
          </View>

          {/* Action Buttons for Local Storage */}
          <View style={styles.btnRow}>
            <Pressable
              style={styles.actionBtnOutline}
              onPress={async () => {
                await refreshStorageSnapshot();
                setShowRawJson(!showRawJson);
              }}>
              <Feather name="code" size={14} color={Colors.primary} />
              <Text style={styles.actionBtnOutlineText}>
                {showRawJson ? 'Sembunyikan JSON' : 'Inspeksi Raw JSON'}
              </Text>
            </Pressable>

            <Pressable style={styles.actionBtnDanger} onPress={clearLocalStorageData}>
              <Ionicons name="trash-outline" size={14} color="#DC2626" />
              <Text style={styles.actionBtnDangerText}>Hapus Local Data</Text>
            </Pressable>
          </View>

          {/* Raw JSON View */}
          {showRawJson && (
            <View style={styles.jsonBox}>
              <Text style={styles.jsonTitle}>📄 Data AsyncStorage Snapshot:</Text>
              <Text style={styles.jsonCode}>
                {JSON.stringify(storageSnapshot.local, null, 2)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* SECURE STORAGE SECTION */}
      {activeSubTab === 'secure' && (
        <View style={styles.cardSecure}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircleSecure}>
              <Ionicons name="shield-checkmark" size={22} color="#16A34A" />
            </View>
            <View style={styles.headerTitleCol}>
              <Text style={styles.cardTitle}>Secure Storage (Data Terenkripsi)</Text>
              <Text style={styles.cardBadgeSecure}>expo-secure-store (KeyStore / Keychain)</Text>
            </View>
          </View>

          {/* Security Banner */}
          <View style={styles.secureBanner}>
            <MaterialCommunityIcons name="security" size={20} color="#15803D" />
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>Perlindungan Kriptografi Hardware-Backed</Text>
              <Text style={styles.bannerDesc}>
                Data sensitif dienkripsi secara hardware (Android KeyStore / iOS Keychain) sehingga
                tidak dapat dibaca dalam bentuk plaintext oleh aplikasi lain atau malware.
              </Text>
            </View>
          </View>

          {/* Active Encrypted Session Info */}
          <Text style={styles.sectionHeading}>Sesi Sensitif Terenkripsi:</Text>
          {userSession ? (
            <View style={styles.sessionBox}>
              <View style={styles.sessionRow}>
                <Text style={styles.sessionKey}>Email User:</Text>
                <Text style={styles.sessionVal}>{userSession.email}</Text>
              </View>

              <View style={styles.sessionRow}>
                <Text style={styles.sessionKey}>Auth Token (JWT):</Text>
                <View style={styles.tokenRow}>
                  <Text style={styles.tokenVal} numberOfLines={1}>
                    {showTokenSecret
                      ? userSession.authToken
                      : '••••••••••••••••••••••••••••••••'}
                  </Text>
                  <Pressable onPress={() => setShowTokenSecret(!showTokenSecret)}>
                    <Ionicons
                      name={showTokenSecret ? 'eye-off-outline' : 'eye-outline'}
                      size={16}
                      color={Colors.primary}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.sessionRow}>
                <Text style={styles.sessionKey}>Waktu Login:</Text>
                <Text style={styles.sessionVal}>{userSession.loginTimestamp}</Text>
              </View>

              <View style={styles.sessionRow}>
                <Text style={styles.sessionKey}>Status Biometrik:</Text>
                <View style={styles.badgeSuccess}>
                  <Ionicons name="finger-print" size={12} color="#15803D" />
                  <Text style={styles.badgeSuccessText}>Aktif (FaceID / Fingerprint)</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptySessionBox}>
              <Ionicons name="lock-closed" size={32} color={Colors.textMuted} />
              <Text style={styles.emptySessionText}>Belum Ada Sesi Sensitif Tersimpan</Text>
            </View>
          )}

          {/* Security PIN Editor */}
          <Text style={styles.sectionHeading}>PIN Keamanan Transaksi (Terenkripsi):</Text>
          <View style={styles.pinCard}>
            <View style={styles.pinHeaderRow}>
              <Ionicons name="keypad-outline" size={18} color={Colors.primary} />
              <Text style={styles.pinLabel}>
                PIN Terkini di KeyStore: <Text style={styles.pinValText}>{securityPin ? '•••••• (Tersimpan)' : 'Belum Ada'}</Text>
              </Text>
            </View>

            <View style={styles.pinInputRow}>
              <TextInput
                style={styles.pinInput}
                placeholder="Masukkan PIN Baru (misal: 123456)"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                value={inputPin}
                onChangeText={setInputPin}
              />
              <Pressable style={styles.pinSaveBtn} onPress={handleUpdatePin}>
                <Text style={styles.pinSaveBtnText}>Simpan PIN</Text>
              </Pressable>
            </View>
          </View>

          {/* Secure Storage Actions */}
          <View style={styles.actionBtnGrid}>
            <Pressable style={styles.btnPrimary} onPress={handleSimulateLogin}>
              <Ionicons name="refresh-circle-outline" size={16} color="#fff" />
              <Text style={styles.btnPrimaryText}>Simulasi Refresh Token</Text>
            </Pressable>

            <Pressable style={styles.btnWarning} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={16} color="#B45309" />
              <Text style={styles.btnWarningText}>Logout (Hapus Token)</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.actionBtnDanger, { marginTop: 10 }]}
            onPress={clearSecureStorageData}>
            <Ionicons name="shield-outline" size={16} color="#DC2626" />
            <Text style={styles.actionBtnDangerText}>Hapus Semua Data Secure Storage</Text>
          </Pressable>

          {/* Raw Secure Storage Inspection */}
          <Pressable
            style={[styles.actionBtnOutline, { marginTop: 12 }]}
            onPress={async () => {
              await refreshStorageSnapshot();
              setShowRawJson(!showRawJson);
            }}>
            <Feather name="shield" size={14} color="#16A34A" />
            <Text style={[styles.actionBtnOutlineText, { color: '#16A34A' }]}>
              {showRawJson ? 'Tutup Secure Key Inspector' : 'Inspeksi Secure Store Keys'}
            </Text>
          </Pressable>

          {showRawJson && (
            <View style={styles.jsonBoxSecure}>
              <Text style={styles.jsonTitleSecure}>🔒 Encrypted SecureStore Keys:</Text>
              <Text style={styles.jsonCode}>
                {JSON.stringify(storageSnapshot.secure, null, 2)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  subTabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  subTabBtnActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  subTabTextActive: {
    fontWeight: '700',
    color: Colors.primary,
  },
  subTabTextActiveSecure: {
    fontWeight: '700',
    color: '#16A34A',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardSecure: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconCircleLocal: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSecure: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  cardBadgeLocal: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  cardBadgeSecure: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  metricLbl: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  settingSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  actionBtnOutlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionBtnDanger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  actionBtnDangerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  jsonBox: {
    marginTop: 14,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
  },
  jsonBoxSecure: {
    marginTop: 14,
    backgroundColor: '#064E3B',
    borderRadius: 12,
    padding: 12,
  },
  jsonTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
  },
  jsonTitleSecure: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A7F3D0',
    marginBottom: 6,
  },
  jsonCode: {
    fontSize: 10,
    color: '#F1F5F9',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 14,
  },

  // SECURE STORAGE SPECIFIC STYLES
  secureBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  bannerDesc: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 15,
    marginTop: 3,
  },
  sessionBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  emptySessionBox: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    marginBottom: 12,
  },
  emptySessionText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionKey: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sessionVal: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
    paddingLeft: 10,
  },
  tokenVal: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    maxWidth: 160,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeSuccessText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  pinCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  pinHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  pinLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  pinValText: {
    fontWeight: '700',
    color: Colors.text,
  },
  pinInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pinInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.text,
  },
  pinSaveBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 10,
  },
  pinSaveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  actionBtnGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnPrimaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  btnWarning: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnWarningText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
});
