/**
 * Body Metrics Calculation & Classification Utilities
 * Based on WHO guidelines and the Deurenberg Adult Body Fat Formula:
 * Body Fat % = (1.20 × BMI) + (0.23 × Age) - (10.8 × Sex) - 5.4
 * where Sex = 1 for male, 0 for female.
 */

export interface BmiCategory {
  key: 'underweight' | 'normal' | 'overweight' | 'obese';
  label: string;
  range: string;
  badgeClass: string;
  textClass: string;
  dotColor: string;
  percentPosition: number; // 0 to 100 for gauge visualization
}

export interface BodyFatCategory {
  key: 'essential' | 'athletes' | 'fitness' | 'average' | 'high';
  label: string;
  shortLabel: string;
  range: string;
  badgeClass: string;
  textClass: string;
  accentColor: string;
  levelIndex: number; // 0 to 4
}

/**
 * Calculates BMI given weight in kg and height in cm.
 */
export function calculateBmi(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

/**
 * Calculates adult body fat percentage using the scientific Deurenberg formula.
 * Formula: 1.20 * BMI + 0.23 * Age - 10.8 * (gender === 'male' ? 1 : 0) - 5.4
 */
export function calculateBodyFat(
  bmi: number,
  age: number = 22,
  gender: 'male' | 'female' = 'male'
): number {
  if (!bmi || bmi <= 0) return 0;
  const sexFactor = gender === 'male' ? 1 : 0;
  const raw = 1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4;
  const clamped = Math.max(3.0, Math.min(55.0, raw));
  return parseFloat(clamped.toFixed(1));
}

/**
 * Categorizes BMI according to standard WHO classification with calibrated visual gauge position.
 */
export function getBmiCategory(bmi: number): BmiCategory {
  // Scale mapping: BMI 15 to 35 -> 0% to 100%
  const clamped = Math.max(15, Math.min(35, bmi));
  const percentPosition = Math.round(((clamped - 15) / (35 - 15)) * 100);

  if (bmi < 18.5) {
    return {
      key: 'underweight',
      label: 'Thiếu cân',
      range: '< 18.5',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
      textClass: 'text-amber-700',
      dotColor: '#D97706',
      percentPosition,
    };
  }
  if (bmi < 25) {
    return {
      key: 'normal',
      label: 'Cân đối chuẩn',
      range: '18.5 - 24.9',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      textClass: 'text-emerald-700',
      dotColor: '#059669',
      percentPosition,
    };
  }
  if (bmi < 30) {
    return {
      key: 'overweight',
      label: 'Thừa cân',
      range: '25.0 - 29.9',
      badgeClass: 'bg-orange-50 text-orange-800 border-orange-200/80',
      textClass: 'text-orange-700',
      dotColor: '#EA580C',
      percentPosition,
    };
  }
  return {
    key: 'obese',
    label: 'Béo phì',
    range: '≥ 30.0',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
    textClass: 'text-rose-700',
    dotColor: '#E11D48',
    percentPosition,
  };
}

/**
 * Categorizes Body Fat % according to ACE (American Council on Exercise) standards.
 */
export function getBodyFatCategory(
  bodyFat: number,
  gender: 'male' | 'female' = 'male'
): BodyFatCategory {
  if (gender === 'male') {
    if (bodyFat < 6) {
      return {
        key: 'essential',
        label: 'Mỡ thiết yếu (Tối thiểu)',
        shortLabel: 'Thiết yếu',
        range: '2 - 5%',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
        textClass: 'text-amber-700',
        accentColor: '#D97706',
        levelIndex: 0,
      };
    }
    if (bodyFat < 14) {
      return {
        key: 'athletes',
        label: 'Vận động viên đỉnh cao',
        shortLabel: 'Vận động viên',
        range: '6 - 13%',
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-200/80',
        textClass: 'text-sky-700',
        accentColor: '#0284C7',
        levelIndex: 1,
      };
    }
    if (bodyFat < 18) {
      return {
        key: 'fitness',
        label: 'Thể lực & Săn chắc',
        shortLabel: 'Săn chắc',
        range: '14 - 17%',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        textClass: 'text-emerald-700',
        accentColor: '#059669',
        levelIndex: 2,
      };
    }
    if (bodyFat < 25) {
      return {
        key: 'average',
        label: 'Mức trung bình chấp nhận',
        shortLabel: 'Trung bình',
        range: '18 - 24%',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
        textClass: 'text-indigo-700',
        accentColor: '#4F46E5',
        levelIndex: 3,
      };
    }
    return {
      key: 'high',
      label: 'Thừa mỡ cơ thể',
      shortLabel: 'Thừa mỡ',
      range: '≥ 25%',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
      textClass: 'text-rose-700',
      accentColor: '#E11D48',
      levelIndex: 4,
    };
  } else {
    // Female classification
    if (bodyFat < 14) {
      return {
        key: 'essential',
        label: 'Mỡ thiết yếu (Tối thiểu)',
        shortLabel: 'Thiết yếu',
        range: '10 - 13%',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
        textClass: 'text-amber-700',
        accentColor: '#D97706',
        levelIndex: 0,
      };
    }
    if (bodyFat < 21) {
      return {
        key: 'athletes',
        label: 'Vận động viên',
        shortLabel: 'Vận động viên',
        range: '14 - 20%',
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-200/80',
        textClass: 'text-sky-700',
        accentColor: '#0284C7',
        levelIndex: 1,
      };
    }
    if (bodyFat < 25) {
      return {
        key: 'fitness',
        label: 'Thể lực & Săn chắc',
        shortLabel: 'Săn chắc',
        range: '21 - 24%',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        textClass: 'text-emerald-700',
        accentColor: '#059669',
        levelIndex: 2,
      };
    }
    if (bodyFat < 32) {
      return {
        key: 'average',
        label: 'Mức trung bình chấp nhận',
        shortLabel: 'Trung bình',
        range: '25 - 31%',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
        textClass: 'text-indigo-700',
        accentColor: '#4F46E5',
        levelIndex: 3,
      };
    }
    return {
      key: 'high',
      label: 'Thừa mỡ cơ thể',
      shortLabel: 'Thừa mỡ',
      range: '≥ 32%',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
      textClass: 'text-rose-700',
      accentColor: '#E11D48',
      levelIndex: 4,
    };
  }
}
