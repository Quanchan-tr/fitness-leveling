import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { ExerciseSet, ExerciseType } from '@fitness/shared';
import { colors } from '../lib/theme';

const FIELDS: Record<ExerciseType, { key: keyof ExerciseSet; label: string }[]> = {
  weight_reps: [{ key: 'weightKg', label: 'kg' }, { key: 'reps', label: 'reps' }],
  bodyweight_reps: [{ key: 'reps', label: 'reps' }],
  duration: [{ key: 'durationSeconds', label: 'giây' }],
  distance_duration: [{ key: 'distanceKm', label: 'km' }, { key: 'durationSeconds', label: 'giây' }],
};

// Inputs are uncontrolled (defaultValue) so typing "2." or "," isn't clobbered by number parsing.
// Parents remount rows via `key` when the set list changes shape.
export function SetRow({
  set,
  type,
  onChange,
  done,
  children,
}: {
  set: ExerciseSet;
  type: ExerciseType;
  onChange: (patch: Partial<ExerciseSet>) => void;
  done?: boolean;
  children?: ReactNode;
}) {
  return (
    <View style={[s.row, done && { backgroundColor: '#ECFDF5' }]}>
      <Text style={s.num}>{set.setNumber}</Text>
      {FIELDS[type].map(({ key, label }) => (
        <View key={key} style={s.field}>
          <TextInput
            style={s.input}
            keyboardType="decimal-pad"
            defaultValue={set[key] != null ? String(set[key]) : ''}
            selectTextOnFocus
            accessibilityLabel={`Set ${set.setNumber} ${label}`}
            onChangeText={(t) => {
              const n = parseFloat(t.replace(',', '.'));
              onChange({ [key]: Number.isFinite(n) && n >= 0 ? n : undefined });
            }}
          />
          <Text style={s.unit}>{label}</Text>
        </View>
      ))}
      <View style={{ marginLeft: 'auto' }}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8 },
  num: { width: 20, fontWeight: '700', color: colors.muted, textAlign: 'center' },
  field: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  input: { minWidth: 56, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, fontSize: 16, textAlign: 'center', backgroundColor: '#fff' },
  unit: { fontSize: 12, color: colors.muted },
});
