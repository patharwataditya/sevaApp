import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, font, shadow } from '../theme';
import { useNav } from '../navigation/Nav';
import { useApp } from '../context/AppContext';
import { findCategory, servicesByCategory } from '../data/logic';
import { useData } from '../context/DataContext';
import { callNumber, prettyNumber } from '../utils/actions';
import Header from '../components/Header';

export default function CategoryScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { location } = useApp();
  const { categories, services } = useData();
  const id = nav.current.params?.id as string;
  const category = findCategory(categories, id);
  const list = servicesByCategory(services, id, location?.stateCode ?? null);

  if (!category) {
    return (
      <View style={styles.container}>
        <Header title="Not found" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={category.title}
        subtitle={category.subtitle}
        color={category.color}
      />
      <FlatList
        data={list}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListHeaderComponent={
          category.emergency ? (
            <View style={styles.banner}>
              <Ionicons name="alert-circle" size={20} color={colors.danger} />
              <Text style={styles.bannerText}>
                For any life-threatening emergency, dial 112 immediately.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const primary = item.phones?.[0];
          return (
            <Pressable
              onPress={() => nav.navigate('service', { id: item.id })}
              android_ripple={{ color: colors.primaryLight }}
              style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.bg }]}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.department ? (
                    <Text style={styles.dept} numberOfLines={1}>
                      {item.department}
                    </Text>
                  ) : null}
                </View>
                {item.scope !== 'national' ? (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{location?.stateName ?? 'State'}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.desc} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.cardActions}>
                {primary ? (
                  <Pressable
                    onPress={() => callNumber(primary.number)}
                    style={[styles.callChip, category.emergency && { backgroundColor: colors.danger }]}
                  >
                    <Ionicons name="call" size={16} color={colors.white} />
                    <Text style={styles.callChipText}>{prettyNumber(primary.number)}</Text>
                  </Pressable>
                ) : (
                  <View style={styles.infoChip}>
                    <Ionicons name="information-circle" size={16} color={colors.primary} />
                    <Text style={styles.infoChipText}>View details</Text>
                  </View>
                )}
                {item.apps?.length ? (
                  <View style={styles.metaChip}>
                    <Ionicons name="phone-portrait" size={14} color={colors.textMuted} />
                    <Text style={styles.metaText}>App</Text>
                  </View>
                ) : null}
                <View style={{ flex: 1 }} />
                <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No services listed yet for this category.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  bannerText: { flex: 1, color: colors.dangerDark, fontSize: font.small, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.soft },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  name: { fontSize: font.h3, fontWeight: '800', color: colors.text },
  dept: { fontSize: font.tiny, color: colors.textFaint, marginTop: 2 },
  tag: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  tagText: { fontSize: font.tiny, color: colors.accent, fontWeight: '800' },
  desc: { fontSize: font.small, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 19 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  callChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  callChipText: { color: colors.white, fontWeight: '800', fontSize: font.small },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  infoChipText: { color: colors.primary, fontWeight: '800', fontSize: font.small },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: font.tiny, color: colors.textMuted, fontWeight: '600' },
  empty: { padding: spacing.xxl, alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: font.body, textAlign: 'center' },
});
