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
              onClick={() => setHasPoseCheck(!hasPoseCheck)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                hasPoseCheck
                  ? 'bg-sky-50 border-sky-300 text-sky-700'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-purple-600" />
              <span>Đăng video / Pose Check</span>
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
