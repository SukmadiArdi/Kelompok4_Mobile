import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Theme';
import { usePushNotification } from '../../hooks/usePushNotification';
import { useAuth } from '../../context/AuthContext';

export const DeviceNotificationView: React.FC = () => {
  const { user } = useAuth();
  const {
    pushToken,
    permission,
    isRegistered,
    isLoading,
    error,
    deviceInfo,
    requestPermissionAndRegister,
    refreshStatus,
    resetRegistration,
  } = usePushNotification();

  const [copied, setCopied] = useState(false);

  const handleCopyToken = () => {
    if (!pushToken) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    Alert.alert(
      'Push Token Disalin! 📋',
      `Token Expo Push Anda:\n\n${pushToken}\n\nGunakan token ini di server/Postman untuk mengirimkan push notification pada Task 02.`
    );
  };

  const getPermissionLabel = () => {
    if (!permission) return { text: 'Belum Diperiksa', color: Colors.warning, bg: Colors.warningLight };
    if (permission.granted) return { text: 'Diizinkan (Granted)', color: Colors.success, bg: Colors.successLight };
    return { text: 'Ditolak (Denied)', color: Colors.danger, bg: Colors.dangerLight };
  };

  const permLabel = getPermissionLabel();

  return (
    <View style={styles.container}>
      {/* 1. Header Card Task 01 */}
      <View style={styles.mainCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications" size={24} color={Colors.primary} />
          </View>
          <View style={styles.cardHeaderTexts}>
            <View style={styles.badgeRow}>
              <View style={styles.weekBadge}>
                <Text style={styles.weekBadgeText}>WEEK 11</Text>
              </View>
              <View style={styles.taskBadge}>
                <Text style={styles.taskBadgeText}>TASK 01</Text>
              </View>
            </View>
            <Text style={styles.mainTitle}>Register Device for Notification</Text>
            <Text style={styles.mainSubtitle}>
              Mendaftarkan identitas perangkat ke server untuk target pengiriman Push Notification.
            </Text>
          </View>
        </View>

        {/* 2. Visual Pipeline 5-Langkah (Sesuai Slide 12) */}
        <View style={styles.pipelineCard}>
          <Text style={styles.pipelineTitle}>Alur Pengerjaan Task 01:</Text>
          <View style={styles.pipelineFlow}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <MaterialCommunityIcons name="cellphone" size={16} color="#FFF" />
              </View>
              <Text style={styles.stepText}>1. App</Text>
            </View>
            <View style={styles.stepLine} />

            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  permission?.granted ? styles.stepCircleActive : styles.stepCirclePending,
                ]}>
                <Ionicons name="shield-checkmark" size={14} color="#FFF" />
              </View>
              <Text style={styles.stepText}>2. Permission</Text>
            </View>
            <View style={styles.stepLine} />

            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  deviceInfo ? styles.stepCircleActive : styles.stepCirclePending,
                ]}>
                <Ionicons name="phone-portrait" size={14} color="#FFF" />
              </View>
              <Text style={styles.stepText}>3. Register</Text>
            </View>
            <View style={styles.stepLine} />

            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  pushToken ? styles.stepCircleActive : styles.stepCirclePending,
                ]}>
                <MaterialCommunityIcons name="key-variant" size={14} color="#FFF" />
              </View>
              <Text style={styles.stepText}>4. Token</Text>
            </View>
            <View style={styles.stepLine} />

            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isRegistered ? styles.stepCircleActive : styles.stepCirclePending,
                ]}>
                <Ionicons name="cloud-upload" size={14} color="#FFF" />
              </View>
              <Text style={styles.stepText}>5. Server</Text>
            </View>
          </View>
        </View>

        {/* 3. Status Ringkasan Perangkat */}
        <View style={styles.statusBox}>
          {/* Permission Row */}
          <View style={styles.statusRow}>
            <View style={styles.statusLabelGroup}>
              <Ionicons name="notifications-circle-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.statusLabel}>Izin Notifikasi OS:</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: permLabel.bg }]}>
              <Text style={[styles.statusBadgeText, { color: permLabel.color }]}>
                {permLabel.text}
              </Text>
            </View>
          </View>

          {/* Device Registration Row */}
          <View style={styles.statusRow}>
            <View style={styles.statusLabelGroup}>
              <Ionicons name="hardware-chip-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.statusLabel}>Status Registrasi:</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isRegistered ? Colors.successLight : Colors.warningLight,
                },
              ]}>
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: isRegistered ? Colors.success : Colors.warning },
                ]}>
                {isRegistered ? 'Terdaftar di Server' : 'Belum Terdaftar'}
              </Text>
            </View>
          </View>

          {/* Server Sync Row */}
          <View style={styles.statusRow}>
            <View style={styles.statusLabelGroup}>
              <Ionicons name="cloud-done-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.statusLabel}>Target Database:</Text>
            </View>
            <Text style={styles.statusValue}>
              {deviceInfo?.syncedWithServer ? 'Supabase user_devices ☁️' : 'Local Persistence & Cache 📱'}
            </Text>
          </View>

          {/* Linked User Account */}
          <View style={styles.statusRow}>
            <View style={styles.statusLabelGroup}>
              <Feather name="user" size={16} color={Colors.textSecondary} />
              <Text style={styles.statusLabel}>Akun Terhubung:</Text>
            </View>
            <Text style={styles.statusValue}>
              {user ? `${user.name} (${user.email})` : 'Tamu (Guest Device)'}
            </Text>
          </View>

          {/* Device Platform & Model */}
          {deviceInfo ? (
            <>
              <View style={styles.statusRow}>
                <View style={styles.statusLabelGroup}>
                  <Ionicons name="phone-portrait-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.statusLabel}>Model Perangkat:</Text>
                </View>
                <Text style={styles.statusValue}>
                  {deviceInfo.deviceName} ({deviceInfo.platform.toUpperCase()})
                </Text>
              </View>

              <View style={styles.statusRow}>
                <View style={styles.statusLabelGroup}>
                  <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.statusLabel}>Waktu Terdaftar:</Text>
                </View>
                <Text style={styles.statusValue}>
                  {new Date(deviceInfo.registeredAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })} WIB
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {/* 4. Tampilan Expo Push Token */}
        {pushToken ? (
          <View style={styles.tokenContainer}>
            <View style={styles.tokenHeader}>
              <View style={styles.tokenTitleGroup}>
                <MaterialCommunityIcons name="key" size={16} color={Colors.primary} />
                <Text style={styles.tokenTitle}>Expo Push Token (Slide 11 & 12):</Text>
              </View>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyToken}
                activeOpacity={0.7}
                hitSlop={6}>
                <Feather name={copied ? 'check' : 'copy'} size={13} color={Colors.primary} />
                <Text style={styles.copyButtonText}>{copied ? 'Disalin!' : 'Salin Token'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tokenBox}>
              <Text style={styles.tokenText} selectable={true}>
                {pushToken}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noTokenBox}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.ocean} />
            <Text style={styles.noTokenText}>
              Perangkat belum meminta push token. Tekan tombol &quot;Daftarkan Perangkat&quot; di bawah untuk meminta izin dan mengambil Expo Push Token.
            </Text>
          </View>
        )}

        {/* Error message if any */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* 5. Tombol Aksi Utama (Task 01) */}
        <View style={styles.actionButtonsCol}>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              isLoading && { opacity: 0.7 },
            ]}
            onPress={() => requestPermissionAndRegister()}
            disabled={isLoading}
            activeOpacity={0.85}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="cellphone-check" size={18} color="#FFF" />
                <Text style={styles.primaryBtnText}>
                  {isRegistered ? 'Perbarui Registrasi Perangkat' : 'Daftarkan Perangkat (Task 01)'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.secondaryButtonsRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => refreshStatus()}
              disabled={isLoading}
              activeOpacity={0.75}>
              <Feather name="refresh-cw" size={14} color={Colors.text} />
              <Text style={styles.secondaryBtnText}>Refresh</Text>
            </TouchableOpacity>

            {pushToken ? (
              <TouchableOpacity
                style={styles.dangerBtn}
                onPress={resetRegistration}
                disabled={isLoading}
                activeOpacity={0.75}>
                <Feather name="trash-2" size={14} color={Colors.danger} />
                <Text style={styles.dangerBtnText}>Reset Token</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      {/* 6. Catatan Panduan untuk Rekan Tim (Task 02 & Task 03) */}
      <View style={styles.teammateNoticeCard}>
        <View style={styles.teammateHeader}>
          <MaterialCommunityIcons name="account-group" size={20} color={Colors.secondary} />
          <Text style={styles.teammateTitle}>Panduan untuk Rekan Tim (Task 02 & Task 03)</Text>
        </View>
        <Text style={styles.teammateDesc}>
          Task 01 telah menyediakan fondasi registrasi & push token lengkap:
        </Text>
        <View style={styles.teammatePoints}>
          <Text style={styles.pointText}>
            • <Text style={styles.boldText}>Task 02 (Kirim Notifikasi):</Text> Rekan Anda dapat menggunakan{' '}
            <Text style={styles.codeSpan}>pushToken</Text> di atas untuk memanggil endpoint pengiriman notifikasi Expo Push API{' '}
            (<Text style={styles.codeSpan}>https://exp.host/--/api/v2/push/send</Text>).
          </Text>
          <Text style={styles.pointText}>
            • <Text style={styles.boldText}>Task 03 (Handle Notification Response):</Text> Rekan Anda dapat memanfaatkan listener{' '}
            <Text style={styles.codeSpan}>addNotificationResponseListener</Text> di{' '}
            <Text style={styles.codeSpan}>src/services/notificationService.ts</Text> untuk mendeteksi tap notifikasi dan navigasi halaman.
          </Text>
        </View>

        {/* Shortcut Navigasi Langsung ke Task 02 */}
        <TouchableOpacity
          style={styles.openTask02Btn}
          onPress={() => router.push('/notifications')}
          activeOpacity={0.85}>
          <Ionicons name="paper-plane" size={16} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.openTask02BtnText}>Buka Pengujian Task 02 (Kirim Notifikasi)</Text>
          <Feather name="arrow-right" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  mainCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTexts: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  weekBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  weekBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  taskBadge: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  taskBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  mainSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  pipelineCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  pipelineTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  pipelineFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
  },
  stepCirclePending: {
    backgroundColor: Colors.textMuted,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
    marginBottom: 14,
  },
  stepText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  statusBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tokenContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tokenTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tokenTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  copyButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  tokenBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 10,
  },
  tokenText: {
    fontSize: 11,
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  noTokenBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.oceanLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  noTokenText: {
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 16,
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dangerLight,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 11,
    color: Colors.danger,
    flex: 1,
  },
  actionButtonsCol: {
    gap: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 9,
    borderRadius: 10,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  dangerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 9,
    borderRadius: 10,
  },
  dangerBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.danger,
  },
  teammateNoticeCard: {
    backgroundColor: Colors.secondaryLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  teammateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  teammateTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.secondary,
  },
  teammateDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  teammatePoints: {
    gap: 6,
  },
  pointText: {
    fontSize: 11,
    color: Colors.text,
    lineHeight: 16,
  },
  boldText: {
    fontWeight: '700',
  },
  codeSpan: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: Colors.primary,
  },
  openTask02Btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  openTask02BtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});
