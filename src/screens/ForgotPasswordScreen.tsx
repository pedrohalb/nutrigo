import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radius } from '../theme';
import { authApi } from '../services/api/auth';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      navigation.navigate('ResetPassword', { email });
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Falha ao enviar');
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
          <Text style={styles.headerTitle}>esqueceu a senha</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
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

          <TouchableOpacity
            onPress={handleSend}
            disabled={!email || loading}
            style={[styles.primaryButton, (!email || loading) && styles.disabled]}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Enviando...' : 'Enviar e-mail de recuperação'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  form: { paddingHorizontal: 32, paddingTop: 32, gap: 20 },
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

export default ForgotPasswordScreen;
