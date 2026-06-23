import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { colors, radius } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import FormField from '../components/FormField';
import PasswordField from '../components/PasswordField';
import PrimaryButton from '../components/PrimaryButton';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const { hasProfile } = await login(email, password);
      navigation.reset({
        index: 0,
        routes: [{ name: hasProfile ? 'Home' : 'Onboarding' }],
      });
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Falha ao entrar');
    } finally {
      setLoading(false);
    }
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

          <View style={styles.form}>
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

            <View style={styles.buttons}>
              <PrimaryButton label="Login" onPress={handleLogin} loading={loading} />

              <TouchableOpacity
                style={styles.accentButton}
                onPress={() => navigation.navigate('Signup')}
                activeOpacity={0.8}
              >
                <Text style={styles.accentButtonText}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 48,
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
  mascotImage: { width: 96, height: 96 },
  title: { fontSize: 30, fontWeight: '700', color: '#236532' },
  form: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 32,
    paddingTop: 32,
    gap: 20,
  },
  buttons: { gap: 12, marginTop: 16 },
  accentButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  accentButtonText: { color: colors.accentForeground, fontSize: 16, fontWeight: '600' },
  forgotBtn: { alignSelf: 'center', marginTop: 8, padding: 8 },
  forgotText: { color: colors.primary, fontSize: 14, fontWeight: '500' },
});

export default LoginScreen;
