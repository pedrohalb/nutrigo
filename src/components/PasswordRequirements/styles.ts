import { StyleSheet } from 'react-native';
import { colors, radius } from '../../theme';

export const styles = StyleSheet.create({
  reqBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  reqTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 8,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  reqLabel: {
    fontSize: 14,
  },
});
