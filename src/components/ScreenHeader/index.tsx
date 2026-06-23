import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../theme';

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  // Conteúdo à direita; sem ele mantém um espaçador para centralizar o título.
  right?: React.ReactNode;
}

// Cabeçalho padrão: botão de voltar + título centralizado + área à direita.
const ScreenHeader = ({ title, onBack, right }: ScreenHeaderProps) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} hitSlop={HIT_SLOP}>
      <ArrowLeft size={24} color={colors.foreground} />
    </TouchableOpacity>
    <Text style={styles.title}>{title}</Text>
    {right ?? <View style={styles.spacer} />}
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  spacer: { width: 24 },
});

export default ScreenHeader;
