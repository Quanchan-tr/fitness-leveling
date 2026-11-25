'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  Camera,
  Dumbbell,
  RefreshCw,
  ShieldAlert,
  Users,
} from 'lucide-react';
import {
  adminApi,
  type AdminRecentError,
  type AdminStatsData,
  type AdminStatsRange,
  type AdminStatsSeriesPoint,
} from '@/lib/adminApi';

type ChartMetricKey = 'workouts' | 'new_users' | 'ai_plan_uses' | 'ai_pose_uses';

const RANGE_OPTIONS: Array<{ value: AdminStatsRange; label: string }> = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '90d', label: '90 ngày' },
];

const CHART_METRICS: Array<{ key: ChartMetricKey; label: string }> = [
  { key: 'workouts', label: 'Buổi tập' },
  { key: 'new_users', label: 'Users mới' },
  { key: 'ai_plan_uses', label: 'AI Đề xuất' },
  { key: 'ai_pose_uses', label: 'AI Pose' },
];

function formatNumber(n: number): string {
  return n.toLocaleString('vi-VN');
}

function formatErrorTimestamp(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} ${hh}:${min}`;
}

export default function AdminStatsPage() {
  const [range, setRange] = useState<AdminStatsRange>('30d');
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<ChartMetricKey>('workouts');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const loadStats = useCallback(async (selectedRange: AdminStatsRange) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getStats(selectedRange);
      setStats(res.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể tải dữ liệu thống kê từ máy chủ.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats(range);
  }, [range, loadStats]);

  const series = useMemo(() => stats?.series ?? [], [stats]);
  const maxSeriesVal = useMemo(() => {
    if (series.length === 0) return 1;
    return Math.max(1, ...series.map((p) => p[chartMetric]));
  }, [series, chartMetric]);

  const maxExerciseSets = useMemo(() => {
    const list = stats?.top_exercises ?? [];
    if (list.length === 0) return 1;
    return Math.max(1, ...list.map((e) => e.sets_count));
  }, [stats]);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-[#E5E7EB] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-44 bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl animate-pulse" />
          <div className="h-44 bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-8 text-center max-w-lg mx-auto my-8">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#111111]">Không thể tải thống kê hệ thống</h2>
        <p className="text-sm text-[#6B7280] mt-1">{error}</p>
        <button
          type="button"
          onClick={() => loadStats(range)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Thử lại</span>
        </button>
      </div>
    );
  }

  const kpis = stats!.kpis;
  const aiPlan = stats!.ai_exercise_plan;
  const aiPose = stats!.ai_pose;
  const recentErrors: AdminRecentError[] = (stats!.recent_errors ?? []).slice(0, 4);
  const pendingTotal = kpis.pending_exercises_count + kpis.pending_reports_count;

  const activePoint: AdminStatsSeriesPoint | null =
    hoveredIdx !== null && series[hoveredIdx] ? series[hoveredIdx] : null;

  return (
    <div className="space-y-8">
      {/* Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#111111] tracking-tight">
          Tổng quan Hệ thống
        </h2>

        <div className="flex items-center gap-2">
          <div className="inline-flex bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg p-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRange(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  range === opt.value
                    ? 'bg-[#2563EB] text-white'
                    : 'text-[#6B7280] hover:text-[#111111]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => loadStats(range)}
            disabled={loading}
            className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] text-[#6B7280] hover:text-[#2563EB] hover:border-[#2563EB] transition-colors cursor-pointer disabled:opacity-50"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Section 1: 4 Core KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
              Người dùng
            </span>
            <Users className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="mt-2 text-3xl font-bold text-[#111111] tabular-nums">
            {formatNumber(kpis.total_users)}
          </div>
          <div className="mt-2 text-xs text-[#6B7280] flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-[#10B981]">+{formatNumber(kpis.new_users)} mới</span>
            <span>•</span>
            <span>{formatNumber(kpis.active_users)} hoạt động</span>
            {kpis.banned_users > 0 && (
              <>
                <span>•</span>
                <span className="text-rose-600 font-medium">{kpis.banned_users} bị khóa</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
              Buổi tập &amp; Ăn uống
            </span>
            <Activity className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="mt-2 text-3xl font-bold text-[#111111] tabular-nums">
            {formatNumber(kpis.workouts_in_range)}
          </div>
          <div className="mt-2 text-xs text-[#6B7280]">
            Tổng <span className="font-semibold text-[#111111]">{formatNumber(kpis.total_workouts)}</span> buổi tập •{' '}
            <span className="font-semibold text-[#111111]">{formatNumber(kpis.nutrition_logs_in_range)}</span> bữa ăn
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
              Kho Dữ liệu
            </span>
            <Dumbbell className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="mt-2 text-3xl font-bold text-[#111111] tabular-nums">
            {formatNumber(kpis.total_exercises)}
          </div>
          <div className="mt-2 text-xs text-[#6B7280]">
            Bài tập hoạt động • <span className="font-semibold text-[#111111]">{formatNumber(kpis.total_foods)}</span> món ăn •{' '}
            <span className="font-semibold text-[#111111]">{formatNumber(kpis.community_posts_in_range)}</span> bài đăng
          </div>
        </div>

        <Link
          href="/admin/exercises"
          className="bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#2563EB] rounded-2xl p-5 transition-colors block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
              Chờ kiểm duyệt
            </span>
            <ShieldAlert className={`w-4 h-4 ${pendingTotal > 0 ? 'text-amber-600' : 'text-[#10B981]'}`} />
          </div>
          <div className="mt-2 text-3xl font-bold text-[#111111] tabular-nums">
            {formatNumber(pendingTotal)}
          </div>
          <div className="mt-2 text-xs text-[#6B7280] flex items-center justify-between">
            <span>
              {kpis.pending_exercises_count} bài tập • {kpis.pending_reports_count} báo cáo
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#2563EB]">
              <span>Xử lý</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      </section>

      {/* Section 2: AI Telemetry Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Exercise Plan */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">
                AI Đề xuất bài tập
              </h3>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] px-2 py-1 rounded bg-[#EFF6FF] text-[#2563EB]">
              Kỳ {range}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                Số lần dùng
              </div>
              <div className="mt-1 text-2xl font-bold text-[#111111] tabular-nums">
                {formatNumber(aiPlan.total_uses)}
              </div>
              <div className="mt-1 text-xs text-[#6B7280] tabular-nums">
                Tổng: {formatNumber(aiPlan.all_time_uses)}
              </div>
              <div className="mt-1 text-[11px] text-[#6B7280] tabular-nums">
                LLM: <span className="font-semibold text-[#10B981]">{aiPlan.llm_calls}</span> • Fallback: {aiPlan.fallback_calls}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                Token đã dùng
              </div>
              <div className="mt-1 text-2xl font-bold text-[#111111] tabular-nums">
                {formatNumber(aiPlan.total_tokens)}
              </div>
              <div className="mt-1 text-xs text-[#6B7280] tabular-nums">
                Tổng: {formatNumber(aiPlan.all_time_tokens)}
              </div>
              <div className="mt-1 text-[11px] text-[#6B7280] tabular-nums">
                In: {formatNumber(aiPlan.prompt_tokens)} • Out: {formatNumber(aiPlan.completion_tokens)}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                Phản hồi TB
              </div>
              <div className="mt-1 text-2xl font-bold text-[#111111] tabular-nums">
                {formatNumber(aiPlan.avg_llm_latency_ms)} ms
              </div>
              <div className="mt-1 text-xs text-[#6B7280] tabular-nums">
                API chính
              </div>
              <div className="mt-1 text-[11px] text-[#6B7280] tabular-nums">
                Trung bình chung: {formatNumber(aiPlan.avg_latency_ms)} ms
              </div>
            </div>
          </div>
        </div>

        {/* AI Pose */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">
                AI Pose Check
              </h3>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] px-2 py-1 rounded bg-[#EFF6FF] text-[#2563EB]">
              Kỳ {range}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                Số lần dùng
              </div>
              <div className="mt-1 text-2xl font-bold text-[#111111] tabular-nums">
                {formatNumber(aiPose.total_uses)}
              </div>
              <div className="mt-1 text-xs text-[#6B7280] tabular-nums">
                Tổng: {formatNumber(aiPose.all_time_uses)}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                Phân loại luồng
              </div>
              <div className="mt-1 text-sm font-bold text-[#111111] tabular-nums">
                Upload: {formatNumber(aiPose.video_upload_uses)}
              </div>
              <div className="mt-1 text-sm font-semibold text-[#2563EB] tabular-nums">
                Realtime: {formatNumber(aiPose.realtime_uses)}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                Trạng thái &amp; Điểm
              </div>
              <div className="mt-1 text-2xl font-bold text-[#10B981] tabular-nums">
                {aiPose.avg_score}/100
              </div>
              <div className="mt-1 text-[11px] text-[#6B7280] tabular-nums">
                Xong: {aiPose.completed_uses} • Lỗi: {aiPose.failed_uses}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Recent AI / Pose Error Log */}
      <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <h3 className="text-sm font-bold text-[#111111]">Sự cố gần nhất</h3>
          </div>
          {recentErrors.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 tabular-nums">
              {recentErrors.length} mục
            </span>
          )}
        </div>

        {recentErrors.length === 0 ? (
          <div className="text-xs text-[#6B7280] py-1">
            Không ghi nhận lỗi trong kỳ này.
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {recentErrors.map((err) => {
              const isPose = err.source === 'pose_worker';
              return (
                <div
                  key={`${err.source}-${err.id}`}
                  className="py-2 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                        isPose
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {isPose ? 'pose-worker' : 'LLM API'}
                    </span>
                    {err.code && (
                      <code className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#F8FAFC] border border-[#E5E7EB] text-[#111111] shrink-0">
                        {err.code}
                      </code>
                    )}
                    <span className="text-[#111111] truncate" title={err.reason}>
                      {err.reason}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6B7280] tabular-nums shrink-0">
                    {formatErrorTimestamp(err.occurred_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 3: Pure SVG Growth Chart + Top 5 Popular Exercises */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Xu hướng hoạt động</h3>
              <p className="text-xs text-[#6B7280] mt-0.5 tabular-nums">
                {activePoint
                  ? `${activePoint.label} (${activePoint.date}): ${activePoint[chartMetric]} lượt`
                  : 'Di chuột lên cột để xem chi tiết từng mốc thời gian'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CHART_METRICS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setChartMetric(m.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    chartMetric === m.key
                      ? 'bg-[#EFF6FF] text-[#2563EB]'
                      : 'text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111111]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {series.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-[#6B7280]">
              Chưa có dữ liệu chuỗi thời gian.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <svg
                viewBox="0 0 640 220"
                className="w-full h-56 select-none"
                role="img"
                aria-label="Biểu đồ xu hướng hoạt động"
              >
                {/* Horizontal subtle reference lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = 180 - ratio * 150;
                  return (
                    <line
                      key={idx}
                      x1="20"
                      y1={y}
                      x2="624"
                      y2={y}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                      strokeDasharray={ratio === 0 ? undefined : '3 3'}
                    />
                  );
                })}

                {series.map((point, idx) => {
                  const plotWidth = 600;
                  const slotW = plotWidth / series.length;
                  const barW = Math.min(28, Math.max(6, slotW * 0.55));
                  const val = point[chartMetric];
                  const barH = Math.max(val > 0 ? 4 : 2, (val / maxSeriesVal) * 150);
                  const x = 22 + idx * slotW + (slotW - barW) / 2;
                  const y = 180 - barH;
                  const showLabel =
                    series.length <= 14 ||
                    idx === 0 ||
                    idx === series.length - 1 ||
                    idx % Math.ceil(series.length / 7) === 0;

                  const isHovered = hoveredIdx === idx;

                  return (
                    <g
                      key={point.date}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={x}
                        y={y}
                        width={barW}
                        height={barH}
                        rx={Math.min(4, barW / 2)}
                        fill={val === 0 ? '#E5E7EB' : isHovered ? '#1D4ED8' : '#2563EB'}
                      />
                      {showLabel && (
                        <text
                          x={x + barW / 2}
                          y={202}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#6B7280"
                        >
                          {point.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Top 5 Popular Exercises */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6">
          <h3 className="text-base font-bold text-[#111111] mb-4">Top 5 Bài tập phổ biến</h3>

          {stats!.top_exercises.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#6B7280]">
              Chưa có hiệp tập nào trong kỳ này.
            </div>
          ) : (
            <div className="space-y-4">
              {stats!.top_exercises.map((ex, idx) => {
                const pct = Math.round((ex.sets_count / maxExerciseSets) * 100);
                return (
                  <div key={ex.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] text-[#111111] font-bold flex items-center justify-center shrink-0 tabular-nums">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-[#111111] truncate">
                          {ex.name}
                        </span>
                      </div>
                      <span className="font-bold text-[#2563EB] shrink-0 tabular-nums">
                        {formatNumber(ex.sets_count)} sets
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2563EB] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {ex.muscle_group && (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.05em] px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] shrink-0">
                          {ex.muscle_group}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
