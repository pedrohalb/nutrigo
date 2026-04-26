import { StyleSheet } from 'react-native';
import { colors, radius } from '../../theme';

export const styles = StyleSheet.create({
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.foreground,
    padding: 0,
    margin: 0,
  },
});
