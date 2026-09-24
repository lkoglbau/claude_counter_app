import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { RADIUS, SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { confirmDestructive, showError } from '@/utils/confirm';

type Props = {
  children: React.ReactNode;
  itemName: string;
  onDelete: () => void | Promise<void>;
};

const ACTION_WIDTH = 92;

/**
 * iOS-style swipe-to-delete. Swiping left reveals a (muted) red action; tapping it (or a
 * full swipe) asks for confirmation before the parent actually deletes.
 */
export function SwipeableRow({ children, itemName, onDelete }: Props) {
  const { colors } = useTheme();
  const ref = useRef<SwipeableMethods>(null);

  const confirmDelete = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const confirmed = await confirmDestructive({
      title: 'Counter löschen?',
      message: `„${itemName}" wird dauerhaft entfernt.`,
    });
    if (!confirmed) {
      ref.current?.close();
      return;
    }
    try {
      await onDelete();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to delete counter', error);
      ref.current?.close();
      showError('Löschen fehlgeschlagen', error instanceof Error ? error.message : String(error));
    }
  };

  const renderRightActions = () => (
    <View style={styles.actionContainer}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${itemName} löschen`}
        onPress={confirmDelete}
        style={({ pressed }) => [
          styles.action,
          { backgroundColor: colors.destructiveSoft, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Feather name="trash-2" size={20} color={colors.destructive} />
        <Text style={[styles.actionLabel, { color: colors.destructive }]}>Löschen</Text>
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
    gap: SPACING.xs,
  },
  actionLabel: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '700',
  },
});
