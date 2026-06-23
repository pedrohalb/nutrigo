import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { colors } from '../../theme';
import { formStyles } from '../../styles/forms';

interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}

// Campo de texto rotulado (fieldset + legend + input).
// Repassa qualquer prop nativa do TextInput (keyboardType, placeholder, etc.).
const FormField = ({ label, value, onChangeText, ...inputProps }: FormFieldProps) => (
  <View style={formStyles.fieldset}>
    <Text style={formStyles.legend}>{label}</Text>
    <TextInput
      style={formStyles.input}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={colors.mutedForeground}
      {...inputProps}
    />
  </View>
);

export default FormField;
