import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CountersProvider } from '@/store/CountersProvider';
import { useTheme } from '@/theme/useTheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colors, scheme } = useTheme();

  useEffect(() => {
    // Data hydration is synchronous, so nothing blocks the first frame.
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CountersProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: colors.background },
              headerStyle: { backgroundColor: colors.background },
              headerShadowVisible: false,
              headerTintColor: colors.tint,
              headerTitleStyle: { color: colors.text },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="counter/new"
              options={{ presentation: 'modal', title: 'Neuer Counter' }}
            />
            <Stack.Screen
              name="counter/[id]"
              options={{ presentation: 'modal', title: 'Counter bearbeiten' }}
            />
          </Stack>
        </CountersProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
