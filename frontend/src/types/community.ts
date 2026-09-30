export interface AuthorInfo {
  name: string;
  avatar?: string;
  verified?: boolean;
  level?: number;
  handle?: string;
}

export interface ExercisePostItem {
  id: string;
  name: string;
  author: AuthorInfo;
  timestamp: string;
  createdAt?: string;
  muscleGroup: 'legs' | 'chest' | 'back' | 'core' | 'shoulders' | 'arms' | 'full_body' | string;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | string;
  hasPoseCheck: boolean;
  verified: boolean;
  avgRating: number;
  ratingCount: number;
  userRating?: number;
  isSaved?: boolean;
  description: string;
  mediaType?: 'image' | 'video' | 'none';
  mediaUrl?: string;
  tags?: string[];
  instructions?: string[];
}

export const initialCommunityPosts: ExercisePostItem[] = [
  {
    id: 'post-1',
    name: 'Barbell Back Squat',
    author: {
      name: 'Alex Morgan',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verified: true,
      level: 24,
      handle: '@alex_lifts',
    },
    timestamp: '2 hours ago',
    createdAt: '2026-09-23T22:30:00Z',
    muscleGroup: 'legs',
    equipment: 'barbell',
    difficulty: 'intermediate',
    hasPoseCheck: true,
    verified: true,
    avgRating: 4.9,
    ratingCount: 142,
    description: 'A compound lower-body exercise focused on developing quadriceps, gluteal strength, and core stability. Keep the chest proud and drive through the mid-foot.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
    tags: ['LEGS', 'BARBELL', 'INTERMEDIATE'],
    instructions: [
      'Position the bar across the upper traps with a tight grip.',
      'Brace your core, unrack, and take 2-3 controlled steps back.',
      'Hinge at the hips and bend knees simultaneously until hip crease is parallel with knees.',
      'Drive powerfully upward through mid-foot while keeping chest upright.',
    ],
  },
  {
    id: 'post-2',
    name: 'Romanian Deadlift',
    author: {
      name: 'Jamie Carter',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verified: true,
      level: 19,
      handle: '@jamie_power',
    },
    timestamp: '5 hours ago',
    createdAt: '2026-09-23T19:45:00Z',
    muscleGroup: 'legs',
    equipment: 'barbell',
    difficulty: 'intermediate',
    hasPoseCheck: true,
    verified: true,
    avgRating: 4.8,
    ratingCount: 96,
    description: 'A hip-hinge movement that emphasizes the hamstrings and posterior chain. Focus on pushing your hips back rather than squatting down.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    tags: ['HAMSTRINGS', 'BARBELL', 'INTERMEDIATE'],
    instructions: [
      'Stand hip-width apart holding the barbell at thigh level with an overhand grip.',
      'Slightly bend knees, lock shoulder blades back and down.',
      'Hinge forward from the hips, pushing glutes backward while keeping the bar close to shins.',
      'Lower until feeling a deep stretch in hamstrings, then contract glutes to return upright.',
    ],
  },
  {
    id: 'post-3',
    name: 'Dumbbell Shoulder Press',
    author: {
      name: 'Taylor Lee',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      verified: true,
      level: 15,
      handle: '@taylor_fit',
    },
    timestamp: 'Yesterday',
    createdAt: '2026-09-22T14:15:00Z',
    muscleGroup: 'shoulders',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    hasPoseCheck: true,
    verified: true,
    avgRating: 4.7,
    ratingCount: 78,
    description: 'A pressing movement for building shoulder strength, anterior deltoid control, and core stability in an overhead vertical plane.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    tags: ['SHOULDERS', 'DUMBBELL', 'BEGINNER'],
    instructions: [
      'Sit on an upright bench or stand with feet shoulder-width apart.',
      'Raise dumbbells to shoulder level with palms facing forward or slightly angled.',
      'Press dumbbells overhead smoothly until arms are extended without locking elbows.',
      'Lower weights in a controlled 2-second tempo back to starting position.',
    ],
  },
  {
    id: 'post-4',
    name: 'Standard Push-up',
    author: {
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      verified: false,
      level: 12,
      handle: '@vance_calisthenics',
    },
    timestamp: '2 days ago',
    createdAt: '2026-09-21T10:00:00Z',
    muscleGroup: 'chest',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    hasPoseCheck: true,
    verified: true,
    avgRating: 4.85,
    ratingCount: 110,
    description: 'Classic calisthenic upper body pushing exercise targeting pectorals, anterior deltoids, and triceps with complete core integration.',
    mediaType: 'none',
    tags: ['CHEST', 'BODYWEIGHT', 'BEGINNER'],
    instructions: [
      'Place hands slightly wider than shoulder-width, wrists under shoulders.',
      'Engage glutes and core to keep body in a straight rigid plank.',
      'Lower chest towards floor until elbows form a 45-degree angle.',
      'Push the ground away to return to top position.',
    ],
  },
  {
    id: 'post-5',
    name: 'Forearm Plank Hold',
    author: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      verified: true,
      level: 21,
      handle: '@elena_core',
    },
    timestamp: '3 days ago',
    createdAt: '2026-09-20T08:30:00Z',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    hasPoseCheck: true,
    verified: true,
    avgRating: 4.75,
    ratingCount: 88,
    description: 'Isometric core stability posture engaging rectus abdominis, obliques, and spinal erectors for functional posture support.',
    mediaType: 'none',
    tags: ['CORE', 'BODYWEIGHT', 'BEGINNER'],
    instructions: [
      'Place forearms on the floor with elbows aligned below shoulders.',
      'Tuck toes and lift body, creating a straight line from head to heels.',
      'Pull belly button inward toward spine and squeeze glutes.',
      'Hold position with steady rhythmic breathing.',
    ],
  },
];
