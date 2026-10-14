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
import { colors } from '../../lib/theme';

const EXERCISES = [
  '🏋️ Barbell Squat / Bodyweight Squat',
  '💪 Push Up (Chống đẩy chuẩn)',
  '🧘 Plank (Gồng cơ lõi)',
];

export default function AIPoseCoachScreen() {
  const [activeTab, setActiveTab] = useState<'pose' | 'planner'>('pose');
  const [selectedExIdx, setSelectedExIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Top-App-Bar */}
        <View style={s.topAppBar}>
          <Text style={s.pageTitle}>Huấn luyện viên AI</Text>
          <View style={s.streakBadge}>
            <Text style={s.streakText}>🔥 12 streak</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={s.tabSwitch}>
          <Pressable
            style={[s.tabBtn, activeTab === 'pose' && s.tabBtnActive]}
            onPress={() => setActiveTab('pose')}
            accessibilityRole="button"
          >
            <Text style={[s.tabBtnText, activeTab === 'pose' && s.tabBtnTextActive]}>
              📹 AI Pose Check
            </Text>
          </Pressable>
          <Pressable
            style={[s.tabBtn, activeTab === 'planner' && s.tabBtnActive]}
            onPress={() => setActiveTab('planner')}
            accessibilityRole="button"
          >
            <Text style={[s.tabBtnText, activeTab === 'planner' && s.tabBtnTextActive]}>
              📅 AI Planner
            </Text>
          </Pressable>
        </View>

        {activeTab === 'pose' ? (
          <>
            {/* 003-Camera Viewfinder Card */}
            <View style={s.viewfinderCard}>
              <View style={s.viewfinderHeader}>
                <View style={s.statusTag}>
                  <View style={s.greenDot} />
                  <Text style={s.statusTagText}>MediaPipe BlazePose Sẵn sàng</Text>
                </View>
                <View style={s.modelBadge}>
                  <Text style={s.modelBadgeText}>SQUAT_V2</Text>
                </View>
              </View>

              <View style={s.cameraPlaceholder}>
                <View style={s.cameraIconCircle}>
                  <Text style={s.cameraIconText}>📷</Text>
                </View>
                <Text style={s.placeholderTitle}>Camera chưa được bật</Text>
                <Text style={s.placeholderSub}>
                  Nhấn bắt đầu để mở camera & nhận diện AI
                </Text>
              </View>

              <View style={s.viewfinderActions}>
                <Pressable
                  style={s.startCameraBtn}
                  onPress={() => router.push('/pose-camera')}
                  accessibilityRole="button"
                >
                  <Text style={s.startCameraBtnText}>
                    ▶ Bắt đầu phân tích (Webcam)
                  </Text>
                </Pressable>

                <Pressable
                  style={s.uploadVideoBtn}
                  onPress={() => router.push('/pose-camera')}
                  accessibilityRole="button"
                >
                  <Text style={s.uploadVideoBtnText}>📤 Tải video phân tích</Text>
                </Pressable>
              </View>
            </View>

            {/* Exercise Selector Card */}
            <View style={s.selectorCard}>
              <Text style={s.selectorLabel}>CHỌN BÀI TẬP KIỂM TRA FORM</Text>
              
              <Pressable
                style={s.dropdownHeader}
                onPress={() => setDropdownOpen(!dropdownOpen)}
                accessibilityRole="button"
              >
                <Text style={s.dropdownSelectedText}>{EXERCISES[selectedExIdx]}</Text>
                <Text style={s.dropdownArrow}>{dropdownOpen ? '▴' : '▾'}</Text>
              </Pressable>

              {dropdownOpen && (
                <View style={s.dropdownMenu}>
                  {EXERCISES.map((ex, i) => (
                    <Pressable
                      key={i}
                      style={[
                        s.dropdownItem,
                        i === selectedExIdx && s.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setSelectedExIdx(i);
                        setDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          s.dropdownItemText,
                          i === selectedExIdx && s.dropdownItemTextActive,
                        ]}
                      >
                        {ex}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <Text style={s.selectorHint}>
                💡 Đứng thẳng trước camera • Giữ toàn thân trong khung hình
              </Text>
            </View>

            {/* Session Stats Card */}
            <View style={s.statsCard}>
              <Text style={s.selectorLabel}>THỐNG KÊ PHIÊN TẬP</Text>
              <View style={s.statsGrid}>
                <View style={s.statBox}>
                  <Text style={s.statBoxLabel}>CHU KỲ</Text>
                  <Text style={s.statBoxValueDark}>0</Text>
                </View>
                <View style={s.statBox}>
                  <Text style={s.statBoxLabel}>HỢP LỆ</Text>
                  <Text style={s.statBoxValueBlue}>0</Text>
                </View>
                <View style={s.statBox}>
                  <Text style={s.statBoxLabel}>ĐIỂM FORM</Text>
                  <Text style={s.statBoxValueGreen}>100%</Text>
                </View>
              </View>
            </View>

            {/* Realtime Status Banner */}
            <View style={s.realtimeBanner}>
              <Text style={s.checkMark}>✓</Text>
              <Text style={s.bannerMessage}>
                Phân tích động học realtime: Sẵn sàng kết nối góc khớp.
              </Text>
            </View>
          </>
        ) : (
          /* AI Planner Placeholder view */
          <View style={s.plannerCard}>
            <Text style={s.plannerTitle}>📅 AI Adaptive Workout Planner</Text>
            <Text style={s.plannerDesc}>
              Hệ thống AI sẽ tự động phân tích độ phục hồi cơ bắp, mức tạ quá khứ
              và điểm form để điều chỉnh khối lượng bài tập hôm nay.
            </Text>
            <Pressable
              style={s.startCameraBtn}
              onPress={() => router.push('/(tabs)/routines')}
              accessibilityRole="button"
            >
              <Text style={s.startCameraBtnText}>Khám phá giáo án gợi ý</Text>
            </Pressable>
          </View>
        )}
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
    gap: 12,
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
  streakBadge: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryText,
  },

  // Tab switcher
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.muted,
  },
  tabBtnTextActive: {
    fontWeight: '700',
    color: colors.text,
  },

  // Camera Viewfinder Card (Dark)
  viewfinderCard: {
    backgroundColor: colors.text,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    gap: 12,
  },
  viewfinderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  modelBadge: {
    backgroundColor: '#1E293B',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  modelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.subtle,
  },
  cameraPlaceholder: {
    height: 140,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cameraIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconText: {
    fontSize: 24,
  },
  placeholderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  placeholderSub: {
    fontSize: 10,
    color: colors.subtle,
  },
  viewfinderActions: {
    gap: 8,
  },
  startCameraBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startCameraBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  uploadVideoBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadVideoBtnText: {
    color: colors.subtle,
    fontSize: 11,
    fontWeight: '600',
  },

  // Exercise Selector Card
  selectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 8,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.subtle,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownSelectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.muted,
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  dropdownItemActive: {
    backgroundColor: colors.primarySoft,
  },
  dropdownItemText: {
    fontSize: 12,
    color: colors.text,
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: colors.primaryText,
  },
  selectorHint: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.muted,
  },

  // Session Stats Card
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 8,
  },
  statsGrid: {
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
  statBoxLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.subtle,
  },
  statBoxValueDark: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  statBoxValueBlue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.info,
  },
  statBoxValueGreen: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.success,
  },

  // Realtime Status Banner
  realtimeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  checkMark: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.successText,
  },
  bannerMessage: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: colors.successDark,
  },

  // Planner Tab Card
  plannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  plannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  plannerDesc: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
});
