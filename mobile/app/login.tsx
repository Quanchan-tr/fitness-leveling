import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../lib/auth';
import { colors } from '../lib/theme';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) return setError('Nhập email và mật khẩu.');
    setBusy(true);
    setError('');
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.inner}>
        <Text style={s.eyebrow}>FITNESSLEVELING AI</Text>
        <Text style={s.title} accessibilityRole="header">Đăng nhập</Text>
        <TextInput
          style={s.input}
          placeholder="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={s.input}
          placeholder="Mật khẩu"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={submit}
        />
        {!!error && <Text style={s.error}>{error}</Text>}
        <Pressable style={[s.button, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy} accessibilityRole="button">
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Đăng nhập</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  eyebrow: { fontSize: 12, fontWeight: '600', letterSpacing: 0.6, color: colors.primary },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: colors.surface,
  },
  error: { color: colors.danger },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
