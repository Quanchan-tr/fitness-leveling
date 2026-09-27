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
  Layers,
  Flame,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-[#F7F3EA] border border-[#B9A78E]/50 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl relative my-auto animate-scaleIn text-[#1F2328] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#B9A78E]/30 bg-white/70 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#303238] text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden flex-shrink-0">
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
                <span className="font-bold text-sm text-[#1F2328]">{post.author.name}</span>
                {post.author.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#7FB069]" />}
                {post.author.level && (
                  <span className="text-[10px] text-[#76583E] bg-[#E8E1D5] px-1.5 py-0.5 rounded font-bold">
                    Lv.{post.author.level}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#76583E]">{post.timestamp}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#76583E] hover:bg-[#E8E1D5] hover:text-[#1F2328] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Title and Badges */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-black text-[#1F2328] tracking-tight">{post.name}</h2>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {post.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#7FB069] bg-[#7FB069]/15 px-2.5 py-1 rounded-full border border-[#7FB069]/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
                {post.hasPoseCheck && (
                  <span className="flex items-center gap-1 bg-[#FF6B35]/10 text-[#FF6B35] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#FF6B35]/20">
                    <Video className="w-3.5 h-3.5" />
                    AI Pose Check
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="text-xs text-[#76583E] font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
              <span>{post.tags ? post.tags.join(' • ') : `${post.muscleGroup} • ${post.equipment} • ${post.difficulty}`}</span>
            </div>
          </div>

          {/* Media preview */}
          {post.mediaUrl ? (
            <div className="rounded-2xl overflow-hidden border border-[#B9A78E]/40 bg-black/5 aspect-video max-h-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.mediaUrl}
                alt={post.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#B9A78E]/50 bg-white/50 p-6 flex flex-col items-center justify-center text-center">
              <Dumbbell className="w-8 h-8 text-[#B9A78E] mb-2" />
              <p className="text-xs font-semibold text-[#76583E]">Form Check Video & 3D Motion Available</p>
            </div>
          )}

          {/* Description */}
          <div className="bg-white p-4 rounded-2xl border border-[#B9A78E]/30 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-[#76583E] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
              Exercise Overview
            </h4>
            <p className="text-xs text-[#1F2328] leading-relaxed">{post.description}</p>
          </div>

          {/* Step by step instructions */}
          {post.instructions && post.instructions.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-[#B9A78E]/30 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[#76583E] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#7FB069]" />
                Form & Execution Guide
              </h4>
              <ul className="space-y-2 text-xs">
                {post.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#FF6B35]/15 text-[#FF6B35] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-[#1F2328] font-medium leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ratings & Quick Actions */}
          <div className="bg-white p-4 rounded-2xl border border-[#B9A78E]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-black text-[#1F2328]">{post.avgRating.toFixed(1)}</div>
                <div className="text-[10px] text-[#76583E]">{post.ratingCount} community ratings</div>
              </div>
              <div className="h-8 w-[1px] bg-[#B9A78E]/30" />
              <div>
                <div className="text-[11px] font-semibold text-[#76583E] mb-1">Your rating:</div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => onRate(post.id, star)}
                      className="p-0.5 hover:scale-125 transition-transform"
                      title={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          (post.userRating || 0) >= star
                            ? 'text-[#F4C95D] fill-[#F4C95D]'
                            : 'text-[#B9A78E]/60 hover:text-[#F4C95D]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onToggleSave(post.id)}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  post.isSaved
                    ? 'bg-[#7FB069] text-white shadow-sm'
                    : 'bg-[#E8E1D5] hover:bg-[#B9A78E]/40 text-[#1F2328]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${post.isSaved ? 'fill-white' : ''}`} />
                <span>{post.isSaved ? 'Saved to Library' : 'Save to Library'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#B9A78E]/30 bg-white/70 backdrop-blur-sm flex items-center justify-between gap-3">
          {post.hasPoseCheck ? (
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B35]">
              <Flame className="w-4 h-4 fill-[#FF6B35]" />
              <span>AI Pose Check Ready on WebCam</span>
            </div>
          ) : (
            <span className="text-xs text-[#76583E]">Standard library movement</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="bg-[#1F2328] hover:bg-black text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
