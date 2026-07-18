import { API_URL } from '../config';
import { Category, Service } from './services';

export type Bootstrap = { categories: Category[]; services: Service[] };

// Fetch the full directory in one call. Times out so a slow/absent network never
// blocks the UI (the app falls back to cached / bundled data).
export async function fetchBootstrap(timeoutMs = 8000): Promise<Bootstrap> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}/bootstrap`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as Bootstrap;
    if (!Array.isArray(data.categories) || !Array.isArray(data.services)) {
      throw new Error('Malformed response');
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}
