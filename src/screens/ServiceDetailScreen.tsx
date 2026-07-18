import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, font, shadow } from '../theme';
import { useNav } from '../navigation/Nav';
import { findService, findCategory } from '../data/logic';
import { useData } from '../context/DataContext';
import { openUrl } from '../utils/actions';
import CallButton from '../components/CallButton';
import Header from '../components/Header';

export default function ServiceDetailScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { categories, services } = useData();
  const id = nav.current.params?.id as string;
  const service = findService(services, id);
  const category = service ? findCategory(categories, service.categoryId) : undefined;

  if (!service) {
    return (
      <View style={styles.container}>
        <Header title="Not found" />
      </View>
    );
  }

  const isEmergency = category?.emergency || service.emergency;
  const headerColor = service.femaleOnly ? colors.pink : category?.color ?? colors.primary;

  return (
    <View style={styles.container}>
      <Header title={service.name} subtitle={service.department} color={headerColor} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.desc}>{service.description}</Text>

        {/* Call actions */}
        {service.phones?.length ? (
          <>
            <SectionLabel icon="call" text="Call now" />
            <View style={{ gap: spacing.md }}>
              {service.phones.map((p, i) => (
                <CallButton
                  key={p.number + i}
                  number={p.number}
                  label={p.label}
                  variant={isEmergency ? 'danger' : 'primary'}
                />
              ))}
            </View>
          </>
        ) : null}

        {/* Apps */}
        {service.apps?.length ? (
          <>
            <SectionLabel icon="phone-portrait" text="Official apps" />
            <View style={{ gap: spacing.md }}>
              {service.apps.map((app) => (
                <View key={app.name} style={styles.appCard}>
                  <View style={styles.appHead}>
                    <View style={styles.appIcon}>
                      <Ionicons name="apps" size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.appName}>{app.name}</Text>
                      {app.description ? (
                        <Text style={styles.appDesc}>{app.description}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.storeRow}>
                    {app.android ? (
                      <StoreButton
                        icon="logo-google-playstore"
                        label="Play Store"
                        onPress={() => openUrl(app.android!)}
                      />
                    ) : null}
                    {app.ios ? (
                      <StoreButton
                        icon="logo-apple-appstore"
                        label="App Store"
                        onPress={() => openUrl(app.ios!)}
                      />
                    ) : null}
                    {!app.android && !app.ios && app.website ? (
                      <StoreButton
                        icon="globe-outline"
                        label="Open"
                        onPress={() => openUrl(app.website!)}
                      />
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* Links */}
        {(service.website || service.complaintUrl) && (
          <>
            <SectionLabel icon="link" text="Links" />
            <View style={{ gap: spacing.sm }}>
              {service.website ? (
                <LinkRow icon="globe-outline" text="Official website" onPress={() => openUrl(service.website!)} />
              ) : null}
              {service.complaintUrl && service.complaintUrl !== service.website ? (
                <LinkRow
                  icon="create-outline"
                  text="File / track a complaint"
                  onPress={() => openUrl(service.complaintUrl!)}
                />
              ) : null}
            </View>
          </>
        )}

        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
          <Text style={styles.disclaimerText}>
            Numbers and links are provided for convenience. Availability may vary by area.
            In a life-threatening emergency, always dial 112.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Ionicons name={icon as any} size={16} color={colors.textMuted} />
      <Text style={styles.sectionText}>{text}</Text>
    </View>
  );
}

function StoreButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.store, pressed && { opacity: 0.85 }]}>
      <Ionicons name={icon as any} size={18} color={colors.text} />
      <Text style={styles.storeText}>{label}</Text>
    </Pressable>
  );
}

function LinkRow({ icon, text, onPress }: { icon: string; text: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.linkRow, pressed && { backgroundColor: colors.bg }]}>
      <Ionicons name={icon as any} size={20} color={colors.primary} />
      <Text style={styles.linkText}>{text}</Text>
      <Ionicons name="open-outline" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  desc: { fontSize: font.body, color: colors.text, lineHeight: 23 },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionText: {
    fontSize: font.small,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  appCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.soft },
  appHead: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  appIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { fontSize: font.body, fontWeight: '800', color: colors.text },
  appDesc: { fontSize: font.small, color: colors.textMuted, marginTop: 2, lineHeight: 18 },
  storeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  store: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  storeText: { fontSize: font.small, fontWeight: '700', color: colors.text },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadow.soft,
  },
  linkText: { flex: 1, fontSize: font.body, fontWeight: '600', color: colors.text },
  disclaimerBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    padding: spacing.md,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    alignItems: 'flex-start',
  },
  disclaimerText: { flex: 1, fontSize: font.small, color: colors.textMuted, lineHeight: 18 },
});
