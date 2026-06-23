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
import PasswordField from '../components/PasswordField';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import PasswordRequirements from '../components/PasswordRequirements';
import PrimaryButton from '../components/PrimaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme';
import Toast, { type ToastHandle } from '../components/Toast';
import { usePasswordValidation } from '../hooks/usePasswordValidation';
import { authApi } from '../services/api/auth';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toastRef = useRef<ToastHandle>(null);

  const { requirements, strengthCount, strengthInfo, isValid: allMet } = usePasswordValidation(
    password,
    confirmPassword,
  );

  const handleReset = async () => {
    if (!allMet || loading) return;
    setLoading(true);
    try {
      await authApi.resetPassword(email, password);
      toastRef.current?.show(() =>
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
      );
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Falha ao redefinir senha');
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
        <ScreenHeader
          title="redefinição de senha"
          onBack={() => navigation.navigate('ForgotPassword')}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <PasswordField
            label="Nova senha"
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
            label="Redefinir"
            loadingLabel="Redefinindo..."
            onPress={handleReset}
            loading={loading}
            disabled={!allMet}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast ref={toastRef} message="Senha redefinida com sucesso!" />
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

export default ResetPasswordScreen;
