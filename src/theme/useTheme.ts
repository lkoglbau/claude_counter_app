import { useColorScheme } from 'react-native';

import { COLORS, type ColorScheme, type ThemeColors } from './tokens';

export type Theme = {
  scheme: ColorScheme;
  colors: ThemeColors;
};

/**
 * Resolves the active color scheme from the OS setting and returns the matching
 * token set. Re-renders automatically when the user flips light/dark.
 */
export function useTheme(): Theme {
  const system = useColorScheme();
  const scheme: ColorScheme = system === 'dark' ? 'dark' : 'light';
  return { scheme, colors: COLORS[scheme] };
}
