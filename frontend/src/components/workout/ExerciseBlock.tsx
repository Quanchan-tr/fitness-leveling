'use strict';
'use client';

import React, { useState } from 'react';
import { ExerciseBlockData, SetEntry } from '@/types/workout.types';
import { SetRow } from './SetRow';
import { RestTimer } from './RestTimer';
import { Trash2, FileText } from 'lucide-react';

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
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Back':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Legs':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Shoulders':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Arms':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Core':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all p-4 ${
        isAllCompleted
          ? 'bg-white border-emerald-300'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Exercise Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[#FF5722] font-black text-sm tabular-nums">
            {exerciseIndex + 1}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {exercise.name}
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getMuscleBadgeColor(
                  exercise.muscleGroup
                )}`}
              >
                {exercise.muscleGroup}
              </span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {exercise.category}
              </span>
            </div>
            {exercise.nameVi && (
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {exercise.nameVi}
              </p>
            )}
          </div>
        </div>

        {/* Status indicator & Actions */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded border tabular-nums ${
              isAllCompleted
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            {completedSets}/{totalSets} Sets
          </span>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200 cursor-pointer"
            title="Ghi chú bài tập"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDeleteExercise}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors border border-slate-200 cursor-pointer"
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
            className="w-full bg-slate-50 text-xs font-medium text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5722] placeholder:text-slate-400"
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
        className="grid items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2"
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
      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
        <button
          onClick={handleAddSet}
          className="text-xs font-semibold text-[#FF5722] hover:text-[#E64A19] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>+ Thêm Set</span>
        </button>
      </div>
    </div>
  );
};
