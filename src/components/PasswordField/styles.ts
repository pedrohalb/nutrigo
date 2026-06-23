import { StyleSheet } from 'react-native';
import { formStyles } from '../../styles/forms';

export const styles = StyleSheet.create({
  fieldset: formStyles.fieldset,
  legend: formStyles.legend,
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    ...formStyles.input,
    flex: 1,
  },
});
