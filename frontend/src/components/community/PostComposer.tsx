'use strict';
'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Video, Send, X, Dumbbell, CheckCircle2 } from 'lucide-react';
import { FitnessUser } from '@/lib/fitnessData';
import { ExercisePostItem } from '@/types/community';

interface PostComposerProps {
  currentUser: FitnessUser;
  onPostCreated: (newPost: ExercisePostItem) => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({ currentUser, onPostCreated }) => {
  const [description, setDescription] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('chest');
  const [equipment, setEquipment] = useState('barbell');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [hasPoseCheck, setHasPoseCheck] = useState(true);
  const [attachedMedia, setAttachedMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showDetailedInputs, setShowDetailedInputs] = useState(false);

  const handleAttachMock = (type: 'image' | 'video') => {
    if (type === 'image') {
      setAttachedMedia({
        type: 'image',
        url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      });
    } else {
      setAttachedMedia({
        type: 'video',
        url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !exerciseName.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const finalName = exerciseName.trim() || 'Chia sẻ bài tập thể hình';
      const newPost: ExercisePostItem = {
        id: `post-${Date.now()}`,
        name: finalName,
        author: {
          name: currentUser.name,
          avatar: currentUser.avatarUrl,
          verified: true,
          level: currentUser.level,
          handle: `@${currentUser.name.toLowerCase()}_fit`,
        },
        timestamp: 'Vừa xong',
        createdAt: new Date().toISOString(),
        muscleGroup: muscleGroup,
        equipment: equipment,
        difficulty: difficulty,
        hasPoseCheck: hasPoseCheck,
        verified: false,
        avgRating: 5.0,
        ratingCount: 1,
        description: description.trim() || `Thành viên chia sẻ bài tập và hướng dẫn kỹ thuật cho ${finalName}.`,
        mediaType: attachedMedia?.type || 'none',
        mediaUrl: attachedMedia?.url,
        tags: [muscleGroup.toUpperCase(), equipment.toUpperCase(), difficulty.toUpperCase()],
      };

      onPostCreated(newPost);
      setDescription('');
      setExerciseName('');
      setAttachedMedia(null);
      setShowDetailedInputs(false);
      setIsSubmitting(false);
      setShowSuccessToast(true);

      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
    }, 300);
  };

  const isPostEmpty = !description.trim() && !exerciseName.trim() && !attachedMedia;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 relative overflow-hidden">
      {showSuccessToast && (
        <div className="absolute top-0 left-0 right-0 bg-emerald-600 text-white py-2 px-4 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
          <CheckCircle2 className="w-4 h-4" />
          <span>Bài tập đã được đăng tải lên bảng tin cộng đồng!</span>
        </div>
      )}

      {/* Top row: Avatar and primary textarea */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
          {currentUser.name.slice(0, 1).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Chia sẻ bài tập, kỹ thuật form hoặc trải nghiệm hôm nay..."
            rows={showDetailedInputs || description ? 3 : 2}
            className="w-full bg-slate-50 rounded-lg p-3 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5722] resize-none border border-slate-200 transition-colors"
          />

          {/* Collapsible Exercise Spec Fields */}
          {showDetailedInputs && (
            <div className="mt-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#FF5722]" />
                <input
                  type="text"
                  placeholder="Tên bài tập (Vd: Incline Dumbbell Curl)"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="flex-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-1 uppercase">Nhóm cơ</label>
                  <select
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value)}
                    className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                  >
                    <option value="chest">Ngực</option>
                    <option value="back">Lưng</option>
                    <option value="legs">Chân</option>
                    <option value="shoulders">Vai</option>
                    <option value="core">Bụng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-1 uppercase">Dụng cụ</label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                  >
                    <option value="barbell">Đòn tạ (Barbell)</option>
                    <option value="dumbbell">Tạ đơn (Dumbbell)</option>
                    <option value="bodyweight">Bodyweight</option>
                    <option value="cable">Máy / Cáp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-1 uppercase">Độ khó</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                  >
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={hasPoseCheck}
                      onChange={(e) => setHasPoseCheck(e.target.checked)}
                      className="rounded border-slate-300 text-[#FF5722] focus:ring-[#FF5722]"
                    />
                    <span>Hỗ trợ Pose Check</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Attached Media Preview */}
          {attachedMedia && (
            <div className="mt-2.5 relative inline-block rounded-lg overflow-hidden border border-slate-200">
              {attachedMedia.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={attachedMedia.url}
                  alt="Đính kèm"
                  className="w-48 h-32 object-cover"
                />
              ) : (
                <div className="w-48 h-32 bg-slate-900 flex items-center justify-center text-white text-xs gap-1.5">
                  <Video className="w-5 h-5 text-[#FF5722]" />
                  <span>Video đính kèm</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setAttachedMedia(null)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
                title="Gỡ phương tiện"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Bottom Toolbar */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowDetailedInputs(!showDetailedInputs)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                  showDetailedInputs
                    ? 'bg-orange-50 text-[#FF5722] border-orange-200'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Chi tiết bài tập</span>
              </button>

              <button
                type="button"
                onClick={() => handleAttachMock('image')}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                title="Đính kèm ảnh minh họa"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleAttachMock('video')}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                title="Đính kèm clip form check"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPostEmpty || isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-[#FF5722] hover:bg-[#E64A19] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Đang đăng...' : 'Đăng bài'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
