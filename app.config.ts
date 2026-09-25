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
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#151517',
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-web-browser',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#151517',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
