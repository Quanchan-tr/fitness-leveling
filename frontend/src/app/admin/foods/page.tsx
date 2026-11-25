'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Edit3, Plus, RotateCcw, Search, Trash2, Utensils, X } from 'lucide-react';
import { adminApi, type AdminFood, type PaginationMeta } from '@/lib/adminApi';
import { AdminPagination } from '@/components/admin/AdminPagination';

interface FoodFormState {
  name: string;
  name_en: string;
  category: string;
  item_type: 'DISH' | 'RAW';
  serving_size: string;
  serving_weight_g: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  image_url: string;
  tags: string;
  description: string;
}

const EMPTY_FORM: FoodFormState = {
  name: '',
  name_en: '',
  category: 'Món mặn',
  item_type: 'DISH',
  serving_size: '1 phần',
  serving_weight_g: '200',
  calories: '250',
  protein: '20',
  carbs: '25',
  fat: '8',
  fiber: '2',
  image_url: '',
  tags: '',
  description: '',
};

export default function AdminFoodsPage() {
  const [foods, setFoods] = useState<AdminFood[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
  });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [itemType, setItemType] = useState('ALL');
  const [showTrashed, setShowTrashed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminFood | null>(null);
  const [form, setForm] = useState<FoodFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadFoods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getFoods({
        q: debouncedQ || undefined,
        item_type: itemType,
        trashed: showTrashed ? 'only' : undefined,
        page,
        per_page: 20,
      });
      setFoods(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải kho món ăn.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, itemType, showTrashed, page]);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  const openCreateModal = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setPreviewFailed(false);
    setModalOpen(true);
  };

  const openEditModal = (food: AdminFood) => {
    setEditing(food);
    setForm({
      name: food.name,
      name_en: food.name_en || '',
      category: food.category,
      item_type: food.item_type || 'DISH',
      serving_size: food.serving_size,
      serving_weight_g: food.serving_weight_g != null ? String(food.serving_weight_g) : '',
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
      fiber: String(food.fiber ?? 0),
      image_url: food.image_url || '',
      tags: (food.tags || []).join(', '),
      description: food.description || '',
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
        name_en: form.name_en.trim() || null,
        category: form.category.trim(),
        item_type: form.item_type,
        serving_size: form.serving_size.trim(),
        serving_weight_g: form.serving_weight_g ? Number(form.serving_weight_g) : null,
        calories: Math.max(0, Math.round(Number(form.calories) || 0)),
        protein: Math.max(0, Number(form.protein) || 0),
        carbs: Math.max(0, Number(form.carbs) || 0),
        fat: Math.max(0, Number(form.fat) || 0),
        fiber: Math.max(0, Number(form.fiber) || 0),
        image_url: form.image_url.trim() || null,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        description: form.description.trim() || null,
      };
      if (editing) {
        await adminApi.updateFood(editing.id, payload);
      } else {
        await adminApi.createFood(payload);
      }
      setModalOpen(false);
      loadFoods();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Lưu món ăn thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (food: AdminFood) => {
    if (!confirm(`Xóa mềm món "${food.name}"?`)) return;
    try {
      await adminApi.deleteFood(food.id);
      loadFoods();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa món ăn.');
    }
  };

  const handleRestore = async (food: AdminFood) => {
    try {
      await adminApi.restoreFood(food.id);
      loadFoods();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể khôi phục món ăn.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#111111] tracking-tight">
            Kho Món ăn &amp; Dinh dưỡng
          </h2>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Cập nhật trực tiếp danh sách món ăn đồng bộ tức thì tới Web và Mobile.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm món ăn</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowTrashed(false);
              setPage(1);
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
              setPage(1);
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
            value={itemType}
            onChange={(e) => {
              setItemType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-medium text-[#111111]"
          >
            <option value="ALL">Tất cả loại</option>
            <option value="DISH">Món chế biến (DISH)</option>
            <option value="RAW">Nguyên liệu (RAW)</option>
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm món ăn (có hoặc không dấu)..."
              className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl overflow-hidden">
        {error && (
          <div className="p-4 text-sm text-rose-600 bg-rose-50 border-b border-[#E5E7EB]">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                  Món ăn
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                  Danh mục &amp; Loại
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                  Khẩu phần
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                  Calo &amp; Macro
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#6B7280]">
                    Đang tải danh sách món ăn...
                  </td>
                </tr>
              ) : foods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#6B7280]">
                    Không tìm thấy món ăn phù hợp.
                  </td>
                </tr>
              ) : (
                foods.map((food) => (
                  <tr key={food.id} className="hover:bg-[#F8FAFC]/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {food.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={food.image_url}
                            alt={food.name}
                            className="w-10 h-10 rounded-lg object-cover border border-[#E5E7EB] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-center text-[#6B7280] shrink-0">
                            <Utensils className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-[#111111] truncate max-w-xs">
                            {food.name}
                          </div>
                          {food.name_en && (
                            <div className="text-xs text-[#6B7280] truncate max-w-xs">
                              {food.name_en}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      <div className="font-medium text-[#111111]">{food.category}</div>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB]">
                        {food.item_type}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-[#6B7280] tabular-nums">
                      <div className="text-[#111111] font-medium">{food.serving_size}</div>
                      {food.serving_weight_g && <div>{food.serving_weight_g}g</div>}
                    </td>

                    <td className="px-4 py-3 text-xs tabular-nums">
                      <div className="font-bold text-[#111111]">{food.calories} kcal</div>
                      <div className="text-[#6B7280]">
                        P {food.protein}g • C {food.carbs}g • F {food.fat}g
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {food.deleted_at ? (
                          <button
                            type="button"
                            onClick={() => handleRestore(food)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Khôi phục</span>
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(food)}
                              className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#2563EB] hover:border-[#2563EB] cursor-pointer"
                              title="Sửa món ăn"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(food)}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination meta={meta} onPageChange={setPage} disabled={loading} />
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#111111]">
                {editing ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}
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
                    Tên món ăn *
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
                    Tên tiếng Anh
                  </label>
                  <input
                    value={form.name_en}
                    onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-sm text-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Danh mục *
                  </label>
                  <input
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Loại
                  </label>
                  <select
                    value={form.item_type}
                    onChange={(e) =>
                      setForm({ ...form, item_type: e.target.value as 'DISH' | 'RAW' })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                  >
                    <option value="DISH">Món chế biến</option>
                    <option value="RAW">Nguyên liệu thô</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Khẩu phần *
                  </label>
                  <input
                    required
                    value={form.serving_size}
                    onChange={(e) => setForm({ ...form, serving_size: e.target.value })}
                    placeholder="1 phần, 100g..."
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Khối lượng (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.serving_weight_g}
                    onChange={(e) => setForm({ ...form, serving_weight_g: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111] tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Calo (kcal) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.calories}
                    onChange={(e) => setForm({ ...form, calories: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Đạm (g) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.protein}
                    onChange={(e) => setForm({ ...form, protein: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Carb (g) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.carbs}
                    onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Béo (g) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.fat}
                    onChange={(e) => setForm({ ...form, fat: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Chất xơ (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.fiber}
                    onChange={(e) => setForm({ ...form, fiber: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111] tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Link ảnh món ăn (URL)
                  </label>
                  <input
                    value={form.image_url}
                    onChange={(e) => {
                      setPreviewFailed(false);
                      setForm({ ...form, image_url: e.target.value });
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Tags (cách nhau bằng dấu phẩy)
                  </label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="Giàu đạm, Bữa trưa, Eat clean"
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                  />
                </div>
              </div>

              {form.image_url.trim() && (
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center gap-3">
                  {previewFailed ? (
                    <span className="text-xs text-[#6B7280]">Không tải được ảnh từ URL này.</span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.image_url.trim()}
                      alt="Xem trước món ăn"
                      onError={() => setPreviewFailed(true)}
                      className="w-16 h-16 rounded-lg object-cover border border-[#E5E7EB]"
                    />
                  )}
                  <span className="text-xs text-[#6B7280] break-all">{form.image_url.trim()}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Mô tả món ăn
                </label>
                <textarea
                  rows={2}
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
                  {saving ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Thêm món ăn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
