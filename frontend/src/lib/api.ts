import cleanExerciseDataset from '@/data/exerciseDataset.json';
import { vietnameseFoods } from '@/data/vietnameseFoods';
import { FoodItem } from '@/types/nutrition.types';
import { PaginatedExercisesResponse } from '@/types/workout.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export class FitnessLevelingApiException extends Error {
  code: string;
  details?: Record<string, string[]>;
  status: number;

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = 'FitnessLevelingApiException';
    this.status = status;
    this.code = error.code || 'INTERNAL_SERVER_ERROR';
    this.details = error.details;
  }
}

export const FitTrackApiException = FitnessLevelingApiException;

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { requiresAuth?: boolean; useIdempotency?: boolean; timeoutMs?: number } = {}
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('fitnessleveling_token') || localStorage.getItem('fittrack_token')
      : null;
  // Don't set Content-Type for FormData — the browser adds multipart boundary automatically.
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (options.requiresAuth !== false && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.useIdempotency && ['POST', 'PUT', 'PATCH'].includes(options.method?.toUpperCase() || '')) {
    if (!headers['Idempotency-Key']) {
      headers['Idempotency-Key'] = generateUUID();
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const timeoutMs = options.timeoutMs ?? 2500;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
      headers,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fitnessleveling:session-expired'));
      }
      const errorPayload: ApiError = data?.error || {
        code: `HTTP_${response.status}`,
        message: data?.message || response.statusText || 'An error occurred during the request.',
        details: data?.errors,
      };
      throw new FitnessLevelingApiException(response.status, errorPayload);
    }

    return data as T;
  } catch (err) {
    if (err instanceof FitnessLevelingApiException) {
      throw err;
    }
    throw new FitnessLevelingApiException(500, {
      code: 'NETWORK_ERROR',
      message: (err as Error).message || 'Unable to communicate with the server.',
    });
  }
}

export interface FetchExercisesParams {
  q?: string;
  category?: string;
  body_part?: string;
  equipment?: string;
  has_ai?: boolean;
  page?: number;
  per_page?: number;
}

export async function fetchExercises(
  params?: FetchExercisesParams
): Promise<PaginatedExercisesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set('q', params.q);
  if (params?.category && params.category !== 'all') searchParams.set('category', params.category);
  if (params?.body_part && params.body_part !== 'all') searchParams.set('body_part', params.body_part);
  if (params?.equipment && params.equipment !== 'all') searchParams.set('equipment', params.equipment);
  if (params?.has_ai) searchParams.set('has_ai', 'true');
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.per_page) searchParams.set('per_page', params.per_page.toString());

  const queryString = searchParams.toString();
  const endpoint = `/exercises${queryString ? `?${queryString}` : ''}`;

  try {
    const remoteRes = await apiRequest<PaginatedExercisesResponse>(endpoint, {
      requiresAuth: false,
    });
    if (remoteRes && remoteRes.data && remoteRes.data.length > 0) {
      return remoteRes;
    }
  } catch (err) {
    // If backend is offline or unreachable, fall through to high-performance local dataset
  }

  // --- LOCAL DATASET FALLBACK (1,324 EXERCISES) ---
  const q = (params?.q || '').trim().toLowerCase();
  const category = (params?.category || 'all').toLowerCase();
  const bodyPart = (params?.body_part || 'all').toLowerCase();
  const equipment = (params?.equipment || 'all').toLowerCase();
  const hasAi = Boolean(params?.has_ai);
  const page = Math.max(1, params?.page || 1);
  const perPage = Math.max(1, params?.per_page || 24);

  const dataset = (cleanExerciseDataset as any[]) || [];
  const filtered = dataset.filter((item) => {
    if (q) {
      const matchName = item.name?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    if (category !== 'all') {
      const itemCat = (item.category || '').toLowerCase();
      const itemBody = (item.body_part || '').toLowerCase();
      if (itemCat !== category && itemBody !== category && !itemBody.includes(category)) return false;
    }
    if (bodyPart !== 'all') {
      const itemBody = (item.body_part || '').toLowerCase();
      if (itemBody !== bodyPart && !itemBody.includes(bodyPart)) return false;
    }
    if (equipment !== 'all') {
      const itemEq = (item.equipment || '').toLowerCase();
      if (!itemEq.includes(equipment) && !equipment.includes(itemEq)) return false;
    }
    if (hasAi && !item.has_ai_check) {
      return false;
    }
    return true;
  });

  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const from = (page - 1) * perPage;
  const to = Math.min(from + perPage, total);
  const pagedData = filtered.slice(from, to);

  return {
    data: pagedData,
    current_page: page,
    last_page: lastPage,
    per_page: perPage,
    total,
  };
}

export interface FetchFoodsParams {
  q?: string;
  category?: string;
  item_type?: string;
  page?: number;
  per_page?: number;
}

export async function fetchFoods(params?: FetchFoodsParams): Promise<FoodItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set('q', params.q);
  if (params?.category && params.category !== 'Tất cả') searchParams.set('category', params.category);
  if (params?.item_type && params.item_type !== 'ALL') searchParams.set('item_type', params.item_type);
  if (params?.page) searchParams.set('page', params.page.toString());
  searchParams.set('per_page', (params?.per_page ?? 500).toString());

  const queryString = searchParams.toString();
  const endpoint = `/foods${queryString ? `?${queryString}` : ''}`;

  try {
    const res = await apiRequest<{ data: FoodItem[] }>(endpoint, {
      requiresAuth: false,
      timeoutMs: 4000,
    });
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((item) => ({
        ...item,
        base_serving: item.base_serving || item.serving_size || '1 phần',
        base_calories: item.base_calories ?? item.calories ?? 0,
        base_macros: item.base_macros ?? {
          protein: item.protein ?? 0,
          carbs: item.carbs ?? 0,
          fat: item.fat ?? 0,
        },
        min_multiplier: item.min_multiplier ?? 0.5,
        max_multiplier: item.max_multiplier ?? 2.5,
      }));
    }
  } catch {
    // Fallback to bundled Vietnamese foods dataset when backend is unreachable
  }

  return vietnameseFoods;
}


