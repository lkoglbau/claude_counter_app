import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { RADIUS, SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Props = {
  children: React.ReactNode;
  itemName: string;
  onDelete: () => void;
};

const ACTION_WIDTH = 92;

/**
 * iOS-style swipe-to-delete. Swiping left reveals a red action; tapping it (or a
 * full swipe) asks for confirmation before the parent actually deletes.
 */
export function SwipeableRow({ children, itemName, onDelete }: Props) {
  const { colors } = useTheme();
  const ref = useRef<SwipeableMethods>(null);

  const confirmDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Counter löschen?',
      `„${itemName}" wird dauerhaft entfernt.`,
      [
        { text: 'Abbrechen', style: 'cancel', onPress: () => ref.current?.close() },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onDelete();
          },
        },
      ],
      { cancelable: true, onDismiss: () => ref.current?.close() },
    );
  };

  const renderRightActions = () => (
    <View style={styles.actionContainer}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${itemName} löschen`}
        onPress={confirmDelete}
        style={({ pressed }) => [
          styles.action,
          { backgroundColor: colors.destructive, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={[styles.actionLabel, { color: colors.onTint }]}>Löschen</Text>
      </Pressable>
    </View>
  );

  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={2}
      rightThreshold={ACTION_WIDTH * 0.6}
      overshootRight={false}
      renderRightActions={renderRightActions}
    >
      {children}
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    justifyContent: 'center',
    paddingLeft: SPACING.md,
  },
  action: {
    width: ACTION_WIDTH,
    flex: 1,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '700',
  },
});
