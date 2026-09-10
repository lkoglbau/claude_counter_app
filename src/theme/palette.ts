/**
 * Curated counter palette — muted, low-chroma tones chosen to sit calmly on both
 * light and dark backgrounds. Each entry provides:
 *
 *  - `tint`   : the card background wash (very soft)
 *  - `border` : a hairline that defines the card edge
 *  - `accent` : the saturated tone used for the big day number
 *
 * Values are hand-picked per color scheme so nothing looks neon in dark mode.
 */
export type CounterColorId =
  | 'lavender'
  | 'sky'
  | 'peach'
  | 'sand'
  | 'sage'
  | 'rose'
  | 'clay'
  | 'periwinkle'
  | 'stone';

export const COLOR_IDS = [
  'lavender',
  'sky',
  'peach',
  'sand',
  'sage',
  'rose',
  'clay',
  'periwinkle',
  'stone',
] as const;

type Swatch = {
  tint: string;
  border: string;
  accent: string;
};

type PaletteEntry = {
  id: CounterColorId;
  label: string;
  light: Swatch;
  dark: Swatch;
};

export const PALETTE: Record<CounterColorId, PaletteEntry> = {
  lavender: {
    id: 'lavender',
    label: 'Lavender',
    light: { tint: '#ECEBFA', border: '#D9D6F2', accent: '#6C63C4' },
    dark: { tint: '#26243A', border: '#3A3660', accent: '#A9A2E8' },
  },
  sky: {
    id: 'sky',
    label: 'Sky',
    light: { tint: '#E5F1F7', border: '#CFE4EF', accent: '#3E86A8' },
    dark: { tint: '#1E2E37', border: '#314857', accent: '#8FC4DC' },
  },
  peach: {
    id: 'peach',
    label: 'Peach',
    light: { tint: '#FBEBE2', border: '#F1D8C9', accent: '#C1704A' },
    dark: { tint: '#352721', border: '#573F33', accent: '#E0A488' },
  },
  sand: {
    id: 'sand',
    label: 'Sand',
    light: { tint: '#F7F0DE', border: '#E9DCBE', accent: '#A98B3E' },
    dark: { tint: '#322E20', border: '#524A32', accent: '#D8C084' },
  },
  sage: {
    id: 'sage',
    label: 'Sage',
    light: { tint: '#E8F1E7', border: '#D2E3D0', accent: '#4F8A57' },
    dark: { tint: '#1F2E20', border: '#334A35', accent: '#94C79A' },
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    light: { tint: '#F9E9EE', border: '#EED3DC', accent: '#B25C7C' },
    dark: { tint: '#331F27', border: '#53333F', accent: '#DFA0B7' },
  },
  clay: {
    id: 'clay',
    label: 'Clay',
    light: { tint: '#F3E8E2', border: '#E1CDC1', accent: '#9C6B52' },
    dark: { tint: '#2E2420', border: '#4A3B33', accent: '#C79C86' },
  },
  periwinkle: {
    id: 'periwinkle',
    label: 'Periwinkle',
    light: { tint: '#E7ECF8', border: '#D0DAF0', accent: '#4B6BB0' },
    dark: { tint: '#212736', border: '#343F5A', accent: '#93A9DE' },
  },
  stone: {
    id: 'stone',
    label: 'Stone',
    light: { tint: '#EEEFF1', border: '#DBDDE1', accent: '#5F6670' },
    dark: { tint: '#26282B', border: '#3D4045', accent: '#A7ADB6' },
  },
};

export const PALETTE_LIST: PaletteEntry[] = COLOR_IDS.map((id) => PALETTE[id]);

export const DEFAULT_COLOR_ID: CounterColorId = 'lavender';

export function getSwatch(colorId: CounterColorId, scheme: 'light' | 'dark'): Swatch {
  return PALETTE[colorId][scheme];
}
