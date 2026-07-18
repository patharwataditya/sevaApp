import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, font } from '../theme';
import { useNav } from '../navigation/Nav';

type Props = {
  title: string;
  subtitle?: string;
  color?: string;
  right?: React.ReactNode;
};

export default function Header({ title, subtitle, color = colors.primary, right }: Props) {
  const insets = useSafeAreaInsets();
  const nav = useNav();
  return (
    <View style={[styles.wrap, { backgroundColor: color, paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.row}>
        {nav.canGoBack ? (
          <Pressable
            onPress={nav.goBack}
            hitSlop={12}
            android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true, radius: 22 }}
            style={styles.back}
          >
            <Ionicons name="chevron-back" size={26} color={colors.white} />
          </Pressable>
        ) : (
          <View style={styles.back} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ?? <View style={styles.back} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: spacing.md, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  back: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.white, fontSize: font.h3, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: font.small, marginTop: 1 },
});
