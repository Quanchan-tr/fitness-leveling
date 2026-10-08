'use strict';
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Flag,
  Copy,
  ShieldCheck,
  Video,
  Star,
  Bookmark,
  ChevronRight,
  Check,
  Dumbbell,
} from 'lucide-react';
import { ExercisePostItem } from '@/types/community';

interface ExercisePostProps {
  post: ExercisePostItem;
  onRate: (postId: string, rating: number) => void;
  onToggleSave: (postId: string) => void;
  onOpenReport: (post: ExercisePostItem) => void;
  onOpenDetails: (post: ExercisePostItem) => void;
}

export const ExercisePost: React.FC<ExercisePostProps> = ({
  post,
  onRate,
  onToggleSave,
  onOpenReport,
  onOpenDetails,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/community#${post.id}`);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
      setIsMenuOpen(false);
    }, 1500);
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : (post.userRating || 0);

  return (
    <article className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col space-y-3.5">
      {/* 1. User Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
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

          {/* User Name & Timestamp */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 hover:text-[#FF5722] transition-colors cursor-pointer">
                {post.author.name}
              </span>
              {post.author.verified && (
                <span title="Thành viên đã xác minh">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </span>
              )}
              {post.author.level && (
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-semibold tabular-nums">
                  Lv.{post.author.level}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              {post.author.handle && <span>{post.author.handle}</span>}
              {post.author.handle && <span>•</span>}
              <span>{post.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Tùy chọn bài viết"
            aria-label="Tùy chọn bài viết"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 text-xs">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-800 flex items-center gap-2 font-medium transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Đã sao chép link' : 'Sao chép liên kết'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenReport(post);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium transition-colors border-t border-slate-100 cursor-pointer"
              >
                <Flag className="w-4 h-4" />
                <span>Báo cáo bài viết</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Exercise Title, Tags, Badges & Description */}
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3
              onClick={() => onOpenDetails(post)}
              className="text-base font-bold text-slate-900 tracking-tight hover:text-[#FF5722] cursor-pointer transition-colors"
            >
              {post.name}
            </h3>
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
              {post.tags ? post.tags.join(' • ') : `${post.muscleGroup} • ${post.equipment} • ${post.difficulty}`}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {post.verified && (
              <span
                className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                title="Đã được xác minh kỹ thuật bởi FitnessLeveling"
              >
                <ShieldCheck className="w-3 h-3" />
                Chuẩn form
              </span>
            )}
            {post.hasPoseCheck && (
              <span
                className="flex items-center gap-1 bg-orange-50 text-[#FF5722] text-[10px] font-semibold px-2 py-0.5 rounded border border-orange-200"
                title="Có hỗ trợ AI Pose Check"
              >
                <Video className="w-3 h-3" />
                AI Pose Check
              </span>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {post.description}
        </p>
      </div>

      {/* 3. Media Placeholder / Exercise Thumbnail */}
      {post.mediaUrl ? (
        <div
          onClick={() => onOpenDetails(post)}
          className="rounded-lg overflow-hidden border border-slate-200 bg-slate-950 aspect-video max-h-80 cursor-pointer group relative"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.mediaUrl}
            alt={post.name}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
          {post.hasPoseCheck && (
            <div className="absolute top-3 left-3 bg-black/75 text-white px-2.5 py-1 rounded text-[10px] font-semibold flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>Hỗ trợ nhận diện 3D</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => onOpenDetails(post)}
          className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white rounded text-slate-700 border border-slate-200">
              <Dumbbell className="w-4 h-4 text-[#FF5722]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">Xem phân tích kỹ thuật form</div>
              <div className="text-[11px] text-slate-400">Xem góc khớp và lưu ý từng set</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      )}

      {/* 4. Action and Interaction Bar */}
      <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        {/* Rating Interaction */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
            <span className="text-[#FF5722] font-black text-sm tabular-nums">{post.avgRating.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400 font-normal tabular-nums">
              ({post.ratingCount} đánh giá)
            </span>
          </div>

          <div className="h-3.5 w-[1px] bg-slate-200 mx-1" />

          {/* Interactive Stars */}
          <div
            className="flex items-center gap-0.5"
            onMouseLeave={() => setHoverRating(null)}
            role="radiogroup"
            aria-label="Đánh giá bài tập"
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = currentDisplayRating >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => onRate(post.id, star)}
                  onMouseEnter={() => setHoverRating(star)}
                  className="p-0.5 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors cursor-pointer"
                  title={`Đánh giá ${star} sao`}
                  aria-label={`${star} sao`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {post.userRating && (
            <span className="text-[11px] text-emerald-700 font-semibold ml-1 hidden sm:inline tabular-nums">
              Đã chấm {post.userRating}★
            </span>
          )}
        </div>

        {/* Buttons: Save & View Details */}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => onToggleSave(post.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
              post.isSaved
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title={post.isSaved ? 'Đã lưu vào kho bài tập' : 'Lưu vào bài tập của tôi'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${post.isSaved ? 'fill-white' : ''}`} />
            <span>{post.isSaved ? 'Đã lưu' : 'Lưu'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenDetails(post)}
            className="bg-slate-50 hover:bg-[#FF5722] hover:text-white text-slate-700 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 border border-slate-200 hover:border-[#FF5722] cursor-pointer"
          >
            <span>Chi tiết</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
