import React from 'react';
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
import { colors } from '../lib/theme';
import { useAuth } from '../lib/auth';
import { useWorkout } from '../lib/workout-store';

const WEEKS_DATA = [
  { label: 'T1', height: 20 },
  { label: 'T2', height: 26 },
  { label: 'T3', height: 38 },
  { label: 'T4', height: 34 },
  { label: 'T5', height: 46 },
  { label: 'T6', height: 42 },
  { label: 'T7', height: 52 },
  { label: 'T8', height: 48 },
  { label: 'T9', height: 58 },
  { label: 'T10', height: 56 },
  { label: 'T11', height: 62 },
  { label: 'T12', height: 66, active: true },
];

export default function UserProfileScreen() {
  const { user, signOut } = useAuth();
  const { history } = useWorkout();

  const handleEditProfile = () => {
    Alert.alert(
      'Hồ sơ cá nhân',
      `Tài khoản: ${user?.name || 'Quan Tran'}\nEmail: ${user?.email || 'quan@fittrack.ai'}`,
      [
        { text: 'Đóng', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: signOut },
      ]
    );
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
          <Pressable onPress={() => router.back()} hitSlop={8} style={s.backBtn}>
            <Text style={s.backBtnText}>‹ Quay lại</Text>
          </Pressable>
          <Text style={s.pageTitle}>Hồ sơ cá nhân</Text>
          <Pressable
            style={s.settingsBtn}
            onPress={handleEditProfile}
            accessibilityRole="button"
          >
            <Text style={s.settingsIcon}>⚙️</Text>
          </Pressable>
        </View>

        {/* 006-User-Profile-Hero */}
        <View style={s.heroCard}>
          <View style={s.userRow}>
            <View style={s.avatarCircle}>
              <Text style={s.avatarEmoji}>🧔</Text>
            </View>

            <View style={s.userInfo}>
              <View style={s.nameBadgeRow}>
                <Text style={s.userName}>{user?.name || 'Quan Tran'}</Text>
                <View style={s.levelBadge}>
                  <Text style={s.levelBadgeText}>Lv. 12</Text>
                </View>
                <View style={s.goalBadge}>
                  <Text style={s.goalBadgeText}>Tăng cơ</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Streak Banner */}
          <View style={s.streakBanner}>
            <Text style={s.streakText}>🔥 17 ngày streak liên tục</Text>
          </View>

          {/* Stats Row */}
          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={s.statValue}>{Math.max(42, history.length)}</Text>
              <Text style={s.statLabel}>BUỔI TẬP</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statValue}>154</Text>
              <Text style={s.statLabel}>FOLLOWERS</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statValue}>88</Text>
              <Text style={s.statLabel}>FOLLOWING</Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <Pressable
            style={s.editBtn}
            onPress={handleEditProfile}
            accessibilityRole="button"
          >
            <Text style={s.editBtnText}>✏️ Chỉnh sửa hồ sơ</Text>
          </Pressable>
        </View>

        {/* 006-Progress Stats (12 Weeks) */}
        <View style={s.chartCard}>
          <View style={s.chartHeader}>
            <Text style={s.chartTitle}>Thống kê tiến trình tập</Text>
            <Text style={s.chartFilter}>12 tuần gần nhất ▾</Text>
          </View>

          <View style={s.barArea}>
            {WEEKS_DATA.map((w, i) => (
              <View key={i} style={s.barCol}>
                <View
                  style={[
                    s.barPill,
                    { height: w.height },
                    w.active ? s.barPillActive : s.barPillDefault,
                  ]}
                />
                <Text style={s.barLabel}>{w.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 006-Activity Log Section */}
        <View style={s.activitySection}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              Nhật ký hoạt động ({Math.max(4, history.length)} buổi)
            </Text>
            <Text style={s.viewAllLink}>Xem tất cả ➔</Text>
          </View>

          {/* Item 1 */}
          <View style={s.activityCard}>
            <View style={s.activityTopRow}>
              <Text style={s.activityDate}>Thứ Sáu, 02/10</Text>
              <View style={s.completePill}>
                <Text style={s.completePillText}>Hoàn thành</Text>
              </View>
            </View>
            <Text style={s.activityRoutine}>Ngực & Tay Sau Cắt Nét</Text>
            <View style={s.activityMetaRow}>
              <Text style={s.activityMeta}>⏱ 45p</Text>
              <Text style={s.activityMeta}>🏋️ 2.680 kg</Text>
              <Text style={s.activityMeta}>⚡ 10 sets</Text>
            </View>
          </View>

          {/* Item 2 */}
          <View style={s.activityCard}>
            <View style={s.activityTopRow}>
              <Text style={s.activityDate}>Thứ Bảy, 03/10</Text>
              <View style={s.completePill}>
                <Text style={s.completePillText}>Hoàn thành</Text>
              </View>
            </View>
            <Text style={s.activityRoutine}>Cardio & Chạy Bộ Đốt Mỡ</Text>
            <View style={s.activityMetaRow}>
              <Text style={s.activityMeta}>⏱ 32p</Text>
              <Text style={s.activityMeta}>🏋️ 0 kg</Text>
              <Text style={s.activityMeta}>⚡ 4 sets</Text>
            </View>
          </View>

          {/* Item 3 */}
          <View style={s.activityCard}>
            <View style={s.activityTopRow}>
              <Text style={s.activityDate}>Thứ Tư, 30/09</Text>
              <View style={s.completePill}>
                <Text style={s.completePillText}>Hoàn thành</Text>
              </View>
            </View>
            <Text style={s.activityRoutine}>Lưng Xô & Bắp Tay Trước</Text>
            <View style={s.activityMetaRow}>
              <Text style={s.activityMeta}>⏱ 52p</Text>
              <Text style={s.activityMeta}>🏋️ 3.450 kg</Text>
              <Text style={s.activityMeta}>⚡ 8 sets</Text>
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
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  settingsBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 14,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  levelBadge: {
    backgroundColor: colors.text,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  goalBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  goalBadgeText: {
    color: colors.primaryText,
    fontSize: 9,
    fontWeight: '700',
  },
  streakBanner: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryText,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.subtle,
  },
  editBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },

  // 12 Weeks Chart Card
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  chartFilter: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.muted,
  },
  barArea: {
    height: 70,
    backgroundColor: colors.bg,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
  barCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  barPill: {
    width: 16,
    borderRadius: 4,
  },
  barPillDefault: {
    backgroundColor: '#334155',
  },
  barPillActive: {
    backgroundColor: colors.primary,
  },
  barLabel: {
    fontSize: 7,
    fontWeight: '500',
    color: colors.subtle,
  },

  // Activity Section
  activitySection: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  viewAllLink: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.muted,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    gap: 6,
  },
  activityTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityDate: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.muted,
  },
  completePill: {
    backgroundColor: colors.successSoft,
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 5,
  },
  completePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.successText,
  },
  activityRoutine: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  activityMetaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  activityMeta: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
