import Feather from '@expo/vector-icons/Feather';
import type { User } from '@supabase/supabase-js';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { useTheme } from '@/theme/useTheme';

type Props = {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onSignOut: () => void;
};

/** Display name: registration name, Google name, else the email's local part. */
export function displayName(user: User | null): string {
  const meta = user?.user_metadata ?? {};
  const name = (meta.full_name ?? meta.name ?? '') as string;
  return name.trim() || user?.email?.split('@')[0] || 'Konto';
}

export function initials(user: User | null): string {
  const parts = displayName(user).split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return letters.toUpperCase();
}

export function Avatar({ user, size }: { user: User | null; size: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.authSurfaceActive,
          borderColor: colors.authBorder,
        },
      ]}
    >
      <Text style={[styles.avatarText, { color: colors.text, fontSize: size * 0.38 }]}>
        {initials(user)}
      </Text>
    </View>
  );
}

/** Account menu behind the avatar in the home screen's top bar. */
export function AccountSheet({ visible, user, onClose, onSignOut }: Props) {
  const { colors } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.profile}>
        <Avatar user={user} size={64} />
        <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>
          {displayName(user)}
        </Text>
        {user?.email ? (
          <Text numberOfLines={1} style={[styles.email, { color: colors.textSecondary }]}>
            {user.email}
          </Text>
        ) : null}
      </View>

      <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Pressable
          accessibilityRole="button"
          onPress={onSignOut}
          style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.rowLabel, { color: colors.destructive }]}>Abmelden</Text>
        </Pressable>
      </View>

      <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
        <Text style={[styles.closeLabel, { color: colors.text }]}>Schließen</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '600',
  },
  profile: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
  },
  email: {
    fontSize: 14,
  },
  group: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  close: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 8,
  },
  closeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
