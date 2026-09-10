import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CounterCard } from '@/components/CounterCard';
import { EmptyState } from '@/components/EmptyState';
import { SwipeableRow } from '@/components/SwipeableRow';
import { useCounters } from '@/hooks/useCounters';
import { RADIUS, SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { counters, removeCounter } = useCounters();

  const openNew = () => {
    Haptics.selectionAsync();
    router.push('/counter/new');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={[styles.title, { color: colors.text }]}>Meine Counter</Text>
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
      </View>

      {counters.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + SPACING.xxl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {counters.map((counter) => (
            <Animated.View
              key={counter.id}
              entering={FadeInDown.springify().damping(18)}
              exiting={FadeOut.duration(180)}
              layout={LinearTransition.springify().damping(18)}
            >
              <SwipeableRow
                itemName={counter.name}
                onDelete={() => removeCounter(counter.id)}
              >
                <CounterCard
                  counter={counter}
                  onPress={() => router.push(`/counter/${counter.id}`)}
                />
              </SwipeableRow>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...TYPOGRAPHY.largeTitle,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGlyph: {
    fontSize: 26,
    fontWeight: '400',
    marginTop: -2,
  },
  list: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
});
