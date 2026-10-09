'use strict';
'use client';

import React, { useState } from 'react';
import {
  RoutineItem,
  RoutineExerciseItem,
  Exercise,
  ExerciseSet,
  RoutineFolder,
  EquipmentType,
} from '@/types/fitnessleveling.types';
import { useFitness } from '@/contexts/FitnessContext';
import { MuscleHeatmapSvg } from './MuscleHeatmapSvg';
import { MuscleDetailModal } from './MuscleDetailModal';
import { CustomExerciseModal } from './CustomExerciseModal';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  Search,
  Dumbbell,
  Check,
  Save,
  Folder,
  SlidersHorizontal,
  Info,
} from 'lucide-react';

interface RoutineEditorProps {
  initialRoutine?: RoutineItem;
  initialFolderId?: string;
  onSave: (routineData: Omit<RoutineItem, 'id' | 'createdBy'>) => void;
  onCancel: () => void;
}

// 15s increment rest timer options up to 300s (5 minutes)
const REST_TIMER_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) * 15);

export const RoutineEditor: React.FC<RoutineEditorProps> = ({
  initialRoutine,
  initialFolderId,
  onSave,
  onCancel,
}) => {
  const { exercises, addCustomExercise, folders } = useFitness();

  const [title, setTitle] = useState(initialRoutine?.title || '');
  const [folderId, setFolderId] = useState<string | undefined>(
    initialRoutine?.folderId || initialFolderId || (folders.length > 0 ? folders[0].id : undefined)
  );
  const [notes, setNotes] = useState(initialRoutine?.notes || '');
  const [routineRestTimer, setRoutineRestTimer] = useState<number>(
    initialRoutine?.restTimerSeconds || 60
  );
  const [routineExercises, setRoutineExercises] = useState<RoutineExerciseItem[]>(
    initialRoutine?.exercises || []
  );

  // Filter state for right column exercise library
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');

  // Modals
  const [isCustomExerciseModalOpen, setIsCustomExerciseModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Custom rest timer active input map
  const [customRestMap, setCustomRestMap] = useState<Record<number, boolean>>({});

  // Add exercise from library into routine
  const handleAddExerciseToRoutine = (ex: Exercise) => {
    const initialSets: ExerciseSet[] = [
      {
        setNumber: 1,
        weightKg: ex.type === 'weight_reps' ? 20 : undefined,
        reps: ex.type === 'weight_reps' || ex.type === 'bodyweight_reps' ? 10 : undefined,
        durationSeconds: ex.type === 'duration' ? 45 : ex.type === 'distance_duration' ? 1800 : undefined,
        distanceKm: ex.type === 'distance_duration' ? 5.0 : undefined,
        isCompleted: false,
      },
      {
        setNumber: 2,
        weightKg: ex.type === 'weight_reps' ? 20 : undefined,
        reps: ex.type === 'weight_reps' || ex.type === 'bodyweight_reps' ? 10 : undefined,
        durationSeconds: ex.type === 'duration' ? 45 : ex.type === 'distance_duration' ? 1800 : undefined,
        distanceKm: ex.type === 'distance_duration' ? 5.0 : undefined,
        isCompleted: false,
      },
      {
        setNumber: 3,
        weightKg: ex.type === 'weight_reps' ? 20 : undefined,
        reps: ex.type === 'weight_reps' || ex.type === 'bodyweight_reps' ? 10 : undefined,
        durationSeconds: ex.type === 'duration' ? 45 : ex.type === 'distance_duration' ? 1800 : undefined,
        distanceKm: ex.type === 'distance_duration' ? 5.0 : undefined,
        isCompleted: false,
      },
    ];

    const newItem: RoutineExerciseItem = {
      exercise: ex,
      sets: initialSets,
      restTimerSeconds: routineRestTimer,
      pinnedNote: '',
    };

    setRoutineExercises((prev) => [...prev, newItem]);
  };

  const handleRemoveExercise = (idx: number) => {
    setRoutineExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddSet = (exerciseIdx: number) => {
    setRoutineExercises((prev) => {
      const copy = [...prev];
      const exItem = { ...copy[exerciseIdx] };
      const lastSet = exItem.sets[exItem.sets.length - 1];

      const newSet: ExerciseSet = {
        setNumber: exItem.sets.length + 1,
        weightKg: lastSet?.weightKg ?? (exItem.exercise.type === 'weight_reps' ? 20 : undefined),
        reps: lastSet?.reps ?? 10,
        durationSeconds: lastSet?.durationSeconds ?? 45,
        distanceKm: lastSet?.distanceKm ?? 1.0,
        isCompleted: false,
      };

      exItem.sets = [...exItem.sets, newSet];
      copy[exerciseIdx] = exItem;
      return copy;
    });
  };

  const handleRemoveSet = (exerciseIdx: number, setIdx: number) => {
    setRoutineExercises((prev) => {
      const copy = [...prev];
      const exItem = { ...copy[exerciseIdx] };
      if (exItem.sets.length <= 1) {
        // Minimum 1 set, or remove exercise
        return copy;
      }
      exItem.sets = exItem.sets
        .filter((_, i) => i !== setIdx)
        .map((s, i) => ({ ...s, setNumber: i + 1 }));
      copy[exerciseIdx] = exItem;
      return copy;
    });
  };

  const handleUpdateSetValue = (
    exerciseIdx: number,
    setIdx: number,
    field: keyof ExerciseSet,
    val: number | undefined
  ) => {
    setRoutineExercises((prev) => {
      const copy = [...prev];
      const exItem = { ...copy[exerciseIdx] };
      const sets = [...exItem.sets];
      sets[setIdx] = { ...sets[setIdx], [field]: val };
      exItem.sets = sets;
      copy[exerciseIdx] = exItem;
      return copy;
    });
  };

  const handleUpdatePinnedNote = (exerciseIdx: number, note: string) => {
    setRoutineExercises((prev) => {
      const copy = [...prev];
      copy[exerciseIdx] = { ...copy[exerciseIdx], pinnedNote: note };
      return copy;
    });
  };

  const handleUpdateExerciseRestTimer = (exerciseIdx: number, seconds: number) => {
    setRoutineExercises((prev) => {
      const copy = [...prev];
      copy[exerciseIdx] = { ...copy[exerciseIdx], restTimerSeconds: seconds };
      return copy;
    });
  };

  const handleSaveRoutine = () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề cho Routine');
      return;
    }

    onSave({
      title: title.trim(),
      folderId,
      notes: notes.trim() || undefined,
      restTimerSeconds: routineRestTimer,
      exercises: routineExercises,
    });
  };

  // Filtered exercises for the right column
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      !searchQuery ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.nameVi && ex.nameVi.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMuscle =
      selectedMuscle === 'all' ||
      ex.targetMuscles.some((m) => m.toLowerCase().includes(selectedMuscle.toLowerCase()));

    const matchesEquipment =
      selectedEquipment === 'all' || ex.equipment.toLowerCase() === selectedEquipment.toLowerCase();

    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {initialRoutine?.id ? 'Chỉnh sửa Routine' : 'Tạo Routine mới'}
            </h1>
            <p className="text-xs text-slate-500">
              Thiết lập bài tập, số hiệp linh hoạt theo loại và theo dõi heatmap cơ bắp thời gian thực
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSaveRoutine}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Routine</span>
          </button>
        </div>
      </div>

      {/* Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: ROUTINE CONFIGURATION (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tiêu đề Routine *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Ngực & Tay Sau Cắt Nét"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-sm sm:text-base outline-none focus:border-[#FF5722] bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-slate-500" />
                  <span>Thư mục chứa</span>
                </label>
                <select
                  value={folderId || ''}
                  onChange={(e) => setFolderId(e.target.value || undefined)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-[#FF5722] cursor-pointer"
                >
                  <option value="">(Không phân loại)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Thời gian nghỉ mặc định</span>
                </label>
                <select
                  value={routineRestTimer}
                  onChange={(e) => setRoutineRestTimer(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-[#FF5722] cursor-pointer"
                >
                  {REST_TIMER_OPTIONS.map((secs) => (
                    <option key={secs} value={secs}>
                      {secs >= 60 ? `${Math.floor(secs / 60)} phút ${secs % 60 ? `${secs % 60}s` : ''}` : `${secs} giây`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi chú routine (tùy chọn)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú tổng quan về mục tiêu, tuần tập hoặc lưu ý khởi động..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-[#FF5722] bg-slate-50/50"
              />
            </div>
          </div>

          {/* Dynamic Muscle Heatmap for current routine exercises */}
          <MuscleHeatmapSvg
            exercises={routineExercises}
            onOpenDetailModal={() => setIsDetailModalOpen(true)}
          />

          {/* Exercise List in Routine */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Danh sách bài tập ({routineExercises.length})
              </h3>
              {routineExercises.length === 0 && (
                <span className="text-xs text-amber-600 font-semibold">
                  Chọn bài tập từ thư viện bên phải để thêm vào routine
                </span>
              )}
            </div>

            {routineExercises.map((item, exIdx) => {
              const ex = item.exercise;
              const isCustomRest = customRestMap[exIdx] || false;

              return (
                <div
                  key={`routine-ex-${ex.id}-${exIdx}`}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-4"
                >
                  {/* Exercise Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#FF5722] flex items-center justify-center font-bold text-sm shrink-0">
                        {exIdx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900">
                          {ex.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                          {ex.nameVi && <span>{ex.nameVi}</span>}
                          <span>•</span>
                          <span className="capitalize">{ex.equipment}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exIdx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa bài tập này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pinned Note & Rest Timer Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">
                        Ghi chú kỹ thuật (Pinned Note)
                      </label>
                      <input
                        type="text"
                        value={item.pinnedNote || ''}
                        onChange={(e) => handleUpdatePinnedNote(exIdx, e.target.value)}
                        placeholder="Ví dụ: Hạ chậm 2s, mở rộng cùi chỏ..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 outline-none focus:border-[#FF5722] bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-600">
                          Thời gian nghỉ hiệp
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomRestMap((prev) => ({
                              ...prev,
                              [exIdx]: !prev[exIdx],
                            }))
                          }
                          className="text-[11px] font-bold text-[#FF5722] hover:underline cursor-pointer"
                        >
                          {isCustomRest ? 'Chọn danh sách' : 'Tự thiết lập'}
                        </button>
                      </div>

                      {isCustomRest ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="5"
                            max="600"
                            step="5"
                            value={item.restTimerSeconds || 60}
                            onChange={(e) =>
                              handleUpdateExerciseRestTimer(
                                exIdx,
                                parseInt(e.target.value, 10) || 60
                              )
                            }
                            className="w-24 px-2 py-1 rounded-lg border border-slate-300 font-bold text-center"
                          />
                          <span className="text-slate-500 font-semibold">giây</span>
                        </div>
                      ) : (
                        <select
                          value={item.restTimerSeconds || 60}
                          onChange={(e) =>
                            handleUpdateExerciseRestTimer(
                              exIdx,
                              parseInt(e.target.value, 10)
                            )
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white cursor-pointer"
                        >
                          {REST_TIMER_OPTIONS.map((secs) => (
                            <option key={secs} value={secs}>
                              {secs >= 60
                                ? `${Math.floor(secs / 60)} phút ${
                                    secs % 60 ? `${secs % 60}s` : ''
                                  }`
                                : `${secs}s`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Section 8.3: Flexible Set Table according to exercise type */}
                  <div className="space-y-2">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-1.5 px-2 w-12 text-center">Set</th>
                            {ex.type === 'weight_reps' && (
                              <>
                                <th className="py-1.5 px-2">Khối lượng (Kg)</th>
                                <th className="py-1.5 px-2">Số lần (Reps)</th>
                              </>
                            )}
                            {ex.type === 'bodyweight_reps' && (
                              <th className="py-1.5 px-2">Số lần (Reps)</th>
                            )}
                            {ex.type === 'duration' && (
                              <th className="py-1.5 px-2">Thời gian giữ (giây)</th>
                            )}
                            {ex.type === 'distance_duration' && (
                              <>
                                <th className="py-1.5 px-2">Quãng đường (Km)</th>
                                <th className="py-1.5 px-2">Thời gian (giây)</th>
                              </>
                            )}
                            <th className="py-1.5 px-2 w-10 text-center">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {item.sets.map((set, setIdx) => (
                            <tr key={`set-${setIdx}`} className="hover:bg-slate-50/50">
                              <td className="py-2 px-2 text-center font-bold text-slate-700">
                                {set.setNumber}
                              </td>

                              {ex.type === 'weight_reps' && (
                                <>
                                  <td className="py-2 px-2">
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={set.weightKg ?? ''}
                                      onChange={(e) =>
                                        handleUpdateSetValue(
                                          exIdx,
                                          setIdx,
                                          'weightKg',
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-20 px-2 py-1 rounded border border-slate-200 font-bold text-slate-900 bg-white"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input
                                      type="number"
                                      value={set.reps ?? ''}
                                      onChange={(e) =>
                                        handleUpdateSetValue(
                                          exIdx,
                                          setIdx,
                                          'reps',
                                          parseInt(e.target.value, 10) || 0
                                        )
                                      }
                                      className="w-20 px-2 py-1 rounded border border-slate-200 font-bold text-slate-900 bg-white"
                                    />
                                  </td>
                                </>
                              )}

                              {ex.type === 'bodyweight_reps' && (
                                <td className="py-2 px-2">
                                  <input
                                    type="number"
                                    value={set.reps ?? ''}
                                    onChange={(e) =>
                                      handleUpdateSetValue(
                                        exIdx,
                                        setIdx,
                                        'reps',
                                        parseInt(e.target.value, 10) || 0
                                      )
                                    }
                                    className="w-24 px-2 py-1 rounded border border-slate-200 font-bold text-slate-900 bg-white"
                                  />
                                </td>
                              )}

                              {ex.type === 'duration' && (
                                <td className="py-2 px-2">
                                  <input
                                    type="number"
                                    step="5"
                                    value={set.durationSeconds ?? ''}
                                    onChange={(e) =>
                                      handleUpdateSetValue(
                                        exIdx,
                                        setIdx,
                                        'durationSeconds',
                                        parseInt(e.target.value, 10) || 0
                                      )
                                    }
                                    className="w-24 px-2 py-1 rounded border border-slate-200 font-bold text-slate-900 bg-white"
                                  />
                                </td>
                              )}

                              {ex.type === 'distance_duration' && (
                                <>
                                  <td className="py-2 px-2">
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={set.distanceKm ?? ''}
                                      onChange={(e) =>
                                        handleUpdateSetValue(
                                          exIdx,
                                          setIdx,
                                          'distanceKm',
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-20 px-2 py-1 rounded border border-slate-200 font-bold text-slate-900 bg-white"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input
                                      type="number"
                                      step="10"
                                      value={set.durationSeconds ?? ''}
                                      onChange={(e) =>
                                        handleUpdateSetValue(
                                          exIdx,
                                          setIdx,
                                          'durationSeconds',
                                          parseInt(e.target.value, 10) || 0
                                        )
                                      }
                                      className="w-24 px-2 py-1 rounded border border-slate-200 font-bold text-slate-900 bg-white"
                                    />
                                  </td>
                                </>
                              )}

                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSet(exIdx, setIdx)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Xóa hiệp này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSet(exIdx)}
                      className="w-full py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-[#FF5722] hover:bg-orange-50/30 text-xs font-bold text-slate-600 hover:text-[#FF5722] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Set</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: EXERCISE LIBRARY (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#FF5722]" />
                  <span>Ngân hàng bài tập</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tìm kiếm và nhấn (+) để thêm vào Routine
                </p>
              </div>

              {/* Section 9: Custom Exercise Button */}
              <button
                type="button"
                onClick={() => setIsCustomExerciseModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF5722] text-xs font-bold transition-colors border border-orange-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tùy chỉnh</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài tập..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#FF5722] bg-slate-50"
              />
            </div>

            {/* Filters: Equipment & Muscle */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-bold text-slate-600 block mb-1 text-[11px] uppercase tracking-wider">
                  Nhóm cơ
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'chest', label: 'Ngực' },
                    { id: 'back', label: 'Lưng xô' },
                    { id: 'shoulders', label: 'Vai' },
                    { id: 'biceps', label: 'Tay trước' },
                    { id: 'triceps', label: 'Tay sau' },
                    { id: 'quads', label: 'Đùi trước' },
                    { id: 'hamstrings', label: 'Đùi sau' },
                    { id: 'abs', label: 'Bụng' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMuscle(m.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                        selectedMuscle === m.id
                          ? 'bg-[#FF5722] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-600 block mb-1 text-[11px] uppercase tracking-wider">
                  Thiết bị
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'barbell', label: 'Barbell' },
                    { id: 'dumbbell', label: 'Dumbbell' },
                    { id: 'machine', label: 'Máy' },
                    { id: 'cable', label: 'Cable' },
                    { id: 'bodyweight', label: 'Bodyweight' },
                    { id: 'cardio', label: 'Cardio' },
                  ].map((eq) => (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => setSelectedEquipment(eq.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                        selectedEquipment === eq.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {eq.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-white flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {ex.name}
                    </h5>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      {ex.nameVi && <span className="truncate">{ex.nameVi}</span>}
                      <span>•</span>
                      <span className="capitalize">{ex.equipment}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddExerciseToRoutine(ex)}
                    className="w-8 h-8 rounded-xl bg-orange-50 hover:bg-[#FF5722] text-[#FF5722] hover:text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                    title="Thêm bài tập này vào routine"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {filteredExercises.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-400">
                  Không tìm thấy bài tập phù hợp.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Exercise Modal */}
      <CustomExerciseModal
        isOpen={isCustomExerciseModalOpen}
        onClose={() => setIsCustomExerciseModalOpen(false)}
        onAddCustomExercise={(newEx) => {
          const created = addCustomExercise(newEx);
          handleAddExerciseToRoutine(created);
          return created;
        }}
      />

      {/* Muscle Detail Modal */}
      <MuscleDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        exercises={routineExercises}
      />
    </div>
  );
};
