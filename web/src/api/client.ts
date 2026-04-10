import type { ApiResponse } from '../types';

const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('wf_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers: { ...headers, ...(options.headers ?? {}) } });

  if (res.status === 401) {
    localStorage.removeItem('wf_token');
    localStorage.removeItem('wf_user');
    window.location.href = '/login';
    throw new Error('Session expirée');
  }

  const json = await res.json() as ApiResponse<T>;
  if (!json.success || json.data === undefined) {
    throw new Error(json.error ?? `Erreur ${res.status}`);
  }
  return json.data;
}

export const api = {
  get:    <T>(path: string)                    => request<T>(path),
  post:   <T>(path: string, body: unknown)     => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)     => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)                    => request<T>(path, { method: 'DELETE' }),
};

export default api;
