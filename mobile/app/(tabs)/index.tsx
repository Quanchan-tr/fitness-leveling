import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { useWorkout } from '../../lib/workout-store';
import { colors, formatDuration } from '../../lib/theme';

const WEEK_MS = 7 * 24 * 3600 * 1000;

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { history, session } = useWorkout();

  const week = history.filter((h) => Date.now() - new Date(h.completedAt).getTime() < WEEK_MS);
  const weekVolume = week.reduce((sum, h) => sum + h.totalVolumeKg, 0);
  const weekTime = week.reduce((sum, h) => sum + h.durationSeconds, 0);

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      data={history}
      keyExtractor={(h) => h.id}
      ListHeaderComponent={
        <View style={{ gap: 16, marginBottom: 4 }}>
          <View style={s.row}>
            <Text style={s.hello}>Chào {user?.name ?? ''} 👋</Text>
            <Pressable onPress={signOut} hitSlop={8} accessibilityRole="button">
              <Text style={{ color: colors.muted }}>Đăng xuất</Text>
            </Pressable>
          </View>

          {session && (
            <Pressable style={s.resume} onPress={() => router.push('/workout')} accessibilityRole="button">
              <Text style={{ color: '#fff', fontWeight: '700' }}>Tiếp tục: {session.routineTitle}</Text>
            </Pressable>
          )}

          <View style={s.stats}>
            <Stat label="Buổi / 7 ngày" value={String(week.length)} />
            <Stat label="Khối lượng" value={`${Math.round(weekVolume)} kg`} />
            <Stat label="Thời gian" value={formatDuration(weekTime)} />
          </View>

          <Text style={s.section}>Lịch sử tập</Text>
          {history.length === 0 && <Text style={{ color: colors.muted }}>Chưa có buổi tập nào. Vào tab Routines để bắt đầu.</Text>}
        </View>
      }
      renderItem={({ item }) => (
        <View style={s.card}>
          <Text style={s.cardTitle}>{item.routineTitle}</Text>
          <Text style={s.meta}>
            {new Date(item.completedAt).toLocaleDateString('vi-VN')} · {formatDuration(item.durationSeconds)} · {item.totalSets} set ·{' '}
            {Math.round(item.totalVolumeKg)} kg
          </Text>
        </View>
      )}
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.meta}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hello: { fontSize: 24, fontWeight: '800', color: colors.text },
  resume: { backgroundColor: colors.primary, borderRadius: 12, padding: 16 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  section: { fontSize: 18, fontWeight: '700', color: colors.text },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.muted },
});
