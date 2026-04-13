import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, CheckCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/* ─── Data types ─── */
interface MultipleChoiceQuestion {
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctIndex: number;
}

interface ImageChoiceQuestion {
  type: 'image-choice';
  question: string;
  options: { label: string; emoji: string }[];
  correctIndex: number;
}

interface FillBlankQuestion {
  type: 'fill-blank';
  question: string;
  chips: string[];
  correctChip: string;
}

type Question = MultipleChoiceQuestion | ImageChoiceQuestion | FillBlankQuestion;

/* ─── Sample lesson data ─── */
const lessonQuestions: Question[] = [
  {
    type: 'multiple-choice',
    question: 'O que caracteriza uma alimentação equilibrada?',
    options: [
      'Consumir apenas alimentos de origem animal',
      'Comer grandes quantidades de um único alimento',
      'Incluir diferentes grupos alimentares em quantidades adequadas',
      'Evitar totalmente carboidratos e gorduras',
    ],
    correctIndex: 2,
  },
  {
    type: 'image-choice',
    question:
      'Qual alimento é considerado uma opção saudável para o consumo diário, por ser rico em nutrientes importantes para o organismo?',
    options: [
      { label: 'Coca-Cola', emoji: '🥤' },
      { label: 'Bala', emoji: '🍬' },
      { label: 'Salgadinho', emoji: '🍿' },
      { label: 'Maçã', emoji: '🍎' },
    ],
    correctIndex: 3,
  },
  {
    type: 'fill-blank',
    question:
      'Uma alimentação saudável deve incluir o consumo regular de ____, pois fornece vitaminas, minerais e fibras essenciais para o bom funcionamento do organismo.',
    chips: ['Frituras', 'Frutas', 'Doces', 'Refrigerantes', 'Salgadinhos', 'Balas'],
    correctChip: 'Frutas',
  },
];

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
        style={[
          styles.progressBarFill,
          { width: `${(step / total) * 100}%` },
        ]}
      />
    </View>
    <Text style={styles.progressText}>
      {step} / {total}
    </Text>
  </View>
);

/* ─── Next Button ─── */
const NextButton = ({
  onPress,
  disabled,
  label = 'Próximo',
}: {
  onPress: () => void;
  disabled?: boolean;
  label?: string;
}) => (
  <View style={styles.nextButtonWrapper}>
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.nextButton, disabled && styles.disabled]}
      activeOpacity={0.8}
    >
      <Text style={styles.nextButtonText}>{label}</Text>
    </TouchableOpacity>
  </View>
);

/* ─── Question screens ─── */
const MultipleChoiceScreen = ({
  q,
  selected,
  onSelect,
}: {
  q: MultipleChoiceQuestion;
  selected: number | null;
  onSelect: (i: number) => void;
}) => (
  <ScrollView style={styles.questionScroll} contentContainerStyle={styles.questionContent}>
    <Text style={styles.questionText}>{q.question}</Text>
    <View style={styles.optionsList}>
      {q.options.map((opt, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => onSelect(i)}
          style={[
            styles.mcOption,
            selected === i && styles.mcOptionSelected,
          ]}
          activeOpacity={0.7}
        >
          <Text style={styles.mcOptionText}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
);

const ImageChoiceScreen = ({
  q,
  selected,
  onSelect,
}: {
  q: ImageChoiceQuestion;
  selected: number | null;
  onSelect: (i: number) => void;
}) => (
  <ScrollView style={styles.questionScroll} contentContainerStyle={styles.questionContent}>
    <Text style={styles.questionText}>{q.question}</Text>
    <View style={styles.imageGrid}>
      {q.options.map((opt, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => onSelect(i)}
          style={[
            styles.imageOption,
            selected === i && styles.imageOptionSelected,
          ]}
          activeOpacity={0.7}
        >
          <Text style={styles.imageEmoji}>{opt.emoji}</Text>
          <Text style={styles.imageLabel}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
);

const FillBlankScreen = ({
  q,
  selected,
  onSelect,
}: {
  q: FillBlankQuestion;
  selected: string | null;
  onSelect: (chip: string) => void;
}) => (
  <ScrollView style={styles.questionScroll} contentContainerStyle={styles.questionContent}>
    <Text style={styles.questionText}>{q.question}</Text>
    <View style={styles.chipContainer}>
      {q.chips.map((chip) => (
        <TouchableOpacity
          key={chip}
          onPress={() => onSelect(chip)}
          style={[
            styles.chip,
            selected === chip && styles.chipSelected,
          ]}
          activeOpacity={0.7}
        >
          <Text style={styles.chipText}>{chip}</Text>
        </TouchableOpacity>
      ))}
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
      source={require('../../assets/images/nutrigo-broccoli-encourage.png')}
      style={styles.encourageImage}
      resizeMode="contain"
    />
  </View>
);

const LessonCompleteScreen = () => (
  <View style={styles.rewardScreen}>
    <Text style={styles.completeTitle}>Lição completa!</Text>
    <Image
      source={require('../../assets/images/nutrigo-broccoli-celebrate.png')}
      style={styles.celebrateImage}
      resizeMode="contain"
    />
    <View style={styles.statsRow}>
      <View style={[styles.statCard, { borderColor: colors.streak }]}>
        <Text style={[styles.statCardLabel, { color: colors.streak }]}>Total de EXP</Text>
        <View style={styles.statCardRow}>
          <Image
            source={require('../../assets/images/icon-energy.png')}
            style={styles.statCardIcon}
            resizeMode="contain"
          />
          <Text style={[styles.statCardValue, { color: colors.streak }]}>100</Text>
        </View>
      </View>
      <View style={[styles.statCard, { borderColor: colors.primary }]}>
        <Text style={[styles.statCardLabel, { color: colors.primary }]}>Incrível</Text>
        <View style={styles.statCardRow}>
          <CheckCircle size={20} color={colors.primary} />
          <Text style={[styles.statCardValue, { color: colors.primary }]}>100%</Text>
        </View>
      </View>
    </View>
  </View>
);

const StreakScreen = () => {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
  return (
    <View style={styles.rewardScreen}>
      <Text style={styles.streakNumber}>1</Text>
      <Text style={styles.streakLabel}>dia de ofensiva!</Text>
      <Image
        source={require('../../assets/images/icon-fire.png')}
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
              {i === 0 && <CheckCircle size={16} color={colors.primaryForeground} />}
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

  const isQuestionStep = step < lessonQuestions.length;
  const currentQuestion = isQuestionStep ? lessonQuestions[step] : null;

  const canProceed = () => {
    if (!isQuestionStep) return true;
    if (currentQuestion?.type === 'multiple-choice') return mcSelected !== null;
    if (currentQuestion?.type === 'image-choice') return imgSelected !== null;
    if (currentQuestion?.type === 'fill-blank') return fillSelected !== null;
    return false;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      setMcSelected(null);
      setImgSelected(null);
      setFillSelected(null);
    } else {
      navigation.navigate('Home');
    }
  };

  const renderContent = () => {
    if (isQuestionStep && currentQuestion) {
      switch (currentQuestion.type) {
        case 'multiple-choice':
          return (
            <MultipleChoiceScreen
              q={currentQuestion}
              selected={mcSelected}
              onSelect={setMcSelected}
            />
          );
        case 'image-choice':
          return (
            <ImageChoiceScreen
              q={currentQuestion}
              selected={imgSelected}
              onSelect={setImgSelected}
            />
          );
        case 'fill-blank':
          return (
            <FillBlankScreen
              q={currentQuestion}
              selected={fillSelected}
              onSelect={setFillSelected}
            />
          );
      }
    }

    const rewardStep = step - lessonQuestions.length;
    if (rewardStep === 0) return <EncouragementScreen />;
    if (rewardStep === 1) return <LessonCompleteScreen />;
    return <StreakScreen />;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ProgressHeader
        step={Math.min(step + 1, totalSteps)}
        total={totalSteps}
        onClose={() => navigation.navigate('Home')}
      />
      <View style={styles.contentArea}>{renderContent()}</View>
      <NextButton
        onPress={handleNext}
        disabled={!canProceed()}
        label="Próximo"
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.muted,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
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
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
  disabled: {
    opacity: 0.4,
  },
  /* Content */
  contentArea: {
    flex: 1,
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
    fontWeight: '700',
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
    borderColor: colors.primary,
    backgroundColor: 'rgba(43, 102, 70, 0.1)',
  },
  mcOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  /* Image choice */
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageOption: {
    width: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 20,
    backgroundColor: colors.card,
  },
  imageOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(43, 102, 70, 0.1)',
  },
  imageEmoji: {
    fontSize: 48,
  },
  imageLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.foreground,
  },
  /* Fill blank */
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    borderColor: colors.primary,
    backgroundColor: 'rgba(43, 102, 70, 0.1)',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  /* Reward screens */
  rewardScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  /* Encouragement */
  encourageBubble: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
    marginBottom: 16,
  },
  encourageText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  encourageImage: {
    width: 288,
    height: 288,
  },
  /* Lesson complete */
  completeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 16,
  },
  celebrateImage: {
    width: 208,
    height: 208,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  statCardLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  statCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statCardIcon: {
    width: 20,
    height: 20,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  /* Streak */
  streakNumber: {
    fontSize: 60,
    fontWeight: '800',
    color: colors.streak,
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.streak,
    marginBottom: 8,
  },
  streakFireIcon: {
    width: 64,
    height: 64,
    marginBottom: 24,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dayItem: {
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakWarning: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.lg,
    shadowColor: '#000',
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
    textAlign: 'center',
  },
});

export default LessonScreen;
