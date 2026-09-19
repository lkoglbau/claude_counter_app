import { Alert, Platform } from 'react-native';

type Options = {
  title: string;
  message: string;
  confirmLabel?: string;
};

/**
 * Cross-platform destructive confirmation. `Alert.alert` is a silent no-op on
 * react-native-web (the dialog never shows, so callbacks never fire), hence
 * `window.confirm` there. Resolves `true` only if the user confirmed.
 */
export function confirmDestructive({
  title,
  message,
  confirmLabel = 'Löschen',
}: Options): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Abbrechen', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

/** Error dialog that also works on web. */
export function showError(title: string, message: string): void {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}
