import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Star, ChevronDown, BookOpen } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import BottomNav from '../components/BottomNav';
import { colors, radius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface LessonNode {
  id: number;
  type: 'star' | 'lock' | 'chest' | 'book';
  status: 'completed' | 'current' | 'locked';
  offsetX: number;
  label?: string;
}

const units = [
  {
    section: 1,
    unit: 1,
    title: 'Fundamentos da Nutrição',
    mascotPosition: 3,
    nodes: [
      { id: 1, type: 'star' as const, status: 'current' as const, offsetX: -30, label: 'COMEÇAR' },
      { id: 2, type: 'lock' as const, status: 'locked' as const, offsetX: -60 },
      { id: 3, type: 'chest' as const, status: 'locked' as const, offsetX: -50 },
      { id: 4, type: 'book' as const, status: 'locked' as const, offsetX: -30 },
      { id: 5, type: 'lock' as const, status: 'locked' as const, offsetX: 0 },
    ],
  },
  {
    section: 1,
    unit: 2,
    title: 'Fundamentos da Nutrição',
    mascotPosition: 1,
    nodes: [
      { id: 6, type: 'star' as const, status: 'locked' as const, offsetX: 0 },
      { id: 7, type: 'book' as const, status: 'locked' as const, offsetX: 30 },
      { id: 8, type: 'lock' as const, status: 'locked' as const, offsetX: 30 },
      { id: 9, type: 'chest' as const, status: 'locked' as const, offsetX: 0 },
    ],
  },
];

const NodeIcon = ({ node, onPress }: { node: LessonNode; onPress?: () => void }) => {
  const size = node.type === 'star' ? 68 : 60;

  if (node.type === 'star') {
    const isActive = node.status === 'current' || node.status === 'completed';
    return (
      <TouchableOpacity
        onPress={isActive ? onPress : undefined}
        activeOpacity={isActive ? 0.7 : 1}
        style={styles.nodeContainer}
      >
        {node.label && (
          <Text style={styles.nodeLabel}>{node.label}</Text>
        )}
        <View>
          {isActive && (
            <View style={[styles.outerRing, { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 }]} />
          )}
          <View
            style={[
              styles.nodeCircle,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: isActive ? colors.primary : colors.muted,
              },
              isActive && styles.activeNodeShadow,
              !isActive && styles.lockedNodeShadow,
            ]}
          >
            <Star
              size={30}
              color={isActive ? colors.primaryForeground : colors.mutedForeground}
              fill={isActive ? colors.primaryForeground : 'transparent'}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const iconMap = {
    lock: <Lock size={24} color={colors.mutedForeground} />,
    chest: <Text style={styles.emojiIcon}>📦</Text>,
    book: <BookOpen size={24} color={colors.mutedForeground} />,
  };

  return (
    <View
      style={[
        styles.nodeCircle,
        styles.lockedNodeShadow,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.muted,
        },
      ]}
    >
      {iconMap[node.type]}
    </View>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const { height: screenHeight } = useWindowDimensions();
  const streak = 3;
  const energy = 2;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {units.map((unit, unitIdx) => (
            <View
              key={unitIdx}
              style={[styles.unitBlock, { minHeight: screenHeight - 120 }]}
            >
              {/* Top accent bar */}
              <View style={styles.topAccent} />

              {/* Unit header */}
              <View style={styles.unitHeader}>
                <View style={styles.unitHeaderLeft}>
                  <Text style={styles.unitHeaderTitle}>
                    Seção {unit.section}, Unidade {unit.unit}
                  </Text>
                  <Text style={styles.unitHeaderSubtitle}>{unit.title}</Text>
                </View>
                <View style={styles.unitHeaderIcon}>
                  <BookOpen size={22} color={colors.primaryForeground} />
                </View>
              </View>

              {/* Stats bar - only on first unit */}
              {unitIdx === 0 && (
                <View style={styles.statsBar}>
                  <View style={styles.statBadge}>
                    <Image
                      source={require('../../assets/images/icon-fire.png')}
                      style={styles.statIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.statValue}>{streak}</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Image
                      source={require('../../assets/images/icon-energy.png')}
                      style={styles.statIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.statValue}>{energy}</Text>
                  </View>
                </View>
              )}

              {/* Lesson path */}
              <View style={styles.lessonPath}>
                {unit.nodes.map((node, nodeIdx) => (
                  <View key={node.id} style={styles.nodeRow}>
                    <View style={{ transform: [{ translateX: node.offsetX }] }}>
                      <NodeIcon
                        node={node}
                        onPress={() => navigation.navigate('Lesson')}
                      />
                    </View>

                    {/* Mascot next to a node */}
                    {nodeIdx === unit.mascotPosition && (
                      <Image
                        source={require('../../assets/images/nutrigo-broccoli.png')}
                        style={[
                          styles.mascotImage,
                          node.offsetX < 0
                            ? { right: '12%', position: 'absolute' }
                            : { left: '12%', position: 'absolute' },
                          { top: -15 },
                        ]}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                ))}
              </View>

              {/* Scroll indicator */}
              {unitIdx < units.length - 1 && (
                <View style={styles.scrollIndicator}>
                  <ChevronDown size={24} color={colors.foreground} />
                </View>
              )}
            </View>
          ))}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  unitBlock: {
    position: 'relative',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: 'hsl(148, 50%, 22%)',
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  unitHeader: {
    marginHorizontal: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  unitHeaderLeft: {
    flex: 1,
  },
  unitHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
  unitHeaderSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  unitHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 24,
    height: 24,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.foreground,
  },
  lessonPath: {
    alignItems: 'center',
    gap: 28,
    paddingVertical: 32,
  },
  nodeRow: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  nodeContainer: {
    alignItems: 'center',
  },
  nodeLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.foreground,
  },
  outerRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    opacity: 0.3,
    backgroundColor: colors.primary,
  },
  nodeCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNodeShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  lockedNodeShadow: {
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 2,
  },
  emojiIcon: {
    fontSize: 24,
  },
  mascotImage: {
    width: 130,
    height: 130,
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 20,
  },
});

export default HomeScreen;
