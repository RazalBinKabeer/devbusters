/**
 * Root Layout — App entry point
 * Loads fonts, manages splash screen, wraps app in AuthProvider
 */
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { BubblegumSans_400Regular } from '@expo-google-fonts/bubblegum-sans';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/theme';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isWelcomeScreen = segments.length === 0 || segments[0] === '(index)' || segments[0] === 'index';

    if (user && (inAuthGroup || isWelcomeScreen)) {
      // User is signed in but on an auth/welcome screen — redirect to home
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup && !isWelcomeScreen) {
      // User is not signed in but trying to access protected screens
      router.replace('/');
    }
  }, [user, loading, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bgDark },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="games"
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    BubblegumSans_400Regular,
    PressStart2P_400Regular,
    FredokaOne_400Regular: Fredoka_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
