import type { ExpoConfig } from 'expo/config';

/**
 * App Store / EAS-ready configuration.
 *
 * Bump `version` for user-facing releases and `ios.buildNumber` for every
 * binary you submit to App Store Connect. Everything an EAS build needs
 * (bundle id, name, icons, splash) lives here so no native project is required.
 */
const config: ExpoConfig = {
  name: 'Days Since',
  slug: 'days-since',
  scheme: 'dayssince',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lenakoglbauer.dayssince',
    buildNumber: '1',
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.lenakoglbauer.dayssince',
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#FFFFFF',
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#FFFFFF',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
