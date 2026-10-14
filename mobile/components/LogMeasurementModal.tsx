import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../lib/theme';

export interface MeasurementRecord {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPercent: number;
  bmi: number;
  status: string;
  deltaWeight?: string;
}

interface LogMeasurementModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: MeasurementRecord) => void;
  currentWeight?: number;
  currentBodyFat?: number;
}

export function LogMeasurementModal({
  visible,
  onClose,
  onSave,
  currentWeight = 68.4,
  currentBodyFat = 15.2,
}: LogMeasurementModalProps) {
  const [weight, setWeight] = useState(String(currentWeight));
  const [bodyFat, setBodyFat] = useState(String(currentBodyFat));
  const [photoSelected, setPhotoSelected] = useState(false);

  // Assuming average height 1.75m for BMI auto-calc if not provided
  const parsedWeight = parseFloat(weight) || 68.4;
  const parsedFat = parseFloat(bodyFat) || 15.2;
  const heightM = 1.75;
  const bmi = parseFloat((parsedWeight / (heightM * heightM)).toFixed(1));

  const getBmiStatus = (val: number) => {
    if (val < 18.5) return 'Gầy';
    if (val <= 24.9) return 'Cân đối chuẩn';
    return 'Thừa cân nhẹ';
  };

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0];
    onSave({
      id: `m-${Date.now()}`,
      date: today,
      weightKg: parsedWeight,
      bodyFatPercent: parsedFat,
      bmi,
      status: parsedFat <= 16 ? 'Săn chắc' : 'Bình thường',
      deltaWeight: '+0.5',
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={s.sheet}>
          {/* Drag Handle */}
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Ghi số đo cơ thể mới</Text>
            <Pressable style={s.closeBtn} onPress={onClose} hitSlop={8} accessibilityRole="button">
              <Text style={s.closeText}>✕</Text>
            </Pressable>
          </View>

          {/* Input fields */}
          <View style={s.inputRow}>
            <View style={s.inputBox}>
              <Text style={s.inputLabel}>CÂN NẶNG (KG)</Text>
              <TextInput
                style={s.inputValue}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
            <View style={s.inputBox}>
              <Text style={s.inputLabel}>TỶ LỆ MỠ (%)</Text>
              <TextInput
                style={s.inputValue}
                keyboardType="decimal-pad"
                value={bodyFat}
                onChangeText={setBodyFat}
              />
            </View>
          </View>

          {/* Auto BMI Badge */}
          <View style={s.bmiBadge}>
            <Text style={s.bmiLabel}>Chỉ số BMI tự tính:</Text>
            <Text style={s.bmiValue}>
              {bmi} BMI ({getBmiStatus(bmi)})
            </Text>
          </View>

          {/* Photo upload mock */}
          <Pressable
            style={[s.photoBox, photoSelected && s.photoBoxActive]}
            onPress={() => setPhotoSelected(!photoSelected)}
            accessibilityRole="button"
          >
            <Text style={s.photoIcon}>📸</Text>
            <Text style={s.photoTitle}>
              {photoSelected ? 'Đã đính kèm ảnh tiến độ hôm nay ✓' : 'Thêm ảnh tiến độ vóc dáng (Tuỳ chọn)'}
            </Text>
            <Text style={s.photoSub}>Chụp hoặc tải ảnh vóc dáng hôm nay</Text>
          </Pressable>

          {/* Submit CTA */}
          <Pressable style={s.submitBtn} onPress={handleSave} accessibilityRole="button">
            <Text style={s.submitText}>Lưu chỉ số & Cập nhật biểu đồ</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 12,
    color: colors.muted,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputBox: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.subtle,
  },
  inputValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    padding: 0,
  },
  bmiBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bmiLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.successDark,
  },
  bmiValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.successText,
  },
  photoBox: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoBoxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  photoIcon: {
    fontSize: 24,
  },
  photoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  photoSub: {
    fontSize: 10,
    color: colors.muted,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
