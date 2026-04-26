import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../styles/colors';
import type { StrengthInfo } from '../../constants/passwordStrength';
import { styles } from './styles';

interface Props {
  strengthCount: 0 | 1 | 2 | 3 | 4;
  strengthInfo: StrengthInfo;
}

const PasswordStrengthMeter = ({ strengthCount, strengthInfo }: Props) => (
  <View style={styles.strengthContainer}>
    <View style={styles.strengthBar}>
      {([1, 2, 3, 4] as const).map((i) => (
        <View
          key={i}
          style={[
            styles.strengthSegment,
            {
              backgroundColor:
                i <= strengthCount && strengthInfo
                  ? strengthInfo.color
                  : colors.border,
            },
          ]}
        />
      ))}
    </View>
    {strengthInfo && (
      <Text style={[styles.strengthLabel, { color: strengthInfo.color }]}>
        {strengthInfo.label}
      </Text>
    )}
  </View>
);

export default PasswordStrengthMeter;
