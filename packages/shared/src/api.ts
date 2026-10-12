import type { ApiUser, PaginatedExercisesResponse } from './types';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export class ApiException extends Error {
  code: string;
  details?: Record<string, string[]>;
  status: number;

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.status = status;
    this.code = error.code || 'INTERNAL_SERVER_ERROR';
    this.details = error.details;
  }
}

// Each platform plugs in its own base URL and token storage (localStorage vs SecureStore).
const config: { baseUrl: string; getToken: () => Promise<string | null> | string | null } = {
  baseUrl: 'http://localhost:8000/api/v1',
  getToken: () => null,
};

export function configureApi(next: Partial<typeof config>): void {
  Object.assign(config, next);
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { requiresAuth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (options.requiresAuth !== false) {
    const token = await config.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}${endpoint}`, { ...options, headers });
  } catch (err) {
    throw new ApiException(0, {
      code: 'NETWORK_ERROR',
      message: (err as Error).message || 'Không thể kết nối tới máy chủ.',
    });
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiException(
      response.status,
      data?.error || {
        code: `HTTP_${response.status}`,
        message: data?.message || 'Đã có lỗi xảy ra.',
        details: data?.errors,
      }
    );
  }
  return data as T;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const login = (email: string, password: string) =>
  apiRequest<{ data: { user: ApiUser; token: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    requiresAuth: false,
  }).then((r) => r.data);

export const fetchMe = () => apiRequest<{ data: ApiUser }>('/auth/me').then((r) => r.data);

export const logout = () => apiRequest('/auth/logout', { method: 'POST' });

export const fetchExercises = (q = '', page = 1) => {
  const params = new URLSearchParams({ page: String(page), per_page: '30' });
  if (q) params.set('q', q);
  return apiRequest<PaginatedExercisesResponse>(`/exercises?${params}`, { requiresAuth: false });
};
