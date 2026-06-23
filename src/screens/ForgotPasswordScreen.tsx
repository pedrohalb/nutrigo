import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme';
import { authApi } from '../services/api/auth';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';

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
        <ScreenHeader title="esqueceu a senha" onBack={() => navigation.navigate('Login')} />

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

          <PrimaryButton
            label="Enviar e-mail de recuperação"
            loadingLabel="Enviando..."
            onPress={handleSend}
            loading={loading}
            disabled={!email}
            style={styles.submit}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  form: { paddingHorizontal: 32, paddingTop: 32, gap: 20 },
  submit: { marginTop: 16 },
});

export default ForgotPasswordScreen;
