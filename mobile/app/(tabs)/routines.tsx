import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useWorkout } from '../../lib/workout-store';
import { colors } from '../../lib/theme';

const WEEK_DAYS = [
  { day: 'T2', date: '28/09', status: 'done' },
  { day: 'T3', date: '29/09', status: 'done' },
  { day: 'T4', date: '30/09', status: 'done' },
  { day: 'T5', date: '01/10', status: 'rest' },
  { day: 'T6', date: '02/10', status: 'done' },
  { day: 'T7', date: '03/10', status: 'done' },
  { day: 'CN', date: '04/10', status: 'today' },
];

export default function WorkoutsScreen() {
  const { routines, session, startWorkout, deleteRoutine } = useWorkout();
  const [folderExpanded, setFolderExpanded] = useState(true);

  const start = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;
    const go = () => {
      startWorkout(routine);
      router.push('/workout');
    };
    if (!session) return go();
    Alert.alert(
      'Đang có buổi tập',
      `Bỏ buổi "${session.routineTitle}" để bắt đầu buổi mới?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Bắt đầu mới', style: 'destructive', onPress: go },
      ]
    );
  };

  const confirmDelete = (id: string, title: string) => {
    Alert.alert('Xoá routine', `Bạn có chắc muốn xoá "${title}"?`, [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: () => deleteRoutine(id) },
    ]);
  };

  const primaryRoutine = routines[0] || null;

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Top-App-Bar */}
        <View style={s.topAppBar}>
          <Text style={s.pageTitle}>Kế hoạch & Routine tập</Text>
          <Pressable
            style={s.createBtn}
            onPress={() => router.push('/routine/new')}
            accessibilityRole="button"
          >
            <Text style={s.createBtnText}>+ Tạo Routine</Text>
          </Pressable>
        </View>

        {/* 002-Today Hero Card */}
        {primaryRoutine && (
          <View style={s.heroCard}>
            <View style={s.heroTopRow}>
              <View style={s.heroBadge}>
                <Text style={s.heroBadgeText}>HÔM NAY • CHỦ NHẬT</Text>
              </View>
              <Text style={s.heroStatusText}>1/3 hoàn thành</Text>
            </View>

            <Text style={s.heroTitle}>{primaryRoutine.title}</Text>

            <Pressable
              style={s.heroStartBtn}
              onPress={() => start(primaryRoutine.id)}
              accessibilityRole="button"
            >
              <Text style={s.heroStartBtnText}>
                {session?.routineId === primaryRoutine.id
                  ? '▶ Tiếp tục buổi tập hôm nay'
                  : '▶ Bắt đầu tập hôm nay'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* 002-Weekly Schedule Strip */}
        <View style={s.scheduleSection}>
          <View style={s.scheduleHeader}>
            <Text style={s.sectionTitle}>Lịch biểu luyện tập tuần</Text>
            <Text style={s.scheduleLegend}>🟢 Đã xong  🟡 Hôm nay  ⚪ Nghỉ</Text>
          </View>

          <View style={s.weekStrip}>
            {WEEK_DAYS.map((d, i) => {
              const isToday = d.status === 'today';
              const isDone = d.status === 'done';
              return (
                <View
                  key={i}
                  style={[s.dayBox, isToday && s.dayBoxToday]}
                >
                  <Text style={[s.dayName, isToday && s.dayNameToday]}>
                    {d.day}
                  </Text>
                  <Text style={s.dayDate}>{d.date}</Text>
                  <View
                    style={[
                      s.statusDot,
                      isDone
                        ? s.dotDone
                        : isToday
                        ? s.dotToday
                        : s.dotRest,
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* 002-Routines & Folders Collection */}
        <View style={s.routinesSection}>
          <View style={s.scheduleHeader}>
            <Text style={s.sectionTitle}>Bộ sưu tập Routine & Thư mục</Text>
            <Text style={s.routinesCountMeta}>
              {routines.length} routines • 3 thư mục
            </Text>
          </View>

          {/* Folder Card */}
          <Pressable
            style={s.folderCard}
            onPress={() => setFolderExpanded(!folderExpanded)}
            accessibilityRole="button"
          >
            <View style={s.folderLeft}>
              <Text style={s.folderIcon}>📁</Text>
              <View>
                <Text style={s.folderTitle}>Khối Cơ Đẩy & Kéo</Text>
                <Text style={s.folderSub}>{routines.length} routine giáo án</Text>
              </View>
            </View>
            <Text style={s.folderArrow}>{folderExpanded ? '▾' : '▸'}</Text>
          </Pressable>

          {/* Routine items */}
          {folderExpanded && (
            <View style={s.routineList}>
              {routines.map((item) => {
                const totalSets = item.exercises.reduce(
                  (sum, e) => sum + e.sets.length,
                  0
                );
                return (
                  <View key={item.id} style={s.routineCard}>
                    <View style={s.routineCardHeader}>
                      <Text style={s.routineCardTitle}>{item.title}</Text>
                      <Pressable
                        onPress={() => confirmDelete(item.id, item.title)}
                        hitSlop={8}
                        accessibilityRole="button"
                      >
                        <Text style={s.moreBtn}>•••</Text>
                      </Pressable>
                    </View>

                    <Text style={s.routineCardMeta}>
                      {item.exercises.length} bài tập • {totalSets} sets • Nghỉ{' '}
                      {item.restTimerSeconds || 90}s
                    </Text>

                    <View style={s.exerciseTagsRow}>
                      {item.exercises.slice(0, 3).map((exItem, eIdx) => (
                        <View key={eIdx} style={s.exerciseTag}>
                          <Text style={s.exerciseTagText} numberOfLines={1}>
                            {exItem.exercise.name}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={s.routineCardFooter}>
                      <Pressable
                        style={s.playNowBtn}
                        onPress={() => start(item.id)}
                        accessibilityRole="button"
                      >
                        <Text style={s.playNowBtnText}>▶ Tập ngay</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => router.push(`/routine/${item.id}`)}
                        hitSlop={8}
                        accessibilityRole="button"
                      >
                        <Text style={s.detailLink}>Chi tiết ➔</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
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
    height: 32,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  createBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Hero Card
  heroCard: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadge: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  heroStatusText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.primaryText,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  heroStartBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStartBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Schedule Section
  scheduleSection: {
    gap: 8,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  scheduleLegend: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.muted,
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayBox: {
    width: 48,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dayBoxToday: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  dayNameToday: {
    color: colors.primary,
  },
  dayDate: {
    fontSize: 9,
    color: colors.subtle,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotDone: {
    backgroundColor: colors.success,
  },
  dotToday: {
    backgroundColor: colors.primary,
  },
  dotRest: {
    backgroundColor: colors.subtle,
  },

  // Routines Section
  routinesSection: {
    gap: 10,
  },
  routinesCountMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.muted,
  },
  folderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  folderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  folderIcon: {
    fontSize: 16,
  },
  folderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  folderSub: {
    fontSize: 10,
    color: colors.muted,
  },
  folderArrow: {
    fontSize: 14,
    color: colors.subtle,
  },
  routineList: {
    gap: 10,
  },
  routineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  routineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  moreBtn: {
    fontSize: 14,
    color: colors.subtle,
    letterSpacing: 1,
  },
  routineCardMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.muted,
  },
  exerciseTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  exerciseTag: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  exerciseTagText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  routineCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  playNowBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  playNowBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  detailLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
});
