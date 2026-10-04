'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { X, Activity, TrendingDown, Scale, Plus, CheckCircle2, Percent, Sparkles, HelpCircle } from 'lucide-react';
import { BodyMetricsData, MetricHistoryItem } from '@/lib/fitnessData';
import { calculateBmi, calculateBodyFat, getBmiCategory, getBodyFatCategory } from '@/lib/bodyMetrics';

interface BodyMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: BodyMetricsData;
  history: MetricHistoryItem[];
  onSaveMetric: (newMetric: MetricHistoryItem) => void;
}

export const BodyMetricsModal: React.FC<BodyMetricsModalProps> = ({
  isOpen,
  onClose,
  metrics,
  history,
  onSaveMetric,
}) => {
  const [weight, setWeight] = useState(metrics.weight.toString());
  const [bodyFat, setBodyFat] = useState(metrics.bodyFat.toString());
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state whenever modal opens or metrics change
  useEffect(() => {
    if (isOpen) {
      setWeight(metrics.weight.toString());
      setBodyFat(metrics.bodyFat.toString());
      setAutoCalculate(true);
      setSavedSuccess(false);
    }
  }, [isOpen, metrics]);

  // When weight or autoCalculate changes, recompute estimated body fat
  const handleWeightChange = (val: string) => {
    setWeight(val);
    const parsedWeight = parseFloat(val);
    if (autoCalculate && !isNaN(parsedWeight) && parsedWeight > 0) {
      const currentBmi = calculateBmi(parsedWeight, metrics.height || 175);
      const estFat = calculateBodyFat(currentBmi, metrics.age || 22, metrics.gender || 'male');
      setBodyFat(estFat.toString());
    }
  };

  const handleToggleAutoCalc = () => {
    const nextAuto = !autoCalculate;
    setAutoCalculate(nextAuto);
    if (nextAuto) {
      const parsedWeight = parseFloat(weight);
      if (!isNaN(parsedWeight) && parsedWeight > 0) {
        const currentBmi = calculateBmi(parsedWeight, metrics.height || 175);
        const estFat = calculateBodyFat(currentBmi, metrics.age || 22, metrics.gender || 'male');
        setBodyFat(estFat.toString());
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const bf = parseFloat(bodyFat);
    if (!isNaN(w) && w > 0) {
      const finalBf = !isNaN(bf) && bf > 0 ? bf : metrics.bodyFat;
      onSaveMetric({
        date: new Date().toISOString().split('T')[0],
        weight: w,
        bodyFat: finalBf,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    }
  };

  const bmiCat = getBmiCategory(metrics.bmi);
  const fatCat = getBodyFatCategory(metrics.bodyFat, metrics.gender || 'male');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF5722] text-white shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Chỉ số cơ thể &amp; Tỷ lệ mỡ
                </h2>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                  {metrics.gender === 'female' ? 'Nữ' : 'Nam'} • {metrics.age || 22} tuổi
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi cân nặng, chỉ số BMI và tỷ lệ mỡ theo công thức Deurenberg
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Current Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Weight Card */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cân nặng</span>
                <Scale className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">
                  {metrics.weight} <span className="text-xs font-normal text-slate-400">kg</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1.5 tabular-nums">
                  <TrendingDown className="w-3 h-3 text-emerald-600" /> Tiến độ ổn định
                </div>
              </div>
            </div>

            {/* BMI Card */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Chỉ số BMI</span>
                <span className="text-[10px] font-bold text-slate-400">{metrics.height} cm</span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">
                  {metrics.bmi}
                </div>
                <div className={`text-[11px] font-bold px-2 py-0.5 rounded border inline-block mt-1.5 ${bmiCat.badgeClass}`}>
                  {bmiCat.label}
                </div>
              </div>
            </div>

            {/* Body Fat Card */}
            <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-200/70 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-950/80">Tỷ lệ mỡ</span>
                <Percent className="w-4 h-4 text-[#FF5722]" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#FF5722] tabular-nums">
                  {metrics.bodyFat} <span className="text-xs font-normal text-orange-950/60">%</span>
                </div>
                <div className="text-[11px] text-orange-900 font-bold bg-orange-100/70 px-2 py-0.5 rounded border border-orange-200/80 inline-block mt-1.5">
                  {fatCat.shortLabel} ({fatCat.range})
                </div>
              </div>
            </div>
          </div>

          {/* Quick Record Form */}
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FF5722]" />
                Ghi nhận chỉ số mới hôm nay
              </h3>

              <button
                type="button"
                onClick={handleToggleAutoCalc}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  autoCalculate
                    ? 'bg-orange-50 text-orange-900 border-orange-200'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                }`}
                title="Tự động tính tỷ lệ mỡ theo công thức Deurenberg dựa trên BMI và tuổi"
              >
                <Sparkles className="w-3 h-3 text-[#FF5722]" />
                <span>{autoCalculate ? 'Đang tự tính theo BMI & Tuổi' : 'Nhập mỡ thủ công'}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cân nặng (kg) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => handleWeightChange(e.target.value)}
                    className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                    placeholder="VD: 68.4"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Chiều cao cố định: {metrics.height || 175} cm
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Tỷ lệ mỡ (%)
                    </label>
                    {autoCalculate && (
                      <span className="text-[10px] font-medium text-orange-800 bg-orange-100/70 px-1.5 py-0.2 rounded">
                        Công thức Deurenberg
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    required
                    disabled={autoCalculate}
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold focus:outline-none ${
                      autoCalculate
                        ? 'bg-slate-100/90 text-slate-700 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]'
                    }`}
                    placeholder="VD: 15.2"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-slate-400" />
                    % Mỡ = 1.20 × BMI + 0.23 × Tuổi - 16.2
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savedSuccess}
                  className="w-full bg-[#FF5722] text-white py-2.5 px-4 rounded-xl font-black text-xs hover:bg-[#E64A19] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Đã ghi nhận chỉ số thành công!
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Lưu chỉ số mới
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* History Timeline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Lịch sử ghi nhận gần đây
              </h3>
              <span className="text-[11px] font-medium text-slate-400">
                {history.length} mốc số đo
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="p-3">Ngày đo</th>
                    <th className="p-3">Cân nặng</th>
                    <th className="p-3">BMI</th>
                    <th className="p-3">Tỷ lệ mỡ (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item, index) => {
                    const rowBmi = calculateBmi(item.weight, metrics.height || 175);
                    const rowFat = item.bodyFat || calculateBodyFat(rowBmi, metrics.age || 22, metrics.gender || 'male');
                    const rowFatCat = getBodyFatCategory(rowFat, metrics.gender || 'male');

                    return (
                      <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-semibold text-slate-700 tabular-nums">{item.date}</td>
                        <td className="p-3 font-bold text-slate-900 tabular-nums">
                          {item.weight} kg
                        </td>
                        <td className="p-3 font-medium text-slate-600 tabular-nums">
                          {rowBmi}
                        </td>
                        <td className="p-3 font-bold text-[#FF5722] tabular-nums">
                          <span className="inline-flex items-center gap-1.5">
                            {rowFat}%
                            <span className="text-[10px] font-normal text-slate-400">
                              ({rowFatCat.shortLabel})
                            </span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
