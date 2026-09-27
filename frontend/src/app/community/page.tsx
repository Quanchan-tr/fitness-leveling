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
import { SearchX, Sparkles } from 'lucide-react';

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [onlyPoseCheck, setOnlyPoseCheck] = useState(false);

  // Community posts list state
  const [posts, setPosts] = useState<ExercisePostItem[]>(initialCommunityPosts);

  // Modals state
  const [selectedPostForDetails, setSelectedPostForDetails] = useState<ExercisePostItem | null>(null);
  const [selectedPostForReport, setSelectedPostForReport] = useState<ExercisePostItem | null>(null);

  // 1. Handle New Post Creation from PostComposer
  const handlePostCreated = (newPost: ExercisePostItem) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // 2. Handle Rating Exercise
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

    // If modal is currently open for this post, update modal state too
    if (selectedPostForDetails && selectedPostForDetails.id === postId) {
      setSelectedPostForDetails((prev) => (prev ? { ...prev, userRating: rating } : null));
    }
  };

  // 3. Handle Save / Bookmark Exercise
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

    // If modal is currently open for this post, update modal state too
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
    <main className="flex-1 flex flex-col min-w-0 bg-[#F7F3EA] min-h-screen">
      {/* 1. Preserved Global TopBar Header */}
      <TopBar user={initialFitnessData.user} streak={initialFitnessData.today.streak} />

      {/* 2. Sticky Feed Filter & Search Bar */}
      <FeedFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterGroup={filterGroup}
        onFilterGroupChange={setFilterGroup}
        onlyPoseCheck={onlyPoseCheck}
        onOnlyPoseCheckChange={setOnlyPoseCheck}
        totalResults={filteredPosts.length}
      />

      {/* 3. Centered Vertical Newsfeed Container (Max width ~680px) */}
      <div className="flex-1 max-w-[680px] w-full mx-auto px-4 py-6 space-y-5">
        {/* Post Composer Card */}
        <PostComposer
          currentUser={initialFitnessData.user}
          onPostCreated={handlePostCreated}
        />

        {/* Feed Header / Sub-title */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF6B35]" />
            <h2 className="text-xs font-bold text-[#1F2328] uppercase tracking-wider">
              Community Feed & Verified Library
            </h2>
          </div>
          <span className="text-[11px] text-[#76583E] font-medium">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'Exercise' : 'Exercises'}
          </span>
        </div>

        {/* Exercise Posts List */}
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
          /* Empty State */
          <div className="bg-white rounded-2xl border border-[#B9A78E]/40 p-8 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#E8E1D5] text-[#76583E] flex items-center justify-center mx-auto">
              <SearchX className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#1F2328]">No exercises match your search</h3>
            <p className="text-xs text-[#76583E] max-w-sm mx-auto">
              We couldn’t find any community posts matching &quot;{searchQuery || filterGroup}&quot;. Try adjusting your keywords or clearing filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterGroup('all');
                setOnlyPoseCheck(false);
              }}
              className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        post={selectedPostForDetails}
        isOpen={Boolean(selectedPostForDetails)}
        onClose={() => setSelectedPostForDetails(null)}
        onToggleSave={handleToggleSave}
        onRate={handleRate}
      />

      {/* Report Modal */}
      <ReportModal
        post={selectedPostForReport}
        isOpen={Boolean(selectedPostForReport)}
        onClose={() => setSelectedPostForReport(null)}
      />
    </main>
  );
}
