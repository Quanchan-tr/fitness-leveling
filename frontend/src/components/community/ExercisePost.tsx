'use strict';
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Flag,
  Copy,
  EyeOff,
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

  // Close menu when clicking outside or pressing Escape
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
    <article className="bg-white rounded-2xl border border-[#B9A78E]/40 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col space-y-4">
      {/* 1. User Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
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

          {/* User Name & Timestamp */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-[#1F2328] hover:text-[#FF6B35] transition-colors cursor-pointer">
                {post.author.name}
              </span>
              {post.author.verified && (
                <span title="Verified Fitizen">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#7FB069]" />
                </span>
              )}
              {post.author.level && (
                <span className="text-[10px] text-[#76583E] bg-[#E8E1D5] px-1.5 py-0.2 rounded font-semibold">
                  Lv.{post.author.level}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#76583E]">
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
            className="p-1.5 text-[#76583E] hover:text-[#1F2328] hover:bg-[#F7F3EA] rounded-xl transition-colors"
            title="Post options"
            aria-label="Post options"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 w-44 bg-[#F7F3EA] border border-[#B9A78E]/40 rounded-xl shadow-lg py-1 z-30 animate-fadeIn text-xs">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full text-left px-3.5 py-2 hover:bg-[#E8E1D5] text-[#1F2328] flex items-center gap-2 font-medium transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#7FB069]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link copied!' : 'Copy link'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenReport(post);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium transition-colors border-t border-[#B9A78E]/20"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report post</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Exercise Title, Tags, Badges & Description */}
      <div className="space-y-2">
        {/* Title and Badges */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              onClick={() => onOpenDetails(post)}
              className="text-base font-black text-[#1F2328] tracking-tight hover:text-[#FF6B35] cursor-pointer transition-colors"
            >
              {post.name}
            </h3>
            {/* Categorization Tags: e.g. LEGS • BARBELL • INTERMEDIATE */}
            <div className="text-[11px] text-[#76583E] font-bold uppercase tracking-wider mt-0.5">
              {post.tags ? post.tags.join(' • ') : `${post.muscleGroup} • ${post.equipment} • ${post.difficulty}`}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {post.verified && (
              <span
                className="flex items-center gap-1 text-[10px] font-bold text-[#7FB069] bg-[#7FB069]/15 px-2.5 py-0.5 rounded-full border border-[#7FB069]/20"
                title="Exercise verified by FitTrack trainers"
              >
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            )}
            {post.hasPoseCheck && (
              <span
                className="flex items-center gap-1 bg-[#FF6B35]/10 text-[#FF6B35] text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-[#FF6B35]/20"
                title="AI Pose Check available"
              >
                <Video className="w-3 h-3" />
                AI Pose Check
              </span>
            )}
          </div>
        </div>

        {/* Post Description */}
        <p className="text-xs text-[#76583E] leading-relaxed pt-1 whitespace-pre-line">
          {post.description}
        </p>
      </div>

      {/* 3. Media Placeholder / Exercise Thumbnail */}
      {post.mediaUrl ? (
        <div
          onClick={() => onOpenDetails(post)}
          className="rounded-2xl overflow-hidden border border-[#B9A78E]/30 bg-black/5 aspect-video max-h-72 cursor-pointer group relative"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.mediaUrl}
            alt={post.name}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
          {post.hasPoseCheck && (
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow">
              <Video className="w-3 h-3 text-[#FF6B35]" />
              <span>3D Motion & Form Ready</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => onOpenDetails(post)}
          className="rounded-xl border border-dashed border-[#B9A78E]/40 bg-[#F7F3EA]/60 p-4 flex items-center justify-between cursor-pointer hover:bg-[#F7F3EA] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E8E1D5] rounded-lg text-[#76583E]">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1F2328]">Step-by-step Movement Guide</div>
              <div className="text-[10px] text-[#76583E]">Tap to view form cues & AI pose calibration</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#76583E]" />
        </div>
      )}

      {/* 4. Action and Interaction Bar */}
      <div className="pt-3 border-t border-[#B9A78E]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Rating Interaction */}
        <div className="flex items-center gap-2">
          {/* Score & Review count */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F2328]">
            <span className="text-[#FF6B35] font-black">{post.avgRating.toFixed(1)}</span>
            <span className="text-[11px] text-[#76583E] font-normal">
              ({post.ratingCount} {post.ratingCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#B9A78E]/30 mx-1" />

          {/* Interactive Stars */}
          <div
            className="flex items-center gap-0.5"
            onMouseLeave={() => setHoverRating(null)}
            role="radiogroup"
            aria-label="Rate this exercise"
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = currentDisplayRating >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => onRate(post.id, star)}
                  onMouseEnter={() => setHoverRating(star)}
                  className="p-1 text-[#B9A78E] hover:text-[#F4C95D] focus:outline-none focus:scale-125 transition-transform"
                  title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  aria-label={`${star} star`}
                >
                  <Star
                    className={`w-3.5 h-3.5 transition-colors ${
                      isFilled ? 'text-[#F4C95D] fill-[#F4C95D]' : 'text-[#B9A78E]/50'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {post.userRating && (
            <span className="text-[10px] text-[#7FB069] font-bold ml-1 hidden sm:inline">
              Rated {post.userRating}★
            </span>
          )}
        </div>

        {/* Buttons: Save & View Details */}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => onToggleSave(post.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
              post.isSaved
                ? 'bg-[#7FB069] text-white'
                : 'bg-[#F7F3EA] hover:bg-[#E8E1D5] text-[#76583E] hover:text-[#1F2328]'
            }`}
            title={post.isSaved ? 'Saved in personal library' : 'Save to my library'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${post.isSaved ? 'fill-white' : ''}`} />
            <span>{post.isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenDetails(post)}
            className="bg-[#E8E1D5] hover:bg-[#FF6B35] hover:text-white text-[#1F2328] px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
