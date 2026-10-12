import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth';
import { useWorkout } from '../../lib/workout-store';
import { colors } from '../../lib/theme';
import { CharacterCanvas } from '../../components/3d/CharacterCanvas';
import { CharacterOutfit } from '../../components/3d/Character';

const OUTFIT_COLORS = [
  { name: 'Xanh Electric', color: '#2563EB' },
  { name: 'Cam Năng Động', color: '#FF5722' },
  { name: 'Xanh Lục Emerald', color: '#10B981' },
  { name: 'Đen Obsidian', color: '#1E293B' },
  { name: 'Tím Cyberpunk', color: '#8B5CF6' },
];

export default function AvatarScreen() {
  const { user } = useAuth();
  const { history } = useWorkout();

  const [autoRotate, setAutoRotate] = useState(false);
  const [shirtColor, setShirtColor] = useState('#2563EB');

  // Compute RPG Leveling stats dynamically based on real workout history
  const totalWorkouts = history.length;
  const level = Math.max(1, Math.floor(totalWorkouts / 2) + 1);
  const currentXp = (totalWorkouts % 2) * 500 + (totalWorkouts > 0 ? 250 : 0);
  const maxXp = 1000;
  const xpPercent = Math.min(100, Math.round((currentXp / maxXp) * 100));

  const totalVolume = history.reduce((acc, h) => acc + h.totalVolumeKg, 0);
  const totalMinutes = Math.round(
    history.reduce((acc, h) => acc + h.durationSeconds, 0) / 60
  );
  const totalSets = history.reduce((acc, h) => acc + h.totalSets, 0);

  // RPG Attributes
  const str = Math.min(100, 20 + Math.round(totalVolume / 100));
  const end = Math.min(100, 25 + Math.round(totalMinutes / 5));
  const agi = Math.min(100, 30 + Math.round(totalSets * 1.5));

  const outfit: CharacterOutfit = useMemo(
    () => ({
      shirtColor,
      shoesColor: shirtColor,
      shortsColor: '#1E293B',
      headbandColor: '#1E293B',
      wristbandColor: '#1E293B',
    }),
    [shirtColor]
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Header with Level & Title */}
      <View style={s.header}>
        <View>
          <Text style={s.playerName}>{user?.name || 'Chiến Binh'}</Text>
          <Text style={s.playerTitle}>Vận Động Viên Thể Thao 3D</Text>
        </View>
        <View style={s.levelBadge}>
          <Text style={s.levelText}>Lv. {level}</Text>
        </View>
      </View>

      {/* 3D Viewport Card */}
      <View style={s.viewportCard}>
        <View style={s.viewportHeader}>
          <Text style={s.hintText}>Vuốt ngang để xoay 360°</Text>
          <Pressable
            style={[s.rotateBtn, autoRotate && s.rotateBtnActive]}
            onPress={() => setAutoRotate((prev) => !prev)}
            accessibilityRole="button"
          >
            <Ionicons
              name="sync-outline"
              size={15}
              color={autoRotate ? '#fff' : colors.text}
            />
            <Text style={[s.rotateText, autoRotate && { color: '#fff' }]}>
              {autoRotate ? 'Dừng' : 'Tự xoay'}
            </Text>
          </Pressable>
        </View>

        <CharacterCanvas level={level} outfit={outfit} autoRotate={autoRotate} />

        {/* XP Bar */}
        <View style={s.xpContainer}>
          <View style={s.xpRow}>
            <Text style={s.xpLabel}>Tiến trình kinh nghiệm</Text>
            <Text style={s.xpValue}>
              {currentXp} / {maxXp} XP ({xpPercent}%)
            </Text>
          </View>
          <View style={s.xpBarBg}>
            <View style={[s.xpBarFill, { width: `${xpPercent}%` }]} />
          </View>
        </View>
      </View>

      {/* RPG Stats Attributes Card */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Chỉ số Leveling (STR / END / AGI)</Text>

        <View style={s.statRow}>
          <View style={s.statMeta}>
            <Text style={s.statName}>Sức mạnh (STR)</Text>
            <Text style={s.statScore}>{str}/100</Text>
          </View>
          <View style={s.statTrack}>
            <View style={[s.statFill, { width: `${str}%`, backgroundColor: '#EF4444' }]} />
          </View>
        </View>

        <View style={s.statRow}>
          <View style={s.statMeta}>
            <Text style={s.statName}>Thể lực (END)</Text>
            <Text style={s.statScore}>{end}/100</Text>
          </View>
          <View style={s.statTrack}>
            <View style={[s.statFill, { width: `${end}%`, backgroundColor: '#3B82F6' }]} />
          </View>
        </View>

        <View style={s.statRow}>
          <View style={s.statMeta}>
            <Text style={s.statName}>Linh hoạt (AGI)</Text>
            <Text style={s.statScore}>{agi}/100</Text>
          </View>
          <View style={s.statTrack}>
            <View style={[s.statFill, { width: `${agi}%`, backgroundColor: '#10B981' }]} />
          </View>
        </View>
      </View>

      {/* Outfit Customizer */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Tuỳ biến trang phục thi đấu</Text>
        <Text style={s.cardSub}>Chọn màu áo & giày thể thao của nhân vật:</Text>

        <View style={s.colorPalette}>
          {OUTFIT_COLORS.map((item) => {
            const isSelected = item.color === shirtColor;
            return (
              <Pressable
                key={item.color}
                style={[s.colorCircle, { backgroundColor: item.color }, isSelected && s.colorCircleSelected]}
                onPress={() => setShirtColor(item.color)}
                accessibilityRole="button"
                accessibilityLabel={item.name}
              >
                {isSelected && <Ionicons name="checkmark" size={18} color="#fff" />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 16, paddingBottom: 64 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  playerName: { fontSize: 24, fontWeight: '800', color: colors.text },
  playerTitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  levelBadge: {
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  levelText: { color: '#F8FAFC', fontWeight: '800', fontSize: 14 },
  viewportCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 16,
  },
  viewportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  hintText: { fontSize: 12, color: colors.muted },
  rotateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  rotateBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rotateText: { fontSize: 12, fontWeight: '600', color: colors.text },
  xpContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 6,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpLabel: { fontSize: 12, fontWeight: '600', color: colors.muted },
  xpValue: { fontSize: 12, fontWeight: '700', color: colors.primary },
  xpBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 13, color: colors.muted },
  statRow: { gap: 6 },
  statMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  statName: { fontSize: 13, fontWeight: '600', color: colors.text },
  statScore: { fontSize: 13, fontWeight: '700', color: colors.muted },
  statTrack: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statFill: { height: '100%', borderRadius: 4 },
  colorPalette: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: '#0F172A',
  },
});
