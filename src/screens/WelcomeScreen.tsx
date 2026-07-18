import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, font, shadow } from '../theme';
import { useNav } from '../navigation/Nav';

const FEATURES = [
  { icon: 'call', color: colors.danger, title: 'One-tap emergency calls', text: 'Police, fire, ambulance and helplines in a single tap.' },
  { icon: 'location', color: colors.primary, title: 'Local to your district', text: 'We detect your state & district to show the right services.' },
  { icon: 'search', color: colors.accent, title: 'Find any help fast', text: 'Search across every government service and helpline.' },
  { icon: 'lock-closed', color: '#5E35B1', title: 'Private by design', text: 'Your details stay on your phone. No account needed.' },
];

export default function WelcomeScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logo}>
          <Ionicons name="shield-checkmark" size={44} color={colors.white} />
        </View>
        <Text style={styles.brand}>SevaApp</Text>
        <Text style={styles.tagline}>
          Every government service and emergency helpline in India — one tap away.
        </Text>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + '18' }]}>
                <Ionicons name={f.icon as any} size={22} color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          onPress={() => nav.navigate('location')}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}
        >
          <Text style={styles.ctaText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </Pressable>
        <Text style={styles.disclaimer}>
          In a life-threatening emergency, dial 112 immediately.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    ...shadow.card,
  },
  brand: { fontSize: 40, fontWeight: '900', color: colors.text, marginTop: spacing.lg, letterSpacing: -0.5 },
  tagline: { fontSize: font.h3, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 26 },
  features: { marginTop: spacing.xxl, gap: spacing.md },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    ...shadow.soft,
  },
  featureIcon: { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: font.body, fontWeight: '700', color: colors.text },
  featureText: { fontSize: font.small, color: colors.textMuted, marginTop: 2, lineHeight: 18 },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.md },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadow.card,
  },
  ctaText: { color: colors.white, fontSize: font.h3, fontWeight: '800' },
  disclaimer: { textAlign: 'center', color: colors.textFaint, fontSize: font.small },
});
