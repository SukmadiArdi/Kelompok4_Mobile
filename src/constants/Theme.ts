export const Colors = {
  primary: '#D95338',        // Terracotta Nusantara
  primaryDark: '#B33C24',
  primaryLight: '#FFEDE9',
  secondary: '#1B4931',      // Forest Emerald
  secondaryLight: '#E8F5EE',
  accent: '#F59E0B',         // Warm Amber / Gold
  accentLight: '#FEF3C7',
  ocean: '#0284C7',          // Cerulean Blue
  oceanLight: '#E0F2FE',
  earth: '#78350F',
  earthLight: '#FEF2F2',

  background: '#FDFBF7',     // Cream Sand
  surface: '#FFFFFF',
  surfaceSubtle: '#F8F9FA',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  text: '#1E293B',           // Deep Slate
  textSecondary: '#64748B',  // Cool Slate
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',

  shadow: 'rgba(30, 41, 59, 0.08)',
  shadowMedium: 'rgba(30, 41, 59, 0.14)',
};

export const Typography = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    hero: 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  full: 9999,
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
};
