import { StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

// Estilos de formulário compartilhados entre telas de autenticação,
// onboarding e os componentes FormField / PasswordField.
export const formStyles = StyleSheet.create({
  fieldset: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: colors.card,
  },
  legend: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  input: {
    fontSize: 16,
    color: colors.foreground,
    padding: 0,
    margin: 0,
  },
});
