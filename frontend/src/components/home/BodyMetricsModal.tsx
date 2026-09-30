'use strict';
'use client';

import React, { useState } from 'react';
import { X, Activity, TrendingDown, Scale, Plus, CheckCircle2 } from 'lucide-react';
import { BodyMetricsData, MetricHistoryItem } from '@/lib/fitnessData';

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
  const [muscle, setMuscle] = useState(metrics.muscle.toString());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const bf = parseFloat(bodyFat);
    const m = parseFloat(muscle);
    if (!isNaN(w) && w > 0) {
      onSaveMetric({
        date: new Date().toISOString().split('T')[0],
        weight: w,
        bodyFat: !isNaN(bf) ? bf : metrics.bodyFat,
        muscle: !isNaN(m) ? m : metrics.muscle,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF5722] text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Chỉ Số Cơ Thể &amp; InBody
              </h2>
              <p className="text-xs text-slate-500">
                Nhật ký theo dõi cân nặng, tỷ lệ mỡ và khối lượng cơ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Current Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold">Cân nặng</span>
                <Scale className="w-3.5 h-3.5 text-[#FF5722]" />
              </div>
              <div className="text-xl font-black text-slate-900 tabular-nums">
                {metrics.weight} <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
                <TrendingDown className="w-3 h-3" /> -0.5 kg tuần này
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold">Khối lượng cơ</span>
                <span className="text-xs text-emerald-600 font-bold">KG</span>
              </div>
              <div className="text-xl font-black text-slate-900 tabular-nums">
                {metrics.muscle} <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
              <div className="text-[10px] text-orange-600 font-semibold mt-1">
                +0.4 kg tăng cơ
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold">BMI (Cao {metrics.height}cm)</span>
                <span className="text-xs text-slate-500 font-bold">BMI</span>
              </div>
              <div className="text-xl font-black text-slate-900 tabular-nums">{metrics.bmi}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                Mức cân đối
              </div>
            </div>
          </div>

          {/* Quick Record Form */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#FF5722]" />
              Ghi nhận chỉ số hôm nay
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Cân nặng (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Khối lượng cơ (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={muscle}
                  onChange={(e) => setMuscle(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-[#FF5722] text-white py-2 px-3 rounded-xl font-bold text-xs hover:bg-[#E64A19] transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Đã lưu!
                    </>
                  ) : (
                    'Lưu chỉ số'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* History Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Lịch sử đo gần đây
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="p-3">Ngày đo</th>
                    <th className="p-3">Cân nặng</th>
                    <th className="p-3">Khối lượng cơ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-700">{item.date}</td>
                      <td className="p-3 font-bold text-slate-900 tabular-nums">
                        {item.weight} kg
                      </td>
                      <td className="p-3 text-emerald-600 font-semibold tabular-nums">
                        {item.muscle} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
