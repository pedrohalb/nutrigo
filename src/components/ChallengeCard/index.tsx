import React from 'react';
import { View, Text } from 'react-native';
import type { Challenge } from '../../types/challenge';
import { styles } from './styles';

const ChallengeCard = ({ challenge: c }: { challenge: Challenge }) => (
  <View style={styles.challengeCard}>
    <Text style={styles.challengeEmoji}>{c.emoji}</Text>
    <View style={styles.challengeContent}>
      <Text style={styles.challengeTitle}>{c.title}</Text>
      <Text style={styles.challengeDesc}>{c.desc}</Text>
      <View style={styles.challengeBarBg}>
        <View
          style={[
            styles.challengeBarFill,
            { width: `${(c.progress / c.total) * 100}%` },
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
);

export default ChallengeCard;
