import { cookies } from 'next/headers';

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number | null;
};

const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.API_URL || 'http://localhost:4000/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
};

export async function getData<T>(
  endpoint: string,
  token: string
): Promise<ApiResponse<T>> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `${getBaseUrl()}${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.status === 401) return { data: null, error: 'Unauthorized', status: 401 };
    if (res.status === 403) return { data: null, error: 'Forbidden', status: 403 };
    if (res.status === 404) return { data: null, error: 'Not Found', status: 404 };
    if (!res.ok) {
      const text = await res.text();
      return { data: null, error: text || `Server Error: ${res.status}`, status: res.status };
    }
    const data = await res.json();
    return { data, error: null, status: res.status };
  } catch (error: unknown) {
    if ((error as Error)?.name === 'AbortError') {
      return { data: null, error: 'Request Timeout', status: 408 };
    }
    return { data: null, error: 'Network Error', status: null };
  }
}

export async function getServerToken() {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value || null;
}