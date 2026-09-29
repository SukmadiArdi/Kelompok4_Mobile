import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/constants/Theme';
import { useAuth } from '@/src/context/AuthContext';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async () => {
    setStatusMessage(null);
    if (!email.trim() || !email.includes('@')) {
      setStatusMessage({ text: 'Masukkan alamat email yang valid.', isError: true });
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPassword(email);
      setStatusMessage({ text: res.message || 'Instruksi reset terkirim.', isError: !res.success });
    } catch {
      setStatusMessage({ text: 'Gagal mengirim instruksi reset kata sandi.', isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pemulihan Kata Sandi</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={40} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Lupa Kata Sandi?</Text>
          <Text style={styles.subtitle}>
            Jangan khawatir! Masukkan alamat email yang terdaftar pada akun LokalTrip Anda, dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
          </Text>

          <View style={styles.card}>
            {statusMessage ? (
              <View
                style={[
                  styles.messageBox,
                  statusMessage.isError ? styles.errorBox : styles.successBox,
                ]}>
                <Ionicons
                  name={statusMessage.isError ? 'alert-circle' : 'checkmark-circle'}
                  size={18}
                  color={statusMessage.isError ? Colors.danger : Colors.success}
                />
                <Text
                  style={[
                    styles.messageText,
                    statusMessage.isError ? styles.errorText : styles.successText,
                  ]}>
                  {statusMessage.text}
                </Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Terdaftar</Text>
              <View style={styles.inputContainer}>
                <Feather name="mail" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nama@email.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (statusMessage) setStatusMessage(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.btnDisabled]}
              onPress={handleReset}
              disabled={submitting}
              activeOpacity={0.85}>
              {submitting ? (
                <ActivityIndicator color={Colors.surface} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Kirim Tautan Pemulihan</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backToLoginBtn}
            onPress={() => router.push('/auth/login' as any)}
            activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={16} color={Colors.primary} />
            <Text style={styles.backToLoginText}>Kembali ke Halaman Masuk</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: Colors.dangerLight,
    borderColor: '#FCA5A5',
  },
  successBox: {
    backgroundColor: Colors.successLight,
    borderColor: '#86EFAC',
  },
  messageText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  errorText: {
    color: Colors.danger,
  },
  successText: {
    color: Colors.success,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    height: '100%',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.surface,
  },
  backToLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xl,
    padding: 8,
  },
  backToLoginText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.primary,
  },
});
