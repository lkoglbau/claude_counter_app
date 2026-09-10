/**
 * App-wide design tokens. Screen/component colors come from here; per-counter
 * accent colors come from `palette.ts`.
 */
export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  groupedBackground: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  separator: string;
  tint: string; // primary interactive color (iOS system blue-ish, slightly muted)
  onTint: string;
  destructive: string;
  overlay: string;
  fieldBackground: string;
};

const light: ThemeColors = {
  background: '#FFFFFF',
  groupedBackground: '#F4F4F6',
  card: '#FFFFFF',
  cardBorder: '#ECECEF',
  text: '#15161A',
  textSecondary: '#6A6C74',
  textTertiary: '#9A9CA3',
  separator: '#E4E4E8',
  tint: '#3B6FE0',
  onTint: '#FFFFFF',
  destructive: '#D64541',
  overlay: 'rgba(0,0,0,0.35)',
  fieldBackground: '#F4F4F6',
};

const dark: ThemeColors = {
  background: '#000000',
  groupedBackground: '#0E0E10',
  card: '#1A1A1D',
  cardBorder: '#2A2A2E',
  text: '#F5F5F7',
  textSecondary: '#9EA0A8',
  textTertiary: '#6C6E76',
  separator: '#2A2A2E',
  tint: '#5B8CF5',
  onTint: '#FFFFFF',
  destructive: '#FF6B67',
  overlay: 'rgba(0,0,0,0.55)',
  fieldBackground: '#1A1A1D',
};

export const COLORS: Record<ColorScheme, ThemeColors> = { light, dark };

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const TYPOGRAPHY = {
  largeTitle: { fontSize: 34, fontWeight: '700', letterSpacing: 0.37 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: 0.35 },
  headline: { fontSize: 17, fontWeight: '600', letterSpacing: -0.4 },
  body: { fontSize: 17, fontWeight: '400', letterSpacing: -0.4 },
  subhead: { fontSize: 15, fontWeight: '400', letterSpacing: -0.24 },
  footnote: { fontSize: 13, fontWeight: '400', letterSpacing: -0.08 },
  counter: { fontSize: 44, fontWeight: '700', letterSpacing: 0.5 },
} as const;

/** Soft, layered iOS-style card shadow. */
export const CARD_SHADOW = {
  shadowColor: '#000000',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
} as const;
