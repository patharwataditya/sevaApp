import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, font, shadow } from '../theme';
import { useNav } from '../navigation/Nav';
import { useApp, Gender } from '../context/AppContext';
import Header from '../components/Header';

const GENDERS: { key: Gender; label: string; icon: string }[] = [
  { key: 'female', label: 'Female', icon: 'female' },
  { key: 'male', label: 'Male', icon: 'male' },
  { key: 'other', label: 'Other', icon: 'transgender' },
];

const AGE_GROUPS = ['Under 18', '18–25', '26–40', '41–60', '60+'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

export default function SignupScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { saveProfile, completeOnboarding, location } = useApp();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const valid = name.trim().length >= 2 && gender && ageGroup;

  async function finish() {
    setTouched(true);
    if (!valid) return;
    await saveProfile({
      name: name.trim(),
      gender: gender!,
      ageGroup: ageGroup!,
      phone: phone.trim() || undefined,
      bloodGroup: bloodGroup || undefined,
    });
    await completeOnboarding();
    nav.reset('home');
  }

  return (
    <View style={styles.container}>
      <Header title="Tell us about you" subtitle={location?.stateName ?? undefined} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.help}>
            This helps us show the most relevant helplines (like the women’s helpline)
            and keeps your basic info handy in an emergency. It stays only on this phone.
          </Text>

          {/* Name */}
          <Field label="Full name" required>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={colors.textFaint}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </Field>
          {touched && name.trim().length < 2 ? (
            <Text style={styles.err}>Please enter your name.</Text>
          ) : null}

          {/* Gender */}
          <Field label="Gender" required>
            <View style={styles.chipRow}>
              {GENDERS.map((g) => {
                const active = gender === g.key;
                return (
                  <Pressable
                    key={g.key}
                    onPress={() => setGender(g.key)}
                    style={[styles.genderChip, active && styles.genderChipActive]}
                  >
                    <Ionicons
                      name={g.icon as any}
                      size={18}
                      color={active ? colors.white : colors.textMuted}
                    />
                    <Text style={[styles.genderText, active && { color: colors.white }]}>
                      {g.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>
          {touched && !gender ? <Text style={styles.err}>Please select your gender.</Text> : null}

          {/* Age group */}
          <Field label="Age group" required>
            <View style={styles.wrapRow}>
              {AGE_GROUPS.map((a) => {
                const active = ageGroup === a;
                return (
                  <Pressable
                    key={a}
                    onPress={() => setAgeGroup(a)}
                    style={[styles.pill, active && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, active && { color: colors.white }]}>{a}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>
          {touched && !ageGroup ? <Text style={styles.err}>Please select your age group.</Text> : null}

          {/* Phone (optional) */}
          <Field label="Phone number" optional>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile (optional)"
              placeholderTextColor={colors.textFaint}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="phone-pad"
            />
          </Field>

          {/* Blood group (optional) */}
          <Field label="Blood group" optional>
            <View style={styles.wrapRow}>
              {BLOOD_GROUPS.map((b) => {
                const active = bloodGroup === b;
                return (
                  <Pressable
                    key={b}
                    onPress={() => setBloodGroup(active ? null : b)}
                    style={[styles.pill, active && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, active && { color: colors.white }]}>{b}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Pressable
            onPress={finish}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            style={({ pressed }) => [
              styles.cta,
              !valid && styles.ctaDisabled,
              pressed && { opacity: 0.92 },
            ]}
          >
            <Text style={styles.ctaText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
        {optional ? <Text style={styles.optional}>  (optional)</Text> : null}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg },
  help: {
    fontSize: font.small,
    color: colors.textMuted,
    lineHeight: 20,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  field: { marginBottom: spacing.lg },
  fieldLabel: { fontSize: font.small, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  optional: { color: colors.textFaint, fontWeight: '500', fontSize: font.tiny },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: font.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  err: { color: colors.danger, fontSize: font.small, marginTop: -spacing.sm, marginBottom: spacing.md },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  genderChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genderChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  genderText: { fontSize: font.body, fontWeight: '700', color: colors.textMuted },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: font.small, fontWeight: '700', color: colors.textMuted },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
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
  ctaDisabled: { backgroundColor: colors.textFaint },
  ctaText: { color: colors.white, fontSize: font.h3, fontWeight: '800' },
});
