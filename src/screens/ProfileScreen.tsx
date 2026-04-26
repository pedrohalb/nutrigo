import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, LogOut, Pencil } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import BottomNav from "../components/BottomNav";
import { colors, radius } from "../theme";
import { profileChallenges as challenges } from "../mocks/challenges";
import ChallengeCard from "../components/ChallengeCard";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>perfil</Text>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <LogOut size={20} color={colors.foreground} />
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
                <TouchableOpacity
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
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
                source={require("../../assets/images/icon-fire.png")}
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
                source={require("../../assets/images/icon-energy.png")}
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
              <ChallengeCard key={i} challenge={c} />
            ))}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Challenges")}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.foreground,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 24,
  },
  userInfoLeft: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
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
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primaryForeground,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
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
    width: 70,
    height: 50,
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.foreground,
    textAlign: "center",
  },
  statCardLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  challengeList: {
    gap: 12,
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
