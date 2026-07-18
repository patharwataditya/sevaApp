// Central design tokens for SevaApp.
// A calm, trustworthy civic palette with a saffron/green nod to the Indian flag.

export const colors = {
  // Brand
  primary: '#0B6E4F', // deep civic green
  primaryDark: '#08533B',
  primaryLight: '#E6F2EE',
  accent: '#FF6D00', // saffron accent for CTAs / emergencies
  accentLight: '#FFF1E6',

  // Emergency
  danger: '#D32F2F',
  dangerDark: '#B71C1C',
  dangerLight: '#FDECEA',

  // Neutrals
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  border: '#E6E8EC',
  text: '#1A1D21',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',

  white: '#FFFFFF',
  black: '#000000',

  // Female helpline theme
  pink: '#C2185B',
  pinkLight: '#FCE4EC',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const font = {
  h1: 28,
  h2: 22,
  h3: 18,
  body: 15,
  small: 13,
  tiny: 11,
};

export const shadow = {
  card: {
    shadowColor: '#0B1F3A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  soft: {
    shadowColor: '#0B1F3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
};
