import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { apiExerciseToExercise, fetchExercises, type ApiExercise, type Exercise } from '@fitness/shared';
import { colors } from '../lib/theme';

// ponytail: shows the first 30 matches only (no infinite scroll); search narrows it. Add onEndReached paging if needed.
export function ExercisePicker({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (ex: Exercise) => void }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<ApiExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    const t = setTimeout(() => {
      setLoading(true);
      setError('');
      fetchExercises(q.trim())
        .then((r) => !cancelled && setItems(r.data))
        .catch((e) => !cancelled && setError((e as Error).message))
        .finally(() => !cancelled && setLoading(false));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, visible]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.header}>
        <Text style={s.title}>Thêm bài tập</Text>
        <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Đóng</Text>
        </Pressable>
      </View>
      <TextInput style={s.search} placeholder="Tìm bài tập…" value={q} onChangeText={setQ} autoCorrect={false} />
      {loading && <ActivityIndicator style={{ margin: 16 }} color={colors.primary} />}
      {!!error && <Text style={s.error}>{error}</Text>}
      <FlatList
        data={items}
        keyExtractor={(e) => String(e.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <Pressable style={s.item} onPress={() => onPick(apiExerciseToExercise(item))} accessibilityRole="button">
            <Text style={s.name}>{item.nameVi || item.name}</Text>
            <Text style={s.meta}>{[item.target_muscle || item.body_part, item.equipment].filter(Boolean).join(' · ')}</Text>
          </Pressable>
        )}
      />
    </Modal>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  search: { marginHorizontal: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, backgroundColor: colors.surface, fontSize: 16 },
  error: { color: colors.danger, margin: 16 },
  item: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { fontSize: 13, color: colors.muted, marginTop: 2 },
});
