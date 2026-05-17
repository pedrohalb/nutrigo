import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  CheckCircle,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../App";
import AIChat from "../components/AIChat";
import { colors, radius } from "../theme";
import type { LessonData, StudyGuideQuestion } from "../types/studyGuide";
import { studyGuideApi } from "../services/api/studyGuide";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "StudyGuide">;
type Tab = "material" | "revisao" | "ia";

/* ─── Tab Button ─── */
const TabButton = ({
  emoji,
  icon,
  label,
  active,
  onPress,
}: {
  emoji?: string;
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tabButton, active && styles.tabButtonActive]}
    activeOpacity={0.7}
  >
    {emoji && <Text style={styles.tabEmoji}>{emoji}</Text>}
    {icon}
    <Text
      style={[styles.tabLabel, active && styles.tabLabelActive]}
      numberOfLines={2}
      textBreakStrategy="simple"
    >
      {label}
    </Text>
  </TouchableOpacity>
);

/* ─── Material Tab ─── */
const MaterialTab = ({ material }: { material: any }) => {
  if (!material) {
    return (
      <View style={[styles.tabContent, { alignItems: "center", paddingTop: 32 }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={{ color: colors.mutedForeground, marginTop: 12 }}>
          Gerando material...
        </Text>
      </View>
    );
  }

  const sections: Array<{ title: string; content: string }> =
    material?.sections ?? [];

  return (
    <View style={styles.tabContent}>
      {sections.map((section, i) => (
        <View key={i} style={styles.materialCard}>
          <View style={styles.materialCardHeader}>
            <Text style={styles.emoji}>📖</Text>
            <Text style={styles.materialCardTitle}>{section.title}</Text>
          </View>
          <Text style={styles.materialCardText}>{section.content}</Text>
        </View>
      ))}
    </View>
  );
};

/* ─── Revision Tab ─── */
const RevisionTab = ({
  lessonsData,
  expandedLesson,
  setExpandedLesson,
  openDetail,
}: {
  lessonsData: LessonData[];
  expandedLesson: number | null;
  setExpandedLesson: (v: number | null) => void;
  openDetail: (lesson: LessonData, qIndex: number) => void;
}) => (
  <View style={styles.tabContent}>
    {lessonsData.map((lesson, li) => {
      const disabled = lesson.questions.length === 0;
      return (
        <View key={li} style={disabled && styles.lessonDisabled}>
          {/* Lesson header */}
          <TouchableOpacity
            onPress={() =>
              !disabled && setExpandedLesson(expandedLesson === li ? null : li)
            }
            style={styles.lessonHeader}
            activeOpacity={disabled ? 1 : 0.7}
          >
            <View style={styles.lessonHeaderLeft}>
              <Text
                style={[
                  styles.lessonTitle,
                  disabled && styles.lessonTitleDisabled,
                ]}
              >
                {lesson.title}
              </Text>
              <Text style={styles.lessonSubtitle}>
                {lesson.questionsCount} questões
              </Text>
            </View>
            <View style={styles.lessonHeaderRight}>
              <Text style={styles.progressPercent}>{lesson.progress}%</Text>
              {expandedLesson === li ? (
                <ChevronUp size={18} color={colors.mutedForeground} />
              ) : (
                <ChevronDown size={18} color={colors.mutedForeground} />
              )}
            </View>
          </TouchableOpacity>

          {/* Progress bar */}
          <View style={styles.lessonBarBg}>
            <View
              style={[styles.lessonBarFill, { width: `${lesson.progress}%` }]}
            />
          </View>

          {/* Questions list */}
          {expandedLesson === li && lesson.questions.length > 0 && (
            <View style={styles.questionsList}>
              {lesson.questions.map((q, qi) => (
                <TouchableOpacity
                  key={qi}
                  onPress={() => openDetail(lesson, qi)}
                  style={styles.questionRow}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.questionNumber,
                      {
                        backgroundColor: q.correct
                          ? "rgba(43, 102, 70, 0.1)"
                          : "rgba(239, 68, 68, 0.1)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.questionNumberText,
                        {
                          color: q.correct
                            ? colors.primary
                            : colors.destructive,
                        },
                      ]}
                    >
                      {qi + 1}
                    </Text>
                  </View>
                  <Text style={styles.questionText} numberOfLines={1}>
                    {q.text}
                  </Text>
                  {q.correct ? (
                    <Check size={16} color={colors.primary} />
                  ) : (
                    <X size={16} color={colors.destructive} />
                  )}
                  <ChevronRight size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      );
    })}
  </View>
);

/* ─── Shared TabBar ─── */
const TabBar = ({
  activeTab,
  setActiveTab,
  style,
}: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  style?: object;
}) => (
  <View style={[styles.tabRow, style]}>
    <TabButton
      emoji="📚"
      label="Material de estudo"
      active={activeTab === "material"}
      onPress={() => setActiveTab("material")}
    />
    <TabButton
      icon={
        <CheckCircle
          size={16}
          color={
            activeTab === "revisao"
              ? colors.primaryForeground
              : colors.foreground
          }
        />
      }
      label="Revisão"
      active={activeTab === "revisao"}
      onPress={() => setActiveTab("revisao")}
    />
    <TabButton
      emoji="🤖"
      label="Dúvidas com a IA"
      active={activeTab === "ia"}
      onPress={() => setActiveTab("ia")}
    />
  </View>
);

/* ─── Main StudyGuide ─── */
const StudyGuideScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { unitId } = route.params;
  const [activeTab, setActiveTab] = useState<Tab>("material");
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<StudyGuideQuestion | null>(null);
  const [detailIndex, setDetailIndex] = useState(0);
  const [detailTotal, setDetailTotal] = useState(0);
  const [detailQuestions, setDetailQuestions] = useState<StudyGuideQuestion[]>([]);
  const [studyMaterial, setStudyMaterial] = useState<any>(null);
  const [lessonsData, setLessonsData] = useState<LessonData[]>([]);
  const [unitInfo, setUnitInfo] = useState<{ section: number; unit: number; title: string } | null>(null);

  useEffect(() => {
    studyGuideApi.getStudyMaterial(unitId).then(({ studyMaterial: sm }) => {
      setStudyMaterial(sm);
    }).catch(() => {});
    import("../services/api/units").then(({ unitsApi }) =>
      unitsApi.getUnit(unitId).then((u) => setUnitInfo({ section: u.section, unit: u.unit, title: u.title })).catch(() => {})
    );
  }, [unitId]);

  useEffect(() => {
    if (activeTab === "revisao") {
      studyGuideApi.getReview(unitId).then(setLessonsData).catch(() => {});
    }
  }, [activeTab, unitId]);

  const openDetail = (lesson: LessonData, qIndex: number) => {
    const qs = lesson.questions.map((q) => ({
      ...q,
      lessonTitle: lesson.title,
    }));
    setDetailQuestions(qs);
    setDetailIndex(qIndex);
    setDetailTotal(qs.length);
    setSelectedQuestion(qs[qIndex]);
  };

  const closeDetail = () => setSelectedQuestion(null);

  const navigateDetail = (dir: -1 | 1) => {
    const newIdx = detailIndex + dir;
    if (newIdx >= 0 && newIdx < detailTotal) {
      setDetailIndex(newIdx);
      setSelectedQuestion(detailQuestions[newIdx]);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>guia de estudos</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.contentArea}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {activeTab !== "ia" ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Section banner */}
            <View style={styles.sectionBanner}>
              <Text style={styles.sectionBannerTitle}>
                {unitInfo ? `Seção ${unitInfo.section}, Unidade ${unitInfo.unit}` : "—"}
              </Text>
              <Text style={styles.sectionBannerSubtitle}>
                {unitInfo?.title ?? ""}
              </Text>
            </View>

            <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === "material" && <MaterialTab material={studyMaterial} />}
            {activeTab === "revisao" && (
              <RevisionTab
                lessonsData={lessonsData}
                expandedLesson={expandedLesson}
                setExpandedLesson={setExpandedLesson}
                openDetail={openDetail}
              />
            )}
          </ScrollView>
        ) : (
          <View style={styles.iaContainer}>
            {/* Section banner */}
            <View
              style={[
                styles.sectionBanner,
                { marginHorizontal: 20, marginBottom: 8 },
              ]}
            >
              <Text style={styles.sectionBannerTitle}>
                {unitInfo ? `Seção ${unitInfo.section}, Unidade ${unitInfo.unit}` : "—"}
              </Text>
              <Text style={styles.sectionBannerSubtitle}>
                {unitInfo?.title ?? ""}
              </Text>
            </View>

            <TabBar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              style={{ marginHorizontal: 20, marginBottom: 12 }}
            />

            <View style={styles.aiChatArea}>
              <AIChat unitId={unitId} />
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Detail Modal — full screen overlay */}
      <Modal
        visible={!!selectedQuestion}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {selectedQuestion && (
          <SafeAreaView style={styles.modalSafe}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={closeDetail}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ArrowLeft size={24} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={styles.modalCounter}>
                {detailIndex + 1} de {detailTotal}
              </Text>
              <TouchableOpacity
                onPress={() => navigateDetail(1)}
                disabled={detailIndex >= detailTotal - 1}
                style={[detailIndex >= detailTotal - 1 && { opacity: 0.3 }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ArrowRight size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalLessonTitle}>
                {selectedQuestion.lessonTitle}
              </Text>
              <Text style={styles.modalQuestion}>
                {selectedQuestion.fullQuestion}
              </Text>

              {/* User answer */}
              <View
                style={[
                  styles.answerBox,
                  {
                    backgroundColor: selectedQuestion.correct
                      ? colors.primary
                      : colors.destructive,
                  },
                ]}
              >
                <View style={styles.answerHeader}>
                  {selectedQuestion.correct ? (
                    <Check size={18} color={colors.primaryForeground} />
                  ) : (
                    <X size={18} color={colors.destructiveForeground} />
                  )}
                  <Text style={styles.answerHeaderText}>
                    SUA RESPOSTA -{" "}
                    {selectedQuestion.correct ? "CORRETA" : "INCORRETA"}
                  </Text>
                </View>
                <Text style={styles.answerText}>
                  {selectedQuestion.userAnswer}
                </Text>
              </View>

              {/* Explanation */}
              <View
                style={[
                  styles.explanationBox,
                  {
                    backgroundColor: selectedQuestion.correct
                      ? "rgba(43, 102, 70, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                  },
                ]}
              >
                <View style={styles.explanationHeader}>
                  <Text style={styles.emoji}>🤔</Text>
                  <Text
                    style={[
                      styles.explanationTitle,
                      {
                        color: selectedQuestion.correct
                          ? colors.primary
                          : colors.destructive,
                      },
                    ]}
                  >
                    POR QUÊ?
                  </Text>
                </View>
                <Text style={styles.explanationText}>
                  {selectedQuestion.explanation}
                </Text>
              </View>

              <TouchableOpacity
                onPress={closeDetail}
                style={styles.closeButton}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
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
  contentArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  /* Section banner */
  sectionBanner: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  sectionBannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primaryForeground,
  },
  sectionBannerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  /* Tabs */
  tabRow: {
    flexDirection: "row",
    backgroundColor: colors.muted,
    borderRadius: radius.full,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: radius.full,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabEmoji: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.foreground,
    textAlign: "center",
  },
  tabLabelActive: {
    color: colors.primaryForeground,
  },
  /* Material tab */
  tabContent: {
    gap: 16,
  },
  materialCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  materialCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  emoji: {
    fontSize: 18,
  },
  materialCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
  },
  materialCardText: {
    fontSize: 14,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  conceptCard: {
    backgroundColor: "rgba(43, 102, 70, 0.1)",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  conceptTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: 4,
  },
  conceptText: {
    fontSize: 14,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  macroList: {
    gap: 12,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  macroCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  macroLetter: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryForeground,
  },
  macroText: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
    lineHeight: 20,
  },
  macroBold: {
    fontWeight: "600",
  },
  /* Revision tab */
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  lessonHeaderLeft: {
    flex: 1,
  },
  lessonDisabled: {
    opacity: 0.4,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
  },
  lessonTitleDisabled: {
    color: colors.mutedForeground,
  },
  lessonSubtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  lessonHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressPercent: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  lessonBarBg: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted,
    marginBottom: 8,
    overflow: "hidden",
  },
  lessonBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  questionsList: {
    gap: 8,
    marginBottom: 12,
  },
  questionRow: {
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
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  questionNumberText: {
    fontSize: 12,
    fontWeight: "700",
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
  },
  /* IA tab */
  iaContainer: {
    flex: 1,
  },
  aiChatArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  /* Detail Modal */
  modalSafe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  modalCounter: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  modalLessonTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
  },
  modalQuestion: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.foreground,
    marginBottom: 20,
  },
  answerBox: {
    borderRadius: radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  answerHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryForeground,
  },
  answerText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  explanationBox: {
    borderRadius: radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 24,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  explanationText: {
    fontSize: 14,
    color: colors.foreground,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.full,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default StudyGuideScreen;
