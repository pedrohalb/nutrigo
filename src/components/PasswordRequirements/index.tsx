import React from 'react';
import { View, Text } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { colors } from '../../styles/colors';
import { styles } from './styles';

interface Requirement {
  label: string;
  met: boolean;
}

const PasswordRequirements = ({ requirements }: { requirements: Requirement[] }) => (
  <View style={styles.reqBox}>
    <Text style={styles.reqTitle}>Requisitos da senha:</Text>
    {requirements.map((req, i) => (
      <View key={i} style={styles.reqRow}>
        {req.met ? (
          <Check size={14} color={colors.primary} />
        ) : (
          <X size={14} color={colors.destructive} />
        )}
        <Text style={[styles.reqLabel, { color: req.met ? colors.primary : colors.destructive }]}>
          {req.label}
        </Text>
      </View>
    ))}
  </View>
);

export default PasswordRequirements;
