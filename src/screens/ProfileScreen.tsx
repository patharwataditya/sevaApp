import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, font, shadow } from '../theme';
import { useNav } from '../navigation/Nav';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import Header from '../components/Header';

export default function ProfileScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { profile, location, resetAll } = useApp();
  const { profileFields } = useData();

  const customRows = [...profileFields]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((f) => (profile?.custom?.[f.key] ?? '').trim())
    .map((f) => ({
      icon: 'ellipse-outline',
      label: f.label,
      value: profile!.custom![f.key],
    }));

  const rows: { icon: string; label: string; value?: string }[] = [
    { icon: 'person', label: 'Name', value: profile?.name },
    { icon: 'transgender', label: 'Gender', value: capitalize(profile?.gender) },
    { icon: 'calendar', label: 'Age group', value: profile?.ageGroup },
    { icon: 'call', label: 'Phone', value: profile?.phone || '—' },
    { icon: 'water', label: 'Blood group', value: profile?.bloodGroup || '—' },
    {
      icon: 'location',
      label: 'Location',
      value: [location?.district, location?.stateName].filter(Boolean).join(', ') || '—',
    },
    ...customRows,
  ];

  function confirmReset() {
    Alert.alert(
      'Reset SevaApp?',
      'This clears your profile and location from this phone and restarts setup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAll();
            nav.reset('welcome');
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Profile" />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(profile?.name?.[0] ?? 'S').toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{profile?.name ?? 'Guest'}</Text>
          {location?.stateName ? (
            <Text style={styles.place}>
              {[location.district, location.stateName].filter(Boolean).join(', ')}
            </Text>
          ) : null}
        </View>

        <View style={styles.card}>
          {rows.map((r, i) => (
            <View key={r.label} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
              <Ionicons name={r.icon as any} size={20} color={colors.primary} />
              <Text style={styles.rowLabel}>{r.label}</Text>
              <Text style={styles.rowValue} numberOfLines={1}>
                {r.value || '—'}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => nav.navigate('location')}
          style={({ pressed }) => [styles.action, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Change location</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </Pressable>

        <Pressable
          onPress={confirmReset}
          style={({ pressed }) => [styles.action, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={[styles.actionText, { color: colors.danger }]}>Reset app</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </Pressable>

        <Text style={styles.footNote}>
          SevaApp keeps everything on your device. No data is uploaded anywhere.
        </Text>
      </ScrollView>
    </View>
  );
}

function capitalize(s?: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : undefined;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  avatarBlock: { alignItems: 'center', marginVertical: spacing.lg },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  avatarText: { color: colors.white, fontSize: 34, fontWeight: '900' },
  name: { fontSize: font.h2, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  place: { fontSize: font.small, color: colors.textMuted, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: spacing.lg, ...shadow.soft },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.bg },
  rowLabel: { fontSize: font.body, color: colors.textMuted, width: 96 },
  rowValue: { flex: 1, fontSize: font.body, color: colors.text, fontWeight: '700', textAlign: 'right' },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadow.soft,
  },
  actionText: { flex: 1, fontSize: font.body, fontWeight: '700', color: colors.text },
  footNote: { textAlign: 'center', color: colors.textFaint, fontSize: font.small, marginTop: spacing.xl, lineHeight: 18 },
});
