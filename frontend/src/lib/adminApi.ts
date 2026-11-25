import { apiRequest } from './api';

export type AdminStatsRange = '7d' | '30d' | '90d';

export interface AdminStatsSeriesPoint {
  label: string;
  date: string;
  new_users: number;
  workouts: number;
  ai_plan_uses: number;
  ai_pose_uses: number;
}

export interface AdminTopExercise {
  id: string;
  name: string;
  muscle_group: string | null;
  sets_count: number;
}

export interface AdminStatsData {
  range: AdminStatsRange;
  kpis: {
    total_users: number;
    new_users: number;
    active_users: number;
    banned_users: number;
    total_workouts: number;
    workouts_in_range: number;
    nutrition_logs_in_range: number;
    total_exercises: number;
    total_foods: number;
    pending_exercises_count: number;
    pending_reports_count: number;
    community_posts_in_range: number;
  };
  ai_exercise_plan: {
    total_uses: number;
    all_time_uses: number;
    llm_calls: number;
    fallback_calls: number;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    all_time_tokens: number;
    avg_latency_ms: number;
    avg_llm_latency_ms: number;
  };
  ai_pose: {
    total_uses: number;
    all_time_uses: number;
    video_upload_uses: number;
    realtime_uses: number;
    completed_uses: number;
    failed_uses: number;
    avg_score: number;
  };
  series: AdminStatsSeriesPoint[];
  top_exercises: AdminTopExercise[];
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedAdminResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  goal?: string | null;
  gender?: string | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  birth_date?: string | null;
  activity_level?: string | null;
  xp?: number;
  level?: number;
  current_streak?: number;
  banned_at?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  workout_logs_count?: number;
  nutrition_logs_count?: number;
  community_posts_count?: number;
  pose_check_sessions_count?: number;
  workout_routines_count?: number;
}

export interface AdminExercise {
  id: string;
  name: string;
  description?: string | null;
  muscle_group?: string | null;
  category?: string | null;
  body_part?: string | null;
  target_muscle?: string | null;
  equipment?: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail_url?: string | null;
  gif_url?: string | null;
  video_url?: string | null;
  instructions?: unknown;
  has_pose_check: boolean;
  pose_rules_key?: string | null;
  verified: boolean;
  status: 'active' | 'under_review' | 'rejected';
  pending_reports_count?: number;
  creator?: { id: string; name: string; email: string } | null;
  deleted_at?: string | null;
  updated_at?: string;
}

export interface AdminExerciseReport {
  id: string;
  exercise_id: string;
  reporter_id: string;
  reason: string;
  detail?: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  exercise?: {
    id: string;
    name: string;
    muscle_group?: string | null;
    status: string;
    deleted_at?: string | null;
  } | null;
  reporter?: { id: string; name: string; email: string } | null;
  resolver?: { id: string; name: string; email: string } | null;
}

export interface AdminFood {
  id: string;
  name: string;
  name_en?: string | null;
  category: string;
  item_type: 'DISH' | 'RAW';
  serving_size: string;
  serving_weight_g?: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  min_multiplier: number;
  max_multiplier: number;
  image_url?: string | null;
  description?: string | null;
  tags: string[];
  deleted_at?: string | null;
  updated_at?: string;
}

export interface AdminCommunityPost {
  id: string;
  user_id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  deleted_at?: string | null;
  user?: { id: string; name: string; email: string; avatar_url?: string | null } | null;
}

export interface AdminCommunityComment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  deleted_at?: string | null;
  user?: { id: string; name: string; email: string } | null;
  post?: { id: string; content: string; deleted_at?: string | null } | null;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') {
      sp.set(k, String(v));
    }
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const adminApi = {
  getStats(range: AdminStatsRange = '30d') {
    return apiRequest<{ data: AdminStatsData }>(`/admin/stats?range=${range}`, {
      timeoutMs: 8000,
    });
  },

  // Users
  getUsers(params: { q?: string; role?: string; status?: string; page?: number; per_page?: number }) {
    return apiRequest<PaginatedAdminResponse<AdminUser>>(`/admin/users${buildQuery(params)}`, {
      timeoutMs: 8000,
    });
  },
  getUser(id: string) {
    return apiRequest<{ data: AdminUser }>(`/admin/users/${id}`, { timeoutMs: 8000 });
  },
  createUser(payload: Record<string, unknown>) {
    return apiRequest<{ data: AdminUser }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 8000,
    });
  },
  updateUser(id: string, payload: Record<string, unknown>) {
    return apiRequest<{ data: AdminUser }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      timeoutMs: 8000,
    });
  },
  toggleBanUser(id: string) {
    return apiRequest<{ data: AdminUser }>(`/admin/users/${id}/toggle-ban`, {
      method: 'POST',
      timeoutMs: 8000,
    });
  },
  deleteUser(id: string) {
    return apiRequest<{ data: { id: string; deleted: boolean } }>(`/admin/users/${id}`, {
      method: 'DELETE',
      timeoutMs: 8000,
    });
  },
  restoreUser(id: string) {
    return apiRequest<{ data: AdminUser }>(`/admin/users/${id}/restore`, {
      method: 'POST',
      timeoutMs: 8000,
    });
  },

  // Exercises & Reports
  getExercises(params: { q?: string; category?: string; status?: string; trashed?: string; page?: number; per_page?: number }) {
    return apiRequest<PaginatedAdminResponse<AdminExercise>>(`/admin/exercises${buildQuery(params)}`, {
      timeoutMs: 8000,
    });
  },
  createExercise(payload: Record<string, unknown>) {
    return apiRequest<{ data: AdminExercise }>('/admin/exercises', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 8000,
    });
  },
  updateExercise(id: string, payload: Record<string, unknown>) {
    return apiRequest<{ data: AdminExercise }>(`/admin/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      timeoutMs: 8000,
    });
  },
  deleteExercise(id: string) {
    return apiRequest<{ data: { id: string; deleted: boolean } }>(`/admin/exercises/${id}`, {
      method: 'DELETE',
      timeoutMs: 8000,
    });
  },
  restoreExercise(id: string) {
    return apiRequest<{ data: AdminExercise }>(`/admin/exercises/${id}/restore`, {
      method: 'POST',
      timeoutMs: 8000,
    });
  },
  getExerciseReports(params: { status?: string; page?: number; per_page?: number }) {
    return apiRequest<PaginatedAdminResponse<AdminExerciseReport>>(`/admin/exercise-reports${buildQuery(params)}`, {
      timeoutMs: 8000,
    });
  },
  resolveExerciseReport(id: string, action: 'dismiss' | 'resolve_and_hide') {
    return apiRequest<{ data: AdminExerciseReport }>(`/admin/exercise-reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
      timeoutMs: 8000,
    });
  },

  // Foods
  getFoods(params: { q?: string; category?: string; item_type?: string; trashed?: string; page?: number; per_page?: number }) {
    return apiRequest<PaginatedAdminResponse<AdminFood>>(`/admin/foods${buildQuery(params)}`, {
      timeoutMs: 8000,
    });
  },
  createFood(payload: Record<string, unknown>) {
    return apiRequest<{ data: AdminFood }>('/admin/foods', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 8000,
    });
  },
  updateFood(id: string, payload: Record<string, unknown>) {
    return apiRequest<{ data: AdminFood }>(`/admin/foods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      timeoutMs: 8000,
    });
  },
  deleteFood(id: string) {
    return apiRequest<{ data: { id: string; deleted: boolean } }>(`/admin/foods/${id}`, {
      method: 'DELETE',
      timeoutMs: 8000,
    });
  },
  restoreFood(id: string) {
    return apiRequest<{ data: AdminFood }>(`/admin/foods/${id}/restore`, {
      method: 'POST',
      timeoutMs: 8000,
    });
  },

  // Community
  getCommunityPosts(params: { q?: string; trashed?: string; page?: number; per_page?: number }) {
    return apiRequest<PaginatedAdminResponse<AdminCommunityPost>>(`/admin/community/posts${buildQuery(params)}`, {
      timeoutMs: 8000,
    });
  },
  deleteCommunityPost(id: string) {
    return apiRequest<{ data: { id: string; deleted: boolean } }>(`/admin/community/posts/${id}`, {
      method: 'DELETE',
      timeoutMs: 8000,
    });
  },
  restoreCommunityPost(id: string) {
    return apiRequest<{ data: AdminCommunityPost }>(`/admin/community/posts/${id}/restore`, {
      method: 'POST',
      timeoutMs: 8000,
    });
  },
  getCommunityComments(params: { q?: string; post_id?: string; trashed?: string; page?: number; per_page?: number }) {
    return apiRequest<PaginatedAdminResponse<AdminCommunityComment>>(`/admin/community/comments${buildQuery(params)}`, {
      timeoutMs: 8000,
    });
  },
  deleteCommunityComment(id: string) {
    return apiRequest<{ data: { id: string; deleted: boolean } }>(`/admin/community/comments/${id}`, {
      method: 'DELETE',
      timeoutMs: 8000,
    });
  },
  restoreCommunityComment(id: string) {
    return apiRequest<{ data: AdminCommunityComment }>(`/admin/community/comments/${id}/restore`, {
      method: 'POST',
      timeoutMs: 8000,
    });
  },
};
