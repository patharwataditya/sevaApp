import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, font, shadow } from '../theme';
import { useNav } from '../navigation/Nav';
import { useApp } from '../context/AppContext';
import { states, findStateByName, StateInfo } from '../data/states';

export default function LocationScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { saveLocation } = useApp();
  const [status, setStatus] = useState<'idle' | 'locating' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  async function detect() {
    setStatus('locating');
    setErrorMsg('');
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') {
        setStatus('error');
        setErrorMsg('Location permission denied. You can pick your state manually below.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const places = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const place = places[0];
      const region = place?.region ?? null;
      const matched = findStateByName(region);
      const district =
        place?.subregion || place?.city || place?.district || null;

      if (!matched) {
        setStatus('error');
        setErrorMsg(
          region
            ? `Detected "${region}", which isn't recognised. Please pick your state manually.`
            : 'Could not read your state. Please pick it manually below.'
        );
        return;
      }

      await saveLocation({
        stateCode: matched.code,
        stateName: matched.name,
        district,
        city: place?.city ?? null,
        detected: true,
      });
      nav.navigate('signup');
    } catch (e: any) {
      setStatus('error');
      setErrorMsg('Could not fetch your location. Please pick your state manually below.');
    }
  }

  async function pickState(s: StateInfo) {
    setPickerOpen(false);
    await saveLocation({
      stateCode: s.code,
      stateName: s.name,
      district: null,
      city: null,
      detected: false,
    });
    nav.navigate('signup');
  }

  const locating = status === 'locating';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pin}>
          <Ionicons name="location" size={40} color={colors.white} />
        </View>
        <Text style={styles.title}>Where are you?</Text>
        <Text style={styles.subtitle}>
          We use your location once to find the emergency numbers and government
          services for your state and district. Your location never leaves your phone.
        </Text>

        {status === 'error' && errorMsg ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={detect}
          disabled={locating}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          style={({ pressed }) => [styles.detectBtn, pressed && { opacity: 0.92 }]}
        >
          {locating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Ionicons name="navigate" size={20} color={colors.white} />
          )}
          <Text style={styles.detectText}>
            {locating ? 'Detecting…' : 'Use my current location'}
          </Text>
        </Pressable>

        <View style={styles.orRow}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [styles.manualBtn, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="map-outline" size={20} color={colors.primary} />
          <Text style={styles.manualText}>Select my state manually</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </Pressable>
      </ScrollView>

      <StatePicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={pickState}
      />
    </View>
  );
}

function StatePicker({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (s: StateInfo) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select your state</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>
          <FlatList
            data={states}
            keyExtractor={(s) => s.code}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                android_ripple={{ color: colors.primaryLight }}
                style={({ pressed }) => [styles.stateRow, pressed && { backgroundColor: colors.bg }]}
              >
                <Text style={styles.stateName}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  pin: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  title: { fontSize: font.h1, fontWeight: '900', color: colors.text, marginTop: spacing.lg },
  subtitle: { fontSize: font.body, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22 },
  errorBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.lg,
    alignItems: 'flex-start',
  },
  errorText: { flex: 1, color: colors.dangerDark, fontSize: font.small, lineHeight: 18 },
  detectBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadow.card,
  },
  detectText: { color: colors.white, fontSize: font.h3, fontWeight: '800' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.xl },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { color: colors.textFaint, fontSize: font.small, fontWeight: '600' },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manualText: { flex: 1, color: colors.text, fontSize: font.body, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '80%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  modalTitle: { fontSize: font.h3, fontWeight: '800', color: colors.text },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  stateName: { fontSize: font.body, color: colors.text, fontWeight: '600' },
  sep: { height: 1, backgroundColor: colors.bg },
});
