'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Flame,
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  Dumbbell,
  Activity,
  Target,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { type FitnessProfile, calculateBmr, calculateTdee } from '@/lib/auth';
import { calculateBmi, calculateBodyFat, getBmiCategory } from '@/lib/bodyMetrics';

// ─── Step config ───────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'basic', label: 'Cơ bản', icon: User },
  { id: 'experience', label: 'Kinh nghiệm', icon: Dumbbell },
  { id: 'activity', label: 'Hoạt động', icon: Activity },
  { id: 'goal', label: 'Mục tiêu', icon: Target },
  { id: 'review', label: 'Xem lại', icon: ClipboardList },
] as const;

type StepId = (typeof STEPS)[number]['id'];

// ─── Partial profile state ────────────────────────────────────────────────────

type ProfileDraft = Partial<FitnessProfile>;

// ─── Sub-components ───────────────────────────────────────────────────────────

function OptionCard({
  selected,
  onClick,
  title,
  subtitle,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-4 rounded-xl border-2 flex items-center gap-3.5 transition-all cursor-pointer ${
        selected
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50'
      }`}
    >
      {icon && (
        <span
          className={`text-lg leading-none ${selected ? 'opacity-90' : 'opacity-60'}`}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className={`font-bold text-sm ${selected ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </p>
        {subtitle && (
          <p className={`text-xs mt-0.5 leading-snug ${selected ? 'text-slate-300' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
      {selected && (
        <div className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

function NumberInput({
  label,
  unit,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  unit: string;
  value: number | '';
  min: number;
  max: number;
  step?: number;
  onChange: (v: number | '') => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === '' ? '' : parseFloat(v));
          }}
          className="w-full h-11 pl-4 pr-14 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
          {unit}
        </span>
      </div>
    </div>
  );
}

// ─── Step panels ──────────────────────────────────────────────────────────────

function StepBasic({
  draft,
  onChange,
}: {
  draft: ProfileDraft;
  onChange: (patch: Partial<ProfileDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold text-slate-700 mb-2 tracking-wide uppercase">Giới tính sinh học</p>
        <div className="grid grid-cols-2 gap-2.5">
          <OptionCard
            selected={draft.gender === 'male'}
            onClick={() => onChange({ gender: 'male' })}
            icon="♂"
            title="Nam"
          />
          <OptionCard
            selected={draft.gender === 'female'}
            onClick={() => onChange({ gender: 'female' })}
            icon="♀"
            title="Nữ"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <NumberInput
          label="Tuổi"
          unit="tuổi"
          value={draft.age ?? ''}
          min={10}
          max={99}
          onChange={(v) => onChange({ age: v === '' ? undefined : (v as number) })}
        />
        <NumberInput
          label="Chiều cao"
          unit="cm"
          value={draft.heightCm ?? ''}
          min={100}
          max={250}
          onChange={(v) => onChange({ heightCm: v === '' ? undefined : (v as number) })}
        />
        <NumberInput
          label="Cân nặng"
          unit="kg"
          value={draft.weightKg ?? ''}
          min={20}
          max={300}
          step={0.1}
          onChange={(v) => onChange({ weightKg: v === '' ? undefined : (v as number) })}
        />
      </div>
    </div>
  );
}

function StepExperience({
  draft,
  onChange,
}: {
  draft: ProfileDraft;
  onChange: (patch: Partial<ProfileDraft>) => void;
}) {
  const options: { value: FitnessProfile['trainingExperience']; title: string; subtitle: string }[] = [
    {
      value: 'beginner',
      title: 'Mới bắt đầu',
      subtitle: 'Chưa từng tập luyện có hệ thống hoặc rất ít kinh nghiệm.',
    },
    {
      value: 'some_experience',
      title: 'Có chút kinh nghiệm',
      subtitle: 'Đã tập trước đây, quen các bài cơ bản nhưng chưa đều đặn.',
    },
    {
      value: 'intermediate',
      title: 'Trình độ trung cấp',
      subtitle: 'Tập đều đặn, quen lập kế hoạch và theo dõi tiến độ.',
    },
    {
      value: 'advanced',
      title: 'Nâng cao',
      subtitle: 'Tập luyện lâu dài, có thể tự thiết kế và điều chỉnh chương trình.',
    },
  ];

  return (
    <div className="space-y-2.5">
      {options.map((o) => (
        <OptionCard
          key={o.value}
          selected={draft.trainingExperience === o.value}
          onClick={() => onChange({ trainingExperience: o.value })}
          title={o.title}
          subtitle={o.subtitle}
        />
      ))}
    </div>
  );
}

function StepActivity({
  draft,
  onChange,
}: {
  draft: ProfileDraft;
  onChange: (patch: Partial<ProfileDraft>) => void;
}) {
  const options: { value: FitnessProfile['dailyActivityLevel']; title: string; subtitle: string }[] = [
    {
      value: 'sedentary',
      title: 'Ít vận động',
      subtitle: 'Công việc văn phòng, ngồi hầu hết ngày, ít đi bộ.',
    },
    {
      value: 'lightly_active',
      title: 'Nhẹ nhàng',
      subtitle: 'Đi bộ nhẹ, làm việc nhà cơ bản 1–3 ngày/tuần.',
    },
    {
      value: 'moderately_active',
      title: 'Vừa phải',
      subtitle: 'Vận động vừa phải, tập thể dục 3–5 ngày/tuần.',
    },
    {
      value: 'very_active',
      title: 'Rất năng động',
      subtitle: 'Tập nặng hoặc làm việc thể chất nhiều, 6–7 ngày/tuần.',
    },
    {
      value: 'extremely_active',
      title: 'Cực kỳ năng động',
      subtitle: 'Vận động viên chuyên nghiệp hoặc công việc đòi hỏi thể lực cao.',
    },
  ];

  return (
    <div className="space-y-2.5">
      {options.map((o) => (
        <OptionCard
          key={o.value}
          selected={draft.dailyActivityLevel === o.value}
          onClick={() => onChange({ dailyActivityLevel: o.value })}
          title={o.title}
          subtitle={o.subtitle}
        />
      ))}
    </div>
  );
}

function StepGoal({
  draft,
  onChange,
}: {
  draft: ProfileDraft;
  onChange: (patch: Partial<ProfileDraft>) => void;
}) {
  const options: { value: FitnessProfile['fitnessGoal']; title: string; subtitle: string; icon: string }[] = [
    {
      value: 'lose_fat',
      title: 'Giảm mỡ',
      subtitle: 'Giảm mỡ bền vững, giữ cơ bắp và cải thiện sức khoẻ tổng thể.',
      icon: '🔥',
    },
    {
      value: 'maintain',
      title: 'Duy trì cân nặng',
      subtitle: 'Giữ nguyên cân nặng, tập trung cải thiện thể lực và hiệu suất.',
      icon: '⚖️',
    },
    {
      value: 'build_muscle',
      title: 'Tăng cơ',
      subtitle: 'Phát triển khối lượng cơ và sức mạnh qua luyện tập có kế hoạch.',
      icon: '💪',
    },
  ];

  return (
    <div className="space-y-2.5">
      {options.map((o) => (
        <OptionCard
          key={o.value}
          selected={draft.fitnessGoal === o.value}
          onClick={() => onChange({ fitnessGoal: o.value })}
          icon={o.icon}
          title={o.title}
          subtitle={o.subtitle}
        />
      ))}
    </div>
  );
}

function StepReview({ draft, user }: { draft: ProfileDraft; user: { email: string; displayName: string } }) {
  const weight = draft.weightKg ?? 0;
  const height = draft.heightCm ?? 0;
  const age = draft.age ?? 22;
  const gender = draft.gender ?? 'male';
  const activityLevel = draft.dailyActivityLevel ?? 'sedentary';

  const bmi = calculateBmi(weight, height);
  const bodyFat = calculateBodyFat(bmi, age, gender);
  const bmr = calculateBmr(weight, height, age, gender);
  const tdee = calculateTdee(bmr, activityLevel);
  const bmiCat = getBmiCategory(bmi);

  const goalLabels: Record<FitnessProfile['fitnessGoal'], string> = {
    lose_fat: 'Giảm mỡ',
    maintain: 'Duy trì cân nặng',
    build_muscle: 'Tăng cơ',
  };

  const expLabels: Record<FitnessProfile['trainingExperience'], string> = {
    beginner: 'Mới bắt đầu',
    some_experience: 'Có chút kinh nghiệm',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
  };

  const activityLabels: Record<FitnessProfile['dailyActivityLevel'], string> = {
    sedentary: 'Ít vận động',
    lightly_active: 'Nhẹ nhàng',
    moderately_active: 'Vừa phải',
    very_active: 'Rất năng động',
    extremely_active: 'Cực kỳ năng động',
  };

  const Section = ({ title, rows }: { title: string; rows: [string, string][] }) => (
    <div>
      <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-2">{title}</p>
      <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="text-sm font-semibold text-slate-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Section
        title="Tài khoản"
        rows={[
          ['Tên', user.displayName],
          ['Email', user.email],
          ['Xác thực', '✓ Đã xác nhận'],
        ]}
      />
      <Section
        title="Cơ thể"
        rows={[
          ['Giới tính', gender === 'male' ? 'Nam' : 'Nữ'],
          ['Tuổi', `${age} tuổi`],
          ['Chiều cao', `${height} cm`],
          ['Cân nặng', `${weight} kg`],
          ['BMI', `${bmi} — ${bmiCat.label}`],
          ['Tỷ lệ mỡ ước tính', `${bodyFat}%`],
        ]}
      />
      <Section
        title="Luyện tập"
        rows={[
          ['Kinh nghiệm', draft.trainingExperience ? expLabels[draft.trainingExperience] : '—'],
          ['Mức vận động', draft.dailyActivityLevel ? activityLabels[draft.dailyActivityLevel] : '—'],
          ['Mục tiêu', draft.fitnessGoal ? goalLabels[draft.fitnessGoal] : '—'],
        ]}
      />
      <Section
        title="Chỉ số khởi đầu"
        rows={[
          ['BMR', `${bmr.toLocaleString()} kcal/ngày`],
          ['TDEE (ước tính)', `${tdee.toLocaleString()} kcal/ngày`],
        ]}
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { user, saveFitnessProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState<StepId>('basic');
  const [draft, setDraft] = useState<ProfileDraft>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Redirect if no verified user
  useEffect(() => {
    if (!user) {
      router.replace('/auth/register');
      return;
    }
    if (!user.isEmailVerified) {
      router.replace('/auth/verify');
      return;
    }
    if (user.hasCompletedOnboarding) {
      router.replace('/');
    }
  }, [user, router]);

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const totalSteps = STEPS.length;

  const patchDraft = (patch: Partial<ProfileDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const isStepComplete = (step: StepId): boolean => {
    switch (step) {
      case 'basic':
        return !!(draft.gender && draft.age && draft.heightCm && draft.weightKg);
      case 'experience':
        return !!draft.trainingExperience;
      case 'activity':
        return !!draft.dailyActivityLevel;
      case 'goal':
        return !!draft.fitnessGoal;
      case 'review':
        return true;
    }
  };

  const canAdvance = isStepComplete(currentStep);

  const goNext = () => {
    if (stepIndex < totalSteps - 1) {
      setCurrentStep(STEPS[stepIndex + 1].id);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].id);
    }
  };

  const handleFinish = async () => {
    if (isSaving) return;
    const profile = draft as FitnessProfile;
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveFitnessProfile(profile);
      router.push('/');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const stepTitles: Record<StepId, { heading: string; sub: string }> = {
    basic: {
      heading: 'Thông tin cơ bản',
      sub: 'Dữ liệu này dùng để tính BMI, BMR và nhu cầu calo hằng ngày.',
    },
    experience: {
      heading: 'Kinh nghiệm luyện tập',
      sub: 'Không phải mức hoạt động hằng ngày — mà là mức độ bạn quen với tập luyện có hệ thống.',
    },
    activity: {
      heading: 'Mức vận động hằng ngày',
      sub: 'Mức hoạt động trong cuộc sống thường ngày, không tính các buổi tập cụ thể.',
    },
    goal: {
      heading: 'Mục tiêu chính',
      sub: 'Chọn mục tiêu chính của bạn — bạn có thể thay đổi bất kỳ lúc nào.',
    },
    review: {
      heading: 'Xem lại hồ sơ',
      sub: 'Kiểm tra thông tin trước khi hoàn tất. Bạn có thể chỉnh sửa sau trong cài đặt.',
    },
  };

  if (!user) return null;

  const { heading, sub } = stepTitles[currentStep];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="h-14 flex items-center px-6 border-b border-slate-200 bg-white flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 mr-auto">
          <div className="w-7 h-7 rounded-lg bg-[#FF5722] flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 fill-white text-white" strokeWidth={1.5} />
          </div>
          <span className="font-black text-base tracking-tight text-slate-900">
            FitTrack<span className="text-[#FF5722]">AI</span>
          </span>
        </Link>
        <span className="text-xs text-slate-400 font-semibold">
          Bước {stepIndex + 1} / {totalSteps}
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-slate-200">
        <div
          className="h-full bg-[#FF5722] transition-all duration-500 ease-out"
          style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step tabs */}
      <div className="bg-white border-b border-slate-100 flex overflow-x-auto scrollbar-none">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isDone = idx < stepIndex;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isDone && setCurrentStep(step.id)}
              disabled={!isDone && !isActive}
              className={`flex-1 min-w-[80px] flex flex-col items-center gap-1 py-3 px-2 text-[10px] font-bold tracking-wide uppercase border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-slate-900 text-slate-900'
                  : isDone
                  ? 'border-transparent text-slate-500 hover:text-slate-700 cursor-pointer'
                  : 'border-transparent text-slate-400 cursor-default'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDone
                    ? 'bg-emerald-100'
                    : isActive
                    ? 'bg-slate-900'
                    : 'bg-slate-100'
                }`}
              >
                {isDone ? (
                  <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                ) : (
                  <Icon
                    className={`w-3 h-3 ${isActive ? 'text-white' : 'text-slate-400'}`}
                    strokeWidth={2}
                  />
                )}
              </div>
              <span className="hidden sm:block">{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center p-6 sm:p-10">
        <div className="w-full max-w-[500px]">
          {/* Step heading */}
          <div className="mb-6">
            <h1 className="font-black text-2xl text-slate-900 tracking-tight mb-1">{heading}</h1>
            <p className="text-slate-500 text-sm leading-relaxed">{sub}</p>
          </div>

          {/* Step content */}
          {currentStep === 'basic' && (
            <StepBasic draft={draft} onChange={patchDraft} />
          )}
          {currentStep === 'experience' && (
            <StepExperience draft={draft} onChange={patchDraft} />
          )}
          {currentStep === 'activity' && (
            <StepActivity draft={draft} onChange={patchDraft} />
          )}
          {currentStep === 'goal' && (
            <StepGoal draft={draft} onChange={patchDraft} />
          )}
          {currentStep === 'review' && (
            <StepReview
              draft={draft}
              user={{ email: user.email, displayName: user.displayName }}
            />
          )}

          {/* Save error */}
          {saveError && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {saveError}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-8">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 h-11 px-5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Quay lại
              </button>
            ) : (
              <div /> /* spacer */
            )}

            {currentStep === 'review' ? (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSaving}
                className="flex-1 h-11 rounded-xl bg-[#FF5722] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#E64A19] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang lưu…
                  </>
                ) : (
                  <>
                    Hoàn tất
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={!canAdvance}
                className="flex-1 h-11 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Tiếp theo
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
