import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useWorkout } from '../../lib/workout-store';
import { colors } from '../../lib/theme';

export default function Routines() {
  const { routines, session, startWorkout, deleteRoutine } = useWorkout();

  const start = (id: string) => {
    const routine = routines.find((r) => r.id === id)!;
    const go = () => {
      startWorkout(routine);
      router.push('/workout');
    };
    if (!session) return go();
    Alert.alert('Đang có buổi tập', `Bỏ buổi "${session.routineTitle}" để bắt đầu buổi mới?`, [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Bắt đầu mới', style: 'destructive', onPress: go },
    ]);
  };

  const confirmDelete = (id: string, title: string) =>
    Alert.alert('Xoá routine', `Xoá "${title}"?`, [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: () => deleteRoutine(id) },
    ]);

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      data={routines}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={
        <Pressable style={s.create} onPress={() => router.push('/routine/new')} accessibilityRole="button">
          <Text style={{ color: colors.primary, fontWeight: '700' }}>+ Tạo routine mới</Text>
        </Pressable>
      }
      ListEmptyComponent={<Text style={{ color: colors.muted }}>Chưa có routine nào.</Text>}
      renderItem={({ item }) => (
        <Pressable
          style={s.card}
          onPress={() => router.push(`/routine/${item.id}`)}
          onLongPress={() => confirmDelete(item.id, item.title)}
        >
          <Text style={s.title}>{item.title}</Text>
          <Text style={s.meta} numberOfLines={2}>
            {item.exercises.map((e) => e.exercise.name).join(' · ') || 'Chưa có bài tập'}
          </Text>
          <View style={s.row}>
            <Pressable
              style={[s.start, !item.exercises.length && { opacity: 0.4 }]}
              disabled={!item.exercises.length}
              onPress={() => start(item.id)}
              accessibilityRole="button"
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Bắt đầu</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    />
  );
}

const s = StyleSheet.create({
  create: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, backgroundColor: colors.primarySoft, borderRadius: 12, padding: 16, alignItems: 'center' },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, gap: 6 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.muted },
  row: { flexDirection: 'row', justifyContent: 'flex-end' },
  start: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 },
});
