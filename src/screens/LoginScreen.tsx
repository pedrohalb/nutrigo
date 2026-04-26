import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<Nav>();

  const handleLogin = () => {
    navigation.navigate('Onboarding');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Green Header */}
          <View style={styles.header}>
            <View style={styles.mascotCircle}>
              <Image
                source={require('../../assets/images/nutrigo-mascot.png')}
                style={styles.mascotImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>NutriGo</Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            {/* E-mail Field */}
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

            {/* Password Field */}
            <View style={styles.fieldset}>
              <Text style={styles.legend}>Senha</Text>
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

            {/* Buttons */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.accentButton}
                onPress={handleSignup}
                activeOpacity={0.8}
              >
                <Text style={styles.accentButtonText}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.accent,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 48,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  mascotCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.card,
    borderWidth: 4,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  mascotImage: {
    width: 96,
    height: 96,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#236532',
  },
  form: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 32,
    paddingTop: 32,
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
  buttons: {
    gap: 12,
    marginTop: 16,
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
  },
  primaryButtonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  accentButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  accentButtonText: {
    color: colors.accentForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  forgotBtn: {
    alignSelf: 'center',
    marginTop: 8,
    padding: 8,
  },
  forgotText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoginScreen;
