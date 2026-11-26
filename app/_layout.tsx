import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AppProvider } from '@/src/context/AppContext';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { Colors } from '@/src/constants/Theme';
import { useNotificationResponse } from '@/hooks/useNotificationResponse';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AppProvider>
        <RootLayoutNav />
      </AppProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // [WEEK 11 - TASK 03: GLOBAL NOTIFICATION TAP & DEEP LINK LISTENER]
  useNotificationResponse();

  // [WEEK 5 / MODUL 4: ROUTE PROTECTION NAVIGATION GUARD]
  useEffect(() => {
    if (isLoading) return;

    const firstSegment = (segments[0] as string) || '';
    const inAuthGroup =
      firstSegment === 'auth' ||
      firstSegment === 'login' ||
      firstSegment === 'modal';

    if (!isAuthenticated && !inAuthGroup) {
      // Pengguna belum login dan mengakses halaman privat -> redirect ke /login
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup && firstSegment !== 'modal') {
      // Pengguna sudah login tapi masih di halaman login/register -> redirect ke halaman utama
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  // Loading Shield saat sesi auth sedang dipulihkan (Mencegah layout flicker)
  if (isLoading) {
    return (
      <View style={styles.loadingShield}>
        <StatusBar style="dark" />
        <View style={styles.brandIconWrap}>
          <Ionicons name="compass" size={44} color="#FFF" />
        </View>
        <Text style={styles.loadingTitle}>LokalTrip</Text>
        <Text style={styles.loadingDesc}>Memeriksa status sesi autentikasi...</Text>
        <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="auth/login"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="auth/forgot-password"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="experience/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="gem/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="product/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="cart"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Tentang LokalTrip',
          }}
        />
        <Stack.Screen
          name="docs/index"
          options={{
            headerShown: true,
            title: 'Dokumentasi Modul 2',
          }}
        />
        <Stack.Screen
          name="docs/[...slug]"
          options={{
            headerShown: true,
            title: 'Detail Materi',
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingShield: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brandIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  loadingDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});
