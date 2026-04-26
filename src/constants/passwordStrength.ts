import { colors } from '../styles/colors';

export const STRENGTH = [
  null,
  { label: 'Fraca', color: '#ef4444' },
  { label: 'Média', color: '#f97316' },
  { label: 'Boa', color: '#eab308' },
  { label: 'Forte', color: colors.primary },
] as const;

export type StrengthInfo = (typeof STRENGTH)[number];
