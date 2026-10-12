import { StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing } from './Theme';

export const externalStyles = StyleSheet.create({
  // Wadah / Container umum
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  
  // Card eksternal yang reusable
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // Badge Pill eksternal
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Tipografi umum
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Tombol aksi umum
  buttonPrimary: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },

  // Flex layout helper
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
