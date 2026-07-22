// Pure query helpers over category/service arrays. These operate on whatever data
// the app currently holds (live from the API, cached, or bundled fallback) — see
// DataContext for how the data is supplied.

import { Category, Service } from './services';

// Normalise a district name for lenient matching (geocoder output vs. admin
// input can differ in case, spacing or a trailing "District").
function normDistrict(d: string | null | undefined): string {
  return (d ?? '')
    .toLowerCase()
    .replace(/\bdistrict\b/g, '')
    .replace(/[^a-z]/g, '')
    .trim();
}

// True if a state-scoped service's district targeting matches the user's
// district. Services without a district target apply to the whole state.
function districtMatches(service: Service, district: string | null): boolean {
  if (!service.district) return true;
  const want = normDistrict(service.district);
  const have = normDistrict(district);
  if (!want) return true;
  if (!have) return false; // service is district-specific but we don't know the user's district
  return have === want || have.includes(want) || want.includes(have);
}

// Services visible for a given location: national services everywhere, plus
// services scoped to the user's state (optionally narrowed to their district).
export function servicesForLocation(
  services: Service[],
  stateCode: string | null,
  district: string | null = null
): Service[] {
  return services.filter(
    (s) =>
      s.scope === 'national' ||
      (s.scope === stateCode && districtMatches(s, district))
  );
}

export function servicesByCategory(
  services: Service[],
  categoryId: string,
  stateCode: string | null,
  district: string | null = null
): Service[] {
  return servicesForLocation(services, stateCode, district).filter(
    (s) => s.categoryId === categoryId
  );
}

export function searchServices(
  services: Service[],
  query: string,
  stateCode: string | null,
  district: string | null = null
): Service[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return servicesForLocation(services, stateCode, district).filter((s) => {
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
