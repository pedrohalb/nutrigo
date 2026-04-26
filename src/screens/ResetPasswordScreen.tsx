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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff, Check, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radius } from '../theme';
import Toast, { type ToastHandle } from '../components/Toast';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STRENGTH = [
  null,
  { label: 'Fraca', color: '#ef4444' },
  { label: 'Média', color: '#f97316' },
  { label: 'Boa', color: '#eab308' },
  { label: 'Forte', color: colors.primary },
] as const;

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
          <View style={styles.fieldset}>
            <Text style={styles.legend}>Nova senha</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.flex]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.mutedForeground} />
                ) : (
                  <Eye size={20} color={colors.mutedForeground} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Strength meter */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                {([1, 2, 3, 4] as const).map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSegment,
                      {
                        backgroundColor:
                          i <= strengthCount && strengthInfo
                            ? strengthInfo.color
                            : colors.border,
                      },
                    ]}
                  />
                ))}
              </View>
              {strengthInfo && (
                <Text style={[styles.strengthLabel, { color: strengthInfo.color }]}>
                  {strengthInfo.label}
                </Text>
              )}
            </View>
          )}

          {/* Confirmar senha */}
          <View style={styles.fieldset}>
            <Text style={styles.legend}>Confirmar senha</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.flex]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••••••"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={colors.mutedForeground} />
                ) : (
                  <Eye size={20} color={colors.mutedForeground} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.reqBox}>
            <Text style={styles.reqTitle}>Requisitos da senha:</Text>
            {requirements.map((req, i) => (
              <View key={i} style={styles.reqRow}>
                {req.met ? (
                  <Check size={14} color={colors.primary} />
                ) : (
                  <X size={14} color={colors.destructive} />
                )}
                <Text
                  style={[
                    styles.reqLabel,
                    { color: req.met ? colors.primary : colors.destructive },
                  ]}
                >
                  {req.label}
                </Text>
              </View>
            ))}
          </View>

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
  fieldset: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: colors.card,
  },
  legend: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  input: {
    fontSize: 16,
    color: colors.foreground,
    padding: 0,
    margin: 0,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: -8,
  },
  strengthBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  reqBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  reqTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 8,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  reqLabel: {
    fontSize: 14,
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
