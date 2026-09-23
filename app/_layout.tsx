import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OnboardingInfoModal } from '@/components/OnboardingInfoModal';
import { AuthProvider, useAuth } from '@/store/AuthProvider';
import { CountersProvider } from '@/store/CountersProvider';
import { useTheme } from '@/theme/useTheme';

import LoginScreen from './login';

SplashScreen.preventAutoHideAsync();

function AppShell() {
  const { colors, scheme } = useTheme();
  const { session, loading, showOnboarding, dismissOnboarding } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return null;
  }

  if (!session) {
    return (
      <>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <LoginScreen />
      </>
    );
  }

  return (
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
      <OnboardingInfoModal visible={showOnboarding} onClose={dismissOnboarding} />
    </CountersProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
