import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors, radius } from "../theme";
import BottomNav from "../components/BottomNav";

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Challenge {
  emoji: string;
  title: string;
  desc: string;
  exp: number;
  progress: number;
  total: number;
  done?: boolean;
}

const dailyChallenge: Challenge = {
  emoji: "🥦",
  title: "Mestre da nutrição",
  desc: "complete 3 lições hoje sem errar nenhuma questão",
  exp: 500,
  progress: 1,
  total: 3,
};

const weeklyChallenges: Challenge[] = [
  {
    emoji: "🔥",
    title: "Desafio de ofensiva",
    desc: "mantenha a ofensiva por 10 dias",
    exp: 500,
    progress: 3,
    total: 10,
  },
  {
    emoji: "📈",
    title: "Hora de avançar",
    desc: "complete 8 lições",
    exp: 500,
    progress: 6,
    total: 8,
  },
  {
    emoji: "🎓",
    title: "Adquirindo conhecimento",
    desc: "Entre no guia de estudo",
    exp: 300,
    progress: 0,
    total: 1,
  },
  {
    emoji: "📚",
    title: "Sabe o básico",
    desc: "complete a 1° unidade",
    exp: 800,
    progress: 1,
    total: 5,
  },
  {
    emoji: "📕",
    title: "Primeira lição",
    desc: "complete a primeira lição",
    exp: 0,
    progress: 1,
    total: 1,
    done: true,
  },
];

const DailyChallengeCard = ({ c }: { c: Challenge }) => (
  <View style={styles.dailyCard}>
    <View style={styles.dailyHeader}>
      <Text style={styles.dailyEmoji}>{c.emoji}</Text>
      <View style={styles.dailyBadge}>
        <Text style={styles.dailyBadgeText}>hoje</Text>
      </View>
    </View>
    <Text style={styles.dailyTitle}>{c.title}</Text>
    <Text style={styles.dailyDesc}>{c.desc}</Text>
    <View style={styles.dailyBarBg}>
      <View
        style={[
          styles.dailyBarFill,
          { width: `${(c.progress / c.total) * 100}%` },
        ]}
      />
    </View>
    <View style={styles.dailyFooter}>
      <Text style={styles.dailyProgress}>
        {c.progress} / {c.total}
      </Text>
      <View style={styles.dailyExpBadge}>
        <Text style={styles.dailyExpText}>+ {c.exp} exp</Text>
      </View>
    </View>
  </View>
);

const ChallengeCard = ({ c }: { c: Challenge }) => (
  <View style={styles.challengeCard}>
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
              backgroundColor: colors.primary,
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
);

const ChallengesScreen = () => {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>desafios</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>Desafio diário</Text>
          <DailyChallengeCard c={dailyChallenge} />

          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
            Desafios semanais
          </Text>
          <View style={styles.challengeList}>
            {weeklyChallenges.map((c, i) => (
              <ChallengeCard key={i} c={c} />
            ))}
          </View>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: colors.foreground,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.mutedForeground,
    marginBottom: 12,
  },
  challengeList: {
    gap: 12,
  },
  challengeCard: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "700",
    color: colors.foreground,
  },
  challengeDesc: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  challengeBarBg: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted,
    marginTop: 8,
    overflow: "hidden",
  },
  challengeBarFill: {
    height: 8,
    borderRadius: 4,
  },
  challengeRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  doneBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  doneBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  expBadge: {
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  expBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.energy,
  },
  challengeProgress: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  // Daily challenge card
  dailyCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 20,
  },
  dailyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dailyEmoji: {
    fontSize: 36,
  },
  dailyBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  dailyBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryForeground,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dailyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryForeground,
    marginBottom: 4,
  },
  dailyDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 14,
  },
  dailyBarBg: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
    marginBottom: 10,
  },
  dailyBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryForeground,
  },
  dailyFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dailyProgress: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
  },
  dailyExpBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  dailyExpText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryForeground,
  },
});

export default ChallengesScreen;
