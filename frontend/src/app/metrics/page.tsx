'use strict';
'use client';

import React, { useState, useMemo } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { initialFitnessData, MetricHistoryItem, ProgressPhotoItem } from '@/lib/fitnessData';
import {
  Scale,
  Plus,
  Camera,
  Activity,
  Pencil,
  Trash2,
  SlidersHorizontal,
  X,
  Percent,
  Calendar,
  ArrowRightLeft,
  LineChart,
  ClipboardList,
} from 'lucide-react';
import { BodyMetricsModal } from '@/components/home/BodyMetricsModal';
import { ProgressPhotoModal } from '@/components/home/ProgressPhotoModal';
import { useShell } from '@/components/layout/ShellLayout';
import {
  calculateBmi,
  calculateBodyFat,
  getBmiCategory,
  getBodyFatCategory,
} from '@/lib/bodyMetrics';

export default function MetricsPage() {
  const { toggleMobileNav } = useShell();
  const [data, setData] = useState(initialFitnessData);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [editingMetric, setEditingMetric] = useState<MetricHistoryItem | null>(null);
  const [editAutoCalc, setEditAutoCalc] = useState(true);
  const [chartView, setChartView] = useState<'weight' | 'bodyFat'>('weight');

  const userAge = data.user.age || 22;
  const userGender = data.user.gender || 'male';
  const userHeight = data.body.height || 175;

  // Add new metric
  const handleSaveMetric = (newMetric: MetricHistoryItem) => {
    const computedBmi = calculateBmi(newMetric.weight, userHeight);
    const computedFat =
      newMetric.bodyFat || calculateBodyFat(computedBmi, userAge, userGender);

    setData((prev) => ({
      ...prev,
      body: {
        ...prev.body,
        weight: newMetric.weight,
        bodyFat: computedFat,
        bmi: computedBmi,
      },
      recentMetrics: [
        {
          ...newMetric,
          bodyFat: computedFat,
        },
        ...prev.recentMetrics,
      ],
    }));
  };

  // Delete a single metric
  const handleDeleteMetric = (dateToDelete: string) => {
    setData((prev) => {
      const updatedMetrics = prev.recentMetrics.filter((m) => m.date !== dateToDelete);
      const latest = updatedMetrics[0] || {
        date: new Date().toISOString().split('T')[0],
        weight: prev.body.weight,
        bodyFat: prev.body.bodyFat,
      };
      const computedBmi = calculateBmi(latest.weight, userHeight);
      const computedFat =
        latest.bodyFat || calculateBodyFat(computedBmi, userAge, userGender);

      return {
        ...prev,
        body: {
          ...prev.body,
          weight: latest.weight,
          bodyFat: computedFat,
          bmi: computedBmi,
        },
        recentMetrics: updatedMetrics,
      };
    });
    setSelectedDates((prev) => prev.filter((d) => d !== dateToDelete));
  };

  // Bulk delete selected
  const handleDeleteSelected = () => {
    if (selectedDates.length === 0) return;
    setData((prev) => {
      const updatedMetrics = prev.recentMetrics.filter((m) => !selectedDates.includes(m.date));
      const latest = updatedMetrics[0] || {
        date: new Date().toISOString().split('T')[0],
        weight: prev.body.weight,
        bodyFat: prev.body.bodyFat,
      };
      const computedBmi = calculateBmi(latest.weight, userHeight);
      const computedFat =
        latest.bodyFat || calculateBodyFat(computedBmi, userAge, userGender);

      return {
        ...prev,
        body: {
          ...prev.body,
          weight: latest.weight,
          bodyFat: computedFat,
          bmi: computedBmi,
        },
        recentMetrics: updatedMetrics,
      };
    });
    setSelectedDates([]);
  };

  // Update existing metric
  const handleUpdateExistingMetric = (updated: MetricHistoryItem) => {
    const computedBmi = calculateBmi(updated.weight, userHeight);
    const finalFat = editAutoCalc
      ? calculateBodyFat(computedBmi, userAge, userGender)
      : updated.bodyFat;

    const normalizedItem: MetricHistoryItem = {
      ...updated,
      bodyFat: finalFat,
    };

    setData((prev) => {
      const updatedMetrics = prev.recentMetrics.map((m) =>
        m.date === updated.date ? normalizedItem : m
      );
      const latest = updatedMetrics[0] || prev.body;
      const latestBmi = calculateBmi(latest.weight, userHeight);
      const latestFat =
        latest.bodyFat || calculateBodyFat(latestBmi, userAge, userGender);

      return {
        ...prev,
        body: {
          ...prev.body,
          weight: latest.weight,
          bodyFat: latestFat,
          bmi: latestBmi,
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

  // Current classifications
  const currentBmi = calculateBmi(data.body.weight, userHeight);
  const currentBodyFat =
    data.body.bodyFat || calculateBodyFat(currentBmi, userAge, userGender);
  const bmiCat = getBmiCategory(currentBmi);
  const fatCat = getBodyFatCategory(currentBodyFat, userGender);

  // Overall deltas
  const historyOldestToNewest = useMemo(
    () => [...data.recentMetrics].reverse(),
    [data.recentMetrics]
  );

  const initialWeight = historyOldestToNewest[0]?.weight ?? data.body.weight;
  const initialFat =
    historyOldestToNewest[0]?.bodyFat ??
    calculateBodyFat(calculateBmi(initialWeight, userHeight), userAge, userGender);

  const totalWeightDelta = parseFloat((data.body.weight - initialWeight).toFixed(1));
  const totalFatDelta = parseFloat((currentBodyFat - initialFat).toFixed(1));

  // Gauge Positions for symmetric cards
  const weightGaugePercent = useMemo(() => {
    const minW = 50;
    const maxW = 85;
    const clamped = Math.max(minW, Math.min(maxW, data.body.weight));
    return Math.round(((clamped - minW) / (maxW - minW)) * 100);
  }, [data.body.weight]);

  const fatGaugePercent = useMemo(() => {
    const minF = 6;
    const maxF = 30;
    const clamped = Math.max(minF, Math.min(maxF, currentBodyFat));
    return Math.round(((clamped - minF) / (maxF - minF)) * 100);
  }, [currentBodyFat]);

  // Mini Sparkline for Weight Card
  const weightSparkline = useMemo(() => {
    const weights = historyOldestToNewest.map((d) => d.weight);
    if (weights.length < 2) return null;
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const range = Math.max(0.1, maxW - minW);
    const width = 56;
    const height = 18;
    const padY = 2;

    const points = weights.map((w, idx) => {
      const x = (idx / (weights.length - 1)) * width;
      const y = height - padY - ((w - minW) / range) * (height - padY * 2);
      return { x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(1)) };
    });

    return {
      pointsStr: points.map((p) => `${p.x},${p.y}`).join(' '),
      lastPoint: points[points.length - 1],
    };
  }, [historyOldestToNewest]);

  // Chart computation
  const svgWidth = 600;
  const svgHeight = 150;
  const chartPadLeft = 36;
  const chartPadRight = 36;
  const chartPadTop = 26;
  const chartPadBottom = 26;

  const chartSeries = useMemo(() => {
    return historyOldestToNewest.map((d) => {
      const b = calculateBmi(d.weight, userHeight);
      const f = d.bodyFat || calculateBodyFat(b, userAge, userGender);
      return {
        date: d.date,
        weight: d.weight,
        bodyFat: f,
        bmi: b,
      };
    });
  }, [historyOldestToNewest, userHeight, userAge, userGender]);

  const activeValues = useMemo(() => {
    return chartSeries.map((s) => (chartView === 'weight' ? s.weight : s.bodyFat));
  }, [chartSeries, chartView]);

  const minVal = activeValues.length > 0 ? Math.min(...activeValues) : 0;
  const maxVal = activeValues.length > 0 ? Math.max(...activeValues) : 100;
  const valMargin = Math.max(0.4, (maxVal - minVal) * 0.25);
  const chartMin = Math.max(0, parseFloat((minVal - valMargin).toFixed(1)));
  const chartMax = parseFloat((maxVal + valMargin).toFixed(1));

  const chartPoints = useMemo(() => {
    const usableW = svgWidth - chartPadLeft - chartPadRight;
    const usableH = svgHeight - chartPadTop - chartPadBottom;
    const denomVal = Math.max(0.1, chartMax - chartMin);

    return chartSeries.map((item, idx) => {
      const val = chartView === 'weight' ? item.weight : item.bodyFat;
      const x =
        chartSeries.length <= 1
          ? svgWidth / 2
          : chartPadLeft + (idx / (chartSeries.length - 1)) * usableW;
      const y = chartPadTop + usableH - ((val - chartMin) / denomVal) * usableH;
      return {
        x: parseFloat(x.toFixed(1)),
        y: parseFloat(y.toFixed(1)),
        val,
        ...item,
      };
    });
  }, [chartSeries, chartView, chartMin, chartMax]);

  const polylineStr = useMemo(
    () => chartPoints.map((p) => `${p.x},${p.y}`).join(' '),
    [chartPoints]
  );

  const areaPathStr = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const bottomY = svgHeight - chartPadBottom;
    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    return `M ${first.x},${bottomY} L ${polylineStr} L ${last.x},${bottomY} Z`;
  }, [chartPoints, polylineStr]);

  // Human-oriented status evaluation
  const activeDelta = chartView === 'weight' ? totalWeightDelta : totalFatDelta;
  const trendHumanLabel = useMemo(() => {
    if (chartView === 'weight') {
      if (activeDelta < 0) return 'Đang giảm đều';
      if (activeDelta === 0) return 'Ổn định';
      return 'Đang tăng cân';
    } else {
      if (activeDelta < 0) return 'Giảm mỡ tốt';
      if (activeDelta === 0) return 'Ổn định';
      return 'Cần điều chỉnh';
    }
  }, [chartView, activeDelta]);

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] min-h-screen">
      <TopBar
        user={data.user}
        streak={data.today.streak}
        photoCount={data.progressPhotos.length}
        onOpenBodyMetrics={() => setIsMetricsModalOpen(true)}
        onOpenProgressPhotos={() => setIsPhotosModalOpen(true)}
        onToggleMobileMenu={toggleMobileNav}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header (Clean, Minimal) */}
        <div className="pb-3 border-b border-slate-200/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FF5722] text-white rounded-xl shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Chỉ số cơ thể
            </h1>
          </div>
        </div>

        {/* 3 Vital Cards (Cân đối 100%, Đồng nhất chiều cao & Màu sắc) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Card 1: Cân nặng hiện tại */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-slate-500" />
                  Cân nặng hiện tại
                </span>
              </div>

              {/* Hero Value Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
                    {data.body.weight}
                  </span>
                  <span className="text-sm font-bold text-slate-400">kg</span>
                </div>

                {weightSparkline && (
                  <div className="flex items-center gap-1.5" title="Diễn biến cân nặng gần đây">
                    <svg width="56" height="18" className="overflow-visible select-none">
                      <polyline
                        fill="none"
                        stroke={totalWeightDelta <= 0 ? '#10B981' : '#0F172A'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={weightSparkline.pointsStr}
                      />
                      <circle
                        cx={weightSparkline.lastPoint.x}
                        cy={weightSparkline.lastPoint.y}
                        r="2.5"
                        fill={totalWeightDelta <= 0 ? '#10B981' : '#0F172A'}
                      />
                    </svg>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 tabular-nums">
                      {totalWeightDelta > 0 ? `+${totalWeightDelta}` : totalWeightDelta}kg
                    </span>
                  </div>
                )}
              </div>

              {/* Middle Range Bar: Phân vùng cân nặng tương thích */}
              <div className="mt-3.5 space-y-1.5">
                <div className="relative pt-1.5 pb-1">
                  <div className="grid grid-cols-4 gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
                    <div className="bg-amber-300 rounded-l" title="Dưới chuẩn (< 56.7kg)" />
                    <div className="col-span-2 bg-emerald-500" title="Cân đối chuẩn (56.7 – 76.3kg)" />
                    <div className="bg-orange-400 rounded-r" title="Thừa cân (> 76.3kg)" />
                  </div>

                  <div
                    className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                    style={{ left: `${weightGaugePercent}%` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs bg-emerald-600" />
                  </div>
                </div>

                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Dưới chuẩn</span>
                  <span className="text-emerald-700 font-extrabold">Cân đối chuẩn</span>
                  <span>Thừa cân</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Đo gần nhất:</span>
              <span className="font-bold text-slate-700 tabular-nums">
                {data.recentMetrics[0]?.date || 'Hôm nay'}
              </span>
            </div>
          </div>

          {/* Card 2: Chỉ số BMI */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-slate-500" />
                  Chỉ số BMI
                </span>
              </div>

              {/* Hero Value Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
                    {currentBmi}
                  </span>
                  <span className="text-sm font-bold text-slate-400">BMI</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${bmiCat.badgeClass}`}>
                  {bmiCat.label}
                </span>
              </div>

              {/* Middle Range Bar: Phân vùng BMI chuẩn */}
              <div className="mt-3.5 space-y-1.5">
                <div className="relative pt-1.5 pb-1">
                  <div className="grid grid-cols-4 gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
                    <div className="bg-amber-300 rounded-l" title="Thiếu cân (< 18.5)" />
                    <div className="bg-emerald-500" title="Cân đối chuẩn (18.5 - 24.9)" />
                    <div className="bg-orange-400" title="Thừa cân (25 - 29.9)" />
                    <div className="bg-rose-400 rounded-r" title="Béo phì (≥ 30)" />
                  </div>

                  <div
                    className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                    style={{ left: `${bmiCat.percentPosition}%` }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs"
                      style={{ backgroundColor: bmiCat.dotColor }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Thiếu cân</span>
                  <span className="text-emerald-700 font-extrabold">Cân đối</span>
                  <span>Thừa cân</span>
                  <span>Béo phì</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Khoảng cân chuẩn:</span>
              <span className="font-bold text-slate-700 tabular-nums">
                56.7 – 76.3 kg
              </span>
            </div>
          </div>

          {/* Card 3: Tỷ lệ mỡ (Đen đồng nhất, cân đối tuyệt đối) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                <span className="flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-slate-500" />
                  Tỷ lệ mỡ cơ thể
                </span>
              </div>

              {/* Hero Value Row: Số đen đồng nhất */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
                    {currentBodyFat}
                  </span>
                  <span className="text-sm font-bold text-slate-400">%</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-800 border-emerald-200/90">
                  {fatCat.shortLabel}
                </span>
              </div>

              {/* Middle Range Bar: Thang đo mỡ 4 mức đồng bộ */}
              <div className="mt-3.5 space-y-1.5">
                <div className="relative pt-1.5 pb-1">
                  <div className="grid grid-cols-4 gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
                    <div className="bg-sky-400 rounded-l" title="Vận động viên (< 14%)" />
                    <div className="bg-emerald-500" title="Săn chắc (14 - 17%)" />
                    <div className="bg-blue-400" title="Cân đối (18 - 24%)" />
                    <div className="bg-rose-400 rounded-r" title="Thừa mỡ (≥ 25%)" />
                  </div>

                  <div
                    className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                    style={{ left: `${fatGaugePercent}%` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs bg-emerald-600" />
                  </div>
                </div>

                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>VĐV</span>
                  <span className="text-emerald-700 font-extrabold">Săn chắc</span>
                  <span>Cân đối</span>
                  <span>Thừa mỡ</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Thay đổi:</span>
              <span className="font-bold text-emerald-700 tabular-nums">
                {totalFatDelta <= 0 ? `${totalFatDelta}%` : `+${totalFatDelta}%`} mỡ
              </span>
            </div>
          </div>
        </div>

        {/* Trend Chart (Icon đen trắng đầu tiêu đề & 3 Card thống kê gộp) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-slate-800" />
              <h2 className="font-black text-lg text-slate-900 tracking-tight">
                Biểu đồ tiến độ
              </h2>
            </div>

            {/* Segmented Switcher */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-100/90 p-1 rounded-xl flex items-center border border-slate-200/80 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartView('weight')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    chartView === 'weight'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Cân nặng (kg)
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('bodyFat')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    chartView === 'bodyFat'
                      ? 'bg-[#FF5722] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Tỷ lệ mỡ (%)
                </button>
              </div>
            </div>
          </div>

          {/* Stat Summary Highlights: Chỉ gồm 3 Card gọn gàng */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-1">
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Mốc ban đầu
              </span>
              <div className="text-base font-black text-slate-900 mt-0.5 tabular-nums">
                {chartView === 'weight' ? `${initialWeight} kg` : `${initialFat}%`}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Hiện tại
              </span>
              <div className="text-base font-black text-slate-900 mt-0.5 tabular-nums">
                {chartView === 'weight' ? `${data.body.weight} kg` : `${currentBodyFat}%`}
              </div>
            </div>

            {/* Gộp Sự thay đổi & Xu hướng vào 1 card duy nhất */}
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  So sánh thay đổi
                </span>
                <div
                  className={`text-base font-black mt-0.5 tabular-nums ${
                    activeDelta <= 0 ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {chartView === 'weight'
                    ? `${activeDelta > 0 ? `+${activeDelta}` : activeDelta} kg`
                    : `${activeDelta > 0 ? `+${activeDelta}` : activeDelta}%`}
                </div>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                  activeDelta <= 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90'
                    : 'bg-amber-50 text-amber-800 border-amber-200/90'
                }`}
              >
                {trendHumanLabel}
              </span>
            </div>
          </div>

          {/* Responsive SVG Chart */}
          <div className="w-full h-36 sm:h-44 relative pt-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible select-none"
            >
              <defs>
                <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F172A" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="fatAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5722" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#FF5722" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line
                x1={chartPadLeft}
                y1={chartPadTop}
                x2={svgWidth - chartPadRight}
                y2={chartPadTop}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <line
                x1={chartPadLeft}
                y1={svgHeight - chartPadBottom}
                x2={svgWidth - chartPadRight}
                y2={svgHeight - chartPadBottom}
                stroke="#CBD5E1"
                strokeWidth="1.2"
              />

              {areaPathStr && (
                <path
                  d={areaPathStr}
                  fill={chartView === 'weight' ? 'url(#weightAreaGrad)' : 'url(#fatAreaGrad)'}
                />
              )}

              <polyline
                fill="none"
                stroke={chartView === 'weight' ? '#0F172A' : '#FF5722'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />

              {chartPoints.map((pt, i) => {
                const isLatest = i === chartPoints.length - 1;
                const strokeColor = chartView === 'weight' ? '#0F172A' : '#FF5722';

                return (
                  <g key={`pt-${i}`}>
                    {isLatest && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={8}
                        fill={chartView === 'weight' ? '#0F172A' : '#FF5722'}
                        fillOpacity="0.18"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isLatest ? 4.5 : 3}
                      fill={isLatest ? strokeColor : '#FFFFFF'}
                      stroke={strokeColor}
                      strokeWidth="2"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      className="text-[10px] font-black select-none tabular-nums fill-slate-800"
                    >
                      {chartView === 'weight' ? `${pt.weight}kg` : `${pt.bodyFat}%`}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Dates Axis */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2 border-t border-slate-100 px-3 tabular-nums">
            {chartPoints.map((p, idx) => (
              <span key={`date-${idx}`} className="text-[11px]">
                {p.date}
              </span>
            ))}
          </div>
        </div>

        {/* Historical Log Table (Icon đen trắng & '5 bản' gọn gàng) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-slate-800" />
              <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight flex items-center gap-2">
                <span>Nhật ký chỉ số cơ thể</span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                  {data.recentMetrics.length} bản
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsManaging(!isManaging);
                  setSelectedDates([]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border flex items-center gap-1.5 cursor-pointer ${
                  isManaging
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isManaging ? 'Hoàn tất' : 'Quản lý & Xóa'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMetricsModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ghi số đo mới</span>
              </button>
            </div>
          </div>

          {/* Batch delete bar if items selected */}
          {isManaging && selectedDates.length > 0 && (
            <div className="bg-orange-50 border-b border-orange-200/90 px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="font-bold text-orange-950">
                Đã chọn {selectedDates.length} mốc số đo
              </span>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa các mục đã chọn</span>
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/90 text-slate-500 font-bold bg-slate-50/50">
                  {isManaging && (
                    <th className="p-3.5 w-10 text-center">
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
                  <th className="p-3.5">Ngày đo</th>
                  <th className="p-3.5">Cân nặng (kg)</th>
                  <th className="p-3.5">Chỉ số BMI</th>
                  <th className="p-3.5">Tỷ lệ mỡ (%)</th>
                  <th className="p-3.5">Phân loại thể trạng</th>
                  {isManaging && <th className="p-3.5 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentMetrics.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isManaging ? 6 : 5}
                      className="p-8 text-center text-slate-400 font-medium"
                    >
                      Chưa có dữ liệu số đo nào. Hãy bấm &quot;Ghi số đo mới&quot; để lưu kết quả đầu tiên.
                    </td>
                  </tr>
                ) : (
                  data.recentMetrics.map((m, idx) => {
                    const rowBmi = calculateBmi(m.weight, userHeight);
                    const rowBmiCat = getBmiCategory(rowBmi);
                    const rowFat =
                      m.bodyFat || calculateBodyFat(rowBmi, userAge, userGender);
                    const rowFatCat = getBodyFatCategory(rowFat, userGender);

                    const olderItem = data.recentMetrics[idx + 1];
                    const weightDiff = olderItem
                      ? parseFloat((m.weight - olderItem.weight).toFixed(1))
                      : null;

                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          selectedDates.includes(m.date)
                            ? 'bg-orange-50/50'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {isManaging && (
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={selectedDates.includes(m.date)}
                              onChange={() => toggleSelectDate(m.date)}
                              className="rounded border-slate-300 text-[#FF5722] focus:ring-[#FF5722] cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="p-3.5 font-bold text-slate-900 tabular-nums">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{m.date}</span>
                            {idx === 0 && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                Mới nhất
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 tabular-nums">
                          <span className="text-sm font-extrabold">{m.weight}</span>{' '}
                          <span className="text-slate-400 font-normal">kg</span>
                          {weightDiff !== null && (
                            <span
                              className={`ml-1.5 text-[10px] font-bold ${
                                weightDiff <= 0 ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              ({weightDiff > 0 ? `+${weightDiff}` : weightDiff})
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-medium text-slate-700 tabular-nums">
                          <span className="font-bold">{rowBmi}</span>{' '}
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ml-1 ${rowBmiCat.badgeClass}`}>
                            {rowBmiCat.label}
                          </span>
                        </td>
                        <td className="p-3.5 font-black text-slate-900 tabular-nums">
                          <span className="text-sm">{rowFat}%</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border text-[11px] ${rowFatCat.badgeClass}`}>
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: rowFatCat.accentColor }}
                            />
                            {rowFatCat.shortLabel} ({rowFatCat.range})
                          </span>
                        </td>
                        {isManaging && (
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMetric({ ...m, bodyFat: rowFat });
                                  setEditAutoCalc(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                title="Sửa số đo ngày này"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMetric(m.date)}
                                className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-100/60 transition-colors cursor-pointer"
                                title="Xóa số đo ngày này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dedicated Progress Photos Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-900 text-white rounded-xl shadow-xs">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                    Ảnh tiến độ vóc dáng
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {data.progressPhotos.length} ảnh
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPhotosModalOpen(true)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Xem so sánh Before / After</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPhotosModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm ảnh tiến độ</span>
              </button>
            </div>
          </div>

          {/* Grid of Progress Photos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.progressPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setIsPhotosModalOpen(true)}
                className="group relative rounded-xl border border-slate-200 bg-slate-50/80 p-3 hover:border-[#FF5722]/50 hover:bg-orange-50/30 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-4/3 rounded-lg bg-slate-200/80 flex flex-col items-center justify-center relative overflow-hidden mb-2.5">
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt={photo.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-[#FF5722] transition-colors">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold text-slate-500">
                        {photo.weight} kg
                      </span>
                    </div>
                  )}
                  <span className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {photo.date}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#FF5722] transition-colors">
                    {photo.label}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 tabular-nums">
                    <span className="font-semibold text-slate-700">{photo.weight} kg</span>
                    <span className="font-bold text-slate-900">{photo.bodyFat}% mỡ</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inline Modal: Chỉnh sửa số đo */}
        {editingMetric && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Chỉnh sửa số đo ({editingMetric.date})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cập nhật cân nặng và tỷ lệ mỡ cơ thể cho mốc đã chọn
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
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cân nặng (kg) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={editingMetric.weight}
                      onChange={(e) => {
                        const newW = parseFloat(e.target.value) || 0;
                        const newBmi = calculateBmi(newW, userHeight);
                        const newFat = editAutoCalc
                          ? calculateBodyFat(newBmi, userAge, userGender)
                          : editingMetric.bodyFat;
                        setEditingMetric({
                          ...editingMetric,
                          weight: newW,
                          bodyFat: newFat,
                        });
                      }}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/30 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Tỷ lệ mỡ (%)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const nextAuto = !editAutoCalc;
                          setEditAutoCalc(nextAuto);
                          if (nextAuto) {
                            const newBmi = calculateBmi(editingMetric.weight, userHeight);
                            setEditingMetric({
                              ...editingMetric,
                              bodyFat: calculateBodyFat(newBmi, userAge, userGender),
                            });
                          }
                        }}
                        className="text-[11px] font-bold text-orange-900 bg-orange-100/80 px-2 py-0.5 rounded cursor-pointer hover:bg-orange-200 transition-colors"
                      >
                        {editAutoCalc ? 'Đang tự tính theo BMI' : 'Chuyển sang tự tính'}
                      </button>
                    </div>

                    <input
                      type="number"
                      step="0.1"
                      required
                      disabled={editAutoCalc}
                      value={editingMetric.bodyFat}
                      onChange={(e) =>
                        setEditingMetric({
                          ...editingMetric,
                          bodyFat: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold outline-none ${
                        editAutoCalc
                          ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed'
                          : 'bg-white text-slate-900 border-slate-300 focus:border-[#FF5722]'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingMetric(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold transition-colors cursor-pointer"
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
