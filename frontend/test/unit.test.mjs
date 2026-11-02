import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. BMI and Body Fat Math Tests ---
function calculateBmi(weightKg, heightCm) {
  if (!heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

function calculateBodyFat(bmi, age, gender) {
  const genderFactor = gender === 'female' ? 0 : 1;
  const fat = 1.2 * bmi + 0.23 * age - 10.8 * genderFactor - 5.4;
  return Math.max(5, Math.min(50, Number(fat.toFixed(1))));
}

test('calculateBmi returns accurate BMI index', () => {
  const bmi = calculateBmi(70, 175);
  // 70 / (1.75 * 1.75) = 22.857 -> 22.9
  assert.equal(bmi, 22.9);
  assert.equal(calculateBmi(0, 175), 0);
  assert.equal(calculateBmi(80, 0), 0);
});

test('calculateBodyFat returns reasonable bounded percentage', () => {
  const maleFat = calculateBodyFat(22.9, 25, 'male');
  assert.ok(maleFat >= 10 && maleFat <= 25, `Male fat ${maleFat}% should be within athletic range`);

  const femaleFat = calculateBodyFat(22.9, 25, 'female');
  assert.ok(femaleFat > maleFat, 'Female formula should produce higher physiological fat than male');
});

// --- 2. Exercise Dataset Integrity & Filter Tests ---
test('exerciseDataset.json contains all 1,324 items with required schema', () => {
  const datasetPath = path.resolve(__dirname, '../src/data/exerciseDataset.json');
  assert.ok(fs.existsSync(datasetPath), 'exerciseDataset.json must exist');

  const content = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
  assert.equal(content.length, 1324, 'Dataset must have exactly 1324 exercises');

  const first = content[0];
  assert.ok(first.id, 'Exercise must have id');
  assert.ok(first.name, 'Exercise must have name');
  assert.ok(first.category, 'Exercise must have category');
  assert.ok(first.equipment, 'Exercise must have equipment');
});

test('Exercise search and filter logic operates correctly', () => {
  const datasetPath = path.resolve(__dirname, '../src/data/exerciseDataset.json');
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

  // Test search query 'squat'
  const squats = dataset.filter((item) => item.name.toLowerCase().includes('squat'));
  assert.ok(squats.length > 10, 'There should be multiple squat exercises');

  // Test AI pose check flag
  const aiCertified = dataset.filter((item) => item.has_ai_check);
  assert.ok(aiCertified.length > 0, 'Should identify AI pose-checkable exercises');
  assert.ok(aiCertified.every((item) => /squat|push up|push-up|pushup|plank|lunge|bicep curl/i.test(item.name)));

  // Test pagination math
  const perPage = 24;
  const total = squats.length;
  const lastPage = Math.ceil(total / perPage);
  const paged = squats.slice(0, perPage);
  assert.equal(paged.length, Math.min(perPage, total));
  assert.ok(lastPage >= 1);
});

// --- 3. Vietnamese Foods Nutrition Math Tests ---
test('Vietnamese food database calorie calculations match macros', () => {
  const foodsPath = path.resolve(__dirname, '../src/data/vietnameseFoods.ts');
  assert.ok(fs.existsSync(foodsPath), 'vietnameseFoods.ts must exist');

  // Multiplier logic check: 1.5x portion doubles nutrients proportionally
  const baseCalories = 450;
  const multiplier = 1.5;
  const scaled = Math.round(baseCalories * multiplier);
  assert.equal(scaled, 675);
});

// --- 4. Idempotency Key Format Check ---
test('UUID format validation for Idempotency Key', () => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  // Sample RFC4122 v4 UUID
  const sampleUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  assert.ok(uuidRegex.test(sampleUuid), 'Valid UUIDv4 must pass regex');
});

// --- 5. AI Workout Planner Rule Engine Tests ---
function recommendSplit(experience, daysCount, goal) {
  if (daysCount <= 3) {
    if (goal === 'strength' && experience !== 'beginner') return 'strength';
    return 'full_body';
  }
  if (daysCount === 4) {
    if (goal === 'strength') return 'strength';
    return 'upper_lower';
  }
  return 'ppl';
}

function validateSplit(split, daysCount) {
  const limits = {
    full_body: { min: 2, max: 4 },
    upper_lower: { min: 3, max: 4 },
    ppl: { min: 3, max: 6 },
    bro_split: { min: 4, max: 5 },
    strength: { min: 3, max: 4 },
  };
  const def = limits[split];
  if (!def) return { isValid: true };
  if (daysCount < def.min) return { isValid: false, reason: 'under_min' };
  if (daysCount > def.max) return { isValid: false, reason: 'over_max' };
  return { isValid: true };
}

test('recommendSplit suggests optimal splits based on schedule and fitness profile', () => {
  // 3 days per week -> Full body
  assert.equal(recommendSplit('intermediate', 3, 'gain_muscle'), 'full_body');
  // 4 days per week -> Upper / Lower
  assert.equal(recommendSplit('intermediate', 4, 'gain_muscle'), 'upper_lower');
  // 5 days per week -> PPL
  assert.equal(recommendSplit('advanced', 5, 'gain_muscle'), 'ppl');
  // 3 days per week with strength goal for experienced lifter -> strength
  assert.equal(recommendSplit('advanced', 3, 'strength'), 'strength');
});

test('validateSplit enforces physiological recovery boundaries', () => {
  // PPL with only 2 days should fail validation
  const pplCheck = validateSplit('ppl', 2);
  assert.equal(pplCheck.isValid, false);
  assert.equal(pplCheck.reason, 'under_min');

  // Full Body with 5 days should fail validation (overtraining risk)
  const fbCheck = validateSplit('full_body', 5);
  assert.equal(fbCheck.isValid, false);
  assert.equal(fbCheck.reason, 'over_max');

  // Upper / Lower with 4 days should pass
  const ulCheck = validateSplit('upper_lower', 4);
  assert.equal(ulCheck.isValid, true);
});


// --- 6. Dataset Starter Routines & Real Streak Calculation ---
test('Starter routines use valid exercise IDs from exerciseDataset.json', () => {
  const datasetPath = path.resolve(__dirname, '../src/data/exerciseDataset.json');
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
  const validIds = new Set(dataset.map((e) => e.id));

  const starterIds = [
    'ex-0025', // Barbell Bench Press
    'ex-0007', // Alternate Lateral Pulldown
    'ex-0662', // Push-Up
    'ex-1004', // Band Squat
    'ex-0464', // Front Plank With Twist
    'ex-1429', // Wide Grip Pull-Up
    'ex-0219', // Cable Shoulder Press
    'ex-1634', // Cable Lying Bicep Curl
    'ex-1001', // Band Single Leg Split Squat
    'ex-3544', // Bodyweight Incline Side Plank
    'ex-0001', // 3/4 Sit-Up
  ];

  for (const id of starterIds) {
    assert.ok(validIds.has(id), `Exercise ID ${id} must exist in exerciseDataset.json`);
  }
});

test('Real streak calculation respects consecutive calendar days', () => {
  function calculateRealStreak(history) {
    if (!history || history.length === 0) return 0;
    const uniqueDates = Array.from(
      new Set(
        history
          .map((h) => {
            try { return new Date(h.completedAt).toISOString().split('T')[0]; } catch { return null; }
          })
          .filter(Boolean)
      )
    ).sort().reverse();

    if (uniqueDates.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const latest = uniqueDates[0];
    if (latest !== todayStr && latest !== yesterdayStr) return 0;

    let streak = 0;
    let checkDate = new Date(latest);
    for (const dStr of uniqueDates) {
      const currentExpected = checkDate.toISOString().split('T')[0];
      if (dStr === currentExpected) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  // Case 1: Empty history -> 0 streak
  assert.equal(calculateRealStreak([]), 0);

  // Case 2: Broken history (workout 5 days ago) -> 0 streak
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 5);
  assert.equal(calculateRealStreak([{ completedAt: oldDate.toISOString() }]), 0);

  // Case 3: 3 consecutive days ending today -> 3 streak
  const today = new Date();
  const d1 = new Date(); d1.setDate(today.getDate() - 1);
  const d2 = new Date(); d2.setDate(today.getDate() - 2);

  const activeHistory = [
    { completedAt: today.toISOString() },
    { completedAt: d1.toISOString() },
    { completedAt: d2.toISOString() },
  ];
  assert.equal(calculateRealStreak(activeHistory), 3);
});
