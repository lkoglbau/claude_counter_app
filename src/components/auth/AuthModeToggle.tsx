import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/theme/useTheme';

export type AuthMode = 'login' | 'register';

const SEGMENTS: { mode: AuthMode; label: string }[] = [
  { mode: 'login', label: 'Login' },
  { mode: 'register', label: 'Registrieren' },
];

const PADDING = 4;

type Props = {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
};

/** Pill-shaped segmented control with a sliding indicator. */
export function AuthModeToggle({ mode, onChange }: Props) {
  const { colors } = useTheme();
  const [segmentWidth, setSegmentWidth] = useState(0);
  const offset = useSharedValue(0);

  const activeIndex = SEGMENTS.findIndex((s) => s.mode === mode);

  useEffect(() => {
    offset.value = withTiming(activeIndex * segmentWidth, { duration: 200 });
  }, [activeIndex, segmentWidth, offset]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    const inner = e.nativeEvent.layout.width - PADDING * 2 - 2; // minus 1px border each side
    const width = inner / SEGMENTS.length;
    setSegmentWidth(width);
    // Jump (don't animate) on first layout so the indicator starts in place.
    offset.value = activeIndex * width;
  };

  return (
    <View
      accessibilityRole="tablist"
      onLayout={handleLayout}
      style={[styles.container, { backgroundColor: colors.authSurface, borderColor: colors.authBorder }]}
    >
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            { width: segmentWidth, backgroundColor: colors.authSurfaceActive },
            indicatorStyle,
          ]}
        />
      )}
      {SEGMENTS.map((segment) => {
        const selected = segment.mode === mode;
        return (
          <Pressable
            key={segment.mode}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(segment.mode)}
            style={styles.segment}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? colors.authTextPrimary : colors.authTextSecondary },
              ]}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    padding: PADDING,
    flexDirection: 'row',
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
    borderRadius: 22,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
});
