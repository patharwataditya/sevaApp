import type { Category, Service, ProfileField } from './types';

// Config is read from Vite env (admin/.env.local) with a localStorage override
// so you can change it from the UI without editing files.
const ENV_URL = (import.meta.env.VITE_API_URL as string) || '';
const ENV_KEY = (import.meta.env.VITE_ADMIN_KEY as string) || '';

export function getConfig() {
  return {
    apiUrl: localStorage.getItem('seva.apiUrl') || ENV_URL,
    adminKey: localStorage.getItem('seva.adminKey') || ENV_KEY,
  };
}

export function setConfig(apiUrl: string, adminKey: string) {
  localStorage.setItem('seva.apiUrl', apiUrl.replace(/\/+$/, ''));
  localStorage.setItem('seva.adminKey', adminKey);
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const { apiUrl, adminKey } = getConfig();
  if (!apiUrl) throw new Error('API URL not set — open Settings.');
  const res = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(method !== 'GET' ? { 'x-admin-key': adminKey } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data as T;
}

export async function fetchBootstrap(): Promise<{
  categories: Category[];
  services: Service[];
  profileFields?: ProfileField[];
}> {
  return request('GET', '/bootstrap');
}

// Signup form fields (stored as a single config blob).
export const saveProfileFields = (fields: ProfileField[]) =>
  request<{ item: { id: string; fields: ProfileField[] } }>(
    'PUT',
    '/config/profileFields',
    { fields }
  );

// Categories
export const createCategory = (c: Partial<Category>) =>
  request<{ item: Category }>('POST', '/categories', c);
export const updateCategory = (id: string, c: Partial<Category>) =>
  request<{ item: Category }>('PUT', `/categories/${id}`, c);
export const deleteCategory = (id: string) =>
  request<{ deleted: string }>('DELETE', `/categories/${id}`);

// Services
export const createService = (s: Partial<Service>) =>
  request<{ item: Service }>('POST', '/services', s);
export const updateService = (id: string, s: Partial<Service>) =>
  request<{ item: Service }>('PUT', `/services/${id}`, s);
export const deleteService = (id: string) =>
  request<{ deleted: string }>('DELETE', `/services/${id}`);

export async function checkHealth(): Promise<boolean> {
  try {
    const { apiUrl } = getConfig();
    const res = await fetch(`${apiUrl}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
