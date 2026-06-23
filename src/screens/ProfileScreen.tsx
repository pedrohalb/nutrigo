import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, LogOut, Pencil } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import BottomNav from "../components/BottomNav";
import { colors, radius } from "../theme";
import ChallengeCard from "../components/ChallengeCard";
import { meApi, type MeResponse } from "../services/api/me";
import { challengesApi, type ChallengeItem } from "../services/api/challenges";
import { useAuth } from "../contexts/AuthContext";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);

  const load = useCallback(async () => {
    try {
      const [meData, challengeData] = await Promise.all([
        meApi.getMe(),
        challengesApi.getChallenges(),
      ]);
      setMe(meData);
      setChallenges(challengeData.weekly.slice(0, 3));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  const openEditName = () => {
    setNameDraft(me?.profile?.name ?? "");
    setEditingName(true);
  };

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    try {
      setSavingName(true);
      await meApi.updateMe({ name: trimmed });
      setEditingName(false);
      await load();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o nome.");
    } finally {
      setSavingName(false);
    }
  };

  const name = me?.profile?.name ?? "";
  const email = me?.user?.email ?? "";
  const avatarLetter = name.charAt(0).toUpperCase() || "?";
  const streak = me?.stats?.streak_days ?? 0;
  const level = me?.stats?.level ?? 1;
  const xp = me?.stats?.xp ?? 0;
  const xpNext = me?.stats?.xp_for_next_level ?? 1000;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>perfil</Text>
          <TouchableOpacity
            onPress={handleLogout}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <LogOut size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            style={{ flex: 1 }}
            color={colors.primary}
            size="large"
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.userInfo}>
              <View style={styles.userInfoLeft}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{name}</Text>
                  <TouchableOpacity
                    onPress={openEditName}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Pencil size={14} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.userEmail}>{email}</Text>
              </View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Estatísticas</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Image
                  source={require("../../assets/images/icon-fire.png")}
                  style={styles.statIcon}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.statCardValue}>{streak}</Text>
                  <Text style={styles.statCardLabel}>
                    {streak === 1 ? "dia de ofensiva" : "dias de ofensiva"}
                  </Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <Image
                  source={require("../../assets/images/icon-energy.png")}
                  style={styles.statIcon}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.statCardValue}>Nível {level}</Text>
                  <Text style={styles.statCardLabel}>
                    {xp} / {xpNext} exp
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Desafios</Text>
            <View style={styles.challengeList}>
              {challenges.map((c) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  onClaimed={() => load()}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("Challenges")}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAllText}>Ver tudo</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        <BottomNav />
      </View>

      <Modal
        visible={editingName}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingName(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar nome</Text>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Seu nome"
              placeholderTextColor={colors.mutedForeground}
              style={styles.modalInput}
              autoFocus
              maxLength={60}
              returnKeyType="done"
              onSubmitEditing={saveName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setEditingName(false)}
                style={[styles.modalBtn, styles.modalBtnGhost]}
              >
                <Text style={styles.modalBtnGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveName}
                disabled={savingName || !nameDraft.trim()}
                style={[
                  styles.modalBtn,
                  styles.modalBtnPrimary,
                  (savingName || !nameDraft.trim()) && { opacity: 0.5 },
                ]}
              >
                {savingName ? (
                  <ActivityIndicator color={colors.primaryForeground} size="small" />
                ) : (
                  <Text style={styles.modalBtnPrimaryText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 20,
    gap: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.foreground,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.background,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  modalBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.full,
    minWidth: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnGhost: {
    backgroundColor: "transparent",
  },
  modalBtnGhostText: {
    color: colors.mutedForeground,
    fontWeight: "600",
  },
  modalBtnPrimary: {
    backgroundColor: colors.primary,
  },
  modalBtnPrimaryText: {
    color: colors.primaryForeground,
    fontWeight: "700",
  },
});

export default ProfileScreen;
