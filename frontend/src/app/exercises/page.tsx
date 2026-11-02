'use strict';
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise, RoutineItem } from '@/types/fitnessleveling.types';
import { useFitness } from '@/contexts/FitnessContext';
import { ExerciseDetailModal } from '@/components/exercises/ExerciseDetailModal';
import { NoSearchResults } from '@/components/ui/NoSearchResults';
import {
  Search,
  X,
  Dumbbell,
  Sparkles,
  BookOpen,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  Check,
} from 'lucide-react';

const ITEMS_PER_PAGE = 24;

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

export default function ExercisesPage() {
  const router = useRouter();
  const { exercises, startWorkout, profile, routines, updateRoutine } = useFitness();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [filterAiOnly, setFilterAiOnly] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Selected exercise for Detail Modal
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick feedback toast when adding to routine
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
      setCurrentPage(1); // reset to page 1 on new search
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEquipment(e.target.value);
    setCurrentPage(1);
  };

  const handleToggleAi = () => {
    setFilterAiOnly((prev) => !prev);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('all');
    setSelectedEquipment('all');
    setFilterAiOnly(false);
    setCurrentPage(1);
  };

  // Filter exercises in-memory (high-performance client filtering across 1,324 items)
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      // 1. Search text match
      if (debouncedSearch) {
        const nameMatch = ex.name.toLowerCase().includes(debouncedSearch);
        const descMatch = (ex.description || '').toLowerCase().includes(debouncedSearch);
        const muscleMatch = (ex.target_muscle || ex.category || '').toLowerCase().includes(debouncedSearch);
        if (!nameMatch && !descMatch && !muscleMatch) return false;
      }

      // 2. Category match
      if (selectedCategory !== 'all') {
        const cat = (ex.category || ex.body_part || ex.target_muscle || '').toLowerCase();
        if (!cat.includes(selectedCategory.toLowerCase())) return false;
      }

      // 3. Equipment match
      if (selectedEquipment !== 'all') {
        const eq = (ex.equipment || '').toLowerCase();
        if (!eq.includes(selectedEquipment.toLowerCase())) return false;
      }

      // 4. AI Pose Check match
      if (filterAiOnly && !ex.has_ai_check) {
        return false;
      }

      return true;
    });
  }, [exercises, debouncedSearch, selectedCategory, selectedEquipment, filterAiOnly]);

  // Pagination calculation
  const totalItems = filteredExercises.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentExercises = useMemo(() => {
    return filteredExercises.slice(startIndex, endIndex);
  }, [filteredExercises, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modal Actions
  const handleOpenDetail = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsModalOpen(false);
    setSelectedExercise(null);
  };

  const handleStartQuickWorkout = (exercise: Exercise) => {
    handleCloseDetail();
    const quickRoutine: RoutineItem = {
      id: `quick-${Date.now()}`,
      title: `Tập nhanh: ${exercise.name}`,
      restTimerSeconds: 60,
      createdBy: {
        userId: profile.id,
        username: profile.name,
        avatarUrl: profile.avatar,
      },
      exercises: [
        {
          exercise,
          sets: [
            { setNumber: 1, reps: 12, isCompleted: false },
            { setNumber: 2, reps: 12, isCompleted: false },
            { setNumber: 3, reps: 12, isCompleted: false },
          ],
        },
      ],
    };
    startWorkout(quickRoutine);
    router.push('/workout/live');
  };

  const handleAddExerciseToRoutine = (exercise: Exercise) => {
    if (routines.length === 0) {
      setToastMessage('Bạn chưa có Routine nào. Hãy tạo Routine ở tab Luyện tập!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const targetRoutine = routines[0];
    const updated: RoutineItem = {
      ...targetRoutine,
      exercises: [
        ...targetRoutine.exercises,
        {
          exercise,
          sets: [
            { setNumber: 1, reps: 10, isCompleted: false },
            { setNumber: 2, reps: 10, isCompleted: false },
            { setNumber: 3, reps: 10, isCompleted: false },
          ],
        },
      ],
    };
    updateRoutine(updated);
    setToastMessage(`Đã thêm "${exercise.name}" vào Routine "${targetRoutine.title}"!`);
    setTimeout(() => setToastMessage(null), 3000);
    handleCloseDetail();
  };

  // Generate numbered pagination window
  const paginationRange = useMemo(() => {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) {
      range.push(i);
    }
    if (right < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);

    return range;
  }, [currentPage, totalPages]);

  const hasActiveFilters = Boolean(
    searchTerm || selectedCategory !== 'all' || selectedEquipment !== 'all' || filterAiOnly
  );

  const getBadgeColor = (muscle: string) => {
    const m = muscle.toLowerCase();
    if (m.includes('chest') || m.includes('ngực')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (m.includes('back') || m.includes('lưng')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (m.includes('leg') || m.includes('đùi') || m.includes('mông')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (m.includes('shoulder') || m.includes('vai')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (m.includes('arm') || m.includes('tay')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (m.includes('waist') || m.includes('core') || m.includes('bụng')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom-4 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Page Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-[#FF5722] text-xs font-bold mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Thư viện Động tác Khoa học</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Kho Bài Tập Chuẩn
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
              Tra cứu toàn bộ 1,324+ động tác thể hình từ dataset chuẩn quốc tế kèm ảnh động GIF thị phạm và phân tích nhóm cơ.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <div className="px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="block text-base sm:text-lg font-black text-slate-900">{exercises.length}</span>
              <span className="block text-[11px] font-bold text-slate-400">Tổng bài tập</span>
            </div>
            <div className="px-4 py-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <span className="block text-base sm:text-lg font-black text-emerald-700">
                {exercises.filter((e) => e.has_ai_check).length}
              </span>
              <span className="block text-[11px] font-bold text-emerald-600">AI Pose Check</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
          {/* Top Row: Search input & AI Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên bài tập, nhóm cơ (ví dụ: Bench Press, Squat, Ngực)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-9 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5722] focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* AI Pose Check Filter Toggle */}
            <button
              type="button"
              onClick={handleToggleAi}
              className={`h-11 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer shrink-0 ${
                filterAiOnly
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${filterAiOnly ? 'text-white' : 'text-emerald-500'}`} />
              <span>Chỉ bài có AI Pose Check</span>
            </button>
          </div>

          {/* Bottom Row: Dropdowns & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Bộ lọc:</span>
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="appearance-none bg-slate-50 text-xs font-semibold text-slate-800 pl-3 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5722] cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Equipment Dropdown */}
              <div className="relative">
                <select
                  value={selectedEquipment}
                  onChange={handleEquipmentChange}
                  className="appearance-none bg-slate-50 text-xs font-semibold text-slate-800 pl-3 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF5722] cursor-pointer"
                >
                  {EQUIPMENTS.map((eq) => (
                    <option key={eq.value} value={eq.value}>
                      {eq.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Reset button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-[#FF5722] hover:underline px-2 py-1 cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              )}
            </div>

            {/* Results Counter */}
            <div className="text-xs font-semibold text-slate-500">
              Tìm thấy <strong className="text-slate-900">{totalItems}</strong> bài tập
              {totalItems > 0 && (
                <span className="hidden sm:inline">
                  {' '}(Trang {currentPage} / {totalPages})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Exercise Cards Grid */}
        {totalItems === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
            <NoSearchResults
              query={searchTerm || 'các bộ lọc đã chọn'}
              onClear={handleResetFilters}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentExercises.map((exercise) => {
              const muscleLabel =
                exercise.target_muscle ||
                exercise.body_part ||
                exercise.category ||
                'Toàn thân';
              const mediaUrl = exercise.thumbnail_url || exercise.gif_url || exercise.gifPlaceholderUrl;

              return (
                <div
                  key={exercise.id}
                  onClick={() => handleOpenDetail(exercise)}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#FF5722]/50 hover:shadow-md transition-all p-3.5 flex flex-col justify-between gap-3 group cursor-pointer"
                >
                  <div>
                    {/* Thumbnail Image Container */}
                    <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200/80 mb-3 flex items-center justify-center">
                      {mediaUrl ? (
                        <img
                          src={mediaUrl}
                          alt={exercise.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Dumbbell className="w-8 h-8 text-slate-300" />
                      )}

                      {/* AI Badge */}
                      {exercise.has_ai_check && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-2xs">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI Check</span>
                        </span>
                      )}
                    </div>

                    {/* Metadata Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize ${getBadgeColor(
                          muscleLabel
                        )}`}
                      >
                        {muscleLabel}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md capitalize">
                        {exercise.equipment || 'Bodyweight'}
                      </span>
                    </div>

                    {/* Exercise Title */}
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#FF5722] transition-colors leading-snug line-clamp-2 capitalize">
                      {exercise.name}
                    </h3>
                  </div>

                  {/* Card Bottom Hint */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="capitalize">{exercise.category || 'Kháng lực'}</span>
                    <span className="text-[#FF5722] font-bold group-hover:underline">Chi tiết →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Traditional Numbered Pagination Bar */}
        {totalPages > 1 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-semibold text-slate-500">
              Hiển thị <strong className="text-slate-900">{startIndex + 1}</strong> –{' '}
              <strong className="text-slate-900">{endIndex}</strong> trong tổng số{' '}
              <strong className="text-slate-900">{totalItems}</strong> bài tập
            </p>

            <div className="flex items-center gap-1.5">
              {/* Previous Page Button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trước</span>
              </button>

              {/* Number Buttons */}
              <div className="flex items-center gap-1">
                {paginationRange.map((item, index) => {
                  if (item === '...') {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="w-8 h-9 flex items-center justify-center text-xs font-bold text-slate-400 select-none"
                      >
                        •••
                      </span>
                    );
                  }

                  const pageNum = item as number;
                  const isActive = pageNum === currentPage;

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FF5722] text-white shadow-sm shadow-orange-500/20'
                          : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Page Button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <span className="hidden sm:inline">Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseDetail}
        exercise={selectedExercise}
        onStartQuickWorkout={handleStartQuickWorkout}
        onAddExerciseToRoutine={handleAddExerciseToRoutine}
      />
    </main>
  );
}
