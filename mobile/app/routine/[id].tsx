import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  addSet,
  defaultSets,
  removeSet,
  type Exercise,
  type ExerciseSet,
  type RoutineExerciseItem,
} from '@fitness/shared';
import { useWorkout } from '../../lib/workout-store';
import { colors } from '../../lib/theme';
import { ExercisePicker } from '../../components/ExercisePicker';
import { SetRow } from '../../components/SetRow';

export default function RoutineDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { routines, saveRoutine, deleteRoutine } = useWorkout();

  const routine = useMemo(() => {
    return isNew ? null : routines.find((r) => r.id === id);
  }, [id, isNew, routines]);

  const [title, setTitle] = useState(routine?.title || '');
  const [restTimerSeconds, setRestTimerSeconds] = useState(routine?.restTimerSeconds || 60);
  const [exercises, setExercises] = useState<RoutineExerciseItem[]>(routine?.exercises || []);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleAddExercise = (picked: Exercise) => {
    const newItem: RoutineExerciseItem = {
      exercise: picked,
      sets: defaultSets(picked.type),
      restTimerSeconds,
    };
    setExercises((prev) => [...prev, newItem]);
    setPickerOpen(false);
  };

  const handleRemoveExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddSet = (exerciseIdx: number) => {
    setExercises((prev) => {
      const copy = [...prev];
      const exItem = copy[exerciseIdx];
      copy[exerciseIdx] = {
        ...exItem,
        sets: addSet(exItem.sets, exItem.exercise.type),
      };
      return copy;
    });
  };

  const handleRemoveSet = (exerciseIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const copy = [...prev];
      const exItem = copy[exerciseIdx];
      copy[exerciseIdx] = {
        ...exItem,
        sets: removeSet(exItem.sets, setIdx),
      };
      return copy;
    });
  };

  const handleUpdateSet = (exerciseIdx: number, setIdx: number, patch: Partial<ExerciseSet>) => {
    setExercises((prev) => {
      const copy = [...prev];
      const exItem = copy[exerciseIdx];
      const sets = [...exItem.sets];
      sets[setIdx] = { ...sets[setIdx], ...patch };
      copy[exerciseIdx] = { ...exItem, sets };
      return copy;
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên cho Routine.');
      return;
    }
    saveRoutine(
      {
        title: title.trim(),
        restTimerSeconds,
        exercises,
      },
      isNew ? undefined : routine?.id
    );
    router.back();
  };

  const handleDelete = () => {
    if (!routine) return;
    Alert.alert('Xoá routine', `Bạn có chắc muốn xoá "${routine.title}"?`, [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: () => {
          deleteRoutine(routine.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={exercises}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 64 }}
        ListHeaderComponent={
          <View style={{ gap: 12 }}>
            <View style={s.card}>
              <Text style={s.label}>Tên Routine *</Text>
              <TextInput
                style={s.input}
                placeholder="Ví dụ: Ngực & Tay Sau"
                value={title}
                onChangeText={setTitle}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={s.label}>Thời gian nghỉ (giây):</Text>
                <TextInput
                  style={[s.input, { width: 80, textAlign: 'center' }]}
                  keyboardType="number-pad"
                  value={String(restTimerSeconds)}
                  onChangeText={(t) => {
                    const n = parseInt(t, 10);
                    if (!isNaN(n) && n > 0) setRestTimerSeconds(n);
                  }}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={s.sectionTitle}>Danh sách bài tập ({exercises.length})</Text>
              <Pressable
                style={s.addExBtn}
                onPress={() => setPickerOpen(true)}
                accessibilityRole="button"
              >
                <Text style={s.addExText}>+ Thêm bài</Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item, index: exIdx }) => (
          <View style={s.exerciseCard}>
            <View style={s.exHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.exName}>{item.exercise.nameVi || item.exercise.name}</Text>
                <Text style={s.exMeta}>
                  {item.exercise.targetMuscles.join(', ')} · {item.exercise.equipment}
                </Text>
              </View>
              <Pressable
                onPress={() => handleRemoveExercise(exIdx)}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '600' }}>Xoá</Text>
              </Pressable>
            </View>

            <View style={{ gap: 6, marginVertical: 8 }}>
              {item.sets.map((set, setIdx) => (
                <SetRow
                  key={`${exIdx}-${setIdx}-${set.setNumber}`}
                  set={set}
                  type={item.exercise.type}
                  onChange={(patch) => handleUpdateSet(exIdx, setIdx, patch)}
                >
                  {item.sets.length > 1 && (
                    <Pressable
                      onPress={() => handleRemoveSet(exIdx, setIdx)}
                      hitSlop={8}
                      accessibilityRole="button"
                    >
                      <Text style={{ color: colors.muted, fontSize: 13 }}>✕</Text>
                    </Pressable>
                  )}
                </SetRow>
              ))}
            </View>

            <Pressable
              style={s.addSetBtn}
              onPress={() => handleAddSet(exIdx)}
              accessibilityRole="button"
            >
              <Text style={s.addSetText}>+ Thêm set</Text>
            </Pressable>
          </View>
        )}
        ListFooterComponent={
          <View style={{ gap: 12, marginTop: 8 }}>
            <Pressable style={s.saveBtn} onPress={handleSave} accessibilityRole="button">
              <Text style={s.saveText}>Lưu Routine</Text>
            </Pressable>
            {!isNew && (
              <Pressable style={s.deleteBtn} onPress={handleDelete} accessibilityRole="button">
                <Text style={s.deleteText}>Xoá Routine này</Text>
              </Pressable>
            )}
          </View>
        }
      />

      <ExercisePicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={handleAddExercise}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  label: { fontSize: 13, fontWeight: '700', color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  addExBtn: {
    backgroundColor: colors.primarySoft,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addExText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  exName: { fontSize: 16, fontWeight: '700', color: colors.text },
  exMeta: { fontSize: 12, color: colors.muted, textTransform: 'capitalize' },
  addSetBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  addSetText: { fontSize: 12, fontWeight: '600', color: colors.text },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  deleteBtn: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
});
