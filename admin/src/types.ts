export type Phone = { label: string; number: string };

export type AppLink = {
  name: string;
  description?: string;
  android?: string;
  ios?: string;
  website?: string;
};

export type Service = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  department?: string;
  phones?: Phone[];
  website?: string;
  complaintUrl?: string;
  apps?: AppLink[];
  scope: string; // 'national' | state code e.g. 'MH'
  district?: string; // optional: restrict a state-scoped service to one district
  emergency?: boolean;
  femaleOnly?: boolean;
  keywords?: string[];
  updatedAt?: string;
};

// A custom field appended to the mobile app's signup form.
export type ProfileFieldType = 'text' | 'phone' | 'number' | 'select';

export type ProfileField = {
  key: string;
  label: string;
  type: ProfileFieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  order?: number;
};

export type Category = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  emergency?: boolean;
  order?: number;
  updatedAt?: string;
};

// Indian states / UTs (for the service "scope" picker).
export const STATES: { code: string; name: string }[] = [
  { code: 'national', name: 'National (all of India)' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'AR', name: 'Arunachal Pradesh' },
  { code: 'AS', name: 'Assam' },
  { code: 'BR', name: 'Bihar' },
  { code: 'CG', name: 'Chhattisgarh' },
  { code: 'GA', name: 'Goa' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'HR', name: 'Haryana' },
  { code: 'HP', name: 'Himachal Pradesh' },
  { code: 'JH', name: 'Jharkhand' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'KL', name: 'Kerala' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'MN', name: 'Manipur' },
  { code: 'ML', name: 'Meghalaya' },
  { code: 'MZ', name: 'Mizoram' },
  { code: 'NL', name: 'Nagaland' },
  { code: 'OD', name: 'Odisha' },
  { code: 'PB', name: 'Punjab' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'SK', name: 'Sikkim' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TG', name: 'Telangana' },
  { code: 'TR', name: 'Tripura' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'UK', name: 'Uttarakhand' },
  { code: 'WB', name: 'West Bengal' },
  { code: 'AN', name: 'Andaman & Nicobar' },
  { code: 'CH', name: 'Chandigarh' },
  { code: 'DN', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: 'DL', name: 'Delhi' },
  { code: 'JK', name: 'Jammu & Kashmir' },
  { code: 'LA', name: 'Ladakh' },
  { code: 'LD', name: 'Lakshadweep' },
  { code: 'PY', name: 'Puducherry' },
];

// Ionicons names used by the mobile app for category icons.
export const ICON_OPTIONS = [
  'alert-circle', 'female', 'leaf', 'megaphone', 'medkit', 'car',
  'document-text', 'school', 'nutrition', 'briefcase', 'shield', 'flame',
  'call', 'people', 'business', 'water', 'bus', 'home', 'heart', 'globe',
];
