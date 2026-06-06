import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Home, Trophy, User } from 'lucide-react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { colors } from '../../styles/colors';
import { styles } from './styles';
import { challengesApi } from '../../services/api/challenges';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const tabs = [
  { icon: Home, route: 'Home' as const, label: 'Home' },
  { icon: Trophy, route: 'Challenges' as const, label: 'Desafios' },
  { icon: User, route: 'Profile' as const, label: 'Perfil' },
];

const BottomNav = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const [pendingClaims, setPendingClaims] = useState(0);

  const refresh = React.useCallback(() => {
    challengesApi
      .getChallenges()
      .then((data) => setPendingClaims(data.pendingClaims ?? 0))
      .catch(() => {});
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <View style={styles.nav}>
      {tabs.map(({ icon: Icon, route: tabRoute }) => {
        const active = route.name === tabRoute;
        const showBadge = tabRoute === 'Challenges' && pendingClaims > 0;
        return (
          <TouchableOpacity
            key={tabRoute}
            onPress={() => navigation.navigate(tabRoute)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View>
              <Icon
                size={24}
                color={active ? colors.primary : colors.mutedForeground}
                strokeWidth={active ? 2.5 : 2}
              />
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {pendingClaims > 9 ? '9+' : pendingClaims}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNav;
