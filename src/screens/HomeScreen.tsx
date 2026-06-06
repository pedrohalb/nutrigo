import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  SectionList,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Lock,
  Star,
  BookOpen,
  Trophy,
  Flame,
  Zap,
  Target,
  Medal,
  Brain,
  Heart,
  Leaf,
  Sun,
  Shield,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import BottomNav from "../components/BottomNav";
import { colors, radius } from "../theme";
import type { LessonNode, MascotImage, Unit } from "../types/lesson";
import { unitsApi } from "../services/api/units";
import { meApi } from "../services/api/me";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MASCOT_IMAGES: Record<MascotImage, ReturnType<typeof require>> = {
  cheer: require("../../assets/images/broccoli-cheer.png"),
  reading: require("../../assets/images/broccoli-reading.png"),
  thumbsup: require("../../assets/images/broccoli-thumbsup.png"),
  love: require("../../assets/images/broccoli-love.png"),
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const SHADOW_PRIMARY = "#1e4a31";
const SHADOW_COMPLETED = "#7a9268";
const SHADOW_MUTED = "#a8ab99";

// Status color palette — completed uses a sage tone from the home palette
// (colors.secondary) so finished lessons sit cohesively next to the current/locked ones.
const STATUS_COLORS = {
  completed: { bg: colors.secondary, shadow: SHADOW_COMPLETED, icon: colors.primary },
  current: { bg: colors.primary, shadow: SHADOW_PRIMARY, icon: "#fff" },
  locked: {
    bg: colors.muted,
    shadow: SHADOW_MUTED,
    icon: colors.mutedForeground,
  },
} as const;

// ── Sticky section header ──────────────────────────────────────────────────
const UnitHeader = ({ unit }: { unit: Unit }) => {
  const navigation = useNavigation<Nav>();
  const isLocked = unit.status === 'skeleton' || unit.status === 'generating';
  return (
    <View style={styles.sectionHeaderWrap}>
      <View style={styles.unitHeader}>
        <View style={styles.unitHeaderLeft}>
          <Text style={styles.unitHeaderSection}>
            SEÇÃO {unit.section} · UNIDADE {unit.unit}
          </Text>
          <Text style={styles.unitHeaderTitle}>{unit.title}</Text>
        </View>
        {isLocked ? (
          <View style={[styles.unitHeaderBtn, { backgroundColor: colors.muted }]}>
            <Lock size={18} color={colors.mutedForeground} />
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate("StudyGuide", { unitId: unit.id })}
            style={styles.unitHeaderBtn}
            activeOpacity={0.7}
          >
            <BookOpen size={20} color={colors.primaryForeground} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ── Node icon ──────────────────────────────────────────────────────────────
const BUBBLE_WIDTH = 240;

type Anchor = { x: number; y: number; w: number; h: number };

const NodeIcon = ({
  node,
  onPress,
}: {
  node: LessonNode;
  onPress?: () => void;
}) => {
  const size = node.type === "star" ? 68 : 58;
  const isActive = node.status !== "locked";
  const isCurrent = node.status === "current";
  const palette = STATUS_COLORS[node.status];

  const [previewing, setPreviewing] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const nodeRef = useRef<View>(null);

  // Pulse only on the current lesson (completed/locked stay static)
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.45)).current;
  const pressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCurrent) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseScale, {
              toValue: 1.65,
              duration: 1100,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0,
              duration: 1100,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseScale, {
              toValue: 1,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.45,
              duration: 50,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    }
  }, []);

  const pressTranslateY = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 5],
  });

  const handlePressIn = () =>
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();

  const handlePressOut = () =>
    Animated.spring(pressAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();

  const iconEl: Record<LessonNode["type"], React.ReactElement> = {
    star:   <Star   size={28} color={palette.icon} fill={isActive ? palette.icon : "transparent"} />,
    flame:  <Flame  size={26} color={palette.icon} fill={isActive ? palette.icon : "transparent"} />,
    zap:    <Zap    size={26} color={palette.icon} fill={isActive ? palette.icon : "transparent"} />,
    target: <Target size={26} color={palette.icon} />,
    medal:  <Medal  size={26} color={palette.icon} />,
    brain:  <Brain  size={26} color={palette.icon} />,
    heart:  <Heart  size={26} color={palette.icon} fill={isActive ? palette.icon : "transparent"} />,
    leaf:   <Leaf   size={26} color={palette.icon} />,
    sun:    <Sun    size={26} color={palette.icon} fill={isActive ? palette.icon : "transparent"} />,
    shield: <Shield size={26} color={palette.icon} fill={isActive ? palette.icon : "transparent"} />,
    chest:  <Trophy size={24} color={palette.icon} />,
  };

  // Tap-triggered bubble for non-current nodes is rendered in a Modal so it
  // overlays everything on the screen (escapes the SectionList stacking ctx).
  // The current node's bubble is rendered by HomeScreen via CurrentNodeContext
  // so it also escapes the stacking context.
  const closePreview = () => {
    setPreviewing(false);
    setAnchor(null);
  };

  const handleStartPress = () => {
    closePreview();
    onPress?.();
  };

  const isCompleted = node.status === "completed";
  const actionLabel = isCompleted ? "REFAZER" : "COMEÇAR";

  const bubbleContent = (
    <View style={styles.bubbleCard}>
      <Text style={styles.bubbleTitle} numberOfLines={2}>
        {node.label}
      </Text>
      <Text style={styles.bubbleSubtitle}>
        Lição {node.position} de {node.total}
      </Text>
      <TouchableOpacity
        onPress={handleStartPress}
        activeOpacity={0.85}
        style={styles.bubbleStartButton}
      >
        <Text style={styles.bubbleStartText}>
          {actionLabel}{" "}
          <Text style={styles.bubbleStartTextXp}>+{node.xpReward} XP</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  const circleStack = (
    <View style={{ width: size, height: size + 5 }}>
      {/* Pulse ring — current lesson only */}
      {isCurrent && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -14,
            left: -14,
            width: size + 28,
            height: size + 28,
            borderRadius: (size + 28) / 2,
            backgroundColor: palette.bg,
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          }}
        />
      )}

      <View
        style={{
          position: "absolute",
          top: 5,
          left: 0,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: palette.shadow,
        }}
      />

      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: palette.bg,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ translateY: pressTranslateY }],
        }}
      >
        {iconEl[node.type]}
      </Animated.View>
    </View>
  );

  if (!onPress) {
    return (
      <View style={styles.nodeOuter}>
        {circleStack}
      </View>
    );
  }

  const handleTap = () => {
    // Any unlocked node: open the preview bubble as a Modal overlay anchored
    // to the node's screen position. Closes on outside tap. The bubble's own
    // COMEÇAR/REFAZER button navigates.
    nodeRef.current?.measureInWindow((x, y, w, h) => {
      setAnchor({ x, y, w, h });
      setPreviewing(true);
    });
  };

  // Compute bubble position so it sits centered below the node, clamped to screen.
  const bubbleStyle = anchor
    ? (() => {
        const centerX = anchor.x + anchor.w / 2;
        let left = centerX - BUBBLE_WIDTH / 2;
        left = Math.max(12, Math.min(left, SCREEN_WIDTH - BUBBLE_WIDTH - 12));
        const top = anchor.y + anchor.h + 12;
        const arrowLeft = centerX - left - 7; // arrow base half-width = 7
        return { left, top, arrowLeft };
      })()
    : null;

  return (
    <View style={styles.nodeOuter}>
      <Pressable
        ref={nodeRef}
        onPress={handleTap}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {circleStack}
      </Pressable>

      <Modal
        visible={previewing && !!bubbleStyle}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closePreview}
      >
        <Pressable style={styles.previewBackdrop} onPress={closePreview}>
          {bubbleStyle && (
            <View
              pointerEvents="box-none"
              style={[
                styles.previewBubbleAnchor,
                { left: bubbleStyle.left, top: bubbleStyle.top, width: BUBBLE_WIDTH },
              ]}
            >
              <View
                style={[
                  styles.bubbleArrow,
                  { marginLeft: bubbleStyle.arrowLeft },
                ]}
              />
              {/* Pressable swallow so taps inside the card don't dismiss */}
              <Pressable onPress={() => {}}>{bubbleContent}</Pressable>
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
};

// ── Animated mascot ────────────────────────────────────────────────────────
// Cada variante começa em uma fase diferente para parecerem independentes
const MASCOT_DELAY: Record<MascotImage, number> = {
  cheer: 0,
  reading: 400,
  thumbsup: 750,
  love: 1100,
};

const AnimatedMascot = ({
  image,
  side,
}: {
  image: MascotImage;
  side: "left" | "right";
}) => {
  const floatY = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;
  const delay = MASCOT_DELAY[image];

  useEffect(() => {
    // Float suave para cima e para baixo
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(floatY, {
          toValue: -9,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Balanço lateral suave
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(tilt, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tilt, {
          toValue: -1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tilt, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const rotation = tilt.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-6deg", "6deg"],
  });

  return (
    <Animated.Image
      source={MASCOT_IMAGES[image]}
      style={[
        styles.mascotNodeImg,
        side === "left" ? { left: 28 } : { right: 28 },
        { transform: [{ translateY: floatY }, { rotate: rotation }] },
      ]}
      resizeMode="contain"
    />
  );
};

// ── Unit path ─────────────────────────────────────────────────────────────
const LockedUnitCard = () => (
  <View style={styles.lockedUnitCard}>
    <Lock size={36} color={colors.mutedForeground} />
    <Text style={styles.lockedUnitMsg}>
      Termine a unidade anterior para desbloquear
    </Text>
  </View>
);

const GeneratingUnitCard = () => (
  <View style={styles.lockedUnitCard}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.lockedUnitMsg}>
      Estamos preparando sua próxima unidade…
    </Text>
    <Text style={styles.lockedUnitMsgSub}>
      Isso pode levar alguns instantes.
    </Text>
  </View>
);

const UnitNodePath = ({ unit }: { unit: Unit }) => {
  const navigation = useNavigation<Nav>();

  if (unit.status === 'generating') {
    return <GeneratingUnitCard />;
  }
  if (unit.status === 'skeleton') {
    return <LockedUnitCard />;
  }

  return (
    <View style={styles.lessonPath}>
      {unit.nodes.map((node, nodeIdx) => {
        const mascot = unit.mascots.find((m) => m.nodeIdx === nodeIdx);
        return (
          <View key={node.id} style={styles.nodeRow}>
            <View style={{ transform: [{ translateX: node.offsetX }] }}>
              <NodeIcon
                node={node}
                onPress={
                  node.status !== "locked" && node.lessonId
                    ? () => navigation.navigate("Lesson", { lessonId: node.lessonId })
                    : undefined
                }
              />
            </View>
            {mascot && (
              <AnimatedMascot image={mascot.image} side={mascot.side} />
            )}
          </View>
        );
      })}
    </View>
  );
};

// SectionList data
type UnitSection = Unit & { data: Unit[] };

// ── Main screen ────────────────────────────────────────────────────────────
const HomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const [sections, setSections] = useState<UnitSection[]>([]);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);


  const loadData = useCallback(async () => {
    try {
      const [{ sections: apiSections }, me] = await Promise.all([
        unitsApi.getUnits(),
        meApi.getMe(),
      ]);

      const mapped: UnitSection[] = apiSections.flatMap((s) =>
        s.units.map((u) => ({ ...u, data: [u] as Unit[] }))
      );
      setSections(mapped);
      setStreak(me.stats.streak_days);
      setLevel(me.stats.level);
      setLoadError(false);

      // Poll while any unit is still generating
      const anyGenerating = apiSections.some((s) =>
        s.units.some((u) => u.status === "generating" || u.status === "skeleton")
      );
      if (!anyGenerating && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    } catch {
      if (sections.length === 0) setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [sections.length]);

  useEffect(() => {
    loadData();
    pollRef.current = setInterval(loadData, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadData]);

  // Show the active section in full, plus a single locked teaser of the next section.
  const visibleSections = useMemo(() => {
    if (sections.length === 0) return sections;
    const activeIdx = sections.findIndex((s) => s.status !== "completed");
    const activeSection =
      activeIdx === -1 ? sections[sections.length - 1].section : sections[activeIdx].section;
    const seenNextSection = new Set<number>();
    return sections.filter((s) => {
      if (s.section === activeSection) return true;
      if (s.section === activeSection + 1 && !seenNextSection.has(s.section)) {
        seenNextSection.add(s.section);
        return true;
      }
      return false;
    });
  }, [sections]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.mutedForeground }}>
            Preparando sua trilha...
          </Text>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
          <Text
            style={{ color: colors.mutedForeground, textAlign: "center", marginBottom: 20 }}
          >
            Não foi possível carregar. Verifique sua conexão.
          </Text>
          <TouchableOpacity
            onPress={loadData}
            style={styles.retryBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  const goToProfile = () => navigation.navigate("Profile");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Fixed stats bar */}
        <View style={styles.statsBar}>
          <TouchableOpacity
            style={styles.statBadge}
            onPress={goToProfile}
            activeOpacity={0.7}
          >
            <Image
              source={require("../../assets/images/icon-fire.png")}
              style={styles.statIcon}
              resizeMode="contain"
            />
            <Text style={styles.statValue}>{streak}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statBadge}
            onPress={goToProfile}
            activeOpacity={0.7}
          >
            <Image
              source={require("../../assets/images/icon-energy.png")}
              style={styles.statIcon}
              resizeMode="contain"
            />
            <Text style={styles.statValue}>{level}</Text>
          </TouchableOpacity>
        </View>

        <SectionList
          style={styles.scroll}
          sections={visibleSections}
          keyExtractor={(item) => `unit-${item.id}`}
          renderSectionHeader={({ section }) => <UnitHeader unit={section} />}
          renderItem={({ item }) => <UnitNodePath unit={item} />}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        />

        <BottomNav />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: radius.full,
  },
  retryBtnText: { color: colors.primaryForeground, fontWeight: "600", fontSize: 15 },
  lockedUnitCard: {
    marginHorizontal: 32,
    marginVertical: 24,
    paddingVertical: 32,
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  lockedUnitMsg: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  lockedUnitMsgSub: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: "center",
    paddingHorizontal: 24,
    opacity: 0.7,
  },

  // Stats bar (fixed above list)
  statsBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 10,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  statIcon: { width: 32, height: 22 },
  statValue: { fontSize: 14, fontWeight: "800", color: colors.foreground },

  // Sticky section header
  sectionHeaderWrap: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  unitHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: radius.xl,
    shadowColor: SHADOW_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  unitHeaderLeft: { flex: 1 },
  unitHeaderSection: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 3,
  },
  unitHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primaryForeground,
  },
  unitHeaderBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Map
  lessonPath: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 14,
    position: "relative",
  },
  nodeRow: {
    width: "100%",
    alignItems: "center",
    position: "relative",
  },
  mascotNodeImg: {
    position: "absolute",
    top: -15,
    width: 110,
    height: 110,
  },

  // Nodes
  nodeOuter: { alignItems: "center", paddingBottom: 2 },

  // Floating preview bubble — absolute so it doesn't shift the row/path layout
  bubbleAnchor: {
    position: "absolute",
    left: -120,
    right: -120,
    alignItems: "center",
    zIndex: 50,
  },
  bubbleArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: colors.foreground,
  },
  bubbleCard: {
    backgroundColor: colors.foreground,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radius.xl,
    width: 240,
    maxWidth: SCREEN_WIDTH - 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  bubbleTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.4,
  },
  bubbleSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
    marginBottom: 12,
    textAlign: "center",
  },
  bubbleStartButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: radius.full,
    alignSelf: "stretch",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  bubbleStartText: {
    color: colors.primaryForeground,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  bubbleStartTextXp: {
    color: "#FFD901",
  },

  // Modal overlay (tap-triggered preview)
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  previewBubbleAnchor: {
    position: "absolute",
    alignItems: "flex-start",
  },
});

export default HomeScreen;
