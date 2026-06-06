import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, CheckCircle, Flag } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../App";
import { colors, radius } from "../theme";
import type {
  MultipleChoiceQuestion,
  ImageChoiceQuestion,
  FillBlankQuestion,
  Question,
} from "../types/quiz";
import { lessonsApi, type UserAnswer, type SubmitResult } from "../services/api/lessons";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "Lesson">;

const CORRECT_COLOR = "#22c55e";
const WRONG_COLOR = "#ef4444";

/* ─── Progress Header ─── */
const ProgressHeader = ({
  step,
  total,
  progressRatio,
  onClose,
}: {
  step: number;
  total: number;
  progressRatio: number;
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
        style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]}
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

const LessonCompleteScreen = ({
  xpEarned,
  correctCount,
  totalCount,
  replay,
}: {
  xpEarned: number;
  correctCount: number;
  totalCount: number;
  replay: boolean;
}) => {
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  return (
    <View style={styles.rewardScreen}>
      <Text style={styles.completeTitle}>
        {replay ? "Lição revisada!" : "Lição completa!"}
      </Text>
      {replay && (
        <Text style={styles.replayNote}>
          Você já tinha concluído. Sem XP novo, só prática.
        </Text>
      )}
      <Image
        source={require("../../assets/images/nutrigo-broccoli-celebrate.png")}
        style={styles.celebrateImage}
        resizeMode="contain"
      />
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: "#FFD901" }]}>
          <View style={[styles.statCardHeader, { borderBottomWidth: 0 }]}>
            <Text style={[styles.statCardLabel, { color: "#fff" }]}>Total de EXP</Text>
          </View>
          <View style={styles.statCardBody}>
            <Image
              source={require("../../assets/images/icon-energy.png")}
              style={styles.statCardIcon}
              resizeMode="contain"
            />
            <Text style={[styles.statCardValue, { color: "#FFD901" }]}>{xpEarned}</Text>
          </View>
        </View>
        <View style={[styles.statCard, { borderColor: colors.primary }]}>
          <View style={[styles.statCardHeader, { backgroundColor: colors.primary, borderBottomWidth: 0 }]}>
            <Text style={[styles.statCardLabel, { color: "#fff" }]}>Precisão</Text>
          </View>
          <View style={styles.statCardBody}>
            <CheckCircle size={32} color={colors.primary} />
            <Text style={[styles.statCardValue, { color: colors.primary }]}>{accuracy}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const LevelUpScreen = ({ level }: { level: number }) => (
  <View style={styles.rewardScreen}>
    <Text style={styles.levelUpKicker}>Você subiu de nível!</Text>
    <Text style={styles.levelUpNumber}>Nível {level}</Text>
    <Image
      source={require("../../assets/images/icon-energy.png")}
      style={styles.levelUpIcon}
      resizeMode="contain"
    />
    <View style={styles.levelUpBubble}>
      <Text style={styles.levelUpBubbleText}>
        Continue assim e desbloqueie novas trilhas mais rápido!
      </Text>
    </View>
  </View>
);

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

// Map JS getDay() (0=Sun..6=Sat) → index in DAY_LABELS (0=Mon..6=Sun)
function todayWeekdayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

const StreakDayCircle = ({
  filled,
  isToday,
  delay,
}: {
  filled: boolean;
  isToday: boolean;
  delay: number;
}) => {
  const scale = useRef(new Animated.Value(filled ? 0 : 1)).current;
  const opacity = useRef(new Animated.Value(filled ? 0 : 1)).current;

  useEffect(() => {
    if (!filled) return;
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: isToday ? 480 : 260,
        delay,
        easing: isToday
          ? Easing.out(Easing.back(2))
          : Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [filled, isToday, delay]);

  return (
    <View
      style={[
        styles.dayCircle,
        { backgroundColor: filled ? colors.streak : colors.muted },
      ]}
    >
      {filled && (
        <Animated.View style={{ transform: [{ scale }], opacity }}>
          <CheckCircle size={16} color={colors.primaryForeground} />
        </Animated.View>
      )}
    </View>
  );
};

const StreakScreen = ({ streakDays }: { streakDays: number }) => {
  const todayIdx = todayWeekdayIndex();
  // Fill today + the prior days of THIS week covered by the current streak.
  const firstFilledIdx = Math.max(0, todayIdx - (streakDays - 1));

  return (
    <View style={styles.rewardScreen}>
      <Text style={styles.streakNumber}>{streakDays}</Text>
      <Text style={styles.streakLabel}>
        {streakDays === 1 ? "dia de ofensiva!" : "dias de ofensiva!"}
      </Text>
      <Image
        source={require("../../assets/images/icon-fire.png")}
        style={styles.streakFireIcon}
        resizeMode="contain"
      />
      <View style={styles.daysRow}>
        {DAY_LABELS.map((d, i) => {
          const filled = i >= firstFilledIdx && i <= todayIdx;
          const isToday = i === todayIdx;
          // Past days fill first (staggered), then today pops in last
          const staggerSlot = filled ? i - firstFilledIdx : 0;
          const delay = isToday
            ? (todayIdx - firstFilledIdx) * 90 + 120
            : staggerSlot * 90;
          return (
            <View key={d} style={styles.dayItem}>
              <Text style={styles.dayLabel}>{d}</Text>
              <StreakDayCircle filled={filled} isToday={isToday} delay={delay} />
            </View>
          );
        })}
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
type Step =
  | { kind: "question"; qIdx: number }
  | { kind: "encouragement" }
  | { kind: "complete" }
  | { kind: "levelUp" }
  | { kind: "streak" };

const LessonScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { lessonId } = route.params;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingLesson, setLoadingLesson] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [mcSelected, setMcSelected] = useState<number | null>(null);
  const [imgSelected, setImgSelected] = useState<number | null>(null);
  const [fillSelected, setFillSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const queueRef = useRef<number[]>([]);
  const correctSetRef = useRef<Set<number>>(new Set());
  const encouragementShownRef = useRef(false);
  const finalAnswersRef = useRef<Map<string, UserAnswer>>(new Map());
  const submittedRef = useRef(false);

  const resetSelection = () => {
    setAnswered(false);
    setShowExplanation(false);
    setMcSelected(null);
    setImgSelected(null);
    setFillSelected(null);
  };

  const submitIfNeeded = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const answers = Array.from(finalAnswersRef.current.entries()).map(
      ([questionId, userAnswer]) => ({ questionId, userAnswer }),
    );
    lessonsApi.submit(lessonId, answers).then(setSubmitResult).catch(() => {});
  };

  const advance = () => {
    resetSelection();
    if (queueRef.current.length === 0) {
      submitIfNeeded();
      setCurrentStep({ kind: "complete" });
      return;
    }
    const qIdx = queueRef.current.shift()!;
    setCurrentStep({ kind: "question", qIdx });
  };

  useEffect(() => {
    lessonsApi
      .getLesson(lessonId)
      .then((data) => {
        setQuestions(data.questions);
        queueRef.current = data.questions.map((_, i) => i);
        const first = queueRef.current.shift();
        if (first !== undefined) {
          setCurrentStep({ kind: "question", qIdx: first });
        } else {
          setCurrentStep({ kind: "complete" });
        }
        setLoadingLesson(false);
      })
      .catch(() => {
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      });
  }, [lessonId]);

  const currentQuestion =
    currentStep?.kind === "question" ? questions[currentStep.qIdx] : null;

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
    if (!currentStep) return false;
    if (currentStep.kind !== "question") return true;
    if (answered) return true;
    return hasSelection();
  };

  const buildUserAnswer = (q: Question): UserAnswer | null => {
    if (q.type === "multiple-choice")
      return mcSelected !== null ? { selectedIndex: mcSelected } : null;
    if (q.type === "image-choice")
      return imgSelected !== null ? { selectedIndex: imgSelected } : null;
    if (q.type === "fill-blank")
      return fillSelected !== null ? { selectedChip: fillSelected } : null;
    return null;
  };

  const handleAction = () => {
    if (!currentStep) return;

    if (currentStep.kind === "question") {
      if (!answered) {
        setAnswered(true);
        return;
      }
      const q = currentQuestion!;
      const qIdx = currentStep.qIdx;
      if (isCorrect) {
        const ua = buildUserAnswer(q);
        if (ua) {
          finalAnswersRef.current.set((q as any).id ?? `q-${qIdx}`, ua);
        }
        if (!correctSetRef.current.has(qIdx)) {
          correctSetRef.current.add(qIdx);
          setCorrectCount(correctSetRef.current.size);
        }
        const midpoint = Math.ceil(questions.length / 2);
        const shouldEncourage =
          !encouragementShownRef.current &&
          correctSetRef.current.size === midpoint &&
          queueRef.current.length > 0;
        if (shouldEncourage) {
          encouragementShownRef.current = true;
          resetSelection();
          setCurrentStep({ kind: "encouragement" });
          return;
        }
      } else {
        queueRef.current.push(qIdx);
      }
      advance();
      return;
    }

    if (currentStep.kind === "encouragement") {
      advance();
      return;
    }

    if (currentStep.kind === "complete") {
      if (submitResult?.levelUp) {
        setCurrentStep({ kind: "levelUp" });
      } else if (submitResult?.streakIncremented) {
        setCurrentStep({ kind: "streak" });
      } else {
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      }
      return;
    }

    if (currentStep.kind === "levelUp") {
      if (submitResult?.streakIncremented) {
        setCurrentStep({ kind: "streak" });
      } else {
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      }
      return;
    }

    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  };

  const renderContent = () => {
    if (!currentStep) return null;

    if (currentStep.kind === "question" && currentQuestion) {
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

    if (currentStep.kind === "encouragement") return <EncouragementScreen />;
    if (currentStep.kind === "complete")
      return (
        <LessonCompleteScreen
          xpEarned={submitResult?.xpEarned ?? 0}
          correctCount={questions.length}
          totalCount={questions.length}
          replay={submitResult?.replay ?? false}
        />
      );
    if (currentStep.kind === "levelUp")
      return <LevelUpScreen level={submitResult?.newLevel ?? 1} />;
    return <StreakScreen streakDays={submitResult?.streakDays ?? 1} />;
  };

  if (loadingLesson || !currentStep) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const isQuestionStep = currentStep.kind === "question";
  const buttonLabel = isQuestionStep && !answered ? "Responder" : "Próximo";

  // Progress bar: ratio of unique correct answers to total
  const totalQuestions = questions.length || 1;
  const progressRatio =
    currentStep.kind === "complete" || currentStep.kind === "streak"
      ? 1
      : Math.min(correctCount / totalQuestions, 1);

  return (
    <SafeAreaView style={styles.safe}>
      <ProgressHeader
        step={
          isQuestionStep
            ? Math.min(correctCount + 1, totalQuestions)
            : totalQuestions
        }
        total={totalQuestions}
        progressRatio={progressRatio}
        onClose={() => navigation.reset({ index: 0, routes: [{ name: "Home" }] })}
      />
      <View style={styles.contentArea}>{renderContent()}</View>

      <View
        style={[
          answered && isQuestionStep && isCorrect === true && styles.bottomCorrect,
          answered && isQuestionStep && isCorrect === false && styles.bottomWrong,
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
                {isCorrect
                  ? "Correto"
                  : "Incorreto — voltaremos a esta questão"}
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
  replayNote: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: "center",
    marginBottom: 16,
    marginHorizontal: 32,
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
  /* Level up */
  levelUpKicker: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.mutedForeground,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  levelUpNumber: {
    fontSize: 44,
    fontWeight: "800",
    color: "#F5A623",
    marginBottom: 12,
  },
  levelUpIcon: {
    width: 180,
    height: 130,
    marginBottom: 16,
  },
  levelUpBubble: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: 280,
  },
  levelUpBubbleText: {
    fontSize: 14,
    color: colors.foreground,
    textAlign: "center",
    fontWeight: "600",
  },
});

export default LessonScreen;
