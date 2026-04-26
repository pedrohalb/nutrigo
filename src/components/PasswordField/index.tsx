import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors } from '../../styles/colors';
import { styles } from './styles';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
}

const PasswordField = ({
  label,
  value,
  onChangeText,
  show,
  onToggle,
  placeholder = '••••••••••••',
}: PasswordFieldProps) => (
  <View style={styles.fieldset}>
    <Text style={styles.legend}>{label}</Text>
    <View style={styles.passwordRow}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        secureTextEntry={!show}
      />
      <TouchableOpacity
        onPress={onToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {show ? (
          <EyeOff size={20} color={colors.mutedForeground} />
        ) : (
          <Eye size={20} color={colors.mutedForeground} />
        )}
      </TouchableOpacity>
    </View>
  </View>
);

export default PasswordField;
