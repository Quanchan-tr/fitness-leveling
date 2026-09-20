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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F7F3EA] w-full max-w-2xl rounded-2xl border border-[#B9A78E]/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#E8E1D5] border-b border-[#B9A78E]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF6B35] text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F2328]">Body Metrics & Progress</h2>
              <p className="text-xs text-[#76583E]">Interactive Wall Note Log</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#76583E] hover:bg-[#F7F3EA] hover:text-[#1F2328] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Current Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-[#B9A78E]/30 shadow-sm">
              <div className="flex items-center justify-between text-[#76583E] mb-1">
                <span className="text-xs font-semibold">Weight</span>
                <Scale className="w-3.5 h-3.5 text-[#FF6B35]" />
              </div>
              <div className="text-xl font-bold text-[#1F2328]">{metrics.weight} <span className="text-xs font-normal text-[#76583E]">kg</span></div>
              <div className="text-[10px] text-[#7FB069] font-medium flex items-center gap-0.5 mt-1">
                <TrendingDown className="w-3 h-3" /> -0.5 kg this week
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#B9A78E]/30 shadow-sm">
              <div className="flex items-center justify-between text-[#76583E] mb-1">
                <span className="text-xs font-semibold">Body Fat</span>
                <span className="text-xs text-[#4D96FF] font-bold">%</span>
              </div>
              <div className="text-xl font-bold text-[#1F2328]">{metrics.bodyFat} <span className="text-xs font-normal text-[#76583E]">%</span></div>
              <div className="text-[10px] text-[#7FB069] font-medium mt-1">Lean Athletic</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#B9A78E]/30 shadow-sm">
              <div className="flex items-center justify-between text-[#76583E] mb-1">
                <span className="text-xs font-semibold">Muscle Mass</span>
                <span className="text-xs text-[#7FB069] font-bold">KG</span>
              </div>
              <div className="text-xl font-bold text-[#1F2328]">{metrics.muscle} <span className="text-xs font-normal text-[#76583E]">kg</span></div>
              <div className="text-[10px] text-[#FF6B35] font-medium mt-1">+0.4 kg lean gain</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#B9A78E]/30 shadow-sm">
              <div className="flex items-center justify-between text-[#76583E] mb-1">
                <span className="text-xs font-semibold">BMI / Height</span>
                <span className="text-xs text-[#76583E] font-bold">{metrics.height}cm</span>
              </div>
              <div className="text-xl font-bold text-[#1F2328]">{metrics.bmi}</div>
              <div className="text-[10px] text-[#7FB069] font-medium mt-1">Normal Range</div>
            </div>
          </div>

          {/* Quick Record Form */}
          <div className="bg-[#E8E1D5]/60 p-4 rounded-xl border border-[#B9A78E]/40">
            <h3 className="text-sm font-bold text-[#1F2328] mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#FF6B35]" />
              Record Today's Measurements
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#76583E] mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-lg border border-[#B9A78E]/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#76583E] mb-1">Body Fat (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-lg border border-[#B9A78E]/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#76583E] mb-1">Muscle (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={muscle}
                  onChange={(e) => setMuscle(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-lg border border-[#B9A78E]/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-[#FF6B35] text-white py-2 rounded-lg font-bold text-xs hover:bg-[#FF6B35]/90 transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    'Save Log'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* History Timeline */}
          <div>
            <h3 className="text-sm font-bold text-[#1F2328] mb-2">Recent Measurement Log</h3>
            <div className="bg-white rounded-xl border border-[#B9A78E]/30 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#E8E1D5]/40 border-b border-[#B9A78E]/20 text-[#76583E] font-semibold">
                    <th className="p-3">Date</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Body Fat</th>
                    <th className="p-3">Muscle Mass</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B9A78E]/20">
                  {history.map((item, index) => (
                    <tr key={index} className="hover:bg-[#F7F3EA] transition-colors">
                      <td className="p-3 font-medium text-[#1F2328]">{item.date}</td>
                      <td className="p-3 font-bold text-[#1F2328]">{item.weight} kg</td>
                      <td className="p-3 text-[#4D96FF] font-semibold">{item.bodyFat}%</td>
                      <td className="p-3 text-[#7FB069] font-semibold">{item.muscle} kg</td>
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
