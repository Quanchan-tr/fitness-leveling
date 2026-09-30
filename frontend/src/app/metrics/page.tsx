'use strict';
'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { initialFitnessData, MetricHistoryItem, ProgressPhotoItem } from '@/lib/fitnessData';
import {
  Scale,
  TrendingDown,
  Plus,
  Camera,
  Activity,
  Pencil,
  Trash2,
  SlidersHorizontal,
  X,
  Check,
} from 'lucide-react';
import { BodyMetricsModal } from '@/components/home/BodyMetricsModal';
import { ProgressPhotoModal } from '@/components/home/ProgressPhotoModal';
import { useShell } from '@/components/layout/ShellLayout';

export default function MetricsPage() {
  const { toggleMobileNav } = useShell();
  const [data, setData] = useState(initialFitnessData);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [editingMetric, setEditingMetric] = useState<MetricHistoryItem | null>(null);

  const handleSaveMetric = (newMetric: MetricHistoryItem) => {
    setData((prev) => ({
      ...prev,
      body: {
        ...prev.body,
        weight: newMetric.weight,
        bodyFat: newMetric.bodyFat,
        muscle: newMetric.muscle,
        bmi: parseFloat((newMetric.weight / Math.pow(prev.body.height / 100, 2)).toFixed(1)),
      },
      recentMetrics: [newMetric, ...prev.recentMetrics],
    }));
  };

  const handleDeleteMetric = (dateToDelete: string) => {
    setData((prev) => {
      const updatedMetrics = prev.recentMetrics.filter((m) => m.date !== dateToDelete);
      const latest = updatedMetrics[0] || {
        date: new Date().toISOString().split('T')[0],
        weight: prev.body.weight,
        bodyFat: prev.body.bodyFat,
        muscle: prev.body.muscle,
      };
      return {
        ...prev,
        body: {
          ...prev.body,
          weight: latest.weight,
          bodyFat: latest.bodyFat,
          muscle: latest.muscle,
          bmi: parseFloat((latest.weight / Math.pow(prev.body.height / 100, 2)).toFixed(1)),
        },
        recentMetrics: updatedMetrics,
      };
    });
    setSelectedDates((prev) => prev.filter((d) => d !== dateToDelete));
  };

  const handleDeleteSelected = () => {
    if (selectedDates.length === 0) return;
    setData((prev) => {
      const updatedMetrics = prev.recentMetrics.filter((m) => !selectedDates.includes(m.date));
      const latest = updatedMetrics[0] || {
        date: new Date().toISOString().split('T')[0],
        weight: prev.body.weight,
        bodyFat: prev.body.bodyFat,
        muscle: prev.body.muscle,
      };
      return {
        ...prev,
        body: {
          ...prev.body,
          weight: latest.weight,
          bodyFat: latest.bodyFat,
          muscle: latest.muscle,
          bmi: parseFloat((latest.weight / Math.pow(prev.body.height / 100, 2)).toFixed(1)),
        },
        recentMetrics: updatedMetrics,
      };
    });
    setSelectedDates([]);
  };

  const handleUpdateExistingMetric = (updated: MetricHistoryItem) => {
    setData((prev) => {
      const updatedMetrics = prev.recentMetrics.map((m) =>
        m.date === updated.date ? updated : m
      );
      const latest = updatedMetrics[0] || prev.body;
      return {
        ...prev,
        body: {
          ...prev.body,
          weight: latest.weight,
          bodyFat: latest.bodyFat,
          muscle: latest.muscle,
          bmi: parseFloat((latest.weight / Math.pow(prev.body.height / 100, 2)).toFixed(1)),
        },
        recentMetrics: updatedMetrics,
      };
    });
    setEditingMetric(null);
  };

  const toggleSelectDate = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDates.length === data.recentMetrics.length) {
      setSelectedDates([]);
    } else {
      setSelectedDates(data.recentMetrics.map((m) => m.date));
    }
  };

  const handleAddPhoto = (photo: ProgressPhotoItem) => {
    setData((prev) => ({
      ...prev,
      progressPhotos: [photo, ...prev.progressPhotos],
    }));
  };

  const handleDeletePhoto = (id: string) => {
    setData((prev) => ({
      ...prev,
      progressPhotos: prev.progressPhotos.filter((p) => p.id !== id),
    }));
  };

  // Measurements data
  const circumferences = [
    { label: 'Vòng ngực (Chest)', value: '98 cm', delta: '+2.5 cm' },
    { label: 'Vòng eo (Waist)', value: '76 cm', delta: '-3.0 cm' },
    { label: 'Vòng mông (Hips)', value: '94 cm', delta: '+1.0 cm' },
    { label: 'Bắp tay (Arms)', value: '36.5 cm', delta: '+1.5 cm' },
    { label: 'Bắp đùi (Thighs)', value: '56 cm', delta: '+2.0 cm' },
    { label: 'Bắp chân (Calves)', value: '37 cm', delta: '+0.5 cm' },
  ];

  // SVG Trend Chart for Weight & Fat
  const history = [...data.recentMetrics].reverse();
  const weights = history.map((d) => d.weight);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights) + 0.5;
  const svgWidth = 600;
  const svgHeight = 120;

  const points = history.map((item, idx) => {
    const x = 20 + (idx / Math.max(1, history.length - 1)) * (svgWidth - 40);
    const y = svgHeight - 20 - ((item.weight - minW) / Math.max(0.1, maxW - minW)) * (svgHeight - 40);
    return { x, y, ...item };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      <TopBar
        user={data.user}
        streak={data.today.streak}
        photoCount={data.progressPhotos.length}
        onOpenBodyMetrics={() => setIsMetricsModalOpen(true)}
        onOpenProgressPhotos={() => setIsPhotosModalOpen(true)}
        onToggleMobileMenu={toggleMobileNav}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header (Information-first, bold and focused) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF5722]" />
              <span>Chỉ số cơ thể</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setIsPhotosModalOpen(true)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Camera className="w-4 h-4 text-slate-600" />
              <span>Ảnh tiến độ ({data.progressPhotos.length})</span>
            </button>
          </div>
        </div>

        {/* Current Overview Cards (3 Vitals - Number is the hero) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Cân nặng hiện tại</span>
              <Scale className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                {data.body.weight}{' '}
                <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1 mt-1.5 tabular-nums">
                <TrendingDown className="w-3 h-3" /> -0.8 kg so với tháng trước
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Chỉ số BMI (Cao {data.body.height} cm)</span>
              <span className="text-xs font-bold text-slate-400">BMI</span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                {data.body.bmi}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1.5">
                Cân đối chuẩn
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Khối lượng cơ bắp</span>
              <span className="text-xs font-bold text-slate-400">KG</span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                {data.body.muscle}{' '}
                <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1.5">
                +0.4 kg cơ bắp nạc
              </div>
            </div>
          </div>
        </div>

        {/* Visual Progress Trend Chart (No decorative gradient fill, clean stroke) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                Diễn biến cân nặng
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-600">
              Xu hướng: <strong className="text-emerald-700 font-bold">-0.8 kg</strong>
            </span>
          </div>

          {/* Responsive SVG Chart */}
          <div className="w-full h-32 sm:h-40 relative">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              <line
                x1="0"
                y1={svgHeight - 20}
                x2={svgWidth}
                y2={svgHeight - 20}
                stroke="#F1F5F9"
                strokeWidth="1"
              />
              <polyline
                fill="none"
                stroke="#0F172A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />
              {points.map((pt, i) => (
                <g key={`pt-${i}`}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={i === points.length - 1 ? 4 : 2.5}
                    fill={i === points.length - 1 ? '#FF5722' : '#FFFFFF'}
                    stroke={i === points.length - 1 ? '#FF5722' : '#0F172A'}
                    strokeWidth="2"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 8}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-700 select-none tabular-nums"
                  >
                    {pt.weight}kg
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Dates Axis */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2 border-t border-slate-100 px-2 tabular-nums">
            {points.map((p, idx) => (
              <span key={`date-${idx}`}>{p.date}</span>
            ))}
          </div>
        </div>

        {/* Body Circumferences Grid */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                Số đo chu vi các vòng
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Cập nhật 3 ngày trước</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {circumferences.map((c, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block truncate">
                  {c.label}
                </span>
                <div className="text-lg font-black text-slate-900 mt-1 tabular-nums">
                  {c.value}
                </div>
                <span
                  className={`text-[10px] font-semibold mt-0.5 inline-block tabular-nums ${
                    c.delta.startsWith('+') && !c.label.includes('Waist')
                      ? 'text-emerald-700'
                      : c.delta.startsWith('-') && c.label.includes('Waist')
                      ? 'text-emerald-700'
                      : 'text-slate-500'
                  }`}
                >
                  {c.delta} so với tháng trước
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Log Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
              Lịch sử ghi nhận chỉ số
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsManaging(!isManaging);
                  setSelectedDates([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border flex items-center gap-1.5 cursor-pointer ${
                  isManaging
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isManaging ? 'Hoàn tất' : 'Chỉnh sửa & Xóa'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMetricsModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ghi số đo mới</span>
              </button>
            </div>
          </div>

          {/* Batch delete bar if items selected */}
          {isManaging && selectedDates.length > 0 && (
            <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-orange-950">
                Đã chọn {selectedDates.length} mốc số đo
              </span>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa các mục đã chọn</span>
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  {isManaging && (
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          data.recentMetrics.length > 0 &&
                          selectedDates.length === data.recentMetrics.length
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-[#FF5722] focus:ring-[#FF5722] cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="p-3">Ngày đo</th>
                  <th className="p-3">Cân nặng (kg)</th>
                  <th className="p-3">Khối lượng cơ (kg)</th>
                  <th className="p-3">BMI</th>
                  {isManaging && <th className="p-3 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentMetrics.length === 0 ? (
                  <tr>
                    <td colSpan={isManaging ? 5 : 4} className="p-6 text-center text-slate-400">
                      Chưa có dữ liệu số đo nào. Hãy bấm &quot;Ghi số đo mới&quot; để lưu kết quả đầu tiên.
                    </td>
                  </tr>
                ) : (
                  data.recentMetrics.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      {isManaging && (
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedDates.includes(m.date)}
                            onChange={() => toggleSelectDate(m.date)}
                            className="rounded border-slate-300 text-[#FF5722] focus:ring-[#FF5722] cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="p-3 font-semibold text-slate-900 tabular-nums">{m.date}</td>
                      <td className="p-3 font-bold text-slate-900 tabular-nums">{m.weight} kg</td>
                      <td className="p-3 font-medium text-slate-700 tabular-nums">{m.muscle} kg</td>
                      <td className="p-3 font-medium text-slate-600 tabular-nums">
                        {(m.weight / Math.pow(data.body.height / 100, 2)).toFixed(1)}
                      </td>
                      {isManaging && (
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingMetric({ ...m })}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                              title="Sửa số đo ngày này"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMetric(m.date)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Xóa số đo ngày này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Inline Modal: Chỉnh sửa số đo */}
      {editingMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Chỉnh sửa số đo ({editingMetric.date})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cập nhật các chỉ số thực tế cho ngày đã ghi nhận
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMetric(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateExistingMetric(editingMetric);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingMetric.weight}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        weight: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:border-[#FF5722] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Khối lượng cơ (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingMetric.muscle}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        muscle: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:border-[#FF5722] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMetric(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Modals */}
      <BodyMetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
        metrics={data.body}
        history={data.recentMetrics}
        onSaveMetric={handleSaveMetric}
      />

      <ProgressPhotoModal
        isOpen={isPhotosModalOpen}
        onClose={() => setIsPhotosModalOpen(false)}
        photos={data.progressPhotos}
        onAddPhoto={handleAddPhoto}
        onDeletePhoto={handleDeletePhoto}
      />
    </main>
  );
}
