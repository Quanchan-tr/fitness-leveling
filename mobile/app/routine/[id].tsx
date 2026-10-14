import React, { useMemo, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { routines, saveRoutine, deleteRoutine, startWorkout } = useWorkout();

  const routine = useMemo(() => {
    return isNew ? null : routines.find((r) => r.id === id);
  }, [id, isNew, routines]);

  const [title, setTitle] = useState(routine?.title || (isNew ? '' : 'Ngực & Tay Sau Cắt Nét'));
  const [restTimerSeconds, setRestTimerSeconds] = useState(routine?.restTimerSeconds || 90);
  const [exercises, setExercises] = useState<RoutineExerciseItem[]>(routine?.exercises || []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(90);

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
    setIsEditing(false);
    if (isNew) router.back();
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

  const handleStartWorkout = () => {
    if (!exercises.length) {
      Alert.alert('Chưa có bài tập', 'Vui lòng thêm ít nhất 1 bài tập vào routine.');
      return;
    }
    const currentRoutine = routine || {
      id: `r-${Date.now()}`,
      title,
      restTimerSeconds,
      exercises,
      createdBy: { userId: 'me', username: 'Me', avatarUrl: '' },
    };
    startWorkout(currentRoutine);
    router.push('/workout');
  };

  const toggleRestTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const totalSets = exercises.reduce((sum, e) => sum + e.sets.length, 0);

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={exercises}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={s.container}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={s.headerGroup}>
              {/* Top-App-Bar */}
              <View style={s.topAppBar}>
                <Pressable
                  style={s.backBtn}
                  onPress={() => router.back()}
                  accessibilityRole="button"
                >
                  <Text style={s.backBtnText}>‹ Trở về</Text>
                </Pressable>

                <Text style={s.topTitle}>Chi tiết Routine</Text>

                <Pressable
                  style={s.moreBtn}
                  onPress={() => setIsEditing(!isEditing)}
                  accessibilityRole="button"
                >
                  <Text style={s.moreBtnText}>{isEditing ? 'Hủy' : '•••'}</Text>
                </Pressable>
              </View>

              {/* 007-Routine Header Card */}
              <View style={s.routineHeaderCard}>
                <View style={s.routineHeaderTop}>
                  {isEditing ? (
                    <TextInput
                      style={s.titleInput}
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Tên Routine..."
                    />
                  ) : (
                    <Text style={s.routineTitleText}>{title}</Text>
                  )}
                  <View style={s.readyPill}>
                    <Text style={s.readyPillText}>Sẵn sàng</Text>
                  </View>
                </View>

                <Text style={s.routineDesc}>
                  Tập trung tạo độ nét ngực trên, ngực giữa và tay sau với kỹ thuật hãm tạ chuẩn.
                </Text>

                <View style={s.metaBadgesRow}>
                  <Text style={s.metaBadgeDark}>⚡ {exercises.length} bài tập</Text>
                  <Text style={s.metaBadgeDark}>⏱ ~45 phút</Text>
                  <Text style={s.metaBadgeOrange}>⏳ Nghỉ {restTimerSeconds}s</Text>
                </View>
              </View>

              {/* 007-Rest Timer Bar */}
              <View style={s.restTimerBar}>
                <View style={s.timerLeft}>
                  <Text style={s.timerLabel}>⏱ Đồng hồ nghỉ chuẩn:</Text>
                  <Text style={s.timerValue}>
                    {String(Math.floor(restTimerSeconds / 60)).padStart(2, '0')}:
                    {String(restTimerSeconds % 60).padStart(2, '0')}
                  </Text>
                </View>
                <Pressable
                  style={s.timerBtn}
                  onPress={toggleRestTimer}
                  accessibilityRole="button"
                >
                  <Text style={s.timerBtnText}>
                    {timerRunning ? 'Dừng nghỉ' : 'Bắt đầu nghỉ'}
                  </Text>
                </Pressable>
              </View>

              {isEditing && (
                <View style={s.editControlsRow}>
                  <Pressable
                    style={s.addExerciseBtn}
                    onPress={() => setPickerOpen(true)}
                    accessibilityRole="button"
                  >
                    <Text style={s.addExerciseBtnText}>+ Thêm bài tập</Text>
                  </Pressable>
                  <Pressable
                    style={s.saveEditBtn}
                    onPress={handleSave}
                    accessibilityRole="button"
                  >
                    <Text style={s.saveEditBtnText}>Lưu thay đổi</Text>
                  </Pressable>
                  {!isNew && (
                    <Pressable
                      style={s.deleteBtn}
                      onPress={handleDelete}
                      accessibilityRole="button"
                    >
                      <Text style={s.deleteBtnText}>Xoá</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          }
          renderItem={({ item, index: exIdx }) => (
            <View style={s.exerciseCard}>
              <View style={s.exerciseCardHeader}>
                <View>
                  <Text style={s.exerciseMuscleLabel}>
                    BÀI {exIdx + 1} • {item.exercise.targetMuscles?.[0] ? item.exercise.targetMuscles[0].toUpperCase() : 'CƠ BẮP'}
                  </Text>
                  <Text style={s.exerciseNameText}>{item.exercise.name}</Text>
                </View>

                <Pressable
                  style={s.aiCheckBtn}
                  onPress={() => router.push('/pose-camera')}
                  accessibilityRole="button"
                >
                  <Text style={s.aiCheckBtnText}>📹 AI Check Form</Text>
                </Pressable>
              </View>

              {/* Sets Table */}
              <View style={s.setsTable}>
                {item.sets.map((set, setIdx) => {
                  const isDone = set.isCompleted;
                  const isCurrent = !isDone && setIdx === 0;
                  return (
                    <View
                      key={setIdx}
                      style={[
                        s.setTableRow,
                        isCurrent && s.setTableRowActive,
                      ]}
                    >
                      <Text style={s.setRowNumber}>Hiệp {setIdx + 1}</Text>
                      <Text style={s.setRowDetail}>
                        {set.weightKg != null ? `${set.weightKg}kg × ` : ''}
                        {set.reps ?? 8} reps
                      </Text>
                      <View style={s.setStatusTag}>
                        <Text
                          style={[
                            s.setStatusText,
                            isDone
                              ? s.statusDoneText
                              : isCurrent
                              ? s.statusCurrentText
                              : s.statusPendingText,
                          ]}
                        >
                          {isDone ? '✓ Xong' : isCurrent ? 'Đang tập' : 'Chờ'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {isEditing && (
                <View style={s.exerciseEditActions}>
                  <Pressable
                    style={s.actionSmallBtn}
                    onPress={() => handleAddSet(exIdx)}
                  >
                    <Text style={s.actionSmallBtnText}>+ Thêm set</Text>
                  </Pressable>
                  <Pressable
                    style={s.actionSmallBtnDanger}
                    onPress={() => handleRemoveExercise(exIdx)}
                  >
                    <Text style={s.actionSmallBtnDangerText}>Bỏ bài</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
          ListFooterComponent={
            <View style={s.footerGroup}>
              {/* 007-Finish and Save CTA Button */}
              <Pressable
                style={s.finishCtaBtn}
                onPress={handleStartWorkout}
                accessibilityRole="button"
              >
                <Text style={s.finishCtaBtnText}>
                  ▶ Hoàn thành buổi tập & Lưu kỷ lục
                </Text>
              </Pressable>
            </View>
          }
        />
      </KeyboardAvoidingView>

      <ExercisePicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={handleAddExercise}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 12,
  },
  headerGroup: {
    gap: 12,
  },

  // Top App Bar
  topAppBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 32,
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  topTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  moreBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  moreBtnText: {
    fontSize: 12,
    color: colors.muted,
  },

  // Routine Header Card
  routineHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  routineHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    padding: 0,
  },
  readyPill: {
    backgroundColor: colors.successSoft,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  readyPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.successText,
  },
  routineDesc: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
  },
  metaBadgesRow: {
    flexDirection: 'row',
    gap: 14,
  },
  metaBadgeDark: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  metaBadgeOrange: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryText,
  },

  // Rest Timer Bar
  restTimerBar: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.primaryText,
  },
  timerValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  timerBtn: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  timerBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Edit controls
  editControlsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addExerciseBtn: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addExerciseBtnText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  saveEditBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  saveEditBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },

  // Exercise Card
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 8,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseMuscleLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.subtle,
  },
  exerciseNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  aiCheckBtn: {
    backgroundColor: colors.infoSoft,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  aiCheckBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.info,
  },

  // Sets Table
  setsTable: {
    gap: 4,
  },
  setTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  setTableRowActive: {
    backgroundColor: colors.primarySoft,
  },
  setRowNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
    width: 50,
  },
  setRowDetail: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    flex: 1,
  },
  setStatusTag: {
    alignItems: 'flex-end',
  },
  setStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusDoneText: {
    color: colors.successText,
  },
  statusCurrentText: {
    color: colors.primaryText,
  },
  statusPendingText: {
    color: colors.subtle,
  },

  exerciseEditActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  actionSmallBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  actionSmallBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
  },
  actionSmallBtnDanger: {
    backgroundColor: '#FEE2E2',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  actionSmallBtnDangerText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.danger,
  },

  // Footer CTA
  footerGroup: {
    marginTop: 8,
  },
  finishCtaBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
