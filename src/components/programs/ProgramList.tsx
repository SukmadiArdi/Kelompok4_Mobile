/**
 * Task 02 - ProgramList: menampilkan daftar "Program Prioritas" PresidenKu
 * yang datanya diambil secara dynamic dari REST API (bukan static/hardcode).
 *
 * Menangani tiga kondisi: loading, error (dengan tombol retry), dan empty state.
 * UI mempertahankan gaya kartu/list aplikasi yang sudah ada (Colors, radius, spacing).
 */

import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/constants/Theme';
import { Program, ProgramStatus } from '@/src/types/program';

interface ProgramListProps {
  programs: Program[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorMessage: string | null;
  onRetry: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  active: { label: 'Berjalan', bg: Colors.successLight, fg: '#047857', icon: 'checkmark-circle' },
  ongoing: { label: 'Berjalan', bg: Colors.successLight, fg: '#047857', icon: 'checkmark-circle' },
  planned: { label: 'Direncanakan', bg: Colors.oceanLight, fg: Colors.ocean, icon: 'time-outline' },
  completed: { label: 'Selesai', bg: Colors.accentLight, fg: '#B45309', icon: 'flag' },
};

function getStatusConfig(status: ProgramStatus) {
  return (
    STATUS_CONFIG[(status ?? '').toString().trim().toLowerCase()] ?? {
      label: (status ?? 'unknown').toString(),
      bg: Colors.surfaceSubtle,
      fg: Colors.textSecondary,
      icon: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
    }
  );
}

const ProgramListItem: React.FC<{ program: Program }> = ({ program }) => {
  const statusCfg = getStatusConfig(program.status);
  const [imageError, setImageError] = React.useState(false);
  const showImage = !!program.image && !imageError;

  return (
    <View style={styles.card}>
      {showImage ? (
        <Image
          source={{ uri: program.image ?? undefined }}
          style={styles.thumb}
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[styles.thumb, styles.thumbFallback]}>
          <MaterialCommunityIcons
            name="file-document-edit-outline"
            size={22}
            color={Colors.primary}
          />
        </View>
      )}

      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {program.name}
          </Text>
          {/* Status berasal dari field `status` response API, bukan hardcode */}
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Ionicons name={statusCfg.icon} size={11} color={statusCfg.fg} />
            <Text style={[styles.statusBadgeText, { color: statusCfg.fg }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>
        {!!program.description && (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {program.description}
          </Text>
        )}
      </View>
    </View>
  );
};

export const ProgramList: React.FC<ProgramListProps> = ({
  programs,
  isLoading,
  isError,
  isEmpty,
  errorMessage,
  onRetry,
}) => {
  // LOADING STATE — spinner agar UI tidak kosong saat request berlangsung
  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.stateText}>Mengambil data program…</Text>
      </View>
    );
  }

  // ERROR STATE — pesan jelas + tombol retry, tanpa crash
  if (isError) {
    return (
      <View style={styles.stateContainer}>
        <View style={[styles.stateIconCircle, { backgroundColor: Colors.dangerLight }]}>
          <Ionicons name="alert-circle-outline" size={26} color={Colors.danger} />
        </View>
        <Text style={styles.stateTitle}>Gagal memuat data</Text>
        <Text style={styles.stateText}>
          {errorMessage ?? 'Gagal memuat data. Silakan coba lagi.'}
        </Text>
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}>
          <Ionicons name="refresh" size={15} color="#FFF" />
          <Text style={styles.retryText}>Coba Lagi</Text>
        </Pressable>
      </View>
    );
  }

  // EMPTY STATE — API sukses tetapi data kosong
  if (isEmpty) {
    return (
      <View style={styles.stateContainer}>
        <View style={[styles.stateIconCircle, { backgroundColor: Colors.surfaceSubtle }]}>
          <MaterialCommunityIcons name="inbox-outline" size={26} color={Colors.textMuted} />
        </View>
        <Text style={styles.stateTitle}>Belum ada data program</Text>
        <Text style={styles.stateText}>
          Saat ini belum tersedia program yang dapat ditampilkan.
        </Text>
      </View>
    );
  }

  // SUCCESS — data dinamis hasil REST API (di-map ke Data Model)
  return (
    <View style={styles.listContainer}>
      {programs.map((program) => (
        <ProgramListItem key={program.id} program={program} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
    alignItems: 'center',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
  },
  thumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semiBold,
  },
  cardDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  stateContainer: {
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  stateIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stateTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  stateText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    lineHeight: 19,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  retryPressed: {
    opacity: 0.85,
  },
  retryText: {
    color: '#FFF',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});

export default ProgramList;
