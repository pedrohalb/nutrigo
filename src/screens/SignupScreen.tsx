import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import PasswordField from '../components/PasswordField';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import PasswordRequirements from '../components/PasswordRequirements';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radius } from '../theme';
import Toast, { type ToastHandle } from '../components/Toast';
import { STRENGTH } from '../constants/passwordStrength';
import { useAuth } from '../contexts/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SignupScreen = () => {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toastRef = useRef<ToastHandle>(null);
  const { signup } = useAuth();

  const requirements = [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Um número', met: /[0-9]/.test(password) },
    { label: 'Um caracter especial', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const strengthCount = requirements.filter((r) => r.met).length as 0 | 1 | 2 | 3 | 4;
  const strengthInfo = STRENGTH[strengthCount];

  const allMet =
    requirements.every((r) => r.met) &&
    password === confirmPassword &&
    email.length > 0;

  const handleCreate = async () => {
    if (!allMet || loading) return;
    setLoading(true);
    try {
      await signup(email, password);
      toastRef.current?.show(() =>
        navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] })
      );
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Falha ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>cadastre-se</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.fieldset}>
            <Text style={styles.legend}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="debra.holt@example.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <PasswordField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            show={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
          />

          {password.length > 0 && (
            <PasswordStrengthMeter
              strengthCount={strengthCount}
              strengthInfo={strengthInfo}
            />
          )}

          <PasswordField
            label="Confirmar senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <PasswordRequirements requirements={requirements} />

          <TouchableOpacity
            onPress={handleCreate}
            disabled={!allMet || loading}
            style={[styles.primaryButton, (!allMet || loading) && styles.disabled]}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Criando...' : 'Criar conta'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast ref={toastRef} message="Conta criada com sucesso!" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
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
    marginTop: 16,
  },
  primaryButtonText: { color: colors.primaryForeground, fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.5 },
});

export default SignupScreen;
