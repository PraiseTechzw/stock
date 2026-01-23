import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useColorScheme } from '@/components/useColorScheme';
import { toastConfig } from '@/src/components/ui/ToastConfig';
import { DatabaseProvider } from '@/src/db/DatabaseProvider';
import { useAppAutomation } from '@/src/hooks/useAppAutomation';
import { useAuth } from '@/src/hooks/useAuth';
import { usePushNotifications } from '@/src/hooks/usePushNotifications';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { AppDarkTheme, AppLightTheme, NavDarkTheme, NavLightTheme } from '@/src/theme/AppTheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
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

  return <RootLayoutNav />;
}

function AuthProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect away from the login page
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return <>{children}</>;
}

function RootLayoutNav() {
  const systemColorScheme = useColorScheme();
  const { themeMode } = useSettingsStore();

  usePushNotifications();
  useAppAutomation();

  const isDark = themeMode === 'system'
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  const paperTheme = isDark ? AppDarkTheme : AppLightTheme;
  const navTheme = isDark ? NavDarkTheme : NavLightTheme;

  return (
    <DatabaseProvider>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navTheme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <AuthProtectedRoute>
            <Stack screenOptions={{
              headerShown: false,
              headerStyle: {
                backgroundColor: paperTheme.colors.surface,
              },
              headerTintColor: paperTheme.colors.onSurface,
              headerShadowVisible: false,
            }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </AuthProtectedRoute>
        </ThemeProvider>
      </PaperProvider>
      <Toast config={toastConfig} />
    </DatabaseProvider>
  );
}
