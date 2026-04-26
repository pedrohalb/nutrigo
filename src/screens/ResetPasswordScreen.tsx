import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ResetPasswordScreen = () => {
  const navigation = useNavigation<Nav>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toastRef = useRef<ToastHandle>(null);

  const requirements = [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Um número', met: /[0-9]/.test(password) },
    { label: 'Um caracter especial', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const strengthCount = requirements.filter((r) => r.met).length as 0 | 1 | 2 | 3 | 4;
  const strengthInfo = STRENGTH[strengthCount];

  const allMet = requirements.every((r) => r.met) && password === confirmPassword;

  const handleReset = () => {
    if (!allMet) return;
    toastRef.current?.show(() => navigation.navigate('Login'));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>redefinição de senha</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Nova senha */}
          <PasswordField
            label="Nova senha"
            value={password}
            onChangeText={setPassword}
            show={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
          />

          {/* Strength meter */}
          {password.length > 0 && (
            <PasswordStrengthMeter
              strengthCount={strengthCount}
              strengthInfo={strengthInfo}
            />
          )}

          {/* Confirmar senha */}
          <PasswordField
            label="Confirmar senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          {/* Requisitos da senha */}
          <PasswordRequirements requirements={requirements} />

          {/* Button */}
          <TouchableOpacity
            onPress={handleReset}
            disabled={!allMet}
            style={[styles.primaryButton, !allMet && styles.disabled]}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Redefinir</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast ref={toastRef} message="Senha redefinida com sucesso!" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
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
  primaryButtonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default ResetPasswordScreen;
