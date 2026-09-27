'use strict';
'use client';

import React from 'react';
import { WorkoutData } from '@/types/dashboard.types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Dumbbell, Sparkles, Trophy, Flame, HeartPulse, Zap } from 'lucide-react';

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

  // Muscle group icon mapping
  const renderMuscleIcon = (iconKey: string) => {
    switch (iconKey.toLowerCase()) {
      case 'chest':
      case 'arms':
      case 'shoulders':
      case 'back':
        return <Dumbbell className="w-5 h-5 text-[#FF6B35]" />;
      case 'legs':
      case 'cardio':
        return <HeartPulse className="w-5 h-5 text-[#FF6B35]" />;
      case 'core':
        return <Flame className="w-5 h-5 text-[#FF6B35]" />;
      default:
        return <Dumbbell className="w-5 h-5 text-[#FF6B35]" />;
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
    <GlassCard className="w-full flex flex-col justify-between p-3.5 sm:p-4 overflow-hidden shadow-rest hover:shadow-hover transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] border border-[#FF6B35]/30 flex items-center justify-center text-[#FF6B35]">
            <Dumbbell className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#1A1A1A]">Luyện Tập Gần Đây</h3>
        </div>
        {formattedTime && (
          <span className="text-[11px] font-medium text-[#888888]">
            Hôm nay {formattedTime}
          </span>
        )}
      </div>

      {/* Main Exercise Title & Icon */}
      <div className="flex items-center gap-3 my-1 bg-white/60 p-2.5 rounded-xl border border-stone-200/50">
        <div className="w-10 h-10 rounded-xl bg-[#FFF5ED] border border-[#FF6B35]/30 flex items-center justify-center shrink-0">
          {renderMuscleIcon(muscleGroupIcon)}
        </div>
        <div className="min-w-0">
          <span className="text-sm font-bold text-[#1A1A1A] block truncate">
            {lastExercise || 'Chưa có buổi tập gần đây'}
          </span>
          <span className="text-[10.5px] font-semibold text-[#22C55E] flex items-center gap-1">
            <Trophy className="w-3 h-3 text-[#F59E0B]" /> Hoàn thành mục tiêu
          </span>
        </div>
      </div>

      {/* Stat Gains Row */}
      <div className="border-t border-stone-200/60 pt-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#4A4A4A] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" /> Tăng chỉ số:
        </span>
        <div className="flex items-center gap-2">
          {statGains && statGains.length > 0 ? (
            statGains.map((gain, idx) => (
              <span
                key={`stat-gain-${idx}`}
                className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#22C55E] border border-[#A7F3D0]"
              >
                +{gain.value} {gain.stat}
              </span>
            ))
          ) : (
            <span className="text-[10.5px] text-[#888888]">Chưa có buổi tập gần đây</span>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
