import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Home, Trophy, User } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { colors } from '../../styles/colors';
import { styles } from './styles';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const tabs = [
  { icon: Home, route: 'Home' as const, label: 'Home' },
  { icon: Trophy, route: 'Challenges' as const, label: 'Desafios' },
  { icon: User, route: 'Profile' as const, label: 'Perfil' },
];

const BottomNav = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute();

  return (
    <View style={styles.nav}>
      {tabs.map(({ icon: Icon, route: tabRoute }) => {
        const active = route.name === tabRoute;
        return (
          <TouchableOpacity
            key={tabRoute}
            onPress={() => navigation.navigate(tabRoute)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Icon
              size={24}
              color={active ? colors.primary : colors.mutedForeground}
              strokeWidth={active ? 2.5 : 2}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNav;
