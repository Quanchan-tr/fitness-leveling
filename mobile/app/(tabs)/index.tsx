import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { useWorkout } from '../../lib/workout-store';
import { colors } from '../../lib/theme';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { routines, session, startWorkout } = useWorkout();

  const [waterMl, setWaterMl] = useState(1800);
  const targetWaterMl = 2000;

  // Use the primary routine (e.g. Chest & Triceps) or first routine
  const todayRoutine = routines[0] || null;

  const handleStartTodayWorkout = () => {
    if (session) {
      router.push('/workout');
      return;
    }
    if (todayRoutine) {
      startWorkout(todayRoutine);
      router.push('/workout');
    } else {
      router.push('/(tabs)/routines');
    }
  };

  const addWater = (ml: number) => {
    setWaterMl((prev) => Math.min(3000, prev + ml));
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Top-App-Bar */}
        <View style={s.topAppBar}>
          <View style={s.brandGroup}>
            <View style={s.brandIconBox}>
              <Text style={s.brandFlame}>🔥</Text>
            </View>
            <View style={s.brandTextGroup}>
              <Text style={s.brandTitle}>FitTrack AI</Text>
              <Text style={s.brandSubtitle}>COMMAND CENTER</Text>
            </View>
          </View>

          <View style={s.topActions}>
            <View style={s.streakBadge}>
              <Text style={s.streakText}>🔥 17 ngày</Text>
            </View>
            <Pressable
              style={s.bellBtn}
              onPress={() => router.push('/profile')}
              accessibilityRole="button"
            >
              <Text style={s.bellIcon}>🔔</Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Action CTAs */}
        <View style={s.ctaRow}>
          <Pressable
            style={s.primaryCta}
            onPress={handleStartTodayWorkout}
            accessibilityRole="button"
          >
            <Text style={s.primaryCtaText}>
              {session ? 'Tiếp tục buổi tập ➔' : 'Vào buổi tập ngay  ➔'}
            </Text>
          </Pressable>

          <Pressable
            style={s.secondaryCta}
            onPress={() => router.push('/pose-camera')}
            accessibilityRole="button"
          >
            <Text style={s.secondaryCtaText}>📷 AI Pose</Text>
          </Pressable>
        </View>

        {/* 001-Avatar-RPG-Card */}
        <View style={s.avatarCard}>
          <View style={s.avatarCardHeader}>
            <View style={s.userInfoRow}>
              <Text style={s.userName}>{user?.name || 'Quan Tran'}</Text>
              <View style={s.levelPill}>
                <Text style={s.levelPillText}>Lv. 12</Text>
              </View>
            </View>

            <View style={s.avatarActionBtns}>
              <Pressable
                style={s.avatarSmallBtn}
                onPress={() => router.push('/(tabs)/avatar')}
                accessibilityRole="button"
              >
                <Text style={s.avatarSmallBtnText}>🔄 Xoay</Text>
              </Pressable>
              <Pressable
                style={s.avatarOutfitBtn}
                onPress={() => router.push('/(tabs)/avatar')}
                accessibilityRole="button"
              >
                <Text style={s.avatarOutfitBtnText}>👕 Trang phục</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            style={s.avatarViewport}
            onPress={() => router.push('/(tabs)/avatar')}
          >
            <View style={s.avatarCircle}>
              <Text style={s.avatarGraphic}>🧍‍♂️</Text>
            </View>
            <Text style={s.avatarCaption}>Hero 3D Avatar • Mục tiêu Tăng cơ</Text>
          </Pressable>

          <View style={s.levelProgressGroup}>
            <View style={s.levelProgressLabels}>
              <Text style={s.levelProgressTitle}>Tiến trình cấp độ</Text>
              <Text style={s.levelProgressValue}>640 / 1.000 XP (64%)</Text>
            </View>
            <View style={s.progressBarTrack}>
              <View style={[s.progressBarFill, { width: '64%' }]} />
            </View>
          </View>
        </View>

        {/* 001-Today-Workout-Card */}
        <View style={s.todayCard}>
          <View style={s.todayHeaderRow}>
            <View>
              <Text style={s.todayTagline}>TIÊU ĐIỂM BUỔI TẬP HÔM NAY</Text>
              <Text style={s.todayRoutineTitle}>
                {todayRoutine?.title || 'Ngực & Tay Sau Cắt Nét'}
              </Text>
            </View>
            <View style={s.readyBadge}>
              <Text style={s.readyBadgeText}>🟢 Sẵn sàng</Text>
            </View>
          </View>

          <View style={s.todayStatsRow}>
            <Text style={s.todayStatsText}>
              ⚡ {todayRoutine?.exercises.length || 3} bài tập
            </Text>
            <Text style={s.todayStatsText}>⏱ ~45 phút</Text>
          </View>

          {/* Exercise items preview */}
          {(todayRoutine?.exercises || [
            { exercise: { name: 'Barbell Bench Press' }, sets: [1, 2, 3, 4] },
            { exercise: { name: 'Incline DB Press' }, sets: [1, 2, 3] },
            { exercise: { name: 'Cable Triceps Pushdown' }, sets: [1, 2, 3] },
          ]).map((exItem: any, idx: number) => {
            const exName = exItem.exercise?.name || 'Bài tập';
            const count = exItem.sets?.length || 3;
            const subtitle =
              idx === 0
                ? '4 sets • 8 reps (80kg)'
                : idx === 1
                ? '3 sets • 10 reps (26kg)'
                : '3 sets • 12 reps';

            return (
              <View key={idx} style={s.exerciseRow}>
                <View>
                  <Text style={s.exerciseIndexLabel}>BÀI {idx + 1}</Text>
                  <Text style={s.exerciseTitle}>{exName}</Text>
                </View>
                <Text style={s.exerciseMeta}>{subtitle}</Text>
              </View>
            );
          })}

          <View style={s.tipPill}>
            <Text style={s.tipPillText}>💡 Gợi ý: Nghỉ 90s giữa các hiệp nặng</Text>
          </View>
        </View>

        {/* 001-Bottom Metrics Mini Cards */}
        <View style={s.miniCardsRow}>
          {/* Energy & Calo */}
          <View style={s.miniCard}>
            <Text style={s.miniCardTitle}>🔥 Năng lượng & Calo</Text>
            <Text style={s.miniCardValueOrange}>1,800 kcal</Text>
            <Text style={s.miniCardSub}>Mục tiêu 2,400 (Còn 600)</Text>
            <View style={s.miniProgressTrack}>
              <View style={[s.miniProgressFillOrange, { width: '75%' }]} />
            </View>
          </View>

          {/* Water & Activity */}
          <View style={s.miniCard}>
            <Text style={s.miniCardTitle}>💧 Nước uống & Vận động</Text>
            <Text style={s.miniCardValueBlue}>
              {(waterMl / 1000).toFixed(1)}L / {(targetWaterMl / 1000).toFixed(1)}L (
              {Math.min(100, Math.round((waterMl / targetWaterMl) * 100))}%)
            </Text>
            <View style={s.miniProgressTrack}>
              <View
                style={[
                  s.miniProgressFillBlue,
                  {
                    width: `${Math.min(
                      100,
                      Math.round((waterMl / targetWaterMl) * 100)
                    )}%`,
                  },
                ]}
              />
            </View>
            <View style={s.waterBtnRow}>
              <Pressable
                style={s.waterBtn}
                onPress={() => addWater(250)}
                accessibilityRole="button"
              >
                <Text style={s.waterBtnText}>+250ml</Text>
              </Pressable>
              <Pressable
                style={s.waterBtn}
                onPress={() => addWater(500)}
                accessibilityRole="button"
              >
                <Text style={s.waterBtnText}>+500ml</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },

  // Top App Bar
  topAppBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 34,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandFlame: {
    fontSize: 18,
  },
  brandTextGroup: {
    gap: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryText,
  },
  bellBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 14,
  },

  // CTA Row
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryCta: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryCta: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    height: 42,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryCtaText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },

  // Avatar RPG Card
  avatarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  avatarCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  levelPill: {
    backgroundColor: colors.text,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  levelPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  avatarActionBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  avatarSmallBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  avatarSmallBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  avatarOutfitBtn: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  avatarOutfitBtnText: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: '600',
  },
  avatarViewport: {
    height: 96,
    backgroundColor: colors.bg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGraphic: {
    fontSize: 32,
  },
  avatarCaption: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.subtle,
  },
  levelProgressGroup: {
    gap: 6,
  },
  levelProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelProgressTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.muted,
  },
  levelProgressValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },

  // Today Workout Card
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  todayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayTagline: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.subtle,
  },
  todayRoutineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  readyBadge: {
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  readyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.successText,
  },
  todayStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  todayStatsText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.muted,
  },
  exerciseRow: {
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseIndexLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.subtle,
  },
  exerciseTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  exerciseMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.muted,
  },
  tipPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  tipPillText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.primaryText,
  },

  // Mini Cards Row
  miniCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 8,
  },
  miniCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  miniCardValueOrange: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  miniCardValueBlue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.info,
  },
  miniCardSub: {
    fontSize: 10,
    color: colors.muted,
  },
  miniProgressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  miniProgressFillOrange: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  miniProgressFillBlue: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.info,
  },
  waterBtnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  waterBtn: {
    backgroundColor: colors.infoSoft,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  waterBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.info,
  },
});
