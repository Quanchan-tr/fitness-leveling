'use strict';
'use client';

import React, { useState, useRef } from 'react';
import { useFitness, DEFAULT_AVATAR } from '@/contexts/FitnessContext';
import {
  Image as ImageIcon,
  Video,
  Dumbbell,
  Send,
  X,
  Sparkles,
  UploadCloud,
  FileVideo,
  Paperclip,
} from 'lucide-react';

export const CommunityPostComposer: React.FC = () => {
  const { profile, routines, createPost } = useFitness();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [imageInputUrl, setImageInputUrl] = useState('');
  const [showUrlImageInput, setShowUrlImageInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [hasPoseCheck, setHasPoseCheck] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const fileInputImageRef = useRef<HTMLInputElement>(null);
  const fileInputVideoRef = useRef<HTMLInputElement>(null);

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

  // Handle local file selection for images
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Handle local file selection for video
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoFileName(file.name);
    setHasPoseCheck(true);
    setIsAddingVideo(true);

    e.target.value = '';
  };

  // Drag and Drop media into composer
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggingFile) setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        setVideoFileName(file.name);
        setHasPoseCheck(true);
        setIsAddingVideo(true);
      }
    });
  };

  const handleAddImageUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (imageInputUrl.trim()) {
      setImages((prev) => [...prev, imageInputUrl.trim()]);
      setImageInputUrl('');
      setShowUrlImageInput(false);
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
    setVideoFileName('');
    setHasPoseCheck(false);
    setIsAddingVideo(false);
    setShowUrlImageInput(false);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white rounded-2xl border transition-all shadow-sm p-4 sm:p-5 space-y-4 ${
        isDraggingFile ? 'border-[#FF5722] bg-orange-50/40 ring-2 ring-orange-200' : 'border-slate-200/90'
      }`}
    >
      {/* Hidden File Inputs for native device upload */}
      <input
        ref={fileInputImageRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageFileChange}
      />
      <input
        ref={fileInputVideoRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleVideoFileChange}
      />

      <div className="flex items-center gap-3">
        <img
          src={profile.avatar || DEFAULT_AVATAR}
          alt={profile.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
          }}
          className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-100"
        />
        <div>
          <span className="font-extrabold text-sm text-slate-900 block leading-tight">
            {profile.name}
          </span>
          <span className="text-[11px] text-slate-400">
            Chia sẻ trải nghiệm buổi tập, hình ảnh &amp; video với cộng đồng
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
            placeholder="Cảm nhận bài tập hôm nay, mức tạ, mẹo form hoặc câu hỏi trao đổi (kéo thả ảnh/video trực tiếp vào đây)..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#FF5722] bg-slate-50/50"
          />
        </div>

        {/* Drag Over Banner */}
        {isDraggingFile && (
          <div className="p-3 bg-orange-100/80 border border-dashed border-[#FF5722] rounded-xl text-center text-xs font-bold text-[#FF5722] flex items-center justify-center gap-2 animate-pulse">
            <UploadCloud className="w-4 h-4" />
            <span>Thả tệp ảnh hoặc video vào đây để tải lên</span>
          </div>
        )}

        {/* Attached Routine Preview */}
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
              <div key={`img-thumb-${idx}`} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputImageRef.current?.click()}
              className="w-20 h-20 rounded-xl border border-dashed border-slate-300 hover:border-sky-500 text-slate-400 hover:text-sky-600 flex flex-col items-center justify-center gap-1 transition-colors text-[10px] font-bold"
            >
              <ImageIcon className="w-4 h-4" />
              <span>+ Thêm ảnh</span>
            </button>
          </div>
        )}

        {/* Optional URL Image input */}
        {showUrlImageInput && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
            <input
              type="url"
              autoFocus
              value={imageInputUrl}
              onChange={(e) => setImageInputUrl(e.target.value)}
              placeholder="Dán link ảnh từ web (Unsplash hoặc direct link)..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-none bg-white"
            />
            <button
              type="button"
              onClick={() => handleAddImageUrl()}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold cursor-pointer"
            >
              Thêm
            </button>
            <button
              type="button"
              onClick={() => setShowUrlImageInput(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Video / AI Pose Check Panel */}
        {isAddingVideo && (
          <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Video bài tập &amp; AI Pose Check</h4>
                  <p className="text-[11px] text-slate-500">
                    {videoFileName ? `Tệp đã chọn: ${videoFileName}` : 'Chọn video từ máy hoặc dán link online'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingVideo(false);
                  setVideoUrl('');
                  setVideoFileName('');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputVideoRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Chọn video từ máy</span>
              </button>

              <input
                type="url"
                value={videoUrl.startsWith('blob:') ? '' : videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  setVideoFileName('');
                }}
                placeholder="Hoặc dán URL video (MP4, WebM)..."
                className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none bg-white focus:border-purple-500"
              />

              {videoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setVideoUrl('');
                    setVideoFileName('');
                  }}
                  className="px-2.5 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 cursor-pointer"
                >
                  Xóa
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
                  setVideoFileName('Squat_Pose_Check_Demo.mp4');
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
                  setVideoFileName('Pushup_Form_Check_Demo.mp4');
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

            {/* Video preview player */}
            {videoUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-purple-200 bg-black aspect-video max-h-48 relative shadow-sm">
                <video src={videoUrl} controls preload="metadata" className="w-full h-full object-contain" />
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  <FileVideo className="w-3 h-3 text-purple-400" />
                  <span>{videoFileName || 'Xem trước video'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Chi tiết bài tập: Routine select dropdown */}
            <div className="relative">
              <select
                value={selectedRoutineId}
                onChange={(e) => setSelectedRoutineId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50 font-bold text-xs outline-none cursor-pointer"
              >
                <option value="">+ Đính kèm Routine</option>
                {routines.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.exercises.length} bài)
                  </option>
                ))}
              </select>
            </div>

            {/* Nút Thêm ảnh từ máy */}
            <button
              type="button"
              onClick={() => fileInputImageRef.current?.click()}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-sky-50 hover:border-sky-300 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Chọn ảnh từ máy hoặc kéo thả ảnh"
            >
              <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
              <span>Thêm ảnh từ máy</span>
            </button>

            {/* Nút Thêm ảnh từ URL */}
            <button
              type="button"
              onClick={() => setShowUrlImageInput(!showUrlImageInput)}
              className="px-2 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs transition-colors cursor-pointer"
              title="Dán link ảnh online"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>

            {/* Nút Thêm video */}
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
              <span>{videoUrl ? 'Đã có video' : 'Thêm video'}</span>
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
