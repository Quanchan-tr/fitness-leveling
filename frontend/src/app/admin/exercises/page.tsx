'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Check,
  Dumbbell,
  Edit3,
  EyeOff,
  Flag,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  adminApi,
  type AdminExercise,
  type AdminExerciseReport,
  type PaginationMeta,
} from '@/lib/adminApi';
import { AdminPagination } from '@/components/admin/AdminPagination';

type ExerciseTab = 'catalog' | 'pending' | 'reports';

interface ExerciseFormState {
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'active' | 'under_review' | 'rejected';
  has_pose_check: boolean;
  pose_rules_key: string;
  thumbnail_url: string;
  gif_url: string;
  video_url: string;
  description: string;
}

const EMPTY_FORM: ExerciseFormState = {
  name: '',
  muscle_group: 'chest',
  equipment: 'body weight',
  difficulty: 'beginner',
  status: 'active',
  has_pose_check: false,
  pose_rules_key: '',
  thumbnail_url: '',
  gif_url: '',
  video_url: '',
  description: '',
};

const REASON_LABELS: Record<string, string> = {
  incorrect_form: 'Kỹ thuật sai lệch, dễ chấn thương',
  misleading_tags: 'Gắn sai nhóm cơ / thông tin',
  inappropriate: 'Hình ảnh / Video không phù hợp',
  spam: 'Spam hoặc trùng lặp',
  other: 'Lý do khác',
};

export default function AdminExercisesPage() {
  const [activeTab, setActiveTab] = useState<ExerciseTab>('catalog');

  // Catalog & Pending state
  const [exercises, setExercises] = useState<AdminExercise[]>([]);
  const [exMeta, setExMeta] = useState<PaginationMeta>({
    page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
  });
  const [exPage, setExPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showTrashed, setShowTrashed] = useState(false);

  // Reports state
  const [reports, setReports] = useState<AdminExerciseReport[]>([]);
  const [repMeta, setRepMeta] = useState<PaginationMeta>({
    page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
  });
  const [repPage, setRepPage] = useState(1);
  const [reportStatus, setReportStatus] = useState('pending');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminExercise | null>(null);
  const [form, setForm] = useState<ExerciseFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(searchInput.trim());
      setExPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'reports') {
        const res = await adminApi.getExerciseReports({
          status: reportStatus,
          page: repPage,
          per_page: 20,
        });
        setReports(res.data);
        setRepMeta(res.meta);
      } else {
        const res = await adminApi.getExercises({
          q: activeTab === 'catalog' ? debouncedQ || undefined : undefined,
          category:
            activeTab === 'catalog' && categoryFilter !== 'all' ? categoryFilter : undefined,
          status: activeTab === 'pending' ? 'under_review' : 'all',
          trashed: activeTab === 'catalog' && showTrashed ? 'only' : undefined,
          page: exPage,
          per_page: 20,
        });
        setExercises(res.data);
        setExMeta(res.meta);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu bài tập.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedQ, categoryFilter, showTrashed, exPage, reportStatus, repPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setPreviewFailed(false);
    setModalOpen(true);
  };

  const openEditModal = (ex: AdminExercise) => {
    setEditing(ex);
    setForm({
      name: ex.name,
      muscle_group: ex.muscle_group || 'chest',
      equipment: ex.equipment || 'body weight',
      difficulty: ex.difficulty || 'beginner',
      status: ex.status || 'active',
      has_pose_check: Boolean(ex.has_pose_check),
      pose_rules_key: ex.pose_rules_key || '',
      thumbnail_url: ex.thumbnail_url || '',
      gif_url: ex.gif_url || '',
      video_url: ex.video_url || '',
      description: ex.description || '',
    });
    setFormError(null);
    setPreviewFailed(false);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name.trim(),
        muscle_group: form.muscle_group.trim(),
        equipment: form.equipment.trim() || null,
        difficulty: form.difficulty,
        status: form.status,
        has_pose_check: form.has_pose_check,
        pose_rules_key: form.pose_rules_key.trim() || null,
        thumbnail_url: form.thumbnail_url.trim() || null,
        gif_url: form.gif_url.trim() || null,
        video_url: form.video_url.trim() || null,
        description: form.description.trim() || null,
      };
      if (editing) {
        await adminApi.updateExercise(editing.id, payload);
      } else {
        await adminApi.createExercise(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Lưu bài tập thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleModerate = async (id: string, status: 'active' | 'rejected') => {
    try {
      await adminApi.updateExercise(id, {
        status,
        verified: status === 'active',
      });
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Thao tác duyệt thất bại.');
    }
  };

  const handleDelete = async (ex: AdminExercise) => {
    if (!confirm(`Xóa mềm bài tập "${ex.name}"?`)) return;
    try {
      await adminApi.deleteExercise(ex.id);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa bài tập.');
    }
  };

  const handleRestore = async (ex: AdminExercise) => {
    try {
      await adminApi.restoreExercise(ex.id);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể khôi phục bài tập.');
    }
  };

  const handleResolveReport = async (
    rep: AdminExerciseReport,
    action: 'dismiss' | 'resolve_and_hide'
  ) => {
    if (
      action === 'resolve_and_hide' &&
      !confirm(`Ẩn & xóa mềm bài tập "${rep.exercise?.name || 'này'}"?`)
    ) {
      return;
    }
    try {
      await adminApi.resolveExerciseReport(rep.id, action);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xử lý báo cáo.');
    }
  };

  const previewUrl = form.gif_url.trim() || form.thumbnail_url.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#111111] tracking-tight">
          Kho Bài tập &amp; Kiểm duyệt
        </h2>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm bài tập</span>
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-2 flex flex-wrap gap-2">
        {(
          [
            { id: 'catalog', label: 'Kho bài tập', icon: Dumbbell },
            { id: 'pending', label: 'Chờ duyệt', icon: Check },
            { id: 'reports', label: 'Báo cáo lỗi', icon: Flag },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setExPage(1);
                setRepPage(1);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                active
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111111]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Catalog Filters */}
      {activeTab === 'catalog' && (
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowTrashed(false);
                setExPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                !showTrashed ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#6B7280] hover:bg-[#F8FAFC]'
              }`}
            >
              Đang hiển thị
            </button>
            <button
              type="button"
              onClick={() => {
                setShowTrashed(true);
                setExPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                showTrashed ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#6B7280] hover:bg-[#F8FAFC]'
              }`}
            >
              Đã xóa
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setExPage(1);
              }}
              className="px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-medium text-[#111111]"
            >
              <option value="all">Tất cả nhóm cơ</option>
              <option value="chest">Chest (Ngực)</option>
              <option value="back">Back (Lưng)</option>
              <option value="legs">Legs (Chân)</option>
              <option value="shoulders">Shoulders (Vai)</option>
              <option value="core">Core (Bụng)</option>
            </select>

            <div className="relative">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm tên bài tập..."
                className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reports Filter */}
      {activeTab === 'reports' && (
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 flex flex-wrap gap-2">
          {[
            { value: 'pending', label: 'Chờ xử lý' },
            { value: 'resolved', label: 'Đã ẩn bài' },
            { value: 'dismissed', label: 'Đã bỏ qua' },
            { value: 'all', label: 'Tất cả' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setReportStatus(opt.value);
                setRepPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                reportStatus === opt.value
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'text-[#6B7280] hover:bg-[#F8FAFC]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl overflow-hidden">
        {error && (
          <div className="p-4 text-sm text-rose-600 bg-rose-50 border-b border-[#E5E7EB]">
            {error}
          </div>
        )}

        {activeTab === 'reports' ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                      Bài tập bị báo cáo
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                      Người báo cáo
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                      Lý do &amp; Chi tiết
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                      Xử lý
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-[#6B7280]">
                        Đang tải báo cáo...
                      </td>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-[#6B7280]">
                        Không có báo cáo nào trong mục này.
                      </td>
                    </tr>
                  ) : (
                    reports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-[#F8FAFC]/70">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-[#111111]">
                            {rep.exercise?.name || 'Bài tập không xác định'}
                          </div>
                          <div className="text-xs text-[#6B7280]">
                            {rep.exercise?.muscle_group || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#6B7280]">
                          <div className="font-semibold text-[#111111]">
                            {rep.reporter?.name || '—'}
                          </div>
                          <div>{rep.reporter?.email || ''}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="font-semibold text-[#111111]">
                            {REASON_LABELS[rep.reason] || rep.reason}
                          </div>
                          {rep.detail && (
                            <p className="text-[#6B7280] mt-0.5 max-w-xs line-clamp-2">
                              {rep.detail}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full font-semibold ${
                              rep.status === 'pending'
                                ? 'bg-amber-50 text-amber-700'
                                : rep.status === 'resolved'
                                ? 'bg-emerald-50 text-[#10B981]'
                                : 'bg-slate-100 text-[#6B7280]'
                            }`}
                          >
                            {rep.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {rep.status === 'pending' && (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleResolveReport(rep, 'dismiss')}
                                className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-[#6B7280] hover:text-[#111111] cursor-pointer"
                              >
                                Bỏ qua
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResolveReport(rep, 'resolve_and_hide')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Ẩn bài</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <AdminPagination meta={repMeta} onPageChange={setRepPage} disabled={loading} />
          </>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                      Bài tập
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                      Nhóm cơ &amp; Dụng cụ
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-[#6B7280]">
                        Đang tải kho bài tập...
                      </td>
                    </tr>
                  ) : exercises.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-[#6B7280]">
                        Không có bài tập nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    exercises.map((ex) => {
                      const img = ex.thumbnail_url || ex.gif_url;
                      return (
                        <tr key={ex.id} className="hover:bg-[#F8FAFC]/70">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {img ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={img}
                                  alt={ex.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-[#E5E7EB] bg-[#F8FAFC] shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-center text-[#6B7280] shrink-0">
                                  <Dumbbell className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-[#111111] truncate max-w-xs">
                                  {ex.name}
                                </div>
                                <div className="text-xs text-[#6B7280] flex items-center gap-2">
                                  <span>{ex.difficulty}</span>
                                  {ex.has_pose_check && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] text-[10px] font-semibold">
                                      AI Pose
                                    </span>
                                  )}
                                  {ex.creator && (
                                    <span className="truncate">• bởi {ex.creator.name}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-xs text-[#6B7280]">
                            <div className="font-semibold text-[#111111]">
                              {ex.muscle_group || ex.body_part || '—'}
                            </div>
                            <div>{ex.equipment || 'body weight'}</div>
                          </td>

                          <td className="px-4 py-3 text-xs">
                            {ex.deleted_at ? (
                              <span className="inline-flex px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-[#6B7280]">
                                Đã xóa
                              </span>
                            ) : ex.status === 'active' ? (
                              <span className="inline-flex px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-[#10B981]">
                                Hoạt động
                              </span>
                            ) : ex.status === 'under_review' ? (
                              <span className="inline-flex px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700">
                                Chờ duyệt
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-0.5 rounded-full font-semibold bg-rose-50 text-rose-700">
                                Từ chối
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {ex.deleted_at ? (
                                <button
                                  type="button"
                                  onClick={() => handleRestore(ex)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Khôi phục</span>
                                </button>
                              ) : activeTab === 'pending' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleModerate(ex.id, 'active')}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleModerate(ex.id, 'rejected')}
                                    className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  >
                                    Từ chối
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(ex)}
                                    className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#2563EB] cursor-pointer"
                                    title="Xem / Sửa"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(ex)}
                                    className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#2563EB] hover:border-[#2563EB] cursor-pointer"
                                    title="Sửa bài tập"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(ex)}
                                    className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-rose-600 hover:border-rose-300 cursor-pointer"
                                    title="Xóa mềm"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <AdminPagination meta={exMeta} onPageChange={setExPage} disabled={loading} />
          </>
        )}
      </div>

      {/* Create / Edit Exercise Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#111111]">
                {editing ? 'Cập nhật bài tập' : 'Thêm bài tập mới'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F8FAFC] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Tên bài tập *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-sm text-[#111111] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Nhóm cơ *
                  </label>
                  <input
                    required
                    value={form.muscle_group}
                    onChange={(e) => setForm({ ...form, muscle_group: e.target.value })}
                    placeholder="chest, back, legs..."
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-sm text-[#111111] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Dụng cụ
                  </label>
                  <input
                    value={form.equipment}
                    onChange={(e) => setForm({ ...form, equipment: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Độ khó
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        difficulty: e.target.value as ExerciseFormState['difficulty'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                  >
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung bình</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as ExerciseFormState['status'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="under_review">Chờ duyệt</option>
                    <option value="rejected">Từ chối</option>
                  </select>
                </div>
              </div>

              {/* Media URL inputs + Live Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Thumbnail URL
                  </label>
                  <input
                    value={form.thumbnail_url}
                    onChange={(e) => {
                      setPreviewFailed(false);
                      setForm({ ...form, thumbnail_url: e.target.value });
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    GIF URL
                  </label>
                  <input
                    value={form.gif_url}
                    onChange={(e) => {
                      setPreviewFailed(false);
                      setForm({ ...form, gif_url: e.target.value });
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Video URL
                  </label>
                  <input
                    value={form.video_url}
                    onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                  />
                </div>
              </div>

              {previewUrl && (
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center gap-3">
                  {previewFailed ? (
                    <span className="text-xs text-[#6B7280]">
                      Không tải được ảnh xem trước từ URL này.
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Xem trước minh họa"
                      onError={() => setPreviewFailed(true)}
                      className="w-20 h-20 rounded-lg object-cover border border-[#E5E7EB] bg-[#FFFFFF]"
                    />
                  )}
                  <div className="text-xs text-[#6B7280] break-all">
                    Xem trước từ URL: <span className="text-[#111111]">{previewUrl}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#111111] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.has_pose_check}
                    onChange={(e) => setForm({ ...form, has_pose_check: e.target.checked })}
                    className="rounded border-[#E5E7EB] text-[#2563EB]"
                  />
                  <span>Hỗ trợ AI Pose Check</span>
                </label>

                {form.has_pose_check && (
                  <input
                    value={form.pose_rules_key}
                    onChange={(e) => setForm({ ...form, pose_rules_key: e.target.value })}
                    placeholder="pose_rules_key (vd: squat, pushup, plank)"
                    className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Mô tả / Hướng dẫn
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                />
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#6B7280] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Tạo bài tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
