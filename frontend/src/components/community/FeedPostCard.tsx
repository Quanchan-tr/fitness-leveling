'use strict';
'use client';

import React, { useState } from 'react';
import { CommunityPost, RoutineItem } from '@/types/fitnessleveling.types';
import { useFitness } from '@/contexts/FitnessContext';
import {
  Heart,
  MessageCircle,
  Share2,
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Check,
  Flame,
  Award,
  Video,
  Send,
  Folder,
  FolderPlus,
  X,
  Plus,
} from 'lucide-react';

interface FeedPostCardProps {
  post: CommunityPost;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({ post }) => {
  const { toggleLikePost, addComment, cloneRoutine, folders, createFolder } = useFitness();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [clonedSuccess, setClonedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Folder selection modal state for saving routine
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(''); // '' = uncategorized
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const images = post.images || [];
  const hasMultipleImages = images.length > 1;

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleConfirmSaveRoutine = () => {
    if (post.attachedRoutine) {
      cloneRoutine(post.attachedRoutine, selectedFolderId ? selectedFolderId : undefined);
      setClonedSuccess(true);
      setIsSaveModalOpen(false);
      setTimeout(() => setClonedSuccess(false), 3000);
    }
  };

  const handleInlineCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/community#${post.id}`).catch(() => {});
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentInput.trim()) {
      addComment(post.id, commentInput.trim());
      setCommentInput('');
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden select-none space-y-4 p-5">
      {/* 1. Header (Author Avatar, Name, Level Badge, Post Time) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-11 h-11 rounded-xl object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900">
                {post.author.name}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white tabular-nums">
                Lv. {post.author.level}
              </span>
              {post.author.badge && (
                <span className="text-[10px] font-semibold text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
                  {post.author.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {post.createdAt}
            </span>
          </div>
        </div>

        {post.hasPoseCheck && (
          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-1 rounded-lg flex items-center gap-1">
            <Video className="w-3 h-3 text-sky-600" />
            <span>AI Pose Check</span>
          </span>
        )}
      </div>

      {/* 2. Post Content (Workout Title & User-Written Text) */}
      <div className="space-y-1.5">
        <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
          {post.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* 3. Workout Metrics Badges (Only relevant metrics displayed per Section 16.4) */}
      {post.metrics && (
        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          {post.metrics.durationMinutes && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 font-bold text-slate-800 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>{post.metrics.durationMinutes} phút</span>
            </div>
          )}

          {post.metrics.volumeKg && post.metrics.volumeKg > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 font-bold text-slate-800 tabular-nums">
              <Dumbbell className="w-3.5 h-3.5 text-slate-700" />
              <span>{post.metrics.volumeKg.toLocaleString('vi-VN')} kg</span>
            </div>
          )}

          {post.metrics.distanceKm && post.metrics.distanceKm > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 font-bold text-slate-800 tabular-nums">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{post.metrics.distanceKm} km</span>
            </div>
          )}

          {post.metrics.personalRecords &&
            post.metrics.personalRecords.map((pr, idx) => (
              <div
                key={`pr-${idx}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-800"
              >
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kỷ lục mới: {pr}</span>
              </div>
            ))}
        </div>
      )}

      {/* 4. Multiple Images Slider / Carousel per Section 16.5 */}
      {images.length > 0 && (
        <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 aspect-video max-h-96">
          <img
            src={images[currentImageIndex]}
            alt={`Post media ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-300"
          />

          {hasMultipleImages && (
            <>
              {/* Prev / Next controls */}
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Pagination Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full">
                {images.map((_, dotIdx) => (
                  <button
                    key={`dot-${dotIdx}`}
                    onClick={() => setCurrentImageIndex(dotIdx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      dotIdx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 5. Attached Routine Section & Clone Routine Button per Section 16.5 & 16.6 */}
      {post.attachedRoutine && (
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-[#FF5722] flex items-center justify-center">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Routine đính kèm
                </span>
                <h4 className="font-extrabold text-sm text-slate-900">
                  {post.attachedRoutine.title}
                </h4>
              </div>
            </div>

            {/* Section 16.6: Clone Routine Button */}
            <button
              type="button"
              onClick={() => setIsSaveModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                clonedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:border-[#FF5722] hover:text-[#FF5722]'
              }`}
            >
              {clonedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã lưu</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Lưu bài tập</span>
                </>
              )}
            </button>
          </div>

          {/* Exercise Summary Pills */}
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            {post.attachedRoutine.exercises.map((item, idx) => (
              <span
                key={`att-ex-${idx}`}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 font-medium"
              >
                {item.exercise.name} ({item.sets.length} sets)
              </span>
            ))}
          </div>

          {/* Expand Details: Set × Kg × Reps */}
          <div>
            <button
              type="button"
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="text-xs font-bold text-[#FF5722] hover:underline flex items-center gap-1 cursor-pointer pt-1"
            >
              <span>
                {isDetailsExpanded ? 'Thu gọn chi tiết bài tập' : 'Xem thêm chi tiết bài tập'}
              </span>
              {isDetailsExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {isDetailsExpanded && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3 animate-in fade-in duration-150">
                {post.attachedRoutine.exercises.map((item, exIdx) => (
                  <div key={`expanded-ex-${exIdx}`} className="space-y-1.5 text-xs">
                    <div className="font-bold text-slate-900">
                      {item.exercise.name}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {item.sets.map((set, sIdx) => (
                        <div
                          key={`exp-set-${sIdx}`}
                          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 tabular-nums font-semibold"
                        >
                          Set {sIdx + 1}: {set.weightKg ? `${set.weightKg}kg × ` : ''}
                          {set.reps ? `${set.reps} reps` : `${set.durationSeconds || 45}s`}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {copiedLink && (
        <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Đã sao chép liên kết bài viết!</span>
        </div>
      )}

      {/* 6. Post Interactions: Like, Comments, Share per Section 16.7 */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            type="button"
            onClick={() => toggleLikePost(post.id)}
            className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
              post.isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                post.isLiked ? 'fill-rose-600 text-rose-600' : 'text-slate-500'
              }`}
            />
            <span className="tabular-nums">{post.likesCount}</span>
          </button>

          {/* Comments Button */}
          <button
            type="button"
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-slate-500" />
            <span className="tabular-nums">{post.comments.length}</span>
            <span className="hidden sm:inline">bình luận</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Chia sẻ</span>
        </button>
      </div>

      {/* 7. Comments Section Drawer/Expansion */}
      {isCommentsOpen && (
        <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {post.comments.map((comment) => (
              <div
                key={comment.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs"
              >
                <img
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  className="w-7 h-7 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {comment.authorName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {comment.createdAt}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{comment.text}</p>
                </div>
              </div>
            ))}

            {post.comments.length === 0 && (
              <div className="text-center py-4 text-xs text-slate-400">
                Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!
              </div>
            )}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#FF5722] bg-slate-50"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="px-3 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Save Routine to Folder Modal */}
      {isSaveModalOpen && post.attachedRoutine && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4 text-[#FF5722]" />
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Lưu bài tập vào thư mục
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Routine being saved preview */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#FF5722] flex items-center justify-center shrink-0">
                <Dumbbell className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {post.attachedRoutine.title}
                </div>
                <div className="text-[10px] text-slate-500">
                  {post.attachedRoutine.exercises.length} bài tập • {post.author.name}
                </div>
              </div>
            </div>

            {/* Folder Selection List */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Chọn thư mục lưu trữ:
              </label>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {/* Uncategorized option */}
                <div
                  onClick={() => setSelectedFolderId('')}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors text-xs ${
                    selectedFolderId === ''
                      ? 'border-[#FF5722] bg-orange-50/50 font-bold text-slate-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-slate-400" />
                    <span>Chưa phân loại (Thư mục gốc)</span>
                  </div>
                  {selectedFolderId === '' && (
                    <Check className="w-3.5 h-3.5 text-[#FF5722]" />
                  )}
                </div>

                {/* Existing Folders */}
                {folders.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFolderId(f.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors text-xs ${
                      selectedFolderId === f.id
                        ? 'border-[#FF5722] bg-orange-50/50 font-bold text-slate-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className="w-4 h-4 text-[#FF5722]" />
                      <span className="truncate">{f.name}</span>
                    </div>
                    {selectedFolderId === f.id && (
                      <Check className="w-3.5 h-3.5 text-[#FF5722] shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Inline Create Folder */}
            {isCreatingFolder ? (
              <form onSubmit={handleInlineCreateFolder} className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                <input
                  type="text"
                  required
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Tên thư mục mới..."
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-medium outline-none focus:border-[#FF5722]"
                />
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-2.5 py-1.5 text-xs font-bold bg-[#FF5722] text-white rounded-lg hover:bg-[#E64A19] cursor-pointer disabled:opacity-50"
                >
                  Tạo
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-2 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreatingFolder(true)}
                className="w-full py-1.5 text-xs font-semibold text-slate-600 hover:text-[#FF5722] flex items-center justify-center gap-1 border border-dashed border-slate-200 hover:border-orange-300 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo thư mục mới</span>
              </button>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveRoutine}
                className="px-4 py-1.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Xác nhận lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
