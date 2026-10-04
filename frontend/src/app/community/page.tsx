'use strict';
'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { useFitness } from '@/contexts/FitnessContext';
import { useShell } from '@/components/layout/ShellLayout';
import { CommunityPostComposer } from '@/components/community/CommunityPostComposer';
import { FeedPostCard } from '@/components/community/FeedPostCard';
import { CommunitySidebar } from '@/components/community/CommunitySidebar';
import {
  Users,
  Search,
  SlidersHorizontal,
  Video,
  SearchX,
  Dumbbell,
  Sparkles,
} from 'lucide-react';

export default function CommunityPage() {
  const { toggleMobileNav } = useShell();
  const { posts, profile } = useFitness();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('all');
  const [onlyPoseCheck, setOnlyPoseCheck] = useState(false);

  // Filter posts based on search, muscle, and AI Pose Check
  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(q))) ||
      (post.attachedRoutine && post.attachedRoutine.title.toLowerCase().includes(q));

    const matchesMuscle =
      filterMuscle === 'all' ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(filterMuscle.toLowerCase()))) ||
      (post.attachedRoutine &&
        post.attachedRoutine.exercises.some((item) =>
          item.exercise.targetMuscles.some((m) =>
            m.toLowerCase().includes(filterMuscle.toLowerCase())
          )
        ));

    const matchesPose = !onlyPoseCheck || post.hasPoseCheck;

    return matchesSearch && matchesMuscle && matchesPose;
  });

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      {/* Top Navigation Bar */}
      <TopBar
        user={{
          name: profile.name,
          level: profile.level,
          xp: profile.xp,
          nextLevelXp: profile.maxXp,
          str: 24,
          end: 18,
          mob: 15,
          goal: profile.goal,
        }}
        streak={profile.streak}
        onToggleMobileMenu={toggleMobileNav}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF5722]" />
              <span>Cộng đồng Thể hình</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs tabular-nums">
              {filteredPosts.length} bài viết
            </span>
          </div>
        </div>

        {/* Section 16.1: Two-Column Desktop Layout (Main: Feed | Right: Community Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT / MAIN: FEED & TOOLBAR (8 cols) ================= */}
          <div className="lg:col-span-8 space-y-5">
            {/* Section 16.2: Feed Toolbar (Search, Muscle filter, AI filter) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài tập, routine, từ khóa..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-[#FF5722] bg-slate-50/60"
                />
              </div>

              {/* Muscle Group Filter Pills + AI Feature Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
                {/* Muscle Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'ngực', label: 'Ngực' },
                    { id: 'lưng', label: 'Lưng xô' },
                    { id: 'vai', label: 'Vai' },
                    { id: 'tay', label: 'Bắp tay' },
                    { id: 'chân', label: 'Chân đùi' },
                    { id: 'bụng', label: 'Bụng' },
                    { id: 'cardio', label: 'Cardio' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setFilterMuscle(m.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        filterMuscle === m.id
                          ? 'bg-[#FF5722] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Section 16.2: AI-feature Filter */}
                <button
                  onClick={() => setOnlyPoseCheck(!onlyPoseCheck)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    onlyPoseCheck
                      ? 'bg-sky-500 text-white border-sky-500 shadow-2xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-sky-500 hover:text-sky-600'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>AI Pose Check</span>
                </button>
              </div>
            </div>

            {/* Section 16.3: Post Composer */}
            <CommunityPostComposer />

            {/* Posts Feed or Empty State */}
            {filteredPosts.length > 0 ? (
              <div className="space-y-5">
                {filteredPosts.map((post) => (
                  <FeedPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <SearchX className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Không tìm thấy bài viết nào
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Không có bài viết nào phù hợp với bộ lọc hiện tại. Thử xóa tìm kiếm hoặc chọn nhóm cơ khác.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterMuscle('all');
                    setOnlyPoseCheck(false);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            )}
          </div>

          {/* ================= RIGHT: COMMUNITY SIDEBAR (4 cols) ================= */}
          <div className="lg:col-span-4 sticky top-20">
            <CommunitySidebar />
          </div>
        </div>
      </div>
    </main>
  );
}
