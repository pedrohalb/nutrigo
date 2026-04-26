import React, { useEffect, useRef, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Lock,
  Star,
  BookOpen,
  Trophy,
  GraduationCap,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import Svg, { Path, Circle } from "react-native-svg";
import BottomNav from "../components/BottomNav";
import { colors, radius } from "../theme";
import type { LessonNode, MascotImage, Unit } from "../types/lesson";
import { units } from "../mocks/units";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MASCOT_IMAGES: Record<MascotImage, ReturnType<typeof require>> = {
  cheer: require("../../assets/images/broccoli-cheer.png"),
  reading: require("../../assets/images/broccoli-reading.png"),
  thumbsup: require("../../assets/images/broccoli-thumbsup.png"),
  love: require("../../assets/images/broccoli-love.png"),
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const SHADOW_PRIMARY = "#1e4a31";
const SHADOW_GOLD = "#B87C0C";
const SHADOW_MUTED = "#a8ab99";

// Status color palette
const STATUS_COLORS = {
  completed: { bg: "#F5A623", shadow: SHADOW_GOLD, icon: "#fff" },
  current: { bg: colors.primary, shadow: SHADOW_PRIMARY, icon: "#fff" },
  locked: {
    bg: colors.muted,
    shadow: SHADOW_MUTED,
    icon: colors.mutedForeground,
  },
} as const;

// Progress ring
const RING_RADIUS = 46;
const RING_STROKE = 5;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;
const RING_SIZE = (RING_RADIUS + RING_STROKE) * 2;
const CURRENT_PROGRESS = 0.7;

// Approximate label container height (bubble ~33 + arrow ~8 + marginBottom ~10)
const LABEL_H = 51;

// ── Sticky section header ──────────────────────────────────────────────────
const UnitHeader = ({ unit }: { unit: Unit }) => {
  const navigation = useNavigation<Nav>();
  return (
    <View style={styles.sectionHeaderWrap}>
      <View style={styles.unitHeader}>
        <View style={styles.unitHeaderLeft}>
          <Text style={styles.unitHeaderSection}>
            SEÇÃO {unit.section} · UNIDADE {unit.unit}
          </Text>
          <Text style={styles.unitHeaderTitle}>{unit.title}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("StudyGuide")}
          style={styles.unitHeaderBtn}
          activeOpacity={0.7}
        >
          <BookOpen size={20} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Node icon ──────────────────────────────────────────────────────────────
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

  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.45)).current;
  const labelY = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
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
    if (isCurrent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(labelY, {
            toValue: -7,
            duration: 550,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(labelY, {
            toValue: 0,
            duration: 550,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
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
    star: (
      <Star
        size={28}
        color={palette.icon}
        fill={isActive ? palette.icon : "transparent"}
      />
    ),
    lock: <Lock size={22} color={palette.icon} />,
    chest: <Trophy size={24} color={palette.icon} />,
    book: <GraduationCap size={24} color={palette.icon} />,
  };

  const inner = (
    <View style={styles.nodeOuter}>
      {isCurrent && node.label && (
        <Animated.View
          style={[
            styles.labelContainer,
            { transform: [{ translateY: labelY }] },
          ]}
        >
          <View style={styles.labelBubble}>
            <Text style={styles.labelText}>{node.label}</Text>
          </View>
          <View style={styles.labelArrow} />
        </Animated.View>
      )}

      <View style={{ width: size, height: size + 5 }}>
        {/* Pulse ring */}
        {isActive && (
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

        {/* Progress ring (current node only) */}
        {isCurrent && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -(RING_SIZE / 2 - size / 2),
              left: -(RING_SIZE / 2 - size / 2),
            }}
          >
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="#FFD700"
                strokeWidth={RING_STROKE}
                fill="none"
                strokeDasharray={`${RING_CIRC * CURRENT_PROGRESS} ${RING_CIRC}`}
                strokeLinecap="round"
                transform={`rotate(-90, ${RING_SIZE / 2}, ${RING_SIZE / 2})`}
              />
            </Svg>
          </View>
        )}

        {/* 3D shadow — stays fixed */}
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

        {/* Main circle — sinks on press */}
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
    </View>
  );

  if (!onPress) return <View style={{ alignItems: "center" }}>{inner}</View>;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ alignItems: "center" }}
    >
      {inner}
    </Pressable>
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

// ── Unit path with SVG connection line ────────────────────────────────────
interface NodeCenter {
  x: number;
  y: number;
}

const UnitNodePath = ({ unit }: { unit: Unit }) => {
  const navigation = useNavigation<Nav>();
  const [nodeCenters, setNodeCenters] = useState<NodeCenter[]>([]);
  const [pathHeight, setPathHeight] = useState(0);
  const layoutsRef = useRef<Array<{ y: number } | null>>(
    unit.nodes.map(() => null),
  );

  const onNodeLayout = (idx: number) => (e: any) => {
    const { y } = e.nativeEvent.layout;
    layoutsRef.current[idx] = { y };
    if (layoutsRef.current.every((v) => v !== null)) {
      const centers = unit.nodes.map((n, i) => {
        const sz = n.type === "star" ? 68 : 58;
        const hasLabel = n.status === "current" && !!n.label;
        return {
          x: SCREEN_WIDTH / 2 + n.offsetX,
          y: layoutsRef.current[i]!.y + (hasLabel ? LABEL_H : 0) + sz / 2,
        };
      });
      setNodeCenters(centers);
    }
  };

  const buildPath = (fromIdx: number, toIdx: number): string => {
    if (nodeCenters.length <= toIdx) return "";
    let d = "";
    for (let i = fromIdx; i < toIdx; i++) {
      const p1 = nodeCenters[i];
      const p2 = nodeCenters[i + 1];
      if (!p1 || !p2) continue;
      if (!d) d = `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
      const cy = ((p1.y + p2.y) / 2).toFixed(1);
      d += ` C ${p1.x.toFixed(1)} ${cy} ${p2.x.toFixed(1)} ${cy} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  // Last index of a non-locked node (completed or current)
  const lastActiveIdx = unit.nodes.reduce(
    (last, n, i) => (n.status !== "locked" ? i : last),
    -1,
  );

  const allPath = buildPath(0, unit.nodes.length - 1);
  const activePath = lastActiveIdx > 0 ? buildPath(0, lastActiveIdx) : "";

  return (
    <View
      style={styles.lessonPath}
      onLayout={(e) => setPathHeight(e.nativeEvent.layout.height)}
    >
      {/* SVG connection line */}
      {pathHeight > 0 && nodeCenters.length === unit.nodes.length && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={SCREEN_WIDTH} height={pathHeight}>
            {!!allPath && (
              <Path
                d={allPath}
                stroke="#D0D0D0"
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
              />
            )}
            {!!activePath && (
              <Path
                d={activePath}
                stroke="#F5A623"
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
              />
            )}
          </Svg>
        </View>
      )}

      {unit.nodes.map((node, nodeIdx) => {
        const mascot = unit.mascots.find((m) => m.nodeIdx === nodeIdx);
        return (
          <View
            key={node.id}
            style={styles.nodeRow}
            onLayout={onNodeLayout(nodeIdx)}
          >
            <View style={{ transform: [{ translateX: node.offsetX }] }}>
              <NodeIcon
                node={node}
                onPress={
                  node.status !== "locked"
                    ? () => navigation.navigate("Lesson")
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
const sections: UnitSection[] = units.map((unit) => ({
  ...unit,
  data: [unit],
}));

// ── Main screen ────────────────────────────────────────────────────────────
const HomeScreen = () => {
  const streak = 3;
  const energy = 2;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Fixed stats bar */}
        <View style={styles.statsBar}>
          <View style={styles.statBadge}>
            <Image
              source={require("../../assets/images/icon-fire.png")}
              style={styles.statIcon}
              resizeMode="contain"
            />
            <Text style={styles.statValue}>{streak}</Text>
          </View>
          <View style={styles.statBadge}>
            <Image
              source={require("../../assets/images/icon-energy.png")}
              style={styles.statIcon}
              resizeMode="contain"
            />
            <Text style={styles.statValue}>{energy}</Text>
          </View>
        </View>

        <SectionList
          style={styles.scroll}
          sections={sections}
          keyExtractor={(item) => `unit-${item.unit}`}
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
  labelContainer: { alignItems: "center", marginBottom: 10 },
  labelBubble: {
    backgroundColor: colors.foreground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 3,
  },
  labelText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#fff",
  },
  labelArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.foreground,
    marginTop: 1,
  },
});

export default HomeScreen;
