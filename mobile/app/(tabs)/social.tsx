import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../lib/theme';
import { useWorkout } from '../../lib/workout-store';

const FILTER_PILLS = ['Tất cả', 'Ngực', 'Lưng xô', 'Cardio', 'AI Pose'];

export default function CommunitySocialScreen() {
  const { routines, saveRoutine } = useWorkout();
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(38);
  const [routineSaved, setRoutineSaved] = useState(false);

  const toggleLike = () => {
    if (liked) {
      setLikeCount((c) => c - 1);
      setLiked(false);
    } else {
      setLikeCount((c) => c + 1);
      setLiked(true);
    }
  };

  const handleCreatePost = () => {
    if (!newPostText.trim()) {
      Alert.alert('Nội dung rỗng', 'Vui lòng nhập cảm nghĩ hoặc kinh nghiệm buổi tập của bạn.');
      return;
    }
    Alert.alert('Thành công', 'Bài viết đã được đăng lên cộng đồng FitTrack AI!');
    setNewPostText('');
  };

  const handleSaveSharedRoutine = () => {
    if (routineSaved) return;
    saveRoutine({
      title: 'Ngực & Tay Sau Cắt Nét (Alex Morgan)',
      restTimerSeconds: 90,
      exercises: routines[0]?.exercises || [],
    });
    setRoutineSaved(true);
    Alert.alert('Đã lưu Routine', 'Đã thêm routine của Alex Morgan vào danh sách của bạn!');
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
          <Text style={s.pageTitle}>Cộng đồng Thể hình</Text>
          <Pressable style={s.bellBtn} accessibilityRole="button">
            <Text style={s.bellIcon}>🔔</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={s.searchBar}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Tìm kiếm bài tập, routine, từ khóa..."
            placeholderTextColor={colors.subtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.pillsRow}
        >
          {FILTER_PILLS.map((pill) => {
            const isActive = activeFilter === pill;
            return (
              <Pressable
                key={pill}
                style={[s.filterPill, isActive && s.filterPillActive]}
                onPress={() => setActiveFilter(pill)}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    s.filterPillText,
                    isActive && s.filterPillTextActive,
                  ]}
                >
                  {pill}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Post Creation Box */}
        <View style={s.createPostCard}>
          <View style={s.createPostTop}>
            <View style={s.userAvatarMini}>
              <Text style={s.userAvatarEmoji}>🧔</Text>
            </View>
            <TextInput
              style={s.createPostInput}
              placeholder="Chia sẻ trải nghiệm buổi tập và giáo án..."
              placeholderTextColor={colors.subtle}
              value={newPostText}
              onChangeText={setNewPostText}
            />
          </View>

          <View style={s.createPostActions}>
            <View style={s.attachBtns}>
              <Pressable style={s.attachBtnGrey} accessibilityRole="button">
                <Text style={s.attachBtnGreyText}>📷 Ảnh</Text>
              </Pressable>
              <Pressable style={s.attachBtnOrange} accessibilityRole="button">
                <Text style={s.attachBtnOrangeText}>⚡ Routine</Text>
              </Pressable>
            </View>

            <Pressable
              style={s.publishBtn}
              onPress={handleCreatePost}
              accessibilityRole="button"
            >
              <Text style={s.publishBtnText}>Đăng bài</Text>
            </Pressable>
          </View>
        </View>

        {/* 005-Feed Post Card (Alex Morgan) */}
        <View style={s.feedCard}>
          <View style={s.feedHeader}>
            <View style={s.authorGroup}>
              <View style={s.authorAvatar}>
                <Text style={s.authorAvatarEmoji}>👩</Text>
              </View>
              <View>
                <View style={s.authorNameRow}>
                  <Text style={s.authorName}>Alex Morgan</Text>
                  <View style={s.levelBadge}>
                    <Text style={s.levelBadgeText}>Lv. 24</Text>
                  </View>
                </View>
                <Text style={s.postMeta}>Coach Pro • 2 giờ trước</Text>
              </View>
            </View>

            <View style={s.aiTag}>
              <Text style={s.aiTagText}>📹 AI Pose Check</Text>
            </View>
          </View>

          <Text style={s.postTitle}>
            Buổi tập Đẩy Ngực & Tay Sau phá kỷ lục 80kg!
          </Text>

          <Text style={s.postContent}>
            Hôm nay cảm giác cơ bắp rất tốt, form ổn định không bị đau khớp cổ tay.
            Mình áp dụng tempo hãm tạ 2s và nghỉ 90s giữa các hiệp nặng.
          </Text>

          {/* Badges Row */}
          <View style={s.badgesRow}>
            <View style={s.badgeOrange}>
              <Text style={s.badgeOrangeText}>⏱ 48 phút</Text>
            </View>
            <View style={s.badgeGrey}>
              <Text style={s.badgeGreyText}>🏋️ 2.840 kg</Text>
            </View>
            <View style={s.badgeGreen}>
              <Text style={s.badgeGreenText}>🏆 PR: Bench 80kg x 6</Text>
            </View>
          </View>

          {/* Action Image Box */}
          <View style={s.actionImageBox}>
            <Text style={s.actionImageTitle}>🏋️‍♀️ Gym Bench Press Action</Text>
            <Text style={s.actionImageSub}>• • (Ảnh 1/2)</Text>
          </View>

          {/* Attached Routine Box */}
          <View style={s.attachedRoutineCard}>
            <View>
              <Text style={s.routineAttachedLabel}>ROUTINE ĐÍNH KÈM</Text>
              <Text style={s.routineAttachedTitle}>
                Ngực & Tay Sau Cắt Nét (3 bài)
              </Text>
            </View>
            <Pressable
              style={[s.saveRoutineBtn, routineSaved && s.saveRoutineBtnDone]}
              onPress={handleSaveSharedRoutine}
              accessibilityRole="button"
            >
              <Text style={s.saveRoutineBtnText}>
                {routineSaved ? '✓ Đã lưu' : '💾 Lưu bài tập'}
              </Text>
            </Pressable>
          </View>

          {/* Social Feedback Row */}
          <View style={s.feedbackRow}>
            <View style={s.feedbackLeft}>
              <Pressable onPress={toggleLike} hitSlop={6} style={s.statClickable}>
                <Text style={[s.statText, liked && { color: colors.primary }]}>
                  {liked ? '❤️' : '🤍'} {likeCount} Thích
                </Text>
              </Pressable>
              <Text style={s.statText}>💬 2 Bình luận</Text>
            </View>
            <Pressable hitSlop={6} accessibilityRole="button">
              <Text style={s.shareText}>↗ Chia sẻ</Text>
            </Pressable>
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
    gap: 12,
  },

  // Top App Bar
  topAppBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 34,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
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

  // Search Bar
  searchBar: {
    height: 35,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    padding: 0,
  },

  // Filter Pills
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.muted,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Create Post Box
  createPostCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 8,
  },
  createPostTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAvatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarEmoji: {
    fontSize: 16,
  },
  createPostInput: {
    flex: 1,
    fontSize: 11,
    color: colors.text,
    padding: 0,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  attachBtnGrey: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  attachBtnGreyText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  attachBtnOrange: {
    backgroundColor: colors.primarySoft,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  attachBtnOrangeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primaryText,
  },
  publishBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Feed Card
  feedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.info,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarEmoji: {
    fontSize: 18,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  levelBadge: {
    backgroundColor: colors.text,
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 4,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  postMeta: {
    fontSize: 10,
    color: colors.muted,
  },
  aiTag: {
    backgroundColor: colors.infoSoft,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  aiTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.info,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  postContent: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badgeOrange: {
    backgroundColor: colors.primarySoft,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  badgeOrangeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primaryText,
  },
  badgeGrey: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  badgeGreyText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  badgeGreen: {
    backgroundColor: colors.successSoft,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  badgeGreenText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.successText,
  },
  actionImageBox: {
    height: 110,
    backgroundColor: colors.text,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionImageTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionImageSub: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.subtle,
  },
  attachedRoutineCard: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineAttachedLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.subtle,
  },
  routineAttachedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  saveRoutineBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  saveRoutineBtnDone: {
    backgroundColor: colors.successSoft,
    borderColor: colors.successBorder,
  },
  saveRoutineBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text,
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackLeft: {
    flexDirection: 'row',
    gap: 14,
  },
  statClickable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  shareText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
});
