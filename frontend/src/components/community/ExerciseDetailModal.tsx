'use strict';
'use client';

import React from 'react';
import {
  X,
  ShieldCheck,
  Video,
  Star,
  Bookmark,
  Dumbbell,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ExercisePostItem } from '@/types/community';

interface ExerciseDetailModalProps {
  post: ExercisePostItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSave: (postId: string) => void;
  onRate: (postId: string, rating: number) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onToggleSave,
  onRate,
}) => {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto transition-opacity">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl relative my-auto text-slate-900 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden shrink-0">
              {post.author.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                post.author.name.slice(0, 1).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">{post.author.name}</span>
                {post.author.verified && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                {post.author.level && (
                  <span className="text-[10px] text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded font-bold">
                    Lv.{post.author.level}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">{post.timestamp}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Title and Badges */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{post.name}</h2>
              <div className="flex items-center gap-1.5 shrink-0">
                {post.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Chuẩn form
                  </span>
                )}
                {post.hasPoseCheck && (
                  <span className="flex items-center gap-1 bg-orange-50 text-[#FF5722] text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-200">
                    <Video className="w-3.5 h-3.5" />
                    AI Pose Check
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
              {post.tags ? post.tags.join(' • ') : `${post.muscleGroup} • ${post.equipment} • ${post.difficulty}`}
            </div>
          </div>

          {/* Media preview */}
          {post.mediaUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-video max-h-72 bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.mediaUrl}
                alt={post.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Hướng dẫn kỹ thuật &amp; Mô tả
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {post.description}
            </p>
          </div>

          {/* Form Check Tips */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Điểm kiểm tra kỹ thuật AI (Pose Check Points)
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Góc khớp chuẩn theo dữ liệu huấn luyện viên chuyên nghiệp</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200">
                <Dumbbell className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Hít thở đều đặn và kiểm soát giai đoạn Eccentric (hạ tạ chậm 2-3s)</span>
              </div>
            </div>
          </div>

          {/* Rating overview */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <div>
                <div className="font-black text-sm text-slate-900 tabular-nums">
                  {post.avgRating.toFixed(1)} / 5.0
                </div>
                <div className="text-[11px] text-slate-400 font-medium tabular-nums">
                  {post.ratingCount} lượt đánh giá từ cộng đồng
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => onRate(post.id, s)}
                  className="p-1 hover:scale-125 transition-transform text-slate-300 hover:text-amber-400 cursor-pointer"
                  title={`Đánh giá ${s} sao`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      (post.userRating || 0) >= s
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => onToggleSave(post.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              post.isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-white' : ''}`} />
            <span>{post.isSaved ? 'Đã lưu trong kho bài tập' : 'Lưu bài tập'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
