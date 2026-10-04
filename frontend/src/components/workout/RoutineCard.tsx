'use strict';
'use client';

import React, { useState } from 'react';
import { RoutineItem } from '@/types/fittrack.types';
import {
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  GripVertical,
  Dumbbell,
  Clock,
  Play,
} from 'lucide-react';

interface RoutineCardProps {
  routine: RoutineItem;
  onSelect: (routine: RoutineItem) => void;
  onEdit: (routine: RoutineItem) => void;
  onDelete: (routineId: string) => void;
  onDuplicate: (routineId: string) => void;
  onStartLive?: (routine: RoutineItem) => void;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({
  routine,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onStartLive,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const totalSets = routine.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', routine.id);
    e.dataTransfer.setData('application/fittrack-routine', routine.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-all hover:border-slate-300 relative flex flex-col justify-between group cursor-grab active:cursor-grabbing select-none"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <div className="text-slate-300 group-hover:text-slate-500 transition-colors pt-0.5">
              <GripVertical className="w-4 h-4" />
            </div>
            <div>
              <h3
                onClick={() => onSelect(routine)}
                className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#FF5722] transition-colors cursor-pointer line-clamp-1"
                title={routine.title}
              >
                {routine.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {routine.exercises.length} bài tập • {totalSets} sets
              </p>
            </div>
          </div>

          {/* Three-dot dropdown menu */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Tùy chọn routine"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                />
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-40 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onEdit(routine);
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sửa</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onDuplicate(routine.id);
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Nhân bản</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onDelete(routine.id);
                    }}
                    className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium border-t border-slate-100"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Xóa</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Exercises Preview Pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {routine.exercises.slice(0, 3).map((item, idx) => (
            <span
              key={`pill-${idx}`}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 truncate max-w-[180px]"
            >
              {item.exercise.name}
            </span>
          ))}
          {routine.exercises.length > 3 && (
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
              +{routine.exercises.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer info & CTA */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Nghỉ {routine.restTimerSeconds}s
        </span>

        <div className="flex items-center gap-2">
          {onStartLive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartLive(routine);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Tập ngay</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onSelect(routine)}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};
