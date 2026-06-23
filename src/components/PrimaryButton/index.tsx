import React from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../theme';
import { styles } from './styles';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  // Texto exibido durante o loading. Sem ele, mostra um ActivityIndicator.
  loadingLabel?: string;
  style?: StyleProp<ViewStyle>;
}

// Botão primário compartilhado pelas telas de auth e onboarding.
const PrimaryButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  loadingLabel,
  style,
}: PrimaryButtonProps) => {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[styles.button, isDisabled && styles.disabled, style]}
    >
      {loading && !loadingLabel ? (
        <ActivityIndicator color={colors.primaryForeground} />
      ) : (
        <Text style={styles.text}>{loading ? loadingLabel : label}</Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
