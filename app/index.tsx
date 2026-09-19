import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

import { CounterCard } from '@/components/CounterCard';
import { EmptyState } from '@/components/EmptyState';
import { SwipeableRow } from '@/components/SwipeableRow';
import { useCounters } from '@/hooks/useCounters';
import { useAuth } from '@/store/AuthProvider';
import { RADIUS, SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const BAR_HEIGHT = 48;
// Scroll distance over which the large title hands over to the compact one.
const COLLAPSE_START = 24;
const COLLAPSE_END = 64;

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { counters, removeCounter } = useCounters();
  const { signOut } = useAuth();

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
    Haptics.selectionAsync();
    router.push('/counter/new');
  };

  const today = format(new Date(), 'EEEE, d. MMMM', { locale: de });
  const topInset = insets.top + BAR_HEIGHT;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[
          styles.list,
          { paddingTop: topInset, paddingBottom: insets.bottom + SPACING.xxl },
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
          { height: topInset, paddingTop: insets.top, backgroundColor: colors.background },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abmelden"
          onPress={() => signOut()}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={[styles.logoutLabel, { color: colors.textSecondary }]}>Abmelden</Text>
        </Pressable>

        <Animated.Text
          pointerEvents="none"
          style={[styles.compactTitle, { color: colors.text, top: insets.top }, compactTitleStyle]}
        >
          Meine Counter
        </Animated.Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Neuen Counter anlegen"
          onPress={openNew}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.addGlyph, { color: colors.onTint }]}>+</Text>
        </Pressable>

        <Animated.View
          pointerEvents="none"
          style={[styles.barSeparator, { backgroundColor: colors.separator }, barSeparatorStyle]}
        />
      </View>
    </View>
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
  logoutLabel: {
    ...TYPOGRAPHY.subhead,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGlyph: {
    fontSize: 24,
    fontWeight: '400',
    marginTop: -2,
  },
  list: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
  listEmpty: {
    flexGrow: 1,
  },
});
