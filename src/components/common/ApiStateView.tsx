/**
 * Reusable Feedback Components for REST API states:
 * - LoadingView (Indikator loading dengan teks pemantik)
 * - ErrorView (Pesan error ramah pengguna dengan tombol Retry)
 * - EmptyView (Tampilan data kosong dengan ikon dan keterangan)
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Theme';

interface LoadingViewProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = 'Memuat data...',
}) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={Colors.primary} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title = 'Gagal Memuat Data',
  message = 'Terjadi gangguan saat mengambil data dari REST API. Silakan coba lagi.',
  onRetry,
}) => (
  <View style={styles.cardContainer}>
    <View style={styles.errorIconBox}>
      <Ionicons name="cloud-offline-outline" size={28} color="#DC2626" />
    </View>
    <Text style={styles.errorTitle}>{title}</Text>
    <Text style={styles.errorText}>{message}</Text>
    {onRetry && (
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [styles.retryBtn, pressed && styles.btnPressed]}>
        <Ionicons name="refresh" size={15} color="#FFF" />
        <Text style={styles.retryBtnText}>Coba Lagi</Text>
      </Pressable>
    )}
  </View>
);

interface EmptyViewProps {
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onRefresh?: () => void;
}

export const EmptyView: React.FC<EmptyViewProps> = ({
  title = 'Belum Ada Data',
  subtitle = 'Data belum tersedia saat ini. Silakan coba kembali nanti.',
  icon = 'file-tray-outline',
  onRefresh,
}) => (
  <View style={styles.cardContainer}>
    <Ionicons name={icon} size={46} color={Colors.textMuted} />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyText}>{subtitle}</Text>
    {onRefresh && (
      <Pressable
        onPress={onRefresh}
        style={({ pressed }) => [styles.refreshOutlineBtn, pressed && styles.btnPressed]}>
        <Ionicons name="refresh-outline" size={14} color={Colors.primary} />
        <Text style={styles.refreshOutlineText}>Muat Ulang</Text>
      </Pressable>
    )}
  </View>
);

interface ApiStatusBarProps {
  isLive: boolean;
  onRefresh?: () => void;
}

export const ApiStatusBar: React.FC<ApiStatusBarProps> = ({ isLive, onRefresh }) => (
  <View style={[styles.statusBarContainer, isLive ? styles.statusLive : styles.statusMock]}>
    <View style={styles.statusDotRow}>
      <View style={[styles.dot, isLive ? styles.dotLive : styles.dotMock]} />
      <Text style={[styles.statusText, isLive ? styles.textLive : styles.textMock]}>
        {isLive ? 'REST API Terhubung (Live Data)' : 'Mode Offline / Fallback Data Model'}
      </Text>
    </View>
    {onRefresh && (
      <Pressable onPress={onRefresh} hitSlop={6} style={styles.syncBtn}>
        <Ionicons
          name="sync-outline"
          size={13}
          color={isLive ? '#047857' : Colors.accent}
        />
      </Pressable>
    )}
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cardContainer: {
    marginHorizontal: 20,
    marginVertical: 14,
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  refreshOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  refreshOutlineText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  statusBarContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  statusLive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusMock: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotLive: {
    backgroundColor: '#059669',
  },
  dotMock: {
    backgroundColor: '#D97706',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  textLive: {
    color: '#047857',
  },
  textMock: {
    color: '#B45309',
  },
  syncBtn: {
    padding: 3,
  },
});
