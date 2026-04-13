import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Pencil, Send } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import BottomNav from '../components/BottomNav';
import { colors, radius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const challenges = [
  {
    emoji: '🔥',
    title: 'Desafio de ofensiva',
    desc: 'mantenha a ofensiva por 10 dias',
    exp: 500,
    progress: 3,
    total: 10,
  },
  {
    emoji: '📈',
    title: 'Hora de avançar',
    desc: 'complete 8 lições',
    exp: 800,
    progress: 6,
    total: 8,
  },
  {
    emoji: '📕',
    title: 'Primeira lição',
    desc: 'complete a primeira lição',
    exp: 0,
    progress: 1,
    total: 1,
    done: true,
  },
];

const ProfileScreen = () => {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>perfil</Text>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Send size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User info */}
          <View style={styles.userInfo}>
            <View style={styles.userInfoLeft}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>Pedro Henrique</Text>
                <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Pencil size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.userEmail}>pedroohalb@gmail.com</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>P</Text>
            </View>
          </View>

          {/* Estatísticas */}
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Image
                source={require('../../assets/images/icon-fire.png')}
                style={styles.statIcon}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.statCardValue}>1</Text>
                <Text style={styles.statCardLabel}>dia de ofensiva</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <Image
                source={require('../../assets/images/icon-energy.png')}
                style={styles.statIcon}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.statCardValue}>Nível 1</Text>
                <Text style={styles.statCardLabel}>500 / 1000 exp</Text>
              </View>
            </View>
          </View>

          {/* Desafios */}
          <Text style={styles.sectionTitle}>Desafios</Text>
          <View style={styles.challengeList}>
            {challenges.map((c, i) => (
              <View key={i} style={styles.challengeCard}>
                <Text style={styles.challengeEmoji}>{c.emoji}</Text>
                <View style={styles.challengeContent}>
                  <Text style={styles.challengeTitle}>{c.title}</Text>
                  <Text style={styles.challengeDesc}>{c.desc}</Text>
                  <View style={styles.challengeBarBg}>
                    <View
                      style={[
                        styles.challengeBarFill,
                        {
                          width: `${(c.progress / c.total) * 100}%`,
                          backgroundColor: c.done ? colors.energy : colors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.challengeRight}>
                  {c.done ? (
                    <View style={styles.doneBadge}>
                      <Text style={styles.doneBadgeText}>Concluído</Text>
                    </View>
                  ) : (
                    <View style={styles.expBadge}>
                      <Text style={styles.expBadgeText}>+ {c.exp} exp</Text>
                    </View>
                  )}
                  {!c.done && (
                    <Text style={styles.challengeProgress}>
                      {c.progress} / {c.total}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Challenges')}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllText}>Ver tudo</Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomNav />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 24,
  },
  userInfoLeft: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
  },
  userEmail: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
  },
  statIcon: {
    width: 24,
    height: 24,
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
  },
  statCardLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  challengeList: {
    gap: 12,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  challengeEmoji: {
    fontSize: 24,
  },
  challengeContent: {
    flex: 1,
    minWidth: 0,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.foreground,
  },
  challengeDesc: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  challengeBarBg: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted,
    marginTop: 8,
    overflow: 'hidden',
  },
  challengeBarFill: {
    height: 8,
    borderRadius: 4,
  },
  challengeRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  doneBadge: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  doneBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  expBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  expBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.energy,
  },
  challengeProgress: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  seeAllBtn: {
    marginTop: 12,
    marginBottom: 16,
    padding: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
});

export default ProfileScreen;
