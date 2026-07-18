import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, font, shadow } from '../theme';
import { callNumber, prettyNumber } from '../utils/actions';

type Props = {
  number: string;
  label?: string;
  variant?: 'danger' | 'primary';
  compact?: boolean;
};

export default function CallButton({ number, label, variant = 'primary', compact }: Props) {
  const bg = variant === 'danger' ? colors.danger : colors.primary;
  return (
    <Pressable
      onPress={() => callNumber(number)}
      android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg },
        compact && styles.compact,
        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="call" size={compact ? 16 : 20} color={colors.white} />
      </View>
      <View style={{ flex: 1 }}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <Text style={[styles.number, compact && { fontSize: font.body }]}>
          {prettyNumber(number)}
        </Text>
      </View>
      {!compact && <Text style={styles.tapHint}>Tap to call</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    ...shadow.soft,
  },
  compact: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: 'rgba(255,255,255,0.85)', fontSize: font.tiny, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  number: { color: colors.white, fontSize: font.h3, fontWeight: '800', letterSpacing: 0.5 },
  tapHint: { color: 'rgba(255,255,255,0.8)', fontSize: font.small, fontWeight: '600' },
});
