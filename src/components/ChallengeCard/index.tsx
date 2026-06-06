import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import type { Challenge } from '../../types/challenge';
import { challengesApi } from '../../services/api/challenges';
import { styles } from './styles';

type Props = {
  challenge: Challenge;
  onClaimed?: (xpEarned: number, levelUp: boolean, newLevel: number) => void;
};

const ChallengeCard = ({ challenge: c, onClaimed }: Props) => {
  const [claiming, setClaiming] = useState(false);
  const [localClaimed, setLocalClaimed] = useState(c.claimed ?? false);

  // Animated values for claim feedback
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const xpFlyY = useRef(new Animated.Value(0)).current;
  const xpFlyOpacity = useRef(new Animated.Value(0)).current;
  const xpFlyScale = useRef(new Animated.Value(1)).current;

  const canClaim = c.done && !localClaimed && !!c.id && !claiming;
  const isClaimed = localClaimed;
  const progressRatio = Math.min(c.progress / Math.max(c.total, 1), 1);

  const handleClaim = async () => {
    if (!canClaim || !c.id) return;
    setClaiming(true);

    // Pop the XP badge upward and fade card to "claimed" state in parallel
    Animated.parallel([
      Animated.sequence([
        Animated.timing(xpFlyOpacity, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(xpFlyY, {
            toValue: -56,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(xpFlyScale, {
            toValue: 1.6,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(380),
            Animated.timing(xpFlyOpacity, {
              toValue: 0,
              duration: 320,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
      Animated.sequence([
        Animated.timing(cardScale, {
          toValue: 1.04,
          duration: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    try {
      const res = await challengesApi.claim(c.id);
      setLocalClaimed(true);
      onClaimed?.(res.xpEarned, res.levelUp, res.newLevel);
    } catch {
      // revert animation state on failure
      xpFlyY.setValue(0);
      xpFlyOpacity.setValue(0);
      xpFlyScale.setValue(1);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Animated.View
      style={[
        styles.challengeCard,
        isClaimed && styles.challengeCardClaimed,
        { transform: [{ scale: cardScale }], opacity: cardOpacity },
      ]}
    >
      <Text style={styles.challengeEmoji}>{c.emoji}</Text>
      <View style={styles.challengeContent}>
        <Text style={styles.challengeTitle}>{c.title}</Text>
        <Text style={styles.challengeDesc}>{c.desc}</Text>
        <View style={styles.challengeBarBg}>
          <View
            style={[styles.challengeBarFill, { width: `${progressRatio * 100}%` }]}
          />
        </View>
      </View>
      <View style={styles.challengeRight}>
        {canClaim ? (
          <TouchableOpacity
            onPress={handleClaim}
            style={styles.claimButton}
            activeOpacity={0.8}
            disabled={claiming}
          >
            <Text style={styles.claimButtonText}>Coletar +{c.exp}</Text>
          </TouchableOpacity>
        ) : isClaimed ? (
          <View style={styles.doneBadge}>
            <Text style={styles.doneBadgeText}>Coletado</Text>
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

      {/* Flying XP feedback */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.xpFly,
          {
            opacity: xpFlyOpacity,
            transform: [{ translateY: xpFlyY }, { scale: xpFlyScale }],
          },
        ]}
      >
        <Text style={styles.xpFlyText}>+{c.exp} XP</Text>
      </Animated.View>
    </Animated.View>
  );
};

export default ChallengeCard;
