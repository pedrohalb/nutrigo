import { StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';

export const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.popover,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    minWidth: 48,
    minHeight: 48,
  },
});
