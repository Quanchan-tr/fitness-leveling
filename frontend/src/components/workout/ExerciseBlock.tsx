'use strict';
'use client';

import React, { useState } from 'react';
import { ExerciseBlockData, SetEntry } from '@/types/workout.types';
import { SetRow } from './SetRow';
import { RestTimer } from './RestTimer';
import { Dumbbell, Plus, Trash2, CheckCircle2, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface ExerciseBlockProps {
  exercise: ExerciseBlockData;
  exerciseIndex: number;
  onUpdateExercise: (updated: ExerciseBlockData) => void;
  onDeleteExercise: () => void;
}

export const ExerciseBlock: React.FC<ExerciseBlockProps> = ({
  exercise,
  exerciseIndex,
  onUpdateExercise,
  onDeleteExercise,
}) => {
  const [activeRestTimer, setActiveRestTimer] = useState<{
    setNumber: number;
  } | null>(null);
  const [showNotes, setShowNotes] = useState(Boolean(exercise.notes));

  const totalSets = exercise.sets.length;
  const completedSets = exercise.sets.filter((s) => s.isCompleted).length;
  const isAllCompleted = totalSets > 0 && completedSets === totalSets;

  const handleUpdateSet = (index: number, updatedSet: SetEntry) => {
    const newSets = [...exercise.sets];
    newSets[index] = updatedSet;
    onUpdateExercise({ ...exercise, sets: newSets });
  };

  const handleDeleteSet = (index: number) => {
    const newSets = exercise.sets
      .filter((_, i) => i !== index)
      .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    onUpdateExercise({ ...exercise, sets: newSets });
  };

  const handleToggleCompleteSet = (index: number) => {
    const targetSet = exercise.sets[index];
    const willComplete = !targetSet.isCompleted;

    const newSets = [...exercise.sets];
    newSets[index] = {
      ...targetSet,
      isCompleted: willComplete,
      actualWeightKg: targetSet.actualWeightKg !== null ? targetSet.actualWeightKg : targetSet.targetWeightKg,
      actualReps: targetSet.actualReps !== null ? targetSet.actualReps : targetSet.targetReps,
      completedAt: willComplete ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    };

    onUpdateExercise({ ...exercise, sets: newSets });

    // Trigger Rest Timer when completing a set
    if (willComplete) {
      setActiveRestTimer({ setNumber: targetSet.setNumber });
    } else {
      setActiveRestTimer(null);
    }
  };

  const handleAddSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: SetEntry = {
      id: `set-${Date.now()}-${exercise.sets.length + 1}`,
      setNumber: exercise.sets.length + 1,
      targetReps: lastSet ? lastSet.targetReps : 10,
      targetWeightKg: lastSet ? lastSet.targetWeightKg : 0,
      actualReps: null,
      actualWeightKg: null,
      rpe: null,
      isCompleted: false,
    };
    onUpdateExercise({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const getMuscleBadgeColor = (group: string) => {
    switch (group) {
      case 'Chest':
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#93C5FD]';
      case 'Back':
        return 'bg-[#F0FDF4] text-[#16A34A] border-[#86EFAC]';
      case 'Legs':
        return 'bg-[#FAF5FF] text-[#9333EA] border-[#D8B4FE]';
      case 'Shoulders':
        return 'bg-[#FFF7ED] text-[#EA580C] border-[#FDBA74]';
      case 'Arms':
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]';
      case 'Core':
        return 'bg-[#ECFEFF] text-[#0891B2] border-[#67E8F9]';
      default:
        return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
    }
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 shadow-sm p-4 ${
      isAllCompleted
        ? 'bg-white/95 border-[#22c55e]/40 shadow-emerald-500/5'
        : 'bg-white/90 border-[#B9A78E]/30 hover:border-[#B9A78E]/60'
    }`}>
      {/* Exercise Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#B9A78E]/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#B9A78E]/30 flex items-center justify-center text-[#FF6B35] font-black text-sm shadow-2xs">
            {exerciseIndex + 1}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-[#1F2328] tracking-tight">
                {exercise.name}
              </h3>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${getMuscleBadgeColor(exercise.muscleGroup)}`}>
                {exercise.muscleGroup}
              </span>
              <span className="text-[10px] font-bold text-[#76583E] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#B9A78E]/20">
                {exercise.category}
              </span>
            </div>
            {exercise.nameVi && (
              <p className="text-[11px] text-[#76583E] font-medium mt-0.5">
                {exercise.nameVi}
              </p>
            )}
          </div>
        </div>

        {/* Status indicator & Actions */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
            isAllCompleted
              ? 'bg-[#ECFDF5] text-[#10B981] border-[#10B981]/30'
              : 'bg-[#FAF8F5] text-[#76583E] border-[#B9A78E]/30'
          }`}>
            {completedSets}/{totalSets} Sets
          </span>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#76583E] transition-colors border border-[#B9A78E]/20"
            title="Ghi chú bài tập"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDeleteExercise}
            className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#FEE2E2] text-[#76583E] hover:text-[#EF4444] transition-colors border border-[#B9A78E]/20"
            title="Xóa bài tập này"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Optional Exercise Notes */}
      {showNotes && (
        <div className="my-2.5">
          <input
            type="text"
            placeholder="Thêm lưu ý bài tập (ví dụ: siết core, hãm lực 2s, vị trí chân...)"
            value={exercise.notes || ''}
            onChange={(e) => onUpdateExercise({ ...exercise, notes: e.target.value })}
            className="w-full bg-[#FAF8F5] text-xs font-medium text-[#1F2328] px-3 py-1.5 rounded-xl border border-[#B9A78E]/30 focus:outline-none focus:ring-1 focus:ring-[#FF6B35] placeholder:text-[#888888]"
          />
        </div>
      )}

      {/* Rest Timer (Triggered when user checks a set) */}
      {activeRestTimer && (
        <RestTimer
          exerciseName={exercise.name}
          setNumber={activeRestTimer.setNumber}
          onFinish={() => setActiveRestTimer(null)}
          onClose={() => setActiveRestTimer(null)}
        />
      )}

      {/* Set Rows Header */}
      <div
        className="grid items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#76583E] mt-2"
        style={{
          gridTemplateColumns: '32px minmax(70px, 1fr) minmax(130px, 1.4fr) 68px 38px',
        }}
      >
        <span className="text-center">Set</span>
        <span>Mục tiêu</span>
        <span>Thực tế</span>
        <span>Cường độ</span>
        <span className="text-center">Xong</span>
      </div>

      {/* Sets List */}
      <div className="space-y-1.5">
        {exercise.sets.map((set, setIndex) => (
          <SetRow
            key={set.id}
            set={set}
            onUpdate={(updated) => handleUpdateSet(setIndex, updated)}
            onDelete={exercise.sets.length > 1 ? () => handleDeleteSet(setIndex) : undefined}
            onToggleComplete={() => handleToggleCompleteSet(setIndex)}
          />
        ))}
      </div>

      {/* Add Set Button */}
      <div className="mt-3 flex justify-start">
        <button
          onClick={handleAddSet}
          className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF3EB] text-[#76583E] hover:text-[#FF6B35] border border-[#B9A78E]/30 hover:border-[#FF6B35]/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm Set</span>
        </button>
      </div>
    </div>
  );
};
