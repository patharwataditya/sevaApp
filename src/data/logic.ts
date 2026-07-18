// Pure query helpers over category/service arrays. These operate on whatever data
// the app currently holds (live from the API, cached, or bundled fallback) — see
// DataContext for how the data is supplied.

import { Category, Service } from './services';

// Services visible for a given state code: national services everywhere, plus
// services scoped to the user's state.
export function servicesForState(services: Service[], stateCode: string | null): Service[] {
  return services.filter((s) => s.scope === 'national' || s.scope === stateCode);
}

export function servicesByCategory(
  services: Service[],
  categoryId: string,
  stateCode: string | null
): Service[] {
  return servicesForState(services, stateCode).filter((s) => s.categoryId === categoryId);
}

export function searchServices(
  services: Service[],
  query: string,
  stateCode: string | null
): Service[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return servicesForState(services, stateCode).filter((s) => {
    const hay = [
      s.name,
      s.description,
      s.department ?? '',
      ...(s.keywords ?? []),
      ...(s.phones?.map((p) => p.number) ?? []),
    ]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}

export function findCategory(categories: Category[], id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function findService(services: Service[], id: string): Service | undefined {
  return services.find((s) => s.id === id);
}
