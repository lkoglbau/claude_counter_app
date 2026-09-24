import Feather from '@expo/vector-icons/Feather';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  interpolate,
  LinearTransition,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountSheet, Avatar } from '@/components/AccountSheet';
import { CounterCard } from '@/components/CounterCard';
import { EmptyState } from '@/components/EmptyState';
import { SwipeableRow } from '@/components/SwipeableRow';
import { useCounters } from '@/hooks/useCounters';
import { useAuth } from '@/store/AuthProvider';
import { SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { confirmDestructive } from '@/utils/confirm';

const BAR_HEIGHT = 48;
// Scroll distance over which the large title hands over to the compact one.
const COLLAPSE_START = 24;
const COLLAPSE_END = 64;
const FAB_SIZE = 64;
const FAB_GAP = 20; // FAB distance from the bottom safe area

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { counters, removeCounter } = useCounters();
  const { user, signOut } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const compactTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [COLLAPSE_START, COLLAPSE_END], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [COLLAPSE_START, COLLAPSE_END], [6, 0], Extrapolation.CLAMP),
      },
    ],
  }));
  const barSeparatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [COLLAPSE_END, COLLAPSE_END + 20], [0, 1], Extrapolation.CLAMP),
  }));
  const largeTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_END], [1, 0], Extrapolation.CLAMP),
  }));

  const openNew = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push('/counter/new');
  };

  const handleSignOut = async () => {
    const confirmed = await confirmDestructive({
      title: 'Abmelden?',
      message: 'Deine Counter bleiben gespeichert. Du kannst dich jederzeit wieder anmelden.',
      confirmLabel: 'Abmelden',
    });
    if (!confirmed) return;
    setAccountOpen(false);
    await signOut();
  };

  const today = format(new Date(), 'EEEE, d. MMMM', { locale: de });
  const topInset = insets.top + BAR_HEIGHT;

  return (
    <LinearGradient colors={[colors.authBgTop, colors.authBgBottom]} style={styles.screen}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[
          styles.list,
          // Leave room so the last card can scroll clear of the floating button.
          { paddingTop: topInset, paddingBottom: insets.bottom + FAB_GAP + FAB_SIZE + SPACING.xl },
          counters.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.largeTitleBlock, largeTitleStyle]}>
          <Text style={[styles.largeTitle, { color: colors.text }]}>Meine Counter</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{today}</Text>
        </Animated.View>

        {counters.length === 0 ? (
          <EmptyState />
        ) : (
          counters.map((counter) => (
            <Animated.View
              key={counter.id}
              entering={FadeInDown.springify().damping(18)}
              exiting={FadeOut.duration(180)}
              layout={LinearTransition.springify().damping(18)}
            >
              <SwipeableRow itemName={counter.name} onDelete={() => removeCounter(counter.id)}>
                <CounterCard
                  counter={counter}
                  onPress={() => router.push(`/counter/${counter.id}`)}
                />
              </SwipeableRow>
            </Animated.View>
          ))
        )}
      </Animated.ScrollView>

      {/* Fixed top bar: sits below the status bar / Dynamic Island. */}
      <View
        pointerEvents="box-none"
        style={[
          styles.bar,
          { height: topInset, paddingTop: insets.top, backgroundColor: colors.authBgTop },
        ]}
      >
        <Animated.Text
          pointerEvents="none"
          style={[styles.compactTitle, { color: colors.text, top: insets.top }, compactTitleStyle]}
        >
          Meine Counter
        </Animated.Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Konto"
          onPress={() => setAccountOpen(true)}
          hitSlop={6}
          style={({ pressed }) => [styles.avatarButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Avatar user={user} size={36} />
        </Pressable>

        <Animated.View
          pointerEvents="none"
          style={[styles.barSeparator, { backgroundColor: colors.separator }, barSeparatorStyle]}
        />
      </View>

      {/* Primary action floats bottom-center, within thumb reach. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Neuen Counter anlegen"
        onPress={openNew}
        style={({ pressed }) => [
          styles.fab,
          {
            bottom: insets.bottom + FAB_GAP,
            backgroundColor: colors.tint,
            shadowColor: colors.overlay,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
        ]}
      >
        <Feather name="plus" size={28} color={colors.onTint} />
      </Pressable>

      <AccountSheet
        visible={accountOpen}
        user={user}
        onClose={() => setAccountOpen(false)}
        onSignOut={handleSignOut}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barSeparator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
  },
  compactTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: BAR_HEIGHT,
    lineHeight: BAR_HEIGHT,
    textAlign: 'center',
    ...TYPOGRAPHY.headline,
  },
  largeTitleBlock: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    gap: SPACING.xs,
  },
  largeTitle: {
    ...TYPOGRAPHY.largeTitle,
    fontSize: 36,
    letterSpacing: 0.4,
  },
  subtitle: {
    ...TYPOGRAPHY.subhead,
  },
  avatarButton: {
    marginLeft: 'auto',
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  list: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
  listEmpty: {
    flexGrow: 1,
  },
});
