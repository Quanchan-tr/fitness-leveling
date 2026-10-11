'use strict';
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { useFitness } from '@/contexts/FitnessContext';
import { useShell } from '@/components/layout/ShellLayout';
import { RoutineItem } from '@/types/fitnessleveling.types';
import { WeeklyCalendar } from '@/components/workout/WeeklyCalendar';
import { RoutineCard } from '@/components/workout/RoutineCard';
import { RoutineEditor } from '@/components/workout/RoutineEditor';
import { RoutineDetailView } from '@/components/workout/RoutineDetailView';
import { ExerciseDrawer } from '@/components/workout/ExerciseDrawer';
import { ExerciseCatalogView } from '@/components/workout/ExerciseCatalogView';
import { Exercise } from '@/types/workout.types';
import {
  Dumbbell,
  Plus,
  FolderPlus,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Play,
  X,
  Trash2,
  MoreVertical,
  Edit2,
} from 'lucide-react';

export default function WorkoutPage() {
  const router = useRouter();
  const { toggleMobileNav } = useShell();
  const {
    routines,
    folders,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    duplicateRoutine,
    createFolder,
    renameFolder,
    deleteFolder,
    toggleFolder,
    startWorkout,
    profile,
  } = useFitness();

  // Page view mode: 'overview' | 'editor' | 'detail'
  const [viewMode, setViewMode] = useState<'overview' | 'editor' | 'detail'>('overview');
  const [editingRoutine, setEditingRoutine] = useState<RoutineItem | undefined>(undefined);
  const [targetFolderId, setTargetFolderId] = useState<string | undefined>(undefined);
  const [selectedRoutineForDetail, setSelectedRoutineForDetail] = useState<RoutineItem | undefined>(
    undefined
  );

  // Folder creation modal state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Folder 3-dots menu & rename modal state
  const [openFolderMenuId, setOpenFolderMenuId] = useState<string | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<{ id: string; name: string } | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // Exercise drawer & collection tab state
  const [isExerciseDrawerOpen, setIsExerciseDrawerOpen] = useState(false);
  const [collectionTab, setCollectionTab] = useState<'routines' | 'exercises'>('routines');

  const handleStartLive = (routine: RoutineItem) => {
    startWorkout(routine);
    router.push('/workout/live');
  };

  const handleOpenEditor = (routine?: RoutineItem, folderId?: string) => {
    setEditingRoutine(routine);
    setTargetFolderId(folderId || routine?.folderId);
    setViewMode('editor');
  };

  const handleAddExerciseToRoutine = (ex: Exercise) => {
    handleOpenEditor({
      id: '',
      title: `Routine với ${ex.name}`,
      restTimerSeconds: 60,
      createdBy: {
        userId: profile.id,
        username: profile.name,
        avatarUrl: profile.avatar,
      },
      exercises: [
        {
          exercise: {
            id: ex.id,
            name: ex.name,
            nameVi: ex.nameVi,
            targetMuscles: [ex.target_muscle || ex.body_part || ex.category || 'chest'],
            equipment: (ex.equipment || 'bodyweight').toLowerCase() as any,
            type: 'weight_reps',
            gifPlaceholderUrl: ex.gif_url || ex.thumbnail_url,
            description:
              typeof ex.instructions === 'string'
                ? ex.instructions
                : ex.description || ex.name,
          },
          sets: [
            { setNumber: 1, weightKg: 20, reps: 10, isCompleted: false },
            { setNumber: 2, weightKg: 20, reps: 10, isCompleted: false },
            { setNumber: 3, weightKg: 20, reps: 10, isCompleted: false },
          ],
        },
      ],
    });
  };

  const handleStartQuickWorkout = (ex: Exercise) => {
    const quickRoutine: RoutineItem = {
      id: `quick-${ex.id}-${Date.now()}`,
      title: `Tập luyện ${ex.name}`,
      restTimerSeconds: 60,
      createdBy: {
        userId: profile.id,
        username: profile.name,
        avatarUrl: profile.avatar,
      },
      exercises: [
        {
          exercise: {
            id: ex.id,
            name: ex.name,
            nameVi: ex.nameVi,
            targetMuscles: [ex.target_muscle || ex.body_part || ex.category || 'chest'],
            equipment: (ex.equipment || 'bodyweight').toLowerCase() as any,
            type: 'weight_reps',
            gifPlaceholderUrl: ex.gif_url || ex.thumbnail_url,
            description:
              typeof ex.instructions === 'string'
                ? ex.instructions
                : ex.description || ex.name,
          },
          sets: [
            { setNumber: 1, weightKg: 20, reps: 10, isCompleted: false },
            { setNumber: 2, weightKg: 20, reps: 10, isCompleted: false },
            { setNumber: 3, weightKg: 20, reps: 10, isCompleted: false },
          ],
        },
      ],
    };
    startWorkout(quickRoutine);
    router.push('/workout/live');
  };

  const handleOpenDetail = (routine: RoutineItem) => {
    setSelectedRoutineForDetail(routine);
    setViewMode('detail');
  };

  const handleSaveRoutine = (routineData: Omit<RoutineItem, 'id' | 'createdBy'>) => {
    if (editingRoutine && editingRoutine.id) {
      updateRoutine({
        ...editingRoutine,
        ...routineData,
      });
    } else {
      createRoutine({
        ...routineData,
        folderId: routineData.folderId || targetFolderId,
      });
    }
    setViewMode('overview');
    setEditingRoutine(undefined);
    setTargetFolderId(undefined);
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsFolderModalOpen(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      {/* Top Navigation Bar */}
      <TopBar
        user={{
          name: profile.name,
          level: profile.level,
          xp: profile.xp,
          nextLevelXp: profile.maxXp,
          str: 24,
          end: 18,
          mob: 15,
          goal: profile.goal,
        }}
        streak={profile.streak}
        onToggleMobileMenu={toggleMobileNav}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Editor View */}
        {viewMode === 'editor' && (
          <RoutineEditor
            initialRoutine={editingRoutine}
            initialFolderId={targetFolderId}
            onSave={handleSaveRoutine}
            onCancel={() => {
              setViewMode('overview');
              setEditingRoutine(undefined);
              setTargetFolderId(undefined);
            }}
          />
        )}

        {/* Routine Detail View */}
        {viewMode === 'detail' && selectedRoutineForDetail && (
          <RoutineDetailView
            routine={selectedRoutineForDetail}
            onBack={() => setViewMode('overview')}
            onEdit={(r) => handleOpenEditor(r)}
            onDelete={(id) => {
              deleteRoutine(id);
              setViewMode('overview');
            }}
            onStartLive={handleStartLive}
          />
        )}

        {/* Overview View: Weekly Calendar + Folder/Routine Management */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Dumbbell className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF5722]" />
                  <span>Kế hoạch &amp; Routine tập</span>
                </h1>
              </div>

              {/* Action Buttons: Tạo Routine & Tạo Thư mục & Ngân hàng bài tập */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setIsFolderModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FolderPlus className="w-4 h-4 text-slate-500" />
                  <span>Tạo Thư mục</span>
                </button>
                <button
                  onClick={() => setCollectionTab((prev) => (prev === 'exercises' ? 'routines' : 'exercises'))}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    collectionTab === 'exercises'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  <Dumbbell className={`w-4 h-4 ${collectionTab === 'exercises' ? 'text-white' : 'text-[#FF5722]'}`} />
                  <span>Danh sách bài tập (1.324 bài)</span>
                </button>
                <button
                  onClick={() => handleOpenEditor()}
                  className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo Routine mới</span>
                </button>
              </div>
            </div>

            {/* 1. Weekly Schedule Ribbon with 7 Days & Drag-and-Drop */}
            <WeeklyCalendar
              onSelectRoutine={(routine) => handleOpenDetail(routine)}
              onSelectDay={(day) => {
                const r = day.assignedRoutines?.[0] || day.assignedRoutine;
                if (r) handleOpenDetail(r);
              }}
            />

            {/* 2. Folders, Routines & Exercises Collection Section */}
            <div className="space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                {/* Segmented Tab Switcher */}
                <div className="flex items-center p-1 bg-slate-200/80 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setCollectionTab('routines')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                      collectionTab === 'routines'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Bộ sưu tập Routine &amp; Thư mục</span>
                    <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700">
                      {routines.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCollectionTab('exercises')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                      collectionTab === 'exercises'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Dumbbell className="w-4 h-4 text-[#FF5722]" />
                    <span>Danh sách bài tập</span>
                    <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-md bg-orange-100 text-[#FF5722]">
                      1.324 bài
                    </span>
                  </button>
                </div>

                <span className="text-xs font-semibold text-slate-500">
                  {collectionTab === 'routines'
                    ? `${routines.length} routines • ${folders.length} thư mục`
                    : '1.324 bài tập kèm GIF động & AI Pose Check'}
                </span>
              </div>

              {/* View 1: Exercise Catalog */}
              {collectionTab === 'exercises' && (
                <ExerciseCatalogView
                  onAddExerciseToRoutine={handleAddExerciseToRoutine}
                  onStartQuickWorkout={handleStartQuickWorkout}
                />
              )}

              {/* View 2: Routines & Folders */}
              {collectionTab === 'routines' && (
                <>

              {/* Folders List with Routines inside */}
              {folders.map((folder) => {
                const folderRoutines = routines.filter((r) => r.folderId === folder.id);

                return (
                  <div
                    key={folder.id}
                    className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs relative ${
                      openFolderMenuId === folder.id ? 'z-30' : 'z-0'
                    }`}
                  >
                    {/* Collapsible Folder Header */}
                    <div
                      onClick={() => toggleFolder(folder.id)}
                      className={`p-4 sm:p-5 bg-slate-50/70 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/60 transition-colors ${
                        folder.isExpanded ? 'rounded-t-2xl border-b border-slate-100' : 'rounded-2xl'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-slate-500">
                          {folder.isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/80 text-[#FF5722] flex items-center justify-center">
                          {folder.isExpanded ? (
                            <FolderOpen className="w-4 h-4" />
                          ) : (
                            <Folder className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                            {folder.name}
                          </h3>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {folderRoutines.length} routine
                          </span>
                        </div>
                      </div>

                      {/* Folder Actions in MoreVertical (...) dropdown */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFolderMenuId(openFolderMenuId === folder.id ? null : folder.id)}
                          className="p-2 rounded-xl hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Tùy chọn thư mục"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openFolderMenuId === folder.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenFolderMenuId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenFolderMenuId(null);
                                  setRenamingFolder(folder);
                                  setRenameInput(folder.name);
                                }}
                                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Sửa tên thư mục</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenFolderMenuId(null);
                                  if (!folder.isExpanded) {
                                    toggleFolder(folder.id);
                                  }
                                  handleOpenEditor(undefined, folder.id);
                                }}
                                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5 text-slate-500" />
                                <span>Thêm routine</span>
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenFolderMenuId(null);
                                  if (confirm(`Bạn có chắc muốn xóa thư mục "${folder.name}"? Các routine bên trong sẽ được chuyển về mục Chưa phân loại.`)) {
                                    deleteFolder(folder.id);
                                  }
                                }}
                                className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Xóa thư mục</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Folder Routines Grid */}
                    {folder.isExpanded && (
                      <div className="p-4 sm:p-5 rounded-b-2xl">
                        {folderRoutines.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {folderRoutines.map((routine) => (
                              <RoutineCard
                                key={routine.id}
                                routine={routine}
                                onSelect={handleOpenDetail}
                                onEdit={handleOpenEditor}
                                onDelete={deleteRoutine}
                                onDuplicate={duplicateRoutine}
                                onStartLive={handleStartLive}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                            Thư mục trống. Bạn có thể kéo hoặc tạo routine mới vào đây.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Uncategorized Routines */}
              {routines.filter((r) => !r.folderId).length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-slate-400" />
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                        Routine chưa phân loại
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {routines
                      .filter((r) => !r.folderId)
                      .map((routine) => (
                        <RoutineCard
                          key={routine.id}
                          routine={routine}
                          onSelect={handleOpenDetail}
                          onEdit={handleOpenEditor}
                          onDelete={deleteRoutine}
                          onDuplicate={duplicateRoutine}
                          onStartLive={handleStartLive}
                        />
                      ))}
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-base text-slate-900">
                Tạo Thư mục mới
              </h4>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolderSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên thư mục *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Ví dụ: Hạ thể & Bụng..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-[#FF5722] bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold transition-colors"
                >
                  Tạo thư mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {renamingFolder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-base text-slate-900">
                Sửa tên thư mục
              </h4>
              <button
                onClick={() => setRenamingFolder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (renameInput.trim()) {
                  renameFolder(renamingFolder.id, renameInput.trim());
                  setRenamingFolder(null);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên thư mục mới *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  placeholder="Nhập tên mới..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-[#FF5722] bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenamingFolder(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!renameInput.trim()}
                  className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold transition-colors disabled:opacity-50"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Exercise Drawer */}
      <ExerciseDrawer
        isOpen={isExerciseDrawerOpen}
        onClose={() => setIsExerciseDrawerOpen(false)}
        onAddExercise={(ex) => {
          setIsExerciseDrawerOpen(false);
          handleOpenEditor({
            id: '',
            title: `Routine với ${ex.name}`,
            restTimerSeconds: 60,
            createdBy: {
              userId: profile.id,
              username: profile.name,
              avatarUrl: profile.avatar,
            },
            exercises: [
              {
                exercise: {
                  id: ex.id,
                  name: ex.name,
                  nameVi: ex.nameVi,
                  targetMuscles: [ex.target_muscle || ex.body_part || ex.category || 'chest'],
                  equipment: (ex.equipment || 'bodyweight').toLowerCase() as any,
                  type: 'weight_reps',
                  gifPlaceholderUrl: ex.gif_url || ex.thumbnail_url,
                  description:
                    typeof ex.instructions === 'string'
                      ? ex.instructions
                      : ex.description || ex.name,
                },
                sets: [
                  { setNumber: 1, weightKg: 20, reps: 10, isCompleted: false },
                  { setNumber: 2, weightKg: 20, reps: 10, isCompleted: false },
                  { setNumber: 3, weightKg: 20, reps: 10, isCompleted: false },
                ],
              },
            ],
          });
        }}
      />
    </main>
  );
}
