import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radius } from '../theme';
import { OBJECTIVES, TOPICS, GOALS } from '../mocks/onboarding';
import { meApi, type GoalKind } from '../services/api/me';
import { unitsApi } from '../services/api/units';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STEPS = ['bem-vindo', 'objetivos', 'aprendizado', 'metas'] as const;

const GOAL_VALUE_MAP: Record<string, GoalKind> = {
  Casual: 'casual',
  Regular: 'regular',
  Sério: 'serio',
  Intenso: 'intenso',
};

const OnboardingScreen = () => {
  const navigation = useNavigation<Nav>();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!building) return;
    pollRef.current = setInterval(async () => {
      try {
        const { sections } = await unitsApi.getUnits();
        const ready = sections.some((s) => s.units.some((u) => u.status === 'generated'));
        if (ready) {
          clearInterval(pollRef.current!);
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        }
      } catch { /* continua polling */ }
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [building]);

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const toggleItem = (item: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'bem-vindo': return name.trim().length > 0;
      case 'objetivos': return selectedObjectives.length >= 1;
      case 'aprendizado': return selectedTopics.length >= 3;
      case 'metas': return selectedGoal.length > 0;
    }
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      await meApi.onboarding({
        name: name.trim(),
        objectives: selectedObjectives,
        topics: selectedTopics,
        goal: GOAL_VALUE_MAP[selectedGoal],
      });
      setBuilding(true);
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Falha ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  const renderCheckableItem = (
    label: string,
    selected: boolean,
    onPress: () => void,
    rightContent?: React.ReactNode
  ) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      style={[styles.optionButton, selected && styles.optionButtonSelected]}
      activeOpacity={0.7}
    >
      <Text style={styles.optionText} numberOfLines={2}>{label}</Text>
      {rightContent || (
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Check size={14} color={colors.primaryForeground} />}
        </View>
      )}
    </TouchableOpacity>
  );

  if (building) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.buildingContainer}>
          <Text style={styles.buildingEmoji}>🌱</Text>
          <Text style={styles.buildingTitle}>Construindo seu plano personalizado</Text>
          <Text style={styles.buildingSubtitle}>
            Estamos preparando seu conteúdo de nutrição.{'\n'}Isso pode levar alguns instantes...
          </Text>
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.stepLabel}>{currentStep}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 'bem-vindo' && (
            <View style={styles.stepContent}>
              <Text style={styles.heading}>Primeiro, como podemos te chamar?</Text>
              <Text style={styles.subtitle}>Queremos conhecer você melhor!</Text>
              <View style={styles.fieldset}>
                <Text style={styles.legend}>Nome</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="example"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            </View>
          )}

          {currentStep === 'objetivos' && (
            <View style={styles.stepContent}>
              <Text style={styles.heading}>Vamos começar com alguns objetivos.</Text>
              <Text style={styles.subtitle}>Selecione 3 objetivos do seu interesse.</Text>
              <View style={styles.optionsList}>
                {OBJECTIVES.map((obj) =>
                  renderCheckableItem(
                    obj,
                    selectedObjectives.includes(obj),
                    () => toggleItem(obj, selectedObjectives, setSelectedObjectives)
                  )
                )}
              </View>
            </View>
          )}

          {currentStep === 'aprendizado' && (
            <View style={styles.stepContent}>
              <Text style={styles.heading}>Eu gostaria de aprender...</Text>
              <Text style={styles.subtitle}>Selecione 3 assuntos do seu interesse.</Text>
              <View style={styles.optionsList}>
                {TOPICS.map((topic) =>
                  renderCheckableItem(
                    topic,
                    selectedTopics.includes(topic),
                    () => toggleItem(topic, selectedTopics, setSelectedTopics)
                  )
                )}
              </View>
            </View>
          )}

          {currentStep === 'metas' && (
            <View style={styles.stepContent}>
              <Text style={styles.heading}>Escolha sua meta diária.</Text>
              <Text style={styles.subtitle}>Quanto tempo por dia irá se dedicar?</Text>
              <View style={styles.optionsList}>
                {GOALS.map((goal) => (
                  <TouchableOpacity
                    key={goal.label}
                    onPress={() => setSelectedGoal(goal.label)}
                    style={[
                      styles.optionButton,
                      selectedGoal === goal.label && styles.optionButtonSelected,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionText}>{goal.label}</Text>
                    <Text style={styles.goalDetail}>{goal.detail}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomButton}>
          <TouchableOpacity
            onPress={handleNext}
            disabled={!canProceed() || loading}
            style={[styles.primaryButton, (!canProceed() || loading) && styles.disabled]}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={styles.primaryButtonText}>Próximo</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  stepLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.muted,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 6, backgroundColor: colors.primary },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 16,
  },
  stepContent: { flex: 1 },
  heading: { fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.mutedForeground, marginBottom: 24 },
  fieldset: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: colors.card,
  },
  legend: { fontSize: 12, color: colors.mutedForeground, marginBottom: 2 },
  input: { fontSize: 16, color: colors.foreground, padding: 0, margin: 0 },
  optionsList: { gap: 12 },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(177, 201, 154, 0.4)',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    flex: 1,
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  goalDetail: { fontSize: 14, color: colors.mutedForeground },
  bottomButton: { paddingHorizontal: 32, paddingBottom: 32 },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.full,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: { color: colors.primaryForeground, fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.5 },
  buildingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  buildingEmoji: { fontSize: 64, marginBottom: 24 },
  buildingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 12,
  },
  buildingSubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default OnboardingScreen;
