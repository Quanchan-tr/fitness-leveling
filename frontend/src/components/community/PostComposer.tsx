'use strict';
'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Video, Send, X, Dumbbell, Sparkles, CheckCircle2 } from 'lucide-react';
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
      const finalName = exerciseName.trim() || 'Community Exercise Share';
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
        timestamp: 'Just now',
        createdAt: new Date().toISOString(),
        muscleGroup: muscleGroup,
        equipment: equipment,
        difficulty: difficulty,
        hasPoseCheck: hasPoseCheck,
        verified: false,
        avgRating: 5.0,
        ratingCount: 1,
        description: description.trim() || `User shared form check and guide for ${finalName}.`,
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
    }, 400);
  };

  const isPostEmpty = !description.trim() && !exerciseName.trim() && !attachedMedia;

  return (
    <div className="bg-white rounded-2xl border border-[#B9A78E]/40 p-4 sm:p-5 shadow-sm transition-all relative overflow-hidden">
      {showSuccessToast && (
        <div className="absolute top-0 left-0 right-0 bg-[#7FB069] text-white py-1.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Exercise post published to community feed!</span>
        </div>
      )}

      {/* Top row: Avatar and primary textarea */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#303238] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
          {currentUser.name.slice(0, 1).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share an exercise, fitness tip, or form check..."
            rows={showDetailedInputs || description ? 3 : 2}
            className="w-full bg-[#F7F3EA] rounded-xl p-3 text-xs font-medium text-[#1F2328] placeholder-[#76583E]/70 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none border border-[#B9A78E]/30 transition-all"
          />

          {/* Collapsible Exercise Spec Fields */}
          {showDetailedInputs && (
            <div className="mt-2.5 p-3 bg-[#F7F3EA]/70 rounded-xl border border-[#B9A78E]/30 space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#FF6B35]" />
                <input
                  type="text"
                  placeholder="Exercise Name (e.g. Incline Dumbbell Curl)"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="flex-1 bg-white px-3 py-1.5 rounded-lg border border-[#B9A78E]/40 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-[#76583E] font-semibold mb-1 uppercase">Muscle</label>
                  <select
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value)}
                    className="w-full bg-white px-2 py-1.5 rounded-lg border border-[#B9A78E]/40 text-xs font-medium"
                  >
                    <option value="chest">Chest</option>
                    <option value="back">Back</option>
                    <option value="legs">Legs</option>
                    <option value="shoulders">Shoulders</option>
                    <option value="core">Core</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#76583E] font-semibold mb-1 uppercase">Equipment</label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    className="w-full bg-white px-2 py-1.5 rounded-lg border border-[#B9A78E]/40 text-xs font-medium"
                  >
                    <option value="barbell">Barbell</option>
                    <option value="dumbbell">Dumbbell</option>
                    <option value="bodyweight">Bodyweight</option>
                    <option value="cable">Cable / Machine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#76583E] font-semibold mb-1 uppercase">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-white px-2 py-1.5 rounded-lg border border-[#B9A78E]/40 text-xs font-medium"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#76583E] font-semibold mb-1 uppercase">AI Pose Check</label>
                  <button
                    type="button"
                    onClick={() => setHasPoseCheck(!hasPoseCheck)}
                    className={`w-full py-1.5 px-2 rounded-lg border text-xs font-bold transition-colors ${
                      hasPoseCheck
                        ? 'bg-[#FF6B35]/15 border-[#FF6B35] text-[#FF6B35]'
                        : 'bg-white border-[#B9A78E]/40 text-[#76583E]'
                    }`}
                  >
                    {hasPoseCheck ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Attached Media Preview */}
          {attachedMedia && (
            <div className="relative mt-2.5 rounded-xl overflow-hidden border border-[#B9A78E]/40 bg-black/5 aspect-video max-h-44 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachedMedia.url}
                alt="Attachment Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setAttachedMedia(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors shadow"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                {attachedMedia.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                <span>{attachedMedia.type === 'image' ? 'Image attached' : 'Video attached'}</span>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[#B9A78E]/20">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAttachMock('image')}
                className="p-2 text-[#76583E] hover:text-[#FF6B35] hover:bg-[#F7F3EA] rounded-xl transition-colors flex items-center gap-1 text-xs font-medium"
                title="Attach Image"
              >
                <ImageIcon className="w-4 h-4 text-[#7FB069]" />
                <span className="hidden sm:inline">Photo</span>
              </button>

              <button
                type="button"
                onClick={() => handleAttachMock('video')}
                className="p-2 text-[#76583E] hover:text-[#FF6B35] hover:bg-[#F7F3EA] rounded-xl transition-colors flex items-center gap-1 text-xs font-medium"
                title="Attach Video"
              >
                <Video className="w-4 h-4 text-[#FF6B35]" />
                <span className="hidden sm:inline">Video</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDetailedInputs(!showDetailedInputs)}
                className={`p-2 rounded-xl transition-colors flex items-center gap-1 text-xs font-medium ${
                  showDetailedInputs ? 'bg-[#FF6B35]/15 text-[#FF6B35]' : 'text-[#76583E] hover:text-[#1F2328] hover:bg-[#F7F3EA]'
                }`}
                title="Add Exercise Metadata"
              >
                <Sparkles className="w-4 h-4 text-[#F4C95D]" />
                <span className="hidden sm:inline">{showDetailedInputs ? 'Details active' : 'Exercise tags'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPostEmpty || isSubmitting}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isPostEmpty || isSubmitting
                  ? 'bg-[#E8E1D5] text-[#76583E]/50 cursor-not-allowed'
                  : 'bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90 hover:shadow-md'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
