/**
 * Register Screen
 * Create new account with email/password + social auth options
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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle, signInWithGithub, loading, error } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

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

  const handleRegister = async () => {
    if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
      triggerShake();
      Alert.alert('Hold up! ✋', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      triggerShake();
      Alert.alert('Oops!', 'Passwords don\'t match. Try again! 🔑');
      return;
    }

    if (password.length < 6) {
      triggerShake();
      Alert.alert('Too weak! 💪', 'Password must be at least 6 characters.');
      return;
    }

    try {
      await signUpWithEmail(email.trim(), password, displayName.trim());
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
            <Logo size="small" />
          </View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={styles.title}>Join the squad! 💥</Text>
            <Text style={styles.subtitle}>Create your account and start busting stress</Text>
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

            {/* Display name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                placeholder="RageMaster_3000"
                placeholderTextColor={Colors.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                ref={emailRef}
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

            {/* Password */}
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
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                ref={confirmRef}
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>

            {/* Register button */}
            <AuthButton
              title="Create Account"
              onPress={handleRegister}
              variant="primary"
              loading={loading}
              icon="🚀"
            />
          </Animated.View>

          {/* Divider */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(500)}
            style={styles.divider}
          >
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with</Text>
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

          {/* Login link */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(500)}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
            </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginTextBold}>Sign In 🔥</Text>
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
    marginBottom: Spacing.md,
    padding: Spacing.sm,
  },
  backText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes['2xl'],
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
    gap: Spacing.md,
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
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  loginText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.textMuted,
  },
  loginTextBold: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.primary,
  },
});
