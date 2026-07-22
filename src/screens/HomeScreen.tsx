import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, font, shadow } from '../theme';
import { useNav } from '../navigation/Nav';
import { useApp } from '../context/AppContext';
import { Service } from '../data/services';
import { searchServices, servicesForLocation } from '../data/logic';
import { useData } from '../context/DataContext';
import { callNumber, prettyNumber } from '../utils/actions';

const QUICK = [
  { number: '112', label: 'Emergency', icon: 'alert-circle', color: colors.danger },
  { number: '100', label: 'Police', icon: 'shield', color: '#1565C0' },
  { number: '101', label: 'Fire', icon: 'flame', color: '#E64A19' },
  { number: '108', label: 'Ambulance', icon: 'medkit', color: '#2E7D32' },
];

const CARD_GAP = spacing.md;

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function HomeScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { profile, location } = useApp();
  const { categories, services, refresh, refreshing, lastSync } = useData();
  const [query, setQuery] = useState('');

  const stateCode = location?.stateCode ?? null;
  const district = location?.district ?? null;
  const isFemale = profile?.gender === 'female';

  const results = useMemo(
    () => searchServices(services, query, stateCode, district),
    [services, query, stateCode, district]
  );
  const searching = query.trim().length > 0;

  const femaleService = useMemo(
    () =>
      isFemale
        ? servicesForLocation(services, stateCode, district).find((s) => s.femaleOnly)
        : undefined,
    [services, isFemale, stateCode, district]
  );

  const firstName = profile?.name?.split(' ')[0] ?? 'there';
  const placeLabel = [location?.district, location?.stateName].filter(Boolean).join(', ');

  return (
    <View style={styles.container}>
      {/* Top hero */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Namaste, {firstName} 👋</Text>
            <Pressable
              onPress={() => nav.navigate('profile')}
              style={styles.locRow}
              hitSlop={8}
            >
              <Ionicons name="location" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.locText} numberOfLines={1}>
                {placeLabel || 'Location not set'}
              </Text>
              <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.9)" />
            </Pressable>
          </View>
          <Pressable
            onPress={() => nav.navigate('profile')}
            style={styles.avatar}
            hitSlop={8}
          >
            <Text style={styles.avatarText}>
              {(profile?.name?.[0] ?? 'S').toUpperCase()}
            </Text>
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textFaint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help — police, ambulance, scholarship…"
            placeholderTextColor={colors.textFaint}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {searching ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <Ionicons name="close-circle" size={20} color={colors.textFaint} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {searching ? (
        <SearchResults results={results} onOpen={(s) => nav.navigate('service', { id: s.id })} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              title="Syncing latest services…"
              titleColor={colors.textMuted}
            />
          }
        >
          {/* Sync status */}
          <View style={styles.syncRow}>
            <Ionicons
              name={refreshing ? 'sync' : 'cloud-done-outline'}
              size={13}
              color={colors.textFaint}
            />
            <Text style={styles.syncText}>
              {refreshing ? 'Syncing…' : `Pull down to sync${lastSync ? ` · updated ${timeAgo(lastSync)}` : ''}`}
            </Text>
          </View>

          {/* Quick emergency dial */}
          <Text style={styles.sectionTitle}>Emergency — one tap to call</Text>
          <View style={styles.quickRow}>
            {QUICK.map((q) => (
              <Pressable
                key={q.number}
                onPress={() => callNumber(q.number)}
                android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
                style={({ pressed }) => [styles.quick, pressed && { transform: [{ scale: 0.96 }] }]}
              >
                <View style={[styles.quickIcon, { backgroundColor: q.color }]}>
                  <Ionicons name={q.icon as any} size={22} color={colors.white} />
                </View>
                <Text style={styles.quickNum}>{q.number}</Text>
                <Text style={styles.quickLabel}>{q.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Female helpline highlight */}
          {femaleService ? (
            <Pressable
              onPress={() => nav.navigate('service', { id: femaleService.id })}
              style={({ pressed }) => [styles.femaleCard, pressed && { opacity: 0.95 }]}
            >
              <View style={styles.femaleIcon}>
                <Ionicons name="female" size={24} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.femaleTitle}>Women’s Helpline</Text>
                <Text style={styles.femaleSub} numberOfLines={1}>
                  {femaleService.name} · 24×7 support
                </Text>
              </View>
              {femaleService.phones?.[0] ? (
                <Pressable
                  onPress={() => callNumber(femaleService.phones![0].number)}
                  style={styles.femaleCall}
                >
                  <Ionicons name="call" size={18} color={colors.white} />
                  <Text style={styles.femaleCallText}>
                    {prettyNumber(femaleService.phones[0].number)}
                  </Text>
                </Pressable>
              ) : null}
            </Pressable>
          ) : null}

          {/* Categories */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
            What do you need help with?
          </Text>
          <View style={styles.grid}>
            {categories.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => nav.navigate('category', { id: c.id })}
                android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
                style={({ pressed }) => [styles.catCard, pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <View style={[styles.catIcon, { backgroundColor: c.color + '18' }]}>
                  <Ionicons name={c.icon as any} size={24} color={c.color} />
                </View>
                <Text style={styles.catTitle}>{c.title}</Text>
                <Text style={styles.catSub} numberOfLines={1}>
                  {c.subtitle}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.footNote}>
            SevaApp is an information directory. In a real emergency, always dial 112.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

function SearchResults({
  results,
  onOpen,
}: {
  results: Service[];
  onOpen: (s: Service) => void;
}) {
  const insets = useSafeAreaInsets();
  if (results.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="search" size={40} color={colors.textFaint} />
        <Text style={styles.emptyText}>No services found. Try another word.</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={results}
      keyExtractor={(s) => s.id}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
      keyboardShouldPersistTaps="handled"
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onOpen(item)}
          android_ripple={{ color: colors.primaryLight }}
          style={({ pressed }) => [styles.resultRow, pressed && { backgroundColor: colors.bg }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.resultName}>{item.name}</Text>
            <Text style={styles.resultDesc} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          {item.phones?.[0] ? (
            <Pressable
              onPress={() => callNumber(item.phones![0].number)}
              style={styles.resultCall}
              hitSlop={8}
            >
              <Ionicons name="call" size={18} color={colors.white} />
            </Pressable>
          ) : (
            <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
          )}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  hello: { color: colors.white, fontSize: font.h2, fontWeight: '800' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locText: { color: 'rgba(255,255,255,0.9)', fontSize: font.small, maxWidth: 220 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: font.h3, fontWeight: '800' },
  searchBar: {
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    ...shadow.soft,
  },
  searchInput: { flex: 1, fontSize: font.body, color: colors.text, paddingVertical: 2 },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.md, marginTop: -spacing.xs },
  syncText: { fontSize: font.tiny, color: colors.textFaint, fontWeight: '600' },
  sectionTitle: { fontSize: font.h3, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  quickRow: { flexDirection: 'row', gap: CARD_GAP },
  quick: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 4,
    ...shadow.soft,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  quickNum: { fontSize: font.h3, fontWeight: '900', color: colors.text },
  quickLabel: { fontSize: font.tiny, color: colors.textMuted, fontWeight: '600' },
  femaleCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.pink,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadow.card,
  },
  femaleIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  femaleTitle: { color: colors.white, fontSize: font.h3, fontWeight: '800' },
  femaleSub: { color: 'rgba(255,255,255,0.9)', fontSize: font.small, marginTop: 2 },
  femaleCall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  femaleCallText: { color: colors.white, fontWeight: '800', fontSize: font.small },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP },
  catCard: {
    width: '47.6%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.soft,
  },
  catIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  catTitle: { fontSize: font.body, fontWeight: '800', color: colors.text },
  catSub: { fontSize: font.small, color: colors.textMuted, marginTop: 2 },
  footNote: {
    marginTop: spacing.xl,
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: font.small,
    lineHeight: 18,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xxl },
  emptyText: { color: colors.textMuted, fontSize: font.body },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.soft,
  },
  resultName: { fontSize: font.body, fontWeight: '800', color: colors.text },
  resultDesc: { fontSize: font.small, color: colors.textMuted, marginTop: 2, lineHeight: 18 },
  resultCall: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
