/**
 * Centralized API helper for TrataTudo Hub
 * Ensures all calls use the correct VITE_API_URL and handle credentials.
 */

// Normalize API URL: remove trailing slash if exists
const rawApiUrl = import.meta.env.VITE_API_URL || '';
export const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

/**
 * Standard fetch wrapper with credentials and base URL
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
  });

  return response;
}

/**
 * Helper for GET requests
 */
export async function apiGet<T = any>(path: string): Promise<T> {
  const response = await apiFetch(path, { method: 'GET' });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

/**
 * Helper for POST requests
 */
export async function apiPost<T = any>(path: string, data?: any): Promise<T> {
  const response = await apiFetch(path, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

/**
 * Helper for PATCH requests
 */
export async function apiPatch<T = any>(path: string, data?: any): Promise<T> {
  const response = await apiFetch(path, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete<T = any>(path: string): Promise<T> {
  const response = await apiFetch(path, { method: 'DELETE' });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}
