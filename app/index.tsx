/**
 * Welcome Screen — DevBusters entry point
 * Animated logo, tagline, floating comic elements, and CTA buttons
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeIn,
  FadeInUp,
  SlideInDown,
} from 'react-native-reanimated';
import GradientBackground from '../components/GradientBackground';
import FloatingElements from '../components/FloatingElements';
import Logo from '../components/Logo';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const buttonScale = useSharedValue(1);
  const ctaPulse = useSharedValue(1);

  useEffect(() => {
    // Subtle pulse on the CTA button
    const pulse = () => {
      ctaPulse.value = withDelay(
        3000,
        withSpring(1.03, { damping: 5, stiffness: 100 }, () => {
          ctaPulse.value = withSpring(1, { damping: 5, stiffness: 100 });
        })
      );
    };
    pulse();
    const interval = setInterval(pulse, 4000);
    return () => clearInterval(interval);
  }, []);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value * ctaPulse.value }],
  }));

  return (
    <GradientBackground colors={Colors.gradientWelcome}>
      <FloatingElements />

      <View style={styles.container}>
        {/* Top spacer */}
        <View style={styles.topSpacer} />

        {/* Logo section */}
        <View style={styles.logoSection}>
          <Logo size="large" showTagline tagline="Bust your bugs. Smash your stress." />
        </View>

        {/* Feature highlights */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(600)}
          style={styles.features}
        >
          <FeatureItem emoji="🚀" text="5 rage-worthy games" delay={0} />
          <FeatureItem emoji="🏆" text="Compete on leaderboards" delay={100} />
          <FeatureItem emoji="😤" text="Track your rage levels" delay={200} />
        </Animated.View>

        {/* CTA Section */}
        <Animated.View
          entering={SlideInDown.delay(1000).duration(600).springify()}
          style={styles.ctaSection}
        >
          {/* Get Started button */}
          <AnimatedPressable
            onPress={() => router.push('/(auth)/register')}
            onPressIn={() => {
              buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
            }}
            style={[styles.ctaButton, Shadows.button, buttonAnimatedStyle]}
          >
            <Text style={styles.ctaText}>Get Started 🎮</Text>
          </AnimatedPressable>

          {/* Sign in link */}
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={styles.signInLink}
          >
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInTextBold}>Sign In</Text>
            </Text>
          </Pressable>
        </Animated.View>

        {/* Version */}
        <Animated.Text
          entering={FadeIn.delay(1200).duration(400)}
          style={styles.version}
        >
          v1.0.0 — Made with 💥 by devs, for devs
        </Animated.Text>
      </View>
    </GradientBackground>
  );
}

function FeatureItem({ emoji, text, delay }: { emoji: string; text: string; delay: number }) {
  return (
    <Animated.View
      entering={FadeInUp.delay(900 + delay).duration(400)}
      style={styles.featureItem}
    >
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
  },
  topSpacer: {
    height: SCREEN_HEIGHT * 0.08,
  },
  logoSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  features: {
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.bgOverlay,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: `${Colors.primary}15`,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  ctaSection: {
    gap: Spacing.base,
    marginBottom: Spacing.lg,
  },
  ctaButton: {
    height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  signInLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  signInText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.textMuted,
  },
  signInTextBold: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.primary,
  },
  version: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});
