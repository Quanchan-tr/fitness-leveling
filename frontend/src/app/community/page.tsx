'use strict';
'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { initialFitnessData } from '@/lib/fitnessData';
import { initialCommunityPosts, ExercisePostItem } from '@/types/community';
import { FeedFilterBar } from '@/components/community/FeedFilterBar';
import { PostComposer } from '@/components/community/PostComposer';
import { ExercisePost } from '@/components/community/ExercisePost';
import { ExerciseDetailModal } from '@/components/community/ExerciseDetailModal';
import { ReportModal } from '@/components/community/ReportModal';
import { SearchX, Users } from 'lucide-react';
import { useShell } from '@/components/layout/ShellLayout';

export default function CommunityPage() {
  const { toggleMobileNav } = useShell();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [onlyPoseCheck, setOnlyPoseCheck] = useState(false);

  // Community posts list state
  const [posts, setPosts] = useState<ExercisePostItem[]>(initialCommunityPosts);

  // Modals state
  const [selectedPostForDetails, setSelectedPostForDetails] = useState<ExercisePostItem | null>(null);
  const [selectedPostForReport, setSelectedPostForReport] = useState<ExercisePostItem | null>(null);

  // Handle New Post Creation from PostComposer
  const handlePostCreated = (newPost: ExercisePostItem) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Handle Rating Exercise
  const handleRate = (postId: string, rating: number) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const hadPreviousUserRating = typeof post.userRating === 'number';
        const newCount = hadPreviousUserRating ? post.ratingCount : post.ratingCount + 1;
        const prevTotal = post.avgRating * post.ratingCount;
        const adjustedTotal = hadPreviousUserRating ? prevTotal - (post.userRating || 0) + rating : prevTotal + rating;
        const newAvg = Number((adjustedTotal / newCount).toFixed(1));

        return {
          ...post,
          userRating: rating,
          avgRating: newAvg,
          ratingCount: newCount,
        };
      })
    );

    if (selectedPostForDetails && selectedPostForDetails.id === postId) {
      setSelectedPostForDetails((prev) => (prev ? { ...prev, userRating: rating } : null));
    }
  };

  // Handle Save / Bookmark Exercise
  const handleToggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          isSaved: !post.isSaved,
        };
      })
    );

    if (selectedPostForDetails && selectedPostForDetails.id === postId) {
      setSelectedPostForDetails((prev) => (prev ? { ...prev, isSaved: !prev.isSaved } : null));
    }
  };

  // Filter Logic
  const filteredPosts = posts.filter((post) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      post.name.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(query)));

    const matchesGroup = filterGroup === 'all' || post.muscleGroup.toLowerCase() === filterGroup.toLowerCase();
    const matchesPose = !onlyPoseCheck || post.hasPoseCheck;

    return matchesSearch && matchesGroup && matchesPose;
  });

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      {/* 1. TopBar Header */}
      <TopBar
        user={initialFitnessData.user}
        streak={initialFitnessData.today.streak}
        onToggleMobileMenu={toggleMobileNav}
      />

      {/* 2. Centered Social Fitness Feed */}
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-5">
        {/* Page Header (Information-first, bold and focused) */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF5722]" />
              <span>Bảng tin</span>
            </h1>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 tabular-nums">
            {posts.length} bài tập
          </span>
        </div>

        {/* Filter & Search Bar */}
        <FeedFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterGroup={filterGroup}
          onFilterGroupChange={setFilterGroup}
          onlyPoseCheck={onlyPoseCheck}
          onOnlyPoseCheckChange={setOnlyPoseCheck}
          totalResults={filteredPosts.length}
        />

        {/* Inline Post Composer */}
        <PostComposer
          currentUser={initialFitnessData.user}
          onPostCreated={handlePostCreated}
        />

        {/* Posts Feed or Empty State */}
        {filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <ExercisePost
                key={post.id}
                post={post}
                onRate={handleRate}
                onToggleSave={handleToggleSave}
                onOpenReport={(p) => setSelectedPostForReport(p)}
                onOpenDetails={(p) => setSelectedPostForDetails(p)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <SearchX className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Không tìm thấy bài tập nào
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Không có bài tập nào phù hợp với bộ lọc hiện tại. Thử xóa tìm kiếm hoặc chọn nhóm cơ khác.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterGroup('all');
                setOnlyPoseCheck(false);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedPostForDetails && (
        <ExerciseDetailModal
          isOpen={true}
          post={selectedPostForDetails}
          onClose={() => setSelectedPostForDetails(null)}
          onRate={handleRate}
          onToggleSave={handleToggleSave}
        />
      )}

      {/* Report Modal */}
      {selectedPostForReport && (
        <ReportModal
          isOpen={true}
          post={selectedPostForReport}
          onClose={() => setSelectedPostForReport(null)}
        />
      )}
    </main>
  );
}
