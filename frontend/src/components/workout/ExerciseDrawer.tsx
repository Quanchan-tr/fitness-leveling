'use strict';
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ExerciseDbItem } from '@/types/workout.types';
import { ExerciseDatabaseItem } from './ExerciseDatabaseItem';
import { Search, X, Dumbbell } from 'lucide-react';

interface ExerciseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (exercise: ExerciseDbItem) => void;
  database: ExerciseDbItem[];
}

export const ExerciseDrawer: React.FC<ExerciseDrawerProps> = ({
  isOpen,
  onClose,
  onAddExercise,
  database,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<string[]>([]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setRecentlyAddedIds([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const categories: { label: string; value: string }[] = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Gym', value: 'Gym' },
    { label: 'Calisthenics', value: 'Calisthenics' },
    { label: 'Cardio', value: 'Cardio' },
    { label: 'Core', value: 'Core' },
  ];

  const muscleGroups: { label: string; value: string }[] = [
    { label: 'Tất cả cơ', value: 'all' },
    { label: 'Ngực (Chest)', value: 'Chest' },
    { label: 'Lưng (Back)', value: 'Back' },
    { label: 'Đùi/Mông (Legs)', value: 'Legs' },
    { label: 'Vai (Shoulders)', value: 'Shoulders' },
    { label: 'Tay (Arms)', value: 'Arms' },
    { label: 'Bụng (Core)', value: 'Core' },
  ];

  const filteredExercises = useMemo(() => {
    return database.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || ex.category === selectedCategory;

      const matchesMuscle =
        selectedMuscle === 'all' || ex.muscleGroup === selectedMuscle;

      return matchesSearch && matchesCategory && matchesMuscle;
    });
  }, [database, searchTerm, selectedCategory, selectedMuscle]);

  const handleAdd = (exercise: ExerciseDbItem) => {
    onAddExercise(exercise);
    setRecentlyAddedIds((prev) => [...prev, exercise.id]);
    setTimeout(() => {
      setRecentlyAddedIds((prev) => prev.filter((id) => id !== exercise.id));
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Content */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen sm:w-[440px] bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-[#B9A78E]/40 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-white border-b border-[#B9A78E]/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B35] text-white flex items-center justify-center shadow-xs">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#1F2328] leading-tight">
                  Ngân Hàng Bài Tập
                </h3>
                <p className="text-[11px] text-[#76583E] font-medium">
                  Chọn bài tập để thêm vào lịch
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#76583E] hover:text-[#1F2328] border border-[#B9A78E]/30 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter & Search Area */}
          <div className="p-4 bg-white/60 border-b border-[#B9A78E]/20 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#76583E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm theo tên bài tập, nhóm cơ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white pl-9 pr-8 py-2 rounded-xl border border-[#B9A78E]/40 text-xs font-medium text-[#1F2328] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#1F2328]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.value
                      ? 'bg-[#FF6B35] text-white shadow-xs'
                      : 'bg-white hover:bg-[#EFE9DF] text-[#76583E] border border-[#B9A78E]/30'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Muscle Group Filter Select */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#76583E] whitespace-nowrap">
                Nhóm cơ:
              </span>
              <select
                value={selectedMuscle}
                onChange={(e) => setSelectedMuscle(e.target.value)}
                className="flex-1 bg-white text-xs font-bold text-[#1F2328] px-2.5 py-1.5 rounded-xl border border-[#B9A78E]/40 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              >
                {muscleGroups.map((mg) => (
                  <option key={mg.value} value={mg.value}>
                    {mg.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exercises List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => (
                <ExerciseDatabaseItem
                  key={exercise.id}
                  exercise={exercise}
                  onAdd={handleAdd}
                  isRecentlyAdded={recentlyAddedIds.includes(exercise.id)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-[#76583E]">
                <Dumbbell className="w-8 h-8 mx-auto text-[#B9A78E] mb-2" />
                <p className="text-xs font-bold text-[#1F2328]">
                  Không tìm thấy bài tập phù hợp
                </p>
                <p className="text-[11px] text-[#76583E] mt-0.5">
                  Thử đổi từ khóa hoặc bộ lọc nhóm cơ
                </p>
              </div>
            )}
          </div>

          {/* Footer Summary */}
          <div className="p-3.5 bg-white border-t border-[#B9A78E]/30 flex items-center justify-between text-xs">
            <span className="text-[#76583E] font-medium">
              Tìm thấy <strong>{filteredExercises.length}</strong> bài tập
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#1F2328] text-white font-bold hover:bg-[#303238] transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
