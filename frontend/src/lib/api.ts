const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export class FitTrackApiException extends Error {
  code: string;
  details?: Record<string, string[]>;
  status: number;

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = 'FitTrackApiException';
    this.status = status;
    this.code = error.code || 'INTERNAL_SERVER_ERROR';
    this.details = error.details;
  }
}

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
  options: RequestInit & { requiresAuth?: boolean; useIdempotency?: boolean } = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('fittrack_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorPayload: ApiError = data?.error || {
        code: `HTTP_${response.status}`,
        message: data?.message || response.statusText || 'An error occurred during the request.',
        details: data?.errors,
      };
      throw new FitTrackApiException(response.status, errorPayload);
    }

    return data as T;
  } catch (err) {
    if (err instanceof FitTrackApiException) {
      throw err;
    }
    throw new FitTrackApiException(500, {
      code: 'NETWORK_ERROR',
      message: (err as Error).message || 'Unable to communicate with the server.',
    });
  }
}
