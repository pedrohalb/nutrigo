import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, CheckCircle, Flag } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors, radius } from "../theme";
import type {
  MultipleChoiceQuestion,
  ImageChoiceQuestion,
  FillBlankQuestion,
} from "../types/quiz";
import { lessonQuestions } from "../mocks/lessonQuestions";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CORRECT_COLOR = "#22c55e";
const WRONG_COLOR = "#ef4444";

const totalSteps = lessonQuestions.length + 3;

/* ─── Progress Header ─── */
const ProgressHeader = ({
  step,
  total,
  onClose,
}: {
  step: number;
  total: number;
  onClose: () => void;
}) => (
  <View style={styles.progressHeader}>
    <TouchableOpacity
      onPress={onClose}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <X size={24} color={colors.mutedForeground} />
    </TouchableOpacity>
    <View style={styles.progressBarBg}>
      <View
        style={[styles.progressBarFill, { width: `${(step / total) * 100}%` }]}
      />
    </View>
    <Text style={styles.progressText}>
      {step} / {total}
    </Text>
  </View>
);

/* ─── Question screens ─── */
const MultipleChoiceScreen = ({
  q,
  selected,
  onSelect,
  answered,
  isCorrect,
}: {
  q: MultipleChoiceQuestion;
  selected: number | null;
  onSelect: (i: number) => void;
  answered: boolean;
  isCorrect: boolean | null;
}) => (
  <ScrollView
    style={styles.questionScroll}
    contentContainerStyle={styles.questionContent}
  >
    <Text style={styles.questionText}>{q.question}</Text>
    <View style={styles.optionsList}>
      {q.options.map((opt, i) => {
        const isSelected = selected === i;
        const showCorrect = answered && isSelected && isCorrect === true;
        const showWrong = answered && isSelected && isCorrect === false;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => !answered && onSelect(i)}
            style={[
              styles.mcOption,
              isSelected && !answered && styles.mcOptionSelected,
              showCorrect && styles.mcOptionCorrect,
              showWrong && styles.mcOptionWrong,
            ]}
            activeOpacity={answered ? 1 : 0.7}
          >
            <Text
              style={[
                styles.mcOptionText,
                showCorrect && { color: CORRECT_COLOR },
                showWrong && { color: WRONG_COLOR },
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </ScrollView>
);

const ImageChoiceScreen = ({
  q,
  selected,
  onSelect,
  answered,
  isCorrect,
}: {
  q: ImageChoiceQuestion;
  selected: number | null;
  onSelect: (i: number) => void;
  answered: boolean;
  isCorrect: boolean | null;
}) => (
  <ScrollView
    style={styles.questionScroll}
    contentContainerStyle={styles.questionContent}
  >
    <Text style={styles.questionText}>{q.question}</Text>
    <View style={styles.imageGrid}>
      {q.options.map((opt, i) => {
        const isSelected = selected === i;
        const showCorrect = answered && isSelected && isCorrect === true;
        const showWrong = answered && isSelected && isCorrect === false;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => !answered && onSelect(i)}
            style={[
              styles.imageOption,
              isSelected && !answered && styles.imageOptionSelected,
              showCorrect && styles.imageOptionCorrect,
              showWrong && styles.imageOptionWrong,
            ]}
            activeOpacity={answered ? 1 : 0.7}
          >
            <Text style={styles.imageEmoji}>{opt.emoji}</Text>
            <Text
              style={[
                styles.imageLabel,
                showCorrect && { color: CORRECT_COLOR },
                showWrong && { color: WRONG_COLOR },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </ScrollView>
);

const FillBlankScreen = ({
  q,
  selected,
  onSelect,
  answered,
  isCorrect,
}: {
  q: FillBlankQuestion;
  selected: string | null;
  onSelect: (chip: string) => void;
  answered: boolean;
  isCorrect: boolean | null;
}) => (
  <ScrollView
    style={styles.questionScroll}
    contentContainerStyle={styles.questionContent}
  >
    <Text style={styles.questionText}>{q.question}</Text>
    <View style={styles.chipContainer}>
      {q.chips.map((chip) => {
        const isSelected = selected === chip;
        const showCorrect = answered && isSelected && isCorrect === true;
        const showWrong = answered && isSelected && isCorrect === false;
        return (
          <TouchableOpacity
            key={chip}
            onPress={() => !answered && onSelect(chip)}
            style={[
              styles.chip,
              isSelected && !answered && styles.chipSelected,
              showCorrect && styles.chipCorrect,
              showWrong && styles.chipWrong,
            ]}
            activeOpacity={answered ? 1 : 0.7}
          >
            <Text
              style={[
                styles.chipText,
                showCorrect && { color: CORRECT_COLOR },
                showWrong && { color: WRONG_COLOR },
              ]}
            >
              {chip}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </ScrollView>
);

/* ─── Reward screens ─── */
const EncouragementScreen = () => (
  <View style={styles.rewardScreen}>
    <View style={styles.encourageBubble}>
      <Text style={styles.encourageText}>
        Seu trabalho duro está sendo recompensado!
      </Text>
    </View>
    <Image
      source={require("../../assets/images/nutrigo-broccoli-encourage.png")}
      style={styles.encourageImage}
      resizeMode="contain"
    />
  </View>
);

const LessonCompleteScreen = () => (
  <View style={styles.rewardScreen}>
    <Text style={styles.completeTitle}>Lição completa!</Text>
    <Image
      source={require("../../assets/images/nutrigo-broccoli-celebrate.png")}
      style={styles.celebrateImage}
      resizeMode="contain"
    />
    <View style={styles.statsRow}>
      <View style={[styles.statCard, { borderColor: "#FFD901" }]}>
        <View style={[styles.statCardHeader, { borderBottomWidth: 0 }]}>
          <Text style={[styles.statCardLabel, { color: "#fff" }]}>
            Total de EXP
          </Text>
        </View>
        <View style={styles.statCardBody}>
          <Image
            source={require("../../assets/images/icon-energy.png")}
            style={styles.statCardIcon}
            resizeMode="contain"
          />
          <Text style={[styles.statCardValue, { color: "#FFD901" }]}>100</Text>
        </View>
      </View>
      <View style={[styles.statCard, { borderColor: colors.primary }]}>
        <View
          style={[
            styles.statCardHeader,
            { backgroundColor: colors.primary, borderBottomWidth: 0 },
          ]}
        >
          <Text style={[styles.statCardLabel, { color: "#fff" }]}>
            Precisão
          </Text>
        </View>
        <View style={styles.statCardBody}>
          <CheckCircle size={32} color={colors.primary} />
          <Text style={[styles.statCardValue, { color: colors.primary }]}>
            100%
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const StreakScreen = () => {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
  return (
    <View style={styles.rewardScreen}>
      <Text style={styles.streakNumber}>1</Text>
      <Text style={styles.streakLabel}>dia de ofensiva!</Text>
      <Image
        source={require("../../assets/images/icon-fire.png")}
        style={styles.streakFireIcon}
        resizeMode="contain"
      />

      <View style={styles.daysRow}>
        {days.map((d, i) => (
          <View key={d} style={styles.dayItem}>
            <Text style={styles.dayLabel}>{d}</Text>
            <View
              style={[
                styles.dayCircle,
                { backgroundColor: i === 0 ? colors.streak : colors.muted },
              ]}
            >
              {i === 0 && (
                <CheckCircle size={16} color={colors.primaryForeground} />
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.streakWarning}>
        <Text style={styles.streakWarningText}>
          Sua ofensiva será resetada amanhã caso você não pratique. Cuidado!
        </Text>
      </View>
    </View>
  );
};

/* ─── Main Lesson Page ─── */
const LessonScreen = () => {
  const navigation = useNavigation<Nav>();
  const [step, setStep] = useState(0);
  const [mcSelected, setMcSelected] = useState<number | null>(null);
  const [imgSelected, setImgSelected] = useState<number | null>(null);
  const [fillSelected, setFillSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const isQuestionStep = step < lessonQuestions.length;
  const currentQuestion = isQuestionStep ? lessonQuestions[step] : null;

  const isCorrect: boolean | null = (() => {
    if (!answered || !currentQuestion) return null;
    if (currentQuestion.type === "multiple-choice")
      return mcSelected === currentQuestion.correctIndex;
    if (currentQuestion.type === "image-choice")
      return imgSelected === currentQuestion.correctIndex;
    if (currentQuestion.type === "fill-blank")
      return fillSelected === currentQuestion.correctChip;
    return null;
  })();

  const hasSelection = (): boolean => {
    if (!currentQuestion) return false;
    if (currentQuestion.type === "multiple-choice") return mcSelected !== null;
    if (currentQuestion.type === "image-choice") return imgSelected !== null;
    if (currentQuestion.type === "fill-blank") return fillSelected !== null;
    return false;
  };

  const canProceed = (): boolean => {
    if (!isQuestionStep) return true;
    if (answered) return true;
    return hasSelection();
  };

  const handleAction = () => {
    if (isQuestionStep && !answered) {
      setAnswered(true);
      setShowExplanation(false);
      return;
    }
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      setAnswered(false);
      setShowExplanation(false);
      setMcSelected(null);
      setImgSelected(null);
      setFillSelected(null);
    } else {
      navigation.navigate("Home");
    }
  };

  const renderContent = () => {
    if (isQuestionStep && currentQuestion) {
      switch (currentQuestion.type) {
        case "multiple-choice":
          return (
            <MultipleChoiceScreen
              q={currentQuestion}
              selected={mcSelected}
              onSelect={setMcSelected}
              answered={answered}
              isCorrect={isCorrect}
            />
          );
        case "image-choice":
          return (
            <ImageChoiceScreen
              q={currentQuestion}
              selected={imgSelected}
              onSelect={setImgSelected}
              answered={answered}
              isCorrect={isCorrect}
            />
          );
        case "fill-blank":
          return (
            <FillBlankScreen
              q={currentQuestion}
              selected={fillSelected}
              onSelect={setFillSelected}
              answered={answered}
              isCorrect={isCorrect}
            />
          );
      }
    }

    const rewardStep = step - lessonQuestions.length;
    if (rewardStep === 0) return <EncouragementScreen />;
    if (rewardStep === 1) return <LessonCompleteScreen />;
    return <StreakScreen />;
  };

  const buttonLabel = isQuestionStep && !answered ? "Responder" : "Próximo";

  return (
    <SafeAreaView style={styles.safe}>
      <ProgressHeader
        step={Math.min(step + 1, totalSteps)}
        total={totalSteps}
        onClose={() => navigation.navigate("Home")}
      />
      <View style={styles.contentArea}>{renderContent()}</View>

      <View
        style={[
          answered &&
            isQuestionStep &&
            isCorrect === true &&
            styles.bottomCorrect,
          answered &&
            isQuestionStep &&
            isCorrect === false &&
            styles.bottomWrong,
        ]}
      >
        {isQuestionStep && answered && currentQuestion && (
          <View
            style={[
              styles.feedbackContainer,
              { borderTopColor: isCorrect ? CORRECT_COLOR : WRONG_COLOR },
            ]}
          >
            {(isCorrect === false || showExplanation) && (
              <Text style={styles.explanationText}>
                {currentQuestion.explanation}
              </Text>
            )}
            <View style={styles.statusRow}>
              <Text
                style={[
                  styles.statusLabel,
                  { color: isCorrect ? CORRECT_COLOR : WRONG_COLOR },
                ]}
              >
                {isCorrect ? "Correto" : "Incorreto"}
              </Text>
              {isCorrect && (
                <TouchableOpacity
                  onPress={() => setShowExplanation((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Flag
                    size={20}
                    color={CORRECT_COLOR}
                    fill={showExplanation ? CORRECT_COLOR : "transparent"}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        <View style={styles.nextButtonWrapper}>
          <TouchableOpacity
            onPress={handleAction}
            disabled={!canProceed()}
            style={[
              styles.nextButton,
              !canProceed() && styles.disabled,
              answered && isCorrect === true && styles.nextButtonCorrect,
              answered && isCorrect === false && styles.nextButtonWrong,
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  /* Progress header */
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.muted,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
  },
  /* Next button */
  nextButtonWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryForeground,
  },
  nextButtonCorrect: {
    backgroundColor: CORRECT_COLOR,
  },
  nextButtonWrong: {
    backgroundColor: WRONG_COLOR,
  },
  bottomCorrect: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
  },
  bottomWrong: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
  },
  disabled: {
    opacity: 0.4,
  },
  /* Content */
  contentArea: {
    flex: 1,
  },
  /* Feedback area */
  feedbackContainer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 2,
    borderTopWidth: 2,
  },
  explanationText: {
    fontSize: 13,
    color: colors.mutedForeground,
    lineHeight: 19,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  /* Questions */
  questionScroll: {
    flex: 1,
  },
  questionContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: 32,
  },
  optionsList: {
    gap: 12,
  },
  mcOption: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
  },
  mcOptionSelected: {
    borderColor: colors.mutedForeground,
    backgroundColor: colors.muted,
  },
  mcOptionCorrect: {
    borderColor: CORRECT_COLOR,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  mcOptionWrong: {
    borderColor: WRONG_COLOR,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  mcOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
  },
  /* Image choice */
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageOption: {
    width: "47%",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 20,
    backgroundColor: colors.card,
  },
  imageOptionSelected: {
    borderColor: colors.mutedForeground,
    backgroundColor: colors.muted,
  },
  imageOptionCorrect: {
    borderColor: CORRECT_COLOR,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  imageOptionWrong: {
    borderColor: WRONG_COLOR,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  imageEmoji: {
    fontSize: 48,
  },
  imageLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.foreground,
  },
  /* Fill blank */
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.card,
  },
  chipSelected: {
    borderColor: colors.mutedForeground,
    backgroundColor: colors.muted,
  },
  chipCorrect: {
    borderColor: CORRECT_COLOR,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  chipWrong: {
    borderColor: WRONG_COLOR,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
  },
  /* Reward screens */
  rewardScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  /* Encouragement */
  encourageBubble: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
    marginBottom: 16,
  },
  encourageText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
  },
  encourageImage: {
    width: 288,
    height: 288,
  },
  /* Lesson complete */
  completeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 16,
  },
  celebrateImage: {
    width: 208,
    height: 208,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    alignItems: "center",
    borderWidth: 2,
    borderRadius: radius.lg,
    backgroundColor: "#f3f1e6",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 130,
  },
  statCardHeader: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    backgroundColor: "#FFD901",
  },
  statCardLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  statCardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  statCardIcon: {
    width: 45,
    height: 30,
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  /* Streak */
  streakNumber: {
    fontSize: 60,
    fontWeight: "800",
    color: colors.streak,
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.streak,
    marginBottom: 8,
  },
  streakFireIcon: {
    width: 200,
    height: 150,
    marginBottom: 24,
  },
  daysRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dayItem: {
    alignItems: "center",
    gap: 4,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.foreground,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  streakWarning: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 8,
    maxWidth: 280,
  },
  streakWarningText: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: "center",
  },
});

export default LessonScreen;
