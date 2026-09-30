'use strict';
'use client';

import React from 'react';
import { WorkoutData } from '@/types/dashboard.types';
import { Dumbbell, CheckCircle2, HeartPulse, Flame } from 'lucide-react';
import Link from 'next/link';

interface WorkoutCardProps {
  workout?: WorkoutData;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout = {
    lastExercise: 'Chest & Triceps',
    muscleGroupIcon: 'chest',
    statGains: [
      { stat: 'STR', value: 2 },
      { stat: 'END', value: 1 },
    ],
    completedAt: '2026-09-27T07:15:00Z',
  },
}) => {
  const { lastExercise, muscleGroupIcon, statGains, completedAt } = workout;

  const renderMuscleIcon = (iconKey: string) => {
    switch (iconKey.toLowerCase()) {
      case 'chest':
      case 'arms':
      case 'shoulders':
      case 'back':
        return <Dumbbell className="w-4 h-4 text-[#FF5722]" />;
      case 'legs':
      case 'cardio':
        return <HeartPulse className="w-4 h-4 text-[#FF5722]" />;
      case 'core':
        return <Flame className="w-4 h-4 text-[#FF5722]" />;
      default:
        return <Dumbbell className="w-4 h-4 text-[#FF5722]" />;
    }
  };

  const formattedTime = (() => {
    try {
      const d = new Date(completedAt);
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      return `${hours}:${mins}`;
    } catch {
      return '';
    }
  })();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          {renderMuscleIcon(muscleGroupIcon)}
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">
            Buổi tập gần nhất
          </h3>
        </div>
        <Link
          href="/workout"
          className="text-xs font-semibold text-slate-500 hover:text-[#FF5722] transition-colors"
        >
          Lịch tuần
        </Link>
      </div>

      {/* Main Routine Info */}
      <div className="py-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xl font-black text-slate-900 tracking-tight truncate block">
            {lastExercise || 'Chưa ghi nhận'}
          </span>
          <span className="text-xs text-slate-400 font-medium shrink-0 tabular-nums">
            {formattedTime ? `Hôm nay, ${formattedTime}` : 'Đã hoàn thành'}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
            <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành 100%
          </span>
          <span className="text-xs text-slate-500 font-medium">
            3 bài • 10 sets
          </span>
        </div>
      </div>

      {/* Attribute Progression */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          Chỉ số cải thiện:
        </span>
        <div className="flex items-center gap-1.5">
          {statGains && statGains.length > 0 ? (
            statGains.map((gain, idx) => (
              <span
                key={`stat-gain-${idx}`}
                className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 tabular-nums"
              >
                +{gain.value} {gain.stat}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">Chưa có chỉ số</span>
          )}
        </div>
      </div>
    </div>
  );
};
