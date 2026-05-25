/**
 * Centralized API helper for TrataTudo Hub (Vanilla Vanilla Edition)
 * Handles responses, errors, absolute paths, and authentication headers/credentials.
 */

const API_BASE = window.location.origin;

async function safeJson(response) {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    const snippet = text.slice(0, 100).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    throw new Error(`Resposta do servidor inválida (não-JSON). Status: ${response.status} ${response.statusText}. Começo: ${snippet}...`);
  }

  try {
    return await response.json();
  } catch (err) {
    throw new Error(`Erro ao descodificar dados (JSON inválido). Status: ${response.status}.`);
  }
}

async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  
  const defaultOptions = {
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
    console.error(err);
    throw new Error(`Sem rede ou impossível ligar ao servidor. Por favor, tente novamente.`);
  }
}

async function apiGet(path) {
  const response = await apiFetch(path, { method: 'GET' });
  if (!response.ok) {
    const error = await safeJson(response).catch(() => ({ error: `Erro ${response.status}: ${response.statusText}` }));
    throw new Error(error.error || `Ação falhou com status ${response.status}`);
  }
  return safeJson(response);
}

async function apiPost(path, data) {
  const response = await apiFetch(path, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) {
    const error = await safeJson(response).catch(() => ({ error: `Erro ${response.status}: ${response.statusText}` }));
    throw new Error(error.error || `Ação falhou com status ${response.status}`);
  }
  return safeJson(response);
}

async function apiPatch(path, data) {
  const response = await apiFetch(path, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) {
    const error = await safeJson(response).catch(() => ({ error: `Erro ${response.status}: ${response.statusText}` }));
    throw new Error(error.error || `Ação falhou com status ${response.status}`);
  }
  return safeJson(response);
}

async function apiPut(path, data) {
  const response = await apiFetch(path, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) {
    const error = await safeJson(response).catch(() => ({ error: `Erro ${response.status}: ${response.statusText}` }));
    throw new Error(error.error || `Ação falhou com status ${response.status}`);
  }
  return safeJson(response);
}

async function apiDelete(path) {
  const response = await apiFetch(path, { method: 'DELETE' });
  if (!response.ok) {
    const error = await safeJson(response).catch(() => ({ error: `Erro ${response.status}: ${response.statusText}` }));
    throw new Error(error.error || `Ação falhou com status ${response.status}`);
  }
  return safeJson(response);
}

// Global Exports
window.apiGet = apiGet;
window.apiPost = apiPost;
window.apiPatch = apiPatch;
window.apiPut = apiPut;
window.apiDelete = apiDelete;
