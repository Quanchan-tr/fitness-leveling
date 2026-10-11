'use strict';
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Exercise } from '@/types/workout.types';
import { fetchExercises } from '@/lib/api';
import {
  Search,
  X,
  Dumbbell,
  Sparkles,
  Loader2,
  ChevronDown,
  Plus,
  Play,
  Flame,
} from 'lucide-react';

interface ExerciseCatalogViewProps {
  onAddExerciseToRoutine: (exercise: Exercise) => void;
  onStartQuickWorkout: (exercise: Exercise) => void;
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

export const ExerciseCatalogView: React.FC<ExerciseCatalogViewProps> = ({
  onAddExerciseToRoutine,
  onStartQuickWorkout,
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

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
        console.error('Failed to load exercises:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [debouncedSearch, selectedCategory, selectedEquipment, filterAiOnly]
  );

  useEffect(() => {
    loadExercises(1, false);
  }, [debouncedSearch, selectedCategory, selectedEquipment, filterAiOnly, loadExercises]);

  const handleLoadMore = () => {
    if (page < lastPage && !isLoadingMore) {
      loadExercises(page + 1, true);
    }
  };

  const getMuscleBadgeColor = (group?: string) => {
    const g = (group || '').toLowerCase();
    if (g.includes('chest') || g.includes('ngực')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (g.includes('back') || g.includes('lưng')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (g.includes('leg') || g.includes('chân') || g.includes('đùi')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (g.includes('shoulder') || g.includes('vai')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (g.includes('arm') || g.includes('tay')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (g.includes('waist') || g.includes('core') || g.includes('bụng') || g.includes('abs')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (g.includes('cardio')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên bài tập (squat, bench press, deadlift, pull up...)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5722] focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AI Filter Button */}
          <button
            type="button"
            onClick={() => setFilterAiOnly((prev) => !prev)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border shrink-0 ${
              filterAiOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Chỉ bài có AI Pose Check</span>
          </button>
        </div>

        {/* Filter Pills & Selects */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Category Pills (horizontal scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat.value
                    ? 'bg-[#FF5722] text-white border-[#FF5722] shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Equipment Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              Dụng cụ:
            </span>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="bg-slate-50 text-xs font-semibold text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#FF5722]"
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

      {/* Exercise Cards Grid */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5722]" />
          <span className="text-sm font-semibold text-slate-600">Đang tải danh sách bài tập từ database...</span>
        </div>
      ) : exercises.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((exercise) => {
              const muscleLabel =
                exercise.target_muscle ||
                exercise.body_part ||
                exercise.category ||
                exercise.muscle_group ||
                'General';
              const mediaUrl = exercise.gif_url || exercise.thumbnail_url;

              return (
                <div
                  key={exercise.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-sm transition-all p-4 flex flex-col justify-between gap-3.5 group"
                >
                  <div className="flex items-start gap-3">
                    {/* GIF animation thumbnail */}
                    <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-2xs">
                      {mediaUrl ? (
                        <img
                          src={mediaUrl}
                          alt={exercise.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Dumbbell className="w-7 h-7 text-slate-300" />
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {exercise.has_ai_check && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500 text-white shadow-2xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>AI Pose Check</span>
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border capitalize ${getMuscleBadgeColor(
                            muscleLabel
                          )}`}
                        >
                          {muscleLabel}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#FF5722] transition-colors leading-snug capitalize line-clamp-2">
                        {exercise.name}
                      </h4>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 capitalize">
                        <span>{exercise.equipment || 'body weight'}</span>
                        {exercise.category && (
                          <>
                            <span>•</span>
                            <span>{exercise.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onAddExerciseToRoutine(exercise)}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-[#FF5722] border border-slate-200 hover:border-orange-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm vào Routine</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onStartQuickWorkout(exercise)}
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-[#FF5722] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Bắt đầu tập ngay bài tập này"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Tập ngay</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {page < lastPage && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#FF5722]" />
                    <span>Đang tải thêm...</span>
                  </>
                ) : (
                  <>
                    <span>Tải thêm bài tập ({exercises.length} / {totalCount})</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500 space-y-2">
          <Dumbbell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h4 className="font-bold text-base text-slate-700">Không tìm thấy bài tập nào</h4>
          <p className="text-xs text-slate-400">
            Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc nhóm cơ / dụng cụ.
          </p>
        </div>
      )}
    </div>
  );
};
