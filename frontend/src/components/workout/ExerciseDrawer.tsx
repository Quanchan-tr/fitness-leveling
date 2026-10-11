'use strict';
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Exercise } from '@/types/workout.types';
import { fetchExercises } from '@/lib/api';
import { ExerciseDatabaseItem } from './ExerciseDatabaseItem';
import { Search, X, Dumbbell, Sparkles, Loader2, ChevronDown } from 'lucide-react';

interface ExerciseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (exercise: Exercise) => void;
  database?: Exercise[];
}

const CATEGORIES = [
  { label: 'Tất cả nhóm cơ', value: 'all' },
  { label: 'Ngực (Chest)', value: 'chest' },
  { label: 'Lưng xô (Back)', value: 'back' },
  { label: 'Đùi / Mông (Legs)', value: 'upper legs' },
  { label: 'Bắp chân (Calves)', value: 'lower legs' },
  { label: 'Vai (Shoulders)', value: 'shoulders' },
  { label: 'Tay (Arms)', value: 'upper arms' },
  { label: 'Bụng & Eo (Core)', value: 'waist' },
  { label: 'Cardio', value: 'cardio' },
];

const EQUIPMENTS = [
  { label: 'Tất cả dụng cụ', value: 'all' },
  { label: 'Bodyweight', value: 'body weight' },
  { label: 'Barbell', value: 'barbell' },
  { label: 'Dumbbell', value: 'dumbbell' },
  { label: 'Cable Machine', value: 'cable' },
  { label: 'Leverage Machine', value: 'leverage machine' },
  { label: 'Resistance Band', value: 'band' },
  { label: 'Kettlebell', value: 'kettlebell' },
];

export const ExerciseDrawer: React.FC<ExerciseDrawerProps> = ({
  isOpen,
  onClose,
  onAddExercise,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [filterAiOnly, setFilterAiOnly] = useState<boolean>(false);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [page, setPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
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

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch exercises from API
  const loadExercises = useCallback(
    async (targetPage: number, append: boolean = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await fetchExercises({
          q: debouncedSearch || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          equipment: selectedEquipment !== 'all' ? selectedEquipment : undefined,
          has_ai: filterAiOnly || undefined,
          page: targetPage,
          per_page: 24,
        });

        if (append) {
          setExercises((prev) => [...prev, ...response.data]);
        } else {
          setExercises(response.data);
        }

        setPage(response.current_page);
        setLastPage(response.last_page);
        setTotalCount(response.total);
      } catch (err) {
        console.error('Failed to load exercises from backend API:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [debouncedSearch, selectedCategory, selectedEquipment, filterAiOnly]
  );

  // Trigger search/filter changes
  useEffect(() => {
    if (!isOpen) return;
    loadExercises(1, false);
  }, [isOpen, debouncedSearch, selectedCategory, selectedEquipment, filterAiOnly, loadExercises]);

  const handleLoadMore = () => {
    if (page < lastPage && !isLoadingMore) {
      loadExercises(page + 1, true);
    }
  };

  const handleAdd = (exercise: Exercise) => {
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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen sm:w-[500px] bg-slate-50 shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FF5722] text-white flex items-center justify-center shadow-xs">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Ngân hàng bài tập
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Hơn 1.300+ bài tập chuẩn hóa kèm GIF động
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 bg-white border-b border-slate-200 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm bài tập (squat, push up, bench press...)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5722]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter: AI Pose Check Toggle */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setFilterAiOnly((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  filterAiOnly
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chỉ bài có AI Pose Check</span>
              </button>

              <span className="text-[11px] font-semibold text-slate-400">
                {totalCount} bài tập
              </span>
            </div>

            {/* Dropdowns for Muscle & Equipment */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nhóm cơ
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 text-xs font-semibold text-slate-800 px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5722]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Dụng cụ
                </label>
                <select
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  className="w-full bg-slate-50 text-xs font-semibold text-slate-800 px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5722]"
                >
                  {EQUIPMENTS.map((eq) => (
                    <option key={eq.value} value={eq.value}>
                      {eq.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Exercises List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin text-[#FF5722]" />
                <span className="text-xs font-medium">Đang tải danh sách bài tập...</span>
              </div>
            ) : exercises.length > 0 ? (
              <>
                {exercises.map((exercise) => (
                  <ExerciseDatabaseItem
                    key={exercise.id}
                    exercise={exercise}
                    onAdd={handleAdd}
                    isRecentlyAdded={recentlyAddedIds.includes(exercise.id)}
                  />
                ))}

                {/* Load More Button */}
                {page < lastPage && (
                  <div className="pt-3 pb-2 text-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-2xs"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5722]" />
                          <span>Đang tải thêm...</span>
                        </>
                      ) : (
                        <>
                          <span>Tải thêm ({exercises.length}/{totalCount})</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <Dumbbell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">
                  Không tìm thấy bài tập phù hợp
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Thử đổi từ khóa hoặc bộ lọc nhóm cơ / dụng cụ
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Đang hiển thị <strong className="text-slate-900">{exercises.length}</strong> / {totalCount} bài tập
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
