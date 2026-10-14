import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../lib/theme';
import {
  LogMeasurementModal,
  MeasurementRecord,
} from '../../components/LogMeasurementModal';

interface BodyRecord {
  id: string;
  date: string;
  weight: number;
  fat: number;
  bmi: number;
  delta: string;
  status: string;
  isLatest?: boolean;
}

const INITIAL_LOGS: BodyRecord[] = [
  {
    id: '1',
    date: '2026-09-01',
    weight: 70.2,
    fat: 16.5,
    bmi: 22.9,
    delta: '+0.7',
    status: 'Săn chắc',
    isLatest: true,
  },
  {
    id: '2',
    date: '2026-09-07',
    weight: 69.5,
    fat: 16.0,
    bmi: 22.7,
    delta: '+0.6',
    status: 'Săn chắc',
  },
  {
    id: '3',
    date: '2026-09-14',
    weight: 68.9,
    fat: 15.5,
    bmi: 22.5,
    delta: '+0.5',
    status: 'Săn chắc',
  },
  {
    id: '4',
    date: '2026-09-20',
    weight: 68.4,
    fat: 15.2,
    bmi: 22.3,
    delta: '-0.5',
    status: 'Săn chắc',
  },
];

export default function BodyMetricsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [chartTab, setChartTab] = useState<'weight' | 'fat'>('weight');
  const [logs, setLogs] = useState<BodyRecord[]>(INITIAL_LOGS);

  const currentWeight = logs[logs.length - 1]?.weight ?? 68.4;
  const currentFat = logs[logs.length - 1]?.fat ?? 15.2;
  const currentBmi = logs[logs.length - 1]?.bmi ?? 22.3;

  const handleSaveMeasurement = (record: MeasurementRecord) => {
    const newEntry: BodyRecord = {
      id: record.id,
      date: record.date,
      weight: record.weightKg,
      fat: record.bodyFatPercent,
      bmi: record.bmi,
      delta: record.deltaWeight || '0.0',
      status: record.status,
      isLatest: true,
    };
    setLogs((prev) => [
      newEntry,
      ...prev.map((item) => ({ ...item, isLatest: false })),
    ]);
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
          <Text style={s.pageTitle}>Chỉ số cơ thể</Text>
          <Pressable
            style={s.logBtn}
            onPress={() => setModalVisible(true)}
            accessibilityRole="button"
          >
            <Text style={s.logBtnText}>+ Ghi số đo</Text>
          </Pressable>
        </View>

        {/* 004-3 Top Metric Cards */}
        <View style={s.topMetricRow}>
          {/* Cân nặng */}
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>CÂN NẶNG</Text>
            <Text style={s.metricValue}>{currentWeight} kg</Text>
            <View style={s.metricBadgeGreen}>
              <Text style={s.metricBadgeGreenText}>Cân đối chuẩn</Text>
            </View>
          </View>

          {/* BMI */}
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>CHỈ SỐ BMI</Text>
            <Text style={s.metricValueBlue}>{currentBmi} BMI</Text>
            <View style={s.metricBadgeBlue}>
              <Text style={s.metricBadgeBlueText}>Chuẩn 56-76kg</Text>
            </View>
          </View>

          {/* Tỷ lệ mỡ */}
          <View style={s.metricCard}>
            <Text style={s.metricLabel}>TỶ LỆ MỠ</Text>
            <Text style={s.metricValueGreen}>{currentFat}%</Text>
            <View style={s.metricBadgeGreen}>
              <Text style={s.metricBadgeGreenText}>Săn chắc</Text>
            </View>
          </View>
        </View>

        {/* 004-Progress-Chart-Card */}
        <View style={s.chartCard}>
          <View style={s.chartHeaderRow}>
            <Text style={s.chartTitle}>Biểu đồ tiến độ</Text>
            <View style={s.chartTabs}>
              <Pressable
                style={[s.chartTab, chartTab === 'weight' && s.chartTabActive]}
                onPress={() => setChartTab('weight')}
              >
                <Text
                  style={[
                    s.chartTabText,
                    chartTab === 'weight' && s.chartTabTextActive,
                  ]}
                >
                  Cân nặng (kg)
                </Text>
              </Pressable>
              <Pressable
                style={[s.chartTab, chartTab === 'fat' && s.chartTabActive]}
                onPress={() => setChartTab('fat')}
              >
                <Text
                  style={[
                    s.chartTabText,
                    chartTab === 'fat' && s.chartTabTextActive,
                  ]}
                >
                  Tỷ lệ mỡ (%)
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={s.chartMetaRow}>
            <Text style={s.chartMetaMuted}>Mốc ban đầu: 68.4 kg</Text>
            <Text style={s.chartMetaBold}>Hiện tại: {currentWeight} kg</Text>
            <View style={s.metricBadgeGreen}>
              <Text style={s.metricBadgeGreenText}>Ổn định (0 kg)</Text>
            </View>
          </View>

          {/* Bar Chart Container */}
          <View style={s.barChartArea}>
            <View style={s.barCol}>
              <Text style={s.barValText}>70.2kg</Text>
              <View style={[s.barPill, { height: 60, backgroundColor: colors.subtle }]} />
              <Text style={s.barDateText}>01/09</Text>
            </View>

            <View style={s.barCol}>
              <Text style={s.barValText}>69.5kg</Text>
              <View style={[s.barPill, { height: 50, backgroundColor: colors.subtle }]} />
              <Text style={s.barDateText}>07/09</Text>
            </View>

            <View style={s.barCol}>
              <Text style={s.barValText}>68.9kg</Text>
              <View style={[s.barPill, { height: 42, backgroundColor: colors.subtle }]} />
              <Text style={s.barDateText}>14/09</Text>
            </View>

            <View style={s.barCol}>
              <Text style={s.barValTextHighlight}>68.4kg</Text>
              <View style={[s.barPill, { height: 36, backgroundColor: colors.primary }]} />
              <Text style={s.barDateText}>20/09</Text>
            </View>
          </View>
        </View>

        {/* 004-Measurement Log List */}
        <View style={s.logSection}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              Nhật ký chỉ số cơ thể ({logs.length} bản)
            </Text>
            <Text style={s.sectionSubLink}>Quản lý & Xóa</Text>
          </View>

          {logs.map((item) => (
            <View key={item.id} style={s.logRow}>
              <View style={s.logLeft}>
                <View style={s.logDateRow}>
                  <Text style={s.logDate}>📅 {item.date}</Text>
                  {item.isLatest && (
                    <View style={s.latestPill}>
                      <Text style={s.latestPillText}>Mới nhất</Text>
                    </View>
                  )}
                </View>
                <Text style={s.logSub}>
                  BMI: {item.bmi} • Mỡ: {item.fat}%
                </Text>
              </View>

              <View style={s.logRight}>
                <Text style={s.logWeight}>
                  {item.weight} kg ({item.delta})
                </Text>
                <View style={s.logStatusPill}>
                  <Text style={s.logStatusText}>{item.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 004-Shape Progress Photos */}
        <View style={s.photosSection}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Ảnh tiến độ vóc dáng (4 ảnh)</Text>
            <Text style={s.compareLink}>So sánh Before/After ➔</Text>
          </View>

          <View style={s.photoCardsRow}>
            <View style={s.photoCard}>
              <View style={s.photoBox}>
                <Text style={s.photoIcon}>📷</Text>
              </View>
              <Text style={s.photoCardTitle}>Day 1 Baseline</Text>
              <Text style={s.photoCardMeta}>72.5kg • 18%</Text>
            </View>

            <View style={s.photoCard}>
              <View style={s.photoBox}>
                <Text style={s.photoIcon}>📷</Text>
              </View>
              <Text style={s.photoCardTitle}>Week 6 Definition</Text>
              <Text style={s.photoCardMeta}>69.1kg • 15.6%</Text>
            </View>

            <View style={s.photoCard}>
              <View style={s.photoBox}>
                <Text style={s.photoIcon}>📷</Text>
              </View>
              <Text style={s.photoCardTitle}>Current Shape</Text>
              <Text style={s.photoCardMeta}>{currentWeight}kg • {currentFat}%</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 009-Log-Measurement-Modal Component */}
      <LogMeasurementModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveMeasurement}
        currentWeight={currentWeight}
        currentBodyFat={currentFat}
      />
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
  logBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Top 3 Metric Cards
  topMetricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    height: 74,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.subtle,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  metricValueBlue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.info,
  },
  metricValueGreen: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.success,
  },
  metricBadgeGreen: {
    backgroundColor: colors.successSoft,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  metricBadgeGreenText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.successText,
  },
  metricBadgeBlue: {
    backgroundColor: colors.infoSoft,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  metricBadgeBlueText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.info,
  },

  // Progress Chart Card
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  chartTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  chartTab: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  chartTabActive: {
    backgroundColor: '#FFFFFF',
  },
  chartTabText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.muted,
  },
  chartTabTextActive: {
    fontWeight: '700',
    color: colors.text,
  },
  chartMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartMetaMuted: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.muted,
  },
  chartMetaBold: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  barChartArea: {
    height: 90,
    backgroundColor: colors.bg,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  barCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  barValText: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.muted,
  },
  barValTextHighlight: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
  },
  barPill: {
    width: 28,
    borderRadius: 6,
  },
  barDateText: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.subtle,
  },

  // Measurement Log Section
  logSection: {
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
  sectionSubLink: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.muted,
  },
  logRow: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logLeft: {
    gap: 2,
  },
  logDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logDate: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  latestPill: {
    backgroundColor: colors.successSoft,
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 4,
  },
  latestPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.successText,
  },
  logSub: {
    fontSize: 10,
    color: colors.muted,
  },
  logRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  logWeight: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  logStatusPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  logStatusText: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  // Photos Section
  photosSection: {
    gap: 8,
  },
  compareLink: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  photoCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  photoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 8,
    gap: 4,
  },
  photoBox: {
    height: 48,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: {
    fontSize: 16,
  },
  photoCardTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  photoCardMeta: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.muted,
  },
});
