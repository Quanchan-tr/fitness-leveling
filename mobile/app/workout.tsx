import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useWorkout } from '../lib/workout-store';
import { colors, formatDuration } from '../lib/theme';
import { SetRow } from '../components/SetRow';

export default function WorkoutSessionScreen() {
  const {
    session,
    editSet,
    completeSet,
    adjustRest,
    skipRest,
    finishWorkout,
    cancelWorkout,
  } = useWorkout();

  const [now, setNow] = useState(Date.now());

  // 1-second interval to drive both the elapsed stopwatch and the rest countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!session) {
    return (
      <View style={s.emptyContainer}>
        <Text style={s.emptyText}>Không có buổi tập nào đang diễn ra.</Text>
        <Pressable
          style={s.backBtn}
          onPress={() => router.replace('/(tabs)/routines')}
          accessibilityRole="button"
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Về danh sách Routines</Text>
        </Pressable>
      </View>
    );
  }

  const elapsedSeconds = Math.max(0, Math.floor((now - session.startTime) / 1000));
  const restRemaining = session.restEndsAt
    ? Math.max(0, Math.ceil((session.restEndsAt - now) / 1000))
    : 0;
  const isResting = restRemaining > 0;

  const handleCompleteSet = (exerciseIdx: number, setIdx: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    completeSet(exerciseIdx, setIdx);
  };

  const handleFinish = () => {
    Alert.alert('Hoàn thành buổi tập', 'Bạn có chắc chắn muốn kết thúc buổi tập này?', [
      { text: 'Tiếp tục tập', style: 'cancel' },
      {
        text: 'Kết thúc & Lưu',
        onPress: () => {
          const record = finishWorkout();
          if (record) {
            Alert.alert(
              '🎉 Tuyệt vời!',
              `Thời gian: ${formatDuration(record.durationSeconds)}\nTổng set: ${record.totalSets}\nTổng rep: ${record.totalReps}\nKhối lượng: ${Math.round(record.totalVolumeKg)} kg`,
              [{ text: 'Xem lịch sử', onPress: () => router.replace('/(tabs)') }]
            );
          } else {
            router.replace('/(tabs)');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Huỷ buổi tập', 'Dữ liệu của buổi tập này sẽ không được lưu. Bạn có chắc không?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Huỷ bỏ',
        style: 'destructive',
        onPress: () => {
          cancelWorkout();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Top Banner: Routine Title & Stopwatch */}
      <View style={s.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={s.routineTitle} numberOfLines={1}>
            {session.routineTitle}
          </Text>
          <Text style={s.stopwatch}>⏱ {formatDuration(elapsedSeconds)}</Text>
        </View>
        <Pressable style={s.cancelBtn} onPress={handleCancel} accessibilityRole="button">
          <Text style={s.cancelText}>Huỷ</Text>
        </Pressable>
        <Pressable style={s.finishBtn} onPress={handleFinish} accessibilityRole="button">
          <Text style={s.finishText}>Hoàn thành</Text>
        </Pressable>
      </View>

      {/* Floating Rest Timer Bar if resting */}
      {isResting && (
        <View style={s.restBar}>
          <View>
            <Text style={s.restLabel}>Nghỉ ngơi</Text>
            <Text style={s.restTime}>{formatDuration(restRemaining)}</Text>
          </View>
          <View style={s.restControls}>
            <Pressable
              style={s.restAdjustBtn}
              onPress={() => adjustRest(-15)}
              accessibilityRole="button"
            >
              <Text style={s.restAdjustText}>-15s</Text>
            </Pressable>
            <Pressable
              style={s.restAdjustBtn}
              onPress={() => adjustRest(+15)}
              accessibilityRole="button"
            >
              <Text style={s.restAdjustText}>+15s</Text>
            </Pressable>
            <Pressable style={s.skipBtn} onPress={skipRest} accessibilityRole="button">
              <Text style={s.skipText}>Bỏ qua</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Exercises & Sets */}
      <FlatList
        data={session.exercises}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 64 }}
        renderItem={({ item, index: exIdx }) => (
          <View style={s.card}>
            <Text style={s.exName}>{item.exercise.nameVi || item.exercise.name}</Text>
            <Text style={s.exMeta}>
              {item.exercise.targetMuscles.join(', ')} · {item.exercise.equipment}
            </Text>

            <View style={{ gap: 6, marginTop: 10 }}>
              {item.sets.map((set, setIdx) => {
                const done = set.isCompleted;
                return (
                  <SetRow
                    key={`${exIdx}-${setIdx}-${set.setNumber}`}
                    set={set}
                    type={item.exercise.type}
                    done={done}
                    onChange={(patch) => editSet(exIdx, setIdx, patch)}
                  >
                    <Pressable
                      style={[s.checkBtn, done && s.checkBtnDone]}
                      onPress={() => handleCompleteSet(exIdx, setIdx)}
                      accessibilityRole="button"
                      accessibilityLabel={`Hoàn thành set ${set.setNumber}`}
                    >
                      <Text style={[s.checkText, done && s.checkTextDone]}>
                        {done ? '✓' : 'Xong'}
                      </Text>
                    </Pressable>
                  </SetRow>
                );
              })}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  emptyText: { fontSize: 16, color: colors.muted, textAlign: 'center' },
  backBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#fff',
    gap: 8,
  },
  routineTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  stopwatch: { fontSize: 13, fontWeight: '600', color: colors.muted, marginTop: 2 },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 10 },
  cancelText: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  finishBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  finishText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  restBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  restLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  restTime: { color: '#38BDF8', fontSize: 20, fontWeight: '800' },
  restControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  restAdjustBtn: {
    backgroundColor: '#334155',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  restAdjustText: { color: '#F1F5F9', fontWeight: '700', fontSize: 12 },
  skipBtn: {
    backgroundColor: '#F87171',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  skipText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  exName: { fontSize: 16, fontWeight: '700', color: colors.text },
  exMeta: { fontSize: 12, color: colors.muted, textTransform: 'capitalize' },
  checkBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  checkBtnDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkText: { fontSize: 13, fontWeight: '700', color: colors.text },
  checkTextDone: { color: '#fff' },
});
