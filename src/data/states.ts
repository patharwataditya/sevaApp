// Indian states & union territories, with a short code used to scope services.
// `match` strings help map a reverse-geocoded region name to the right entry.

export type StateInfo = {
  code: string;
  name: string;
  match: string[]; // lowercase substrings that may appear in geocoder output
};

export const states: StateInfo[] = [
  { code: 'AP', name: 'Andhra Pradesh', match: ['andhra'] },
  { code: 'AR', name: 'Arunachal Pradesh', match: ['arunachal'] },
  { code: 'AS', name: 'Assam', match: ['assam'] },
  { code: 'BR', name: 'Bihar', match: ['bihar'] },
  { code: 'CG', name: 'Chhattisgarh', match: ['chhattisgarh', 'chattisgarh'] },
  { code: 'GA', name: 'Goa', match: ['goa'] },
  { code: 'GJ', name: 'Gujarat', match: ['gujarat'] },
  { code: 'HR', name: 'Haryana', match: ['haryana'] },
  { code: 'HP', name: 'Himachal Pradesh', match: ['himachal'] },
  { code: 'JH', name: 'Jharkhand', match: ['jharkhand'] },
  { code: 'KA', name: 'Karnataka', match: ['karnataka'] },
  { code: 'KL', name: 'Kerala', match: ['kerala'] },
  { code: 'MP', name: 'Madhya Pradesh', match: ['madhya'] },
  { code: 'MH', name: 'Maharashtra', match: ['maharashtra'] },
  { code: 'MN', name: 'Manipur', match: ['manipur'] },
  { code: 'ML', name: 'Meghalaya', match: ['meghalaya'] },
  { code: 'MZ', name: 'Mizoram', match: ['mizoram'] },
  { code: 'NL', name: 'Nagaland', match: ['nagaland'] },
  { code: 'OD', name: 'Odisha', match: ['odisha', 'orissa'] },
  { code: 'PB', name: 'Punjab', match: ['punjab'] },
  { code: 'RJ', name: 'Rajasthan', match: ['rajasthan'] },
  { code: 'SK', name: 'Sikkim', match: ['sikkim'] },
  { code: 'TN', name: 'Tamil Nadu', match: ['tamil'] },
  { code: 'TG', name: 'Telangana', match: ['telangana'] },
  { code: 'TR', name: 'Tripura', match: ['tripura'] },
  { code: 'UP', name: 'Uttar Pradesh', match: ['uttar pradesh'] },
  { code: 'UK', name: 'Uttarakhand', match: ['uttarakhand', 'uttaranchal'] },
  { code: 'WB', name: 'West Bengal', match: ['west bengal', 'bengal'] },
  // Union Territories
  { code: 'AN', name: 'Andaman & Nicobar', match: ['andaman'] },
  { code: 'CH', name: 'Chandigarh', match: ['chandigarh'] },
  { code: 'DN', name: 'Dadra & Nagar Haveli and Daman & Diu', match: ['dadra', 'daman', 'diu'] },
  { code: 'DL', name: 'Delhi', match: ['delhi'] },
  { code: 'JK', name: 'Jammu & Kashmir', match: ['jammu', 'kashmir'] },
  { code: 'LA', name: 'Ladakh', match: ['ladakh'] },
  { code: 'LD', name: 'Lakshadweep', match: ['lakshadweep'] },
  { code: 'PY', name: 'Puducherry', match: ['puducherry', 'pondicherry'] },
];

export function findStateByName(region: string | null | undefined): StateInfo | null {
  if (!region) return null;
  const r = region.toLowerCase();
  return (
    states.find((s) => s.match.some((m) => r.includes(m))) ?? null
  );
}

export function getStateByCode(code: string | null): StateInfo | null {
  if (!code) return null;
  return states.find((s) => s.code === code) ?? null;
}
