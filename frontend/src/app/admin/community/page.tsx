'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquare, RotateCcw, Search, Trash2, Users } from 'lucide-react';
import {
  adminApi,
  type AdminCommunityComment,
  type AdminCommunityPost,
  type PaginationMeta,
} from '@/lib/adminApi';
import { AdminPagination } from '@/components/admin/AdminPagination';

type CommunityTab = 'posts' | 'comments';

export default function AdminCommunityPage() {
  const [tab, setTab] = useState<CommunityTab>('posts');
  const [posts, setPosts] = useState<AdminCommunityPost[]>([]);
  const [comments, setComments] = useState<AdminCommunityComment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
  });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [showTrashed, setShowTrashed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        q: debouncedQ || undefined,
        trashed: showTrashed ? 'only' : undefined,
        page,
        per_page: 20,
      };
      if (tab === 'posts') {
        const res = await adminApi.getCommunityPosts(params);
        setPosts(res.data);
        setMeta(res.meta);
      } else {
        const res = await adminApi.getCommunityComments(params);
        setComments(res.data);
        setMeta(res.meta);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu cộng đồng.');
    } finally {
      setLoading(false);
    }
  }, [tab, debouncedQ, showTrashed, page]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDeletePost = async (id: string) => {
    if (!confirm('Xóa mềm bài viết vi phạm này?')) return;
    try {
      await adminApi.deleteCommunityPost(id);
      loadItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa bài viết.');
    }
  };

  const handleRestorePost = async (id: string) => {
    try {
      await adminApi.restoreCommunityPost(id);
      loadItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể khôi phục bài viết.');
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm('Xóa mềm bình luận vi phạm này?')) return;
    try {
      await adminApi.deleteCommunityComment(id);
      loadItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa bình luận.');
    }
  };

  const handleRestoreComment = async (id: string) => {
    try {
      await adminApi.restoreCommunityComment(id);
      loadItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể khôi phục bình luận.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#111111] tracking-tight">
          Kiểm duyệt Cộng đồng
        </h2>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Giám sát bài viết và bình luận từ người dùng, xóa mềm nội dung vi phạm hoặc khôi phục.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setTab('posts');
            setPage(1);
          }}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            tab === 'posts'
              ? 'bg-[#2563EB] text-white'
              : 'text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111111]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Bài viết</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab('comments');
            setPage(1);
          }}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            tab === 'comments'
              ? 'bg-[#2563EB] text-white'
              : 'text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111111]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Bình luận</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

        <div className="relative">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm nội dung hoặc tác giả..."
            className="w-full sm:w-72 pl-9 pr-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* List Card */}
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
                  Tác giả
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                  Nội dung
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                  {tab === 'posts' ? 'Tương tác' : 'Thuộc bài viết'}
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
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : tab === 'posts' ? (
                posts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-[#6B7280]">
                      Không có bài viết nào.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-[#F8FAFC]/70">
                      <td className="px-4 py-3 text-xs">
                        <div className="font-semibold text-[#111111]">
                          {post.user?.name || '—'}
                        </div>
                        <div className="text-[#6B7280]">{post.user?.email || ''}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#111111] max-w-md">
                        <p className="line-clamp-3 leading-relaxed">{post.content}</p>
                        <span className="text-[11px] text-[#6B7280] mt-1 block">
                          {new Date(post.created_at).toLocaleString('vi-VN')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6B7280] tabular-nums">
                        {post.likes_count} thích • {post.comments_count} bình luận
                      </td>
                      <td className="px-4 py-3 text-right">
                        {post.deleted_at ? (
                          <button
                            type="button"
                            onClick={() => handleRestorePost(post.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Khôi phục</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa mềm</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[#6B7280]">
                    Không có bình luận nào.
                  </td>
                </tr>
              ) : (
                comments.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8FAFC]/70">
                    <td className="px-4 py-3 text-xs">
                      <div className="font-semibold text-[#111111]">
                        {c.user?.name || '—'}
                      </div>
                      <div className="text-[#6B7280]">{c.user?.email || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#111111] max-w-md">
                      <p className="line-clamp-3 leading-relaxed">{c.content}</p>
                      <span className="text-[11px] text-[#6B7280] mt-1 block">
                        {new Date(c.created_at).toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280] max-w-xs">
                      <p className="truncate">{c.post?.content || 'Bài viết không còn'}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.deleted_at ? (
                        <button
                          type="button"
                          onClick={() => handleRestoreComment(c.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Khôi phục</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa mềm</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination meta={meta} onPageChange={setPage} disabled={loading} />
      </div>
    </div>
  );
}
