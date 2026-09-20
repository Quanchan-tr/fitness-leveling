'use strict';
'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { initialFitnessData } from '@/lib/fitnessData';
import { Users, Search, Star, ShieldCheck, Video, Dumbbell, Flag, Plus } from 'lucide-react';

interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  hasPoseCheck: boolean;
  verified: boolean;
  avgRating: number;
  ratingCount: number;
  description: string;
}

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [onlyPoseCheck, setOnlyPoseCheck] = useState(false);

  const [exercises] = useState<ExerciseItem[]>([
    {
      id: '1',
      name: 'Barbell Back Squat',
      muscleGroup: 'legs',
      equipment: 'barbell',
      difficulty: 'intermediate',
      hasPoseCheck: true,
      verified: true,
      avgRating: 4.9,
      ratingCount: 142,
      description: 'Fundamental lower body compound exercise focusing on quadriceps, glutes, and core stability.',
    },
    {
      id: '2',
      name: 'Standard Push-up',
      muscleGroup: 'chest',
      equipment: 'bodyweight',
      difficulty: 'beginner',
      hasPoseCheck: true,
      verified: true,
      avgRating: 4.8,
      ratingCount: 98,
      description: 'Classic calisthenic upper body pushing exercise targeting pectorals, anterior deltoids, and triceps.',
    },
    {
      id: '3',
      name: 'Forearm Plank Hold',
      muscleGroup: 'core',
      equipment: 'bodyweight',
      difficulty: 'beginner',
      hasPoseCheck: true,
      verified: true,
      avgRating: 4.7,
      ratingCount: 85,
      description: 'Isometric core stability posture engaging rectus abdominis, obliques, and spinal erectors.',
    },
    {
      id: '4',
      name: 'Conventional Deadlift',
      muscleGroup: 'back',
      equipment: 'barbell',
      difficulty: 'advanced',
      hasPoseCheck: false,
      verified: true,
      avgRating: 4.95,
      ratingCount: 210,
      description: 'Posterior chain compound powerhouse targeting glutes, hamstrings, and the entire back structure.',
    },
    {
      id: '5',
      name: 'Incline Dumbbell Press',
      muscleGroup: 'chest',
      equipment: 'dumbbell',
      difficulty: 'intermediate',
      hasPoseCheck: false,
      verified: false,
      avgRating: 4.6,
      ratingCount: 43,
      description: 'Upper clavicular head pectoral development with improved range of motion using independent dumbbells.',
    },
  ]);

  const filtered = exercises.filter((ex) => {
    const matchQuery = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGroup = filterGroup === 'all' || ex.muscleGroup === filterGroup;
    const matchPose = !onlyPoseCheck || ex.hasPoseCheck;
    return matchQuery && matchGroup && matchPose;
  });

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <TopBar user={initialFitnessData.user} streak={initialFitnessData.today.streak} />

      <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1F2328] tracking-tight flex items-center gap-2.5">
              <Users className="w-7 h-7 text-[#FF6B35]" />
              Exercise Library & Community
            </h1>
            <p className="text-xs text-[#76583E] mt-0.5">
              Discover verified workouts, community submissions, and AI Pose Check enabled movements.
            </p>
          </div>
          <button className="bg-[#FF6B35] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#FF6B35]/90 transition-all flex items-center gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            Contribute Exercise
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#B9A78E]/40 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#76583E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exercises by name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F7F3EA] rounded-xl border border-[#B9A78E]/30 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="bg-[#F7F3EA] px-3 py-2 rounded-xl border border-[#B9A78E]/30 text-xs font-medium text-[#1F2328]"
            >
              <option value="all">All Muscle Groups</option>
              <option value="chest">Chest</option>
              <option value="back">Back</option>
              <option value="legs">Legs</option>
              <option value="core">Core</option>
            </select>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#1F2328] cursor-pointer bg-[#F7F3EA] px-3 py-2 rounded-xl border border-[#B9A78E]/30">
              <input
                type="checkbox"
                checked={onlyPoseCheck}
                onChange={(e) => setOnlyPoseCheck(e.target.checked)}
                className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
              />
              <Video className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>Pose Check Only</span>
            </label>
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ex) => (
            <div
              key={ex.id}
              className="bg-white rounded-2xl border border-[#B9A78E]/40 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#1F2328]">{ex.name}</h3>
                      {ex.verified && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#7FB069] bg-[#7FB069]/15 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#76583E] uppercase font-semibold">
                      {ex.muscleGroup} • {ex.equipment} • {ex.difficulty}
                    </span>
                  </div>

                  {ex.hasPoseCheck && (
                    <span className="flex items-center gap-1 bg-[#FF6B35]/10 text-[#FF6B35] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#FF6B35]/20">
                      <Video className="w-3 h-3" />
                      AI Pose Check
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#76583E] mt-3 leading-relaxed">
                  {ex.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#B9A78E]/20 text-xs">
                <div className="flex items-center gap-1 text-[#F4C95D] font-bold">
                  <Star className="w-4 h-4 fill-[#F4C95D]" />
                  <span className="text-[#1F2328]">{ex.avgRating}</span>
                  <span className="text-[#76583E] font-normal">({ex.ratingCount} reviews)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="text-[11px] text-[#76583E] hover:text-red-500 flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    Report
                  </button>
                  <button className="bg-[#E8E1D5] hover:bg-[#FF6B35] hover:text-white text-[#1F2328] px-3 py-1.5 rounded-lg font-bold text-xs transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
