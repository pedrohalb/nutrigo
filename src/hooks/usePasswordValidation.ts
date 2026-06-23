import { useMemo } from 'react';
import { STRENGTH } from '../constants/passwordStrength';

export type StrengthCount = 0 | 1 | 2 | 3 | 4;

// Centraliza as regras de senha usadas em Signup e ResetPassword:
// requisitos, força e correspondência de confirmação.
export function usePasswordValidation(password: string, confirmPassword: string) {
  const requirements = useMemo(
    () => [
      { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
      { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
      { label: 'Um número', met: /[0-9]/.test(password) },
      { label: 'Um caracter especial', met: /[^A-Za-z0-9]/.test(password) },
    ],
    [password],
  );

  const strengthCount = requirements.filter((r) => r.met).length as StrengthCount;
  const strengthInfo = STRENGTH[strengthCount];
  const meetsAll = requirements.every((r) => r.met);
  const passwordsMatch = password === confirmPassword;
  const isValid = meetsAll && passwordsMatch;

  return { requirements, strengthCount, strengthInfo, meetsAll, passwordsMatch, isValid };
}
