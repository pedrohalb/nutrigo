import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import FormField from '../components/FormField';
import PasswordField from '../components/PasswordField';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import PasswordRequirements from '../components/PasswordRequirements';
import PrimaryButton from '../components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme';
import Toast, { type ToastHandle } from '../components/Toast';
import { usePasswordValidation } from '../hooks/usePasswordValidation';
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

  const { requirements, strengthCount, strengthInfo, isValid } = usePasswordValidation(
    password,
    confirmPassword,
  );
  const allMet = isValid && email.length > 0;

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
        <ScreenHeader title="cadastre-se" onBack={() => navigation.navigate('Login')} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <FormField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="debra.holt@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

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

          <PrimaryButton
            label="Criar conta"
            loadingLabel="Criando..."
            onPress={handleCreate}
            loading={loading}
            disabled={!allMet}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast ref={toastRef} message="Conta criada com sucesso!" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  submit: { marginTop: 16 },
});

export default SignupScreen;
