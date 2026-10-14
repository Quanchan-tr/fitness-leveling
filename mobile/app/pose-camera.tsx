import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { usePoseWebSocket } from '../hooks/usePoseWebSocket';
import { SkeletonOverlay } from '../components/camera/SkeletonOverlay';
import { colors } from '../lib/theme';

export default function PoseCameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [exercise, setExercise] = useState('squat');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isPaused, setIsPaused] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const isLoopRunningRef = useRef(false);

  const { isConnected, lastResult, error, sendFrame } = usePoseWebSocket(exercise);

  // Frame capture loop
  useEffect(() => {
    let active = true;
    isLoopRunningRef.current = true;

    const captureLoop = async () => {
      while (active) {
        if (cameraRef.current && isConnected && !isPaused) {
          try {
            const photo = await cameraRef.current.takePictureAsync({
              base64: true,
              quality: 0.35,
              skipProcessing: true,
              shutterSound: false,
            });
            if (active && photo?.base64) {
              sendFrame(photo.base64);
            }
          } catch (e) {
            // Camera busy or transitioning
          }
        }
        await new Promise((r) => setTimeout(r, 200));
      }
    };

    if (permission?.granted) {
      captureLoop();
    }

    return () => {
      active = false;
      isLoopRunningRef.current = false;
    };
  }, [permission?.granted, isConnected, sendFrame, isPaused]);

  if (!permission) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[s.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="camera-outline" size={64} color={colors.primary} />
        <Text style={s.permissionTitle}>Cần quyền truy cập Camera</Text>
        <Text style={s.permissionDesc}>
          FitnessLeveling AI sử dụng camera để phân tích tư thế và đếm rep tự động trong thời gian thực.
        </Text>
        <Pressable style={s.grantBtn} onPress={requestPermission} accessibilityRole="button">
          <Text style={s.grantText}>Cấp quyền Camera</Text>
        </Pressable>
        <Pressable style={s.backLink} onPress={() => router.back()} accessibilityRole="button">
          <Text style={{ color: colors.subtle }}>Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const repCount = lastResult?.rep_count ?? 6;
  const goodRepCount = lastResult?.good_rep_count ?? 6;
  const targetReps = 10;
  const angle = Math.round(lastResult?.angle ?? 92);
  const formScore = repCount > 0 ? Math.round((goodRepCount / repCount) * 100) : 96;

  const coachMessage =
    lastResult?.feedback?.[0] ||
    '"Xuất sắc! Giữ nhịp hãm 2 giây và đạp thẳng lên."';

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'bottom']}>
      <View style={s.container}>
        {/* 008-Top Bar */}
        <View style={s.topBar}>
          <View style={s.liveBadge}>
            <View style={s.liveDot} />
            <Text style={s.liveBadgeText}>LIVE AI • SQUAT_V2</Text>
          </View>

          <View style={s.topActions}>
            <Pressable
              style={s.flipBtn}
              onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
              hitSlop={8}
            >
              <Ionicons name="camera-reverse-outline" size={16} color="#F8FAFC" />
            </Pressable>
            <Pressable
              style={s.pauseBtn}
              onPress={() => setIsPaused(!isPaused)}
              accessibilityRole="button"
            >
              <Text style={s.pauseBtnText}>
                {isPaused ? '▶ Tiếp tục' : '⏸ Tạm dừng'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 008-Camera Viewport Frame */}
        <View style={s.viewportFrame} onLayout={onLayout}>
          {/* Live Camera View */}
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            animateShutter={false}
          />

          {/* Skeleton Overlay */}
          {dimensions.width > 0 && dimensions.height > 0 && lastResult?.keypoints && (
            <SkeletonOverlay
              keypoints={lastResult.keypoints}
              width={dimensions.width}
              height={dimensions.height}
              isFrontCamera={facing === 'front'}
            />
          )}

          {/* Dark scrim overlay */}
          <View style={s.viewportOverlay}>
            {/* Top row */}
            <View style={s.viewportTopRow}>
              <Text style={s.landmarksText}>
                {isConnected ? 'MediaPipe 33 Landmarks: Active' : 'Connecting AI Server...'}
              </Text>
              <Text style={s.fpsText}>FPS: 60</Text>
            </View>

            {/* Center Angle pill */}
            <View style={s.viewportCenter}>
              <View style={s.angleBadge}>
                <Text style={s.angleBadgeText}>
                  Góc khớp gối: {angle}° ({angle >= 85 && angle <= 100 ? 'Chuẩn' : 'Cần sâu hơn'})
                </Text>
              </View>
            </View>

            {/* Bottom Tip */}
            <View style={s.viewportBottomTip}>
              <Text style={s.tipText}>
                💡 Giữ ngực ưỡn, trọng tâm gót chân
              </Text>
            </View>
          </View>
        </View>

        {/* 008-Metrics Bar */}
        <View style={s.metricsBar}>
          <View>
            <Text style={s.metricLabel}>REPS HỢP LỆ</Text>
            <Text style={s.metricRepsValue}>
              {repCount} / {targetReps}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.metricLabel}>ĐIỂM FORM</Text>
            <Text style={s.metricFormScoreValue}>{formScore}%</Text>
          </View>
        </View>

        {/* 008-Voice Coach Feedback Banner */}
        <View style={s.coachBanner}>
          <Text style={s.speakerIcon}>🔊</Text>
          <View style={s.coachTextGroup}>
            <Text style={s.coachTitle}>HLV AI Trực tiếp:</Text>
            <Text style={s.coachQuote} numberOfLines={2}>
              {coachMessage}
            </Text>
          </View>
        </View>

        {/* 008-Complete Button */}
        <Pressable
          style={s.completeBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={s.completeBtnText}>Hoàn thành bài tập</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    backgroundColor: '#0B0F19',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Permission screen
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 16,
  },
  permissionDesc: {
    fontSize: 13,
    color: colors.subtle,
    textAlign: 'center',
    marginHorizontal: 32,
    marginVertical: 12,
    lineHeight: 18,
  },
  grantBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  grantText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  backLink: {
    marginTop: 16,
    padding: 8,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 32,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flipBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pauseBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F8FAFC',
  },

  // Camera Viewport Frame
  viewportFrame: {
    flex: 1,
    minHeight: 240,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#141C2E',
    overflow: 'hidden',
  },
  viewportOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(11, 15, 25, 0.25)',
  },
  viewportTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  landmarksText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.success,
  },
  fpsText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.subtle,
  },
  viewportCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  angleBadge: {
    backgroundColor: colors.success,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  angleBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  viewportBottomTip: {
    alignItems: 'center',
  },
  tipText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#F8FAFC',
  },

  // Metrics Bar
  metricsBar: {
    height: 72,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.subtle,
  },
  metricRepsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  metricFormScoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.success,
  },

  // Coach Banner
  coachBanner: {
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speakerIcon: {
    fontSize: 16,
  },
  coachTextGroup: {
    flex: 1,
    gap: 1,
  },
  coachTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  coachQuote: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Complete CTA
  completeBtn: {
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
