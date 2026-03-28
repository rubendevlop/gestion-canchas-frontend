import { auth } from '../firebase';

function normalizeBaseUrl(value) {
  return String(value || '')
    .trim()
    .replace(/\/+$/, '');
}

function resolveApiUrl() {
  const envUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);

  if (!envUrl) {
    return '/api';
  }

  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    try {
      const parsed = new URL(envUrl, window.location.origin);
      if (parsed.origin !== window.location.origin) {
        console.warn(
          `VITE_API_URL apunta a otro origen (${parsed.origin}). Se usa /api del sitio actual.`,
        );
        return '/api';
      }
    } catch {
      return envUrl.startsWith('/') ? envUrl : '/api';
    }
  }

  return envUrl;
}

const API_URL = resolveApiUrl();

export const fetchAPI = async (endpoint, options = {}) => {
  let token = null;
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.error || data.message || data.detail || `Error HTTP: ${response.status}`,
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
