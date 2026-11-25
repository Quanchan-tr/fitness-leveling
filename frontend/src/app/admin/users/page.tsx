'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Ban,
  Edit3,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Trash2,
  Unlock,
  X,
} from 'lucide-react';
import { adminApi, type AdminUser, type PaginationMeta } from '@/lib/adminApi';
import { useAuth } from '@/contexts/AuthContext';
import { AdminPagination } from '@/components/admin/AdminPagination';

type UserStatusFilter = 'all' | 'active' | 'banned' | 'trashed';

interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  goal: string;
  gender: string;
  weight_kg: string;
  height_cm: string;
}

const EMPTY_FORM: UserFormState = {
  name: '',
  email: '',
  password: '',
  role: 'user',
  goal: 'maintain',
  gender: 'male',
  weight_kg: '70',
  height_cm: '175',
};

const STATUS_TABS: Array<{ value: UserStatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'banned', label: 'Bị khóa' },
  { value: 'trashed', label: 'Đã xóa' },
];

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
  });
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sort, setSort] = useState<string>('newest');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers({
        q: debouncedQ || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter,
        sort,
        page,
        per_page: 20,
      });
      setItems(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, roleFilter, statusFilter, sort, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (u: AdminUser) => {
    setEditingUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      goal: u.goal || 'maintain',
      gender: u.gender || 'other',
      weight_kg: u.weight_kg != null ? String(u.weight_kg) : '70',
      height_cm: u.height_cm != null ? String(u.height_cm) : '175',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        goal: form.goal,
        gender: form.gender,
        weight_kg: Number(form.weight_kg) || 70,
        height_cm: Number(form.height_cm) || 175,
      };
      if (form.password.trim()) {
        payload.password = form.password;
      }

      if (editingUser) {
        await adminApi.updateUser(editingUser.id, payload);
      } else {
        await adminApi.createUser(payload);
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Lưu người dùng thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBan = async (u: AdminUser) => {
    const actionLabel = u.banned_at ? 'mở khóa' : 'khóa';
    if (!confirm(`Bạn có chắc muốn ${actionLabel} tài khoản "${u.email}"?`)) return;
    try {
      await adminApi.toggleBanUser(u.id);
      loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Thao tác thất bại.');
    }
  };

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`Xóa mềm tài khoản "${u.email}"? Bạn có thể khôi phục lại trong tab Đã xóa.`)) return;
    try {
      await adminApi.deleteUser(u.id);
      loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa tài khoản.');
    }
  };

  const handleRestore = async (u: AdminUser) => {
    try {
      await adminApi.restoreUser(u.id);
      loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể khôi phục tài khoản.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#111111] tracking-tight">
          Quản lý Người dùng
        </h2>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111111]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-medium text-[#111111] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">Tất cả quyền</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={sort}
            aria-label="Sắp xếp người dùng"
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-medium text-[#111111] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="newest">Sắp xếp: Mới nhất</option>
            <option value="oldest">Sắp xếp: Cũ nhất</option>
            <option value="workouts_desc">Sắp xếp: Tập nhiều nhất</option>
            <option value="name_asc">Sắp xếp: Tên A–Z</option>
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm tên hoặc email..."
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
                  Người dùng
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                  Quyền
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                  Hoạt động
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
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#6B7280]">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#6B7280]">
                    Không tìm thấy tài khoản phù hợp.
                  </td>
                </tr>
              ) : (
                items.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isBanned = Boolean(u.banned_at);
                  const isTrashed = Boolean(u.deleted_at);

                  return (
                    <tr key={u.id} className="hover:bg-[#F8FAFC]/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#111111] flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB]">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#6B7280]">{u.email}</div>
                      </td>

                      <td className="px-4 py-3">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.05em] bg-[#EFF6FF] text-[#2563EB]">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.05em] bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280]">
                            User
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs text-[#6B7280] tabular-nums">
                        <div>
                          <span className="font-semibold text-[#111111]">
                            {u.workout_logs_count ?? 0}
                          </span>{' '}
                          buổi tập •{' '}
                          <span className="font-semibold text-[#111111]">
                            {u.nutrition_logs_count ?? 0}
                          </span>{' '}
                          bữa ăn
                        </div>
                        <div className="mt-0.5">
                          Lv.{u.level ?? 1} • {u.pose_check_sessions_count ?? 0} AI Pose
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {isTrashed ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-[#6B7280]">
                            Đã xóa
                          </span>
                        ) : isBanned ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Bị khóa
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#10B981]">
                            Hoạt động
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {isTrashed ? (
                            <button
                              type="button"
                              onClick={() => handleRestore(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Khôi phục</span>
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditModal(u)}
                                className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#2563EB] hover:border-[#2563EB] cursor-pointer"
                                title="Sửa thông tin"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                disabled={isSelf}
                                onClick={() => handleToggleBan(u)}
                                className={`p-1.5 rounded-lg border border-[#E5E7EB] cursor-pointer disabled:opacity-35 disabled:pointer-events-none ${
                                  isBanned
                                    ? 'text-[#10B981] hover:border-[#10B981]'
                                    : 'text-amber-600 hover:border-amber-500'
                                }`}
                                title={isBanned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                              >
                                {isBanned ? (
                                  <Unlock className="w-3.5 h-3.5" />
                                ) : (
                                  <Ban className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                disabled={isSelf}
                                onClick={() => handleDelete(u)}
                                className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-rose-600 hover:border-rose-300 cursor-pointer disabled:opacity-35 disabled:pointer-events-none"
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

        <AdminPagination meta={meta} onPageChange={setPage} disabled={loading} />
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#111111]">
                {editingUser ? 'Cập nhật tài khoản' : 'Thêm người dùng mới'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111111] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Họ tên *
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
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-sm text-[#111111] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    {editingUser ? 'Mật khẩu mới (bỏ trống nếu giữ nguyên)' : 'Mật khẩu *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Tối thiểu 8 ký tự"
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-sm text-[#111111] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Phân quyền
                  </label>
                  <select
                    value={form.role}
                    disabled={editingUser?.id === currentUser?.id}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value as 'user' | 'admin' })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-sm text-[#111111] focus:outline-none focus:border-[#2563EB] disabled:opacity-60"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Mục tiêu
                  </label>
                  <select
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                  >
                    <option value="maintain">Duy trì</option>
                    <option value="gain_muscle">Tăng cơ</option>
                    <option value="lose_weight">Giảm cân</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Giới tính
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111]"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.weight_kg}
                    onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.height_cm}
                    onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111] tabular-nums"
                  />
                </div>
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
                  {saving ? 'Đang lưu...' : editingUser ? 'Lưu thay đổi' : 'Tạo người dùng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
