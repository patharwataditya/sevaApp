import { Linking, Alert, Platform } from 'react-native';

// Initiate a phone call. On most Android devices `tel:` opens the dialer with the
// number pre-filled (one tap to call); this is the safest cross-device behaviour.
export async function callNumber(rawNumber: string) {
  const number = rawNumber.replace(/[^0-9+]/g, '');
  const url = `tel:${number}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported && Platform.OS === 'ios') {
      Alert.alert('Calling not available', 'This device cannot place calls.');
      return;
    }
    await Linking.openURL(url);
  } catch (e) {
    Alert.alert('Could not start call', `Please dial ${rawNumber} manually.`);
  }
}

export async function openUrl(url: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Cannot open link', url);
    }
  } catch (e) {
    Alert.alert('Cannot open link', url);
  }
}

// Format a helpline number for display: keep short codes as-is, group longer ones.
export function prettyNumber(n: string): string {
  if (n.length <= 5) return n;
  if (n.startsWith('1800')) {
    return n.replace(/(\d{4})(\d{3})(\d+)/, '$1-$2-$3');
  }
  if (n.length === 12 && n.startsWith('0')) {
    // e.g. 022 + 8 digits
    return n.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return n;
}
