/**
 * GameStubScreen — Reusable coming-soon screen for unreleased games
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GameStubScreenProps {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accentColor: string;
  features: string[];
}

export default function GameStubScreen({
  title,
  subtitle,
  description,
  icon,
  accentColor,
  features,
}: GameStubScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const iconFloat = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    iconFloat.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 1500 }),
        withTiming(15, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: iconFloat.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <LinearGradient
      colors={[Colors.bgDark, accentColor + '30', Colors.bgDark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Close button */}
      <Animated.View
        entering={FadeIn.delay(200)}
        style={[styles.closeContainer, { paddingTop: insets.top + Spacing.sm }]}
      >
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </Animated.View>

      <View style={styles.content}>
        {/* Icon */}
        <Animated.Text
          entering={FadeInDown.duration(600)}
          style={[styles.icon, iconStyle]}
        >
          {icon}
        </Animated.Text>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </Animated.View>

        {/* Coming Soon badge */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={[styles.comingSoonBadge, { borderColor: accentColor }]}
        >
          <Text style={styles.comingSoonText}>🚀 COMING SOON</Text>
        </Animated.View>

        {/* Description */}
        <Animated.Text
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.description}
        >
          {description}
        </Animated.Text>

        {/* Feature list */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(500)}
          style={styles.featureList}
        >
          {features.map((feature, index) => (
            <Animated.View
              key={feature}
              entering={FadeInDown.delay(600 + index * 100).duration(400)}
              style={styles.featureItem}
            >
              <Text style={[styles.featureBullet, { color: accentColor }]}>▸</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </Animated.View>
          ))}
        </Animated.View>
      </View>

      {/* Back button */}
      <Animated.View
        entering={SlideInDown.delay(700).duration(500).springify()}
        style={[styles.bottomSection, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <AnimatedPressable
          onPress={() => router.back()}
          onPressIn={() => {
            buttonScale.value = withSpring(0.95, { damping: 15 });
          }}
          onPressOut={() => {
            buttonScale.value = withSpring(1, { damping: 10 });
          }}
          style={[
            styles.backButton,
            { backgroundColor: accentColor },
            Shadows.button,
            buttonStyle,
          ]}
        >
          <Text style={styles.backButtonText}>← Back to Games</Text>
        </AnimatedPressable>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    paddingRight: Spacing.xl,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.md,
  },
  icon: {
    fontSize: 80,
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes['4xl'],
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  comingSoonBadge: {
    borderWidth: 2,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  comingSoonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  featureList: {
    alignSelf: 'stretch',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureBullet: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSizes.lg,
  },
  featureText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    flex: 1,
  },
  bottomSection: {
    paddingHorizontal: Spacing.xl,
  },
  backButton: {
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
  },
});
