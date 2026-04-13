/**
 * Design system colors converted from Tailwind HSL variables.
 * Source: figma-frame-forward-96/src/index.css
 */
export const colors = {
  background: '#e3e0c4',
  foreground: '#223622',

  card: '#f3f1e6',
  cardForeground: '#223622',

  popover: '#ffffff',
  popoverForeground: '#223622',

  primary: '#2b6646',
  primaryForeground: '#ffffff',

  secondary: '#b1c99a',
  secondaryForeground: '#2b6646',

  muted: '#d4d6c3',
  mutedForeground: '#606d60',

  accent: '#7db85a',
  accentForeground: '#ffffff',

  destructive: '#ef4444',
  destructiveForeground: '#fafafa',

  border: '#c3cabc',
  input: '#c3cabc',
  ring: '#2b6646',

  streak: '#f59e0b',
  energy: '#eab308',
} as const;

export const fonts = {
  regular: 'System',
  bold: 'System',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;
