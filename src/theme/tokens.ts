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
  tint: string; // primary interactive color: near-white on dark, near-black on light
  onTint: string;
  destructive: string; // muted red for text/icons; never used as a loud fill
  destructiveSoft: string; // quiet wash behind destructive actions
  overlay: string;
  fieldBackground: string;
  fieldBorder: string;
  /** Selection color for system controls (date picker) where tint would vanish. */
  controlAccent: string;
  // Login / register / password-reset screens (gradient background, pill
  // controls). The home screen reuses the gradient so both feel like one app.
  authBgTop: string;
  authBgBottom: string;
  authSurface: string;
  authSurfaceActive: string;
  authInputBg: string;
  authBorder: string;
  authBorderFocus: string;
  authTextPrimary: string;
  authTextSecondary: string;
  authButtonBg: string;
  authButtonText: string;
  authButtonDisabled: string;
  authError: string;
};

const light: ThemeColors = {
  background: '#F5F5F7',
  groupedBackground: '#EDEDF0',
  card: '#FFFFFF',
  cardBorder: '#E5E5EA',
  text: '#0A0A0A',
  textSecondary: '#6E6E73',
  textTertiary: '#AEAEB2',
  separator: '#D1D1D6',
  tint: '#0A0A0A',
  onTint: '#F5F5F7',
  destructive: '#B4534C',
  destructiveSoft: '#F4E4E2',
  overlay: 'rgba(0,0,0,0.35)',
  fieldBackground: '#FFFFFF',
  fieldBorder: '#D1D1D6',
  controlAccent: '#6E6E73',
  authBgTop: '#F5F5F7',
  authBgBottom: '#E8E8ED',
  authSurface: '#FFFFFF',
  authSurfaceActive: '#E5E5EA',
  authInputBg: '#FFFFFF',
  authBorder: '#D1D1D6',
  authBorderFocus: '#8E8E93',
  authTextPrimary: '#0A0A0A',
  authTextSecondary: '#6E6E73',
  authButtonBg: '#0A0A0A',
  authButtonText: '#F5F5F7',
  authButtonDisabled: '#C7C7CC',
  authError: '#D70015',
};

const dark: ThemeColors = {
  background: '#121214',
  groupedBackground: '#0A0A0B',
  card: '#1F1F22',
  cardBorder: '#2C2C2E',
  text: '#F5F5F7',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  separator: '#2C2C2E',
  tint: '#F5F5F7',
  onTint: '#0A0A0A',
  destructive: '#E08A83',
  destructiveSoft: 'rgba(224,138,131,0.12)',
  overlay: 'rgba(0,0,0,0.6)',
  fieldBackground: 'rgba(255,255,255,0.03)',
  fieldBorder: '#2C2C2E',
  controlAccent: '#8E8E93',
  authBgTop: '#1C1C1E',
  authBgBottom: '#050505',
  authSurface: '#1F1F22',
  authSurfaceActive: '#3A3A3D',
  authInputBg: 'rgba(255,255,255,0.03)',
  authBorder: '#2C2C2E',
  authBorderFocus: '#8E8E93',
  authTextPrimary: '#F5F5F7',
  authTextSecondary: '#8E8E93',
  authButtonBg: '#F5F5F7',
  authButtonText: '#0A0A0A',
  authButtonDisabled: '#3A3A3D',
  authError: '#FF6961',
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
  field: 14,
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
  /** Small caption above form fields. */
  label: { fontSize: 13, fontWeight: '600', letterSpacing: 0.1 },
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
