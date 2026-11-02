'use strict';
'use client';

import React, { useState } from 'react';
import { useFitness } from '@/contexts/FitnessContext';
import {
  Image,
  Video,
  Dumbbell,
  Send,
  X,
  Sparkles,
  Check,
  Paperclip,
  Clock,
} from 'lucide-react';

export const CommunityPostComposer: React.FC = () => {
  const { profile, routines, createPost } = useFitness();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [imageInputUrl, setImageInputUrl] = useState('');
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [hasPoseCheck, setHasPoseCheck] = useState(false);

  // Derive metrics if routine is attached
  const selectedRoutine = routines.find((r) => r.id === selectedRoutineId);
  const derivedVolume = selectedRoutine
    ? selectedRoutine.exercises.reduce((acc, ex) => {
        return (
          acc +
          ex.sets.reduce((sAcc, s) => {
            return sAcc + (s.weightKg && s.reps ? s.weightKg * s.reps : 0);
          }, 0)
        );
      }, 0)
    : 0;

  const handleAddImage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (imageInputUrl.trim()) {
      setImages((prev) => [...prev, imageInputUrl.trim()]);
      setImageInputUrl('');
      setIsAddingImage(false);
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createPost({
      title: title.trim(),
      content: content.trim(),
      routineId: selectedRoutineId || undefined,
      images: images.length > 0 ? images : undefined,
      videoUrl: videoUrl.trim() || undefined,
      hasPoseCheck,
      tags: ['CỘNG ĐỒNG', selectedRoutine ? 'ROUTINE' : 'FITNESSLEVELING'],
    });

    // Reset form
    setTitle('');
    setContent('');
    setSelectedRoutineId('');
    setImages([]);
    setVideoUrl('');
    setHasPoseCheck(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-3">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
        />
        <div>
          <span className="font-extrabold text-sm text-slate-900 block leading-tight">
            {profile.name}
          </span>
          <span className="text-[11px] text-slate-400">
            Chia sẻ trải nghiệm buổi tập và giáo án với cộng đồng
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề buổi tập hoặc bài viết..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-900 outline-none focus:border-[#FF5722] bg-slate-50/50"
          />
        </div>

        <div>
          <textarea
            rows={3}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Cảm nhận bài tập hôm nay, mức tạ, mẹo form hoặc câu hỏi trao đổi..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#FF5722] bg-slate-50/50"
          />
        </div>

        {/* Section 16.3 & 18: Routine Selector & Derived Metrics Preview */}
        {selectedRoutine && (
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FF5722] text-white flex items-center justify-center font-bold">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">
                  Routine: {selectedRoutine.title}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {selectedRoutine.exercises.length} bài • Tải trọng: ~{derivedVolume.toLocaleString('vi-VN')} kg • Thời lượng: ~45p
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedRoutineId('')}
              className="text-slate-400 hover:text-rose-600 p-1 self-end sm:self-center"
              title="Gỡ routine"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Images List Preview */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {images.map((img, idx) => (
              <div key={`img-thumb-${idx}`} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Inline Image Input Form */}
        {isAddingImage && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
            <input
              type="url"
              autoFocus
              value={imageInputUrl}
              onChange={(e) => setImageInputUrl(e.target.value)}
              placeholder="Dán URL hình ảnh workout (Unsplash hoặc ảnh trực tiếp)..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-none bg-white"
            />
            <button
              type="button"
              onClick={() => handleAddImage()}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold"
            >
              Thêm ảnh
            </button>
            <button
              type="button"
              onClick={() => setIsAddingImage(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Inline Video / AI Pose Check Panel */}
        {isAddingVideo && (
          <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Đính kèm Video bài tập & AI Pose Check</h4>
                  <p className="text-[11px] text-slate-500">Dán URL video hoặc chọn video mẫu để kiểm tra tư thế chuyển động</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingVideo(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Dán link video (MP4 / WebM / Cloud URL)..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none bg-white focus:border-purple-500"
              />
              {videoUrl && (
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="px-2.5 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300"
                >
                  Xóa link
                </button>
              )}
            </div>

            {/* Quick sample videos */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-slate-500 font-semibold">Video demo:</span>
              <button
                type="button"
                onClick={() => {
                  setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
                  setHasPoseCheck(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-100/60 font-semibold cursor-pointer"
              >
                + Squat Pose Check mẫu
              </button>
              <button
                type="button"
                onClick={() => {
                  setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4');
                  setHasPoseCheck(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-100/60 font-semibold cursor-pointer"
              >
                + Push-up Form Check mẫu
              </button>
            </div>

            {/* AI Pose Check Toggle */}
            <div className="pt-2 border-t border-purple-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPoseCheck}
                  onChange={(e) => setHasPoseCheck(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 accent-purple-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Bật huy hiệu AI Pose Check (được AI gắn cờ phân tích form)
                </span>
              </label>
              {hasPoseCheck && (
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  Đã kích hoạt AI
                </span>
              )}
            </div>

            {/* Video preview if URL is set */}
            {videoUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-purple-200 bg-black aspect-video max-h-48 relative">
                <video src={videoUrl} controls preload="metadata" className="w-full h-full object-contain" />
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  <Video className="w-3 h-3 text-purple-400" />
                  <span>Xem trước video</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Chi tiết bài tập: Routine select dropdown */}
            <div className="relative">
              <select
                value={selectedRoutineId}
                onChange={(e) => setSelectedRoutineId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50 font-bold text-xs outline-none cursor-pointer"
              >
                <option value="">+ Chi tiết bài tập (Routine)</option>
                {routines.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.exercises.length} bài)
                  </option>
                ))}
              </select>
            </div>

            {/* Đăng ảnh */}
            <button
              type="button"
              onClick={() => setIsAddingImage(!isAddingImage)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Image className="w-3.5 h-3.5 text-sky-600" />
              <span>Đăng ảnh</span>
            </button>

            {/* Đăng video / Pose check */}
            <button
              type="button"
              onClick={() => {
                const nextState = !isAddingVideo;
                setIsAddingVideo(nextState);
                if (nextState && !hasPoseCheck) setHasPoseCheck(true);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                isAddingVideo || videoUrl
                  ? 'bg-purple-50 border-purple-300 text-purple-700'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-purple-600" />
              <span>{videoUrl ? 'Đã gắn video Pose Check' : 'Đăng video / Pose Check'}</span>
            </button>
          </div>

          {/* Đăng bài */}
          <button
            type="submit"
            disabled={!title.trim() || !content.trim()}
            className="px-5 py-2 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Đăng bài</span>
          </button>
        </div>
      </form>
    </div>
  );
};
