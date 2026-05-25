/**
 * Centralized API helper for TrataTudo Hub
 * Ensures all calls use the correct VITE_API_URL and handle credentials.
 */

// Normalize API URL: use the current origin to ensure requests go to the correct absolute URL
const rawApiUrl = typeof window !== 'undefined' ? window.location.origin : (import.meta.env.VITE_API_URL || '');
export const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

/**
 * Safely parse JSON response, checking Content-Type and handling errors.
 */
async function safeJson<T = any>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    const snippet = text.slice(0, 100).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    throw new Error(`Resposta inválida do servidor (não é JSON). Status: ${response.status} ${response.statusText}. Início da resposta: ${snippet}...`);
  }

  try {
    return await response.json();
  } catch (err) {
    throw new Error(`Erro ao processar dados (JSON inválido). Status: ${response.status}.`);
  }
}

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

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });
    return response;
  } catch (err) {
    throw new Error(`Erro de ligação ao servidor. Por favor, verifique a sua internet.`);
  }
}

/**
 * Helper for GET requests
 */
export async function apiGet<T = any>(path: string): Promise<T> {
  const response = await apiFetch(path, { method: 'GET' });
  if (!response.ok) {
    const error = await safeJson(response).catch(() => ({ error: `Erro ${response.status}: ${response.statusText}` }));
    throw new Error(error.error || `A requisição falhou com o status ${response.status}`);
  }
  return safeJson<T>(response);
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
    const error = await safeJson(response).catch(() => ({ error: `Erro ${response.status}: ${response.statusText}` }));
    throw new Error(error.error || `A requisição falhou com o status ${response.status}`);
  }
  return safeJson<T>(response);
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
    const error = await safeJson(response).catch(() => ({ error: `Erro ${response.status}: ${response.statusText}` }));
    throw new Error(error.error || `A requisição falhou com o status ${response.status}`);
  }
  return safeJson<T>(response);
}

/**
 * Helper for PUT requests
 */
export async function apiPut<T = any>(path: string, data?: any): Promise<T> {
  const response = await apiFetch(path, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) {
    const error = await safeJson(response).catch(() => ({ error: `Erro ${response.status}: ${response.statusText}` }));
    throw new Error(error.error || `A requisição falhou com o status ${response.status}`);
  }
  return safeJson<T>(response);
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete<T = any>(path: string): Promise<T> {
  const response = await apiFetch(path, { method: 'DELETE' });
  if (!response.ok) {
    const error = await safeJson(response).catch(() => ({ error: `Erro ${response.status}: ${response.statusText}` }));
    throw new Error(error.error || `A requisição falhou com o status ${response.status}`);
  }
  return safeJson<T>(response);
}
