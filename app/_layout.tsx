import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
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

  return (
    <AuthProvider>
      <AppProvider>
        <RootLayoutNav fontsLoaded={loaded} />
      </AppProvider>
    </AuthProvider>
  );
}

function RootLayoutNav({ fontsLoaded }: { fontsLoaded: boolean }) {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // [WEEK 11 - TASK 03: GLOBAL NOTIFICATION TAP & DEEP LINK LISTENER]
  useNotificationResponse();

  // Sembunyikan native splash screen setelah font & sesi auth siap dimuat
  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, isLoading]);

  // [WEEK 5 / MODUL 4: ROUTE PROTECTION NAVIGATION GUARD]
  useEffect(() => {
    if (!fontsLoaded || isLoading) return;

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
  }, [isAuthenticated, isLoading, fontsLoaded, segments, router]);

  if (!fontsLoaded) {
    return null;
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
