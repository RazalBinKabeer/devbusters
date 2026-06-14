/**
 * Login Screen
 * Email/password login with Google & GitHub social auth buttons
 */
import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import GradientBackground from '../../components/GradientBackground';
import Logo from '../../components/Logo';
import AuthButton from '../../components/AuthButton';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, signInWithGithub, loading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>(null);

  // Shake animation for errors
  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      triggerShake();
      Alert.alert('Oops!', 'Please fill in both email and password.');
      return;
    }

    try {
      await signInWithEmail(email.trim(), password);
    } catch {
      triggerShake();
    }
  };

  return (
    <GradientBackground colors={Colors.gradientWelcome}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo size="medium" />
          </View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={styles.title}>Welcome back! 👋</Text>
            <Text style={styles.subtitle}>Sign in to continue your rage session</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={[styles.form, shakeStyle]}
          >
            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* Email input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="developer@rage.dev"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            {/* Password input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            {/* Forgot password */}
            <Pressable style={styles.forgotPassword}>
              <Text style={styles.forgotText}>Forgot password? 🤔</Text>
            </Pressable>

            {/* Sign In button */}
            <AuthButton
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              loading={loading}
              icon="🔥"
            />
          </Animated.View>

          {/* Divider */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(500)}
            style={styles.divider}
          >
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Social auth buttons */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(500)}
            style={styles.socialButtons}
          >
            <AuthButton
              title="Google"
              onPress={signInWithGoogle}
              variant="google"
            />
            <AuthButton
              title="GitHub"
              onPress={signInWithGithub}
              variant="github"
            />
          </Animated.View>

          {/* Register link */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(500)}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={() => router.replace('/(auth)/register')}>
              <Text style={styles.registerTextBold}>Sign Up 🚀</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
    padding: Spacing.sm,
  },
  backText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes['3xl'],
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.base,
  },
  errorContainer: {
    backgroundColor: `${Colors.danger}20`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: `${Colors.danger}40`,
  },
  errorText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.danger,
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  inputLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  input: {
    height: 52,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.bgLight,
    paddingHorizontal: Spacing.base,
    fontFamily: Fonts.body,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.bgLight,
  },
  dividerText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  socialButtons: {
    gap: Spacing.md,
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  registerText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.textMuted,
  },
  registerTextBold: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.primary,
  },
});
