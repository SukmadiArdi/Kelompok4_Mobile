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
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/constants/Theme';
import { useAuth } from '@/src/context/AuthContext';
import { getFirebaseStatus } from '@/src/services/firebaseConfig';

export default function LoginScreen() {
  const { login, loginDemo, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const firebaseStatus = getFirebaseStatus();

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Harap isi alamat email dan kata sandi.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/profile');
        }
      } else {
        setErrorMessage(res.message || 'Gagal masuk. Periksa data Anda.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat masuk. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage('');
    setSubmitting(true);
    try {
      await loginDemo();
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/profile');
      }
    } catch {
      setErrorMessage('Gagal menggunakan akun demo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        {/* Header bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            }}
            style={styles.backBtn}
            activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.providerBadge}>
            <Ionicons
              name={firebaseStatus.isLive ? 'cloud-done' : 'shield-checkmark'}
              size={14}
              color={firebaseStatus.isLive ? Colors.ocean : Colors.secondary}
            />
            <Text style={styles.providerBadgeText}>
              {firebaseStatus.isLive ? 'Firebase Auth' : 'Mode Demo & Lokal'}
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Logo & Headline */}
          <View style={styles.brandHero}>
            <View style={styles.logoCircle}>
              <Ionicons name="compass" size={36} color={Colors.surface} />
            </View>
            <Text style={styles.appTitle}>LokalTrip</Text>
            <Text style={styles.tagline}>Jelajahi Cerita, Rasa, dan Jiwa Nusantara</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Masuk ke Akun</Text>
            <Text style={styles.cardSubtitle}>
              Akses reservasi tur adat, workshop seni, dan koleksi kriya lokal Anda.
            </Text>

            {/* Error Banner */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Feather name="mail" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nama@email.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Kata Sandi</Text>
                <TouchableOpacity
                  onPress={() => router.push('/auth/forgot-password' as any)}
                  activeOpacity={0.7}>
                  <Text style={styles.forgotLink}>Lupa Sandi?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan kata sandi"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}>
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Submit Button */}
            <TouchableOpacity
              style={[styles.primaryBtn, (submitting || isLoading) && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={submitting || isLoading}
              activeOpacity={0.85}>
              {submitting ? (
                <ActivityIndicator color={Colors.surface} size="small" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Masuk Sekarang</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.surface} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ATAU</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick Demo Login Button */}
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={handleDemoLogin}
              disabled={submitting || isLoading}
              activeOpacity={0.85}>
              <MaterialCommunityIcons name="lightning-bolt" size={20} color={Colors.accent} />
              <Text style={styles.demoBtnText}>Masuk Cepat (Akun Demo)</Text>
            </TouchableOpacity>
            <Text style={styles.demoHint}>
              Demo user: Arya Wibowo (arya.wibowo@lokaltrip.id / password123)
            </Text>
          </View>

          {/* Footer Register Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Belum memiliki akun?</Text>
            <TouchableOpacity
              onPress={() => router.push('/auth/register' as any)}
              activeOpacity={0.7}>
              <Text style={styles.registerLink}>Daftar Sekarang</Text>
            </TouchableOpacity>
          </View>

          {/* Guest Link */}
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            }}
            activeOpacity={0.7}>
            <Text style={styles.guestBtnText}>Lanjutkan sebagai Tamu</Text>
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
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  providerBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semiBold,
    color: Colors.secondary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  brandHero: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  appTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
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
  cardTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerLight,
    padding: 12,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    color: Colors.danger,
    fontWeight: Typography.weights.medium,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: 6,
  },
  forgotLink: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.semiBold,
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
  eyeBtn: {
    padding: 6,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  primaryBtnText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.surface,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.semiBold,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accent,
    height: 46,
    borderRadius: BorderRadius.md,
  },
  demoBtnText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.earth,
  },
  demoHint: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  guestBtn: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: 8,
  },
  guestBtnText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});
