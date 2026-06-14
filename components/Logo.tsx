/**
 * Logo — DevBusters animated logo component
 * Used on Welcome and Auth screens
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing } from '../constants/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
  tagline?: string;
}

export default function Logo({
  size = 'large',
  showTagline = false,
  tagline = 'Bust your bugs. Smash your stress.',
}: LogoProps) {
  const bounceScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0.4);
  const iconRotate = useSharedValue(-10);

  const sizeConfig = {
    small: { icon: 40, title: FontSizes['2xl'], subtitle: FontSizes.sm },
    medium: { icon: 56, title: FontSizes['3xl'], subtitle: FontSizes.md },
    large: { icon: 80, title: FontSizes['4xl'], subtitle: FontSizes.lg },
  }[size];

  useEffect(() => {
    // Entrance bounce
    bounceScale.value = withSpring(1, {
      damping: 8,
      stiffness: 100,
      mass: 1,
    });

    // Continuous glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Icon wobble
    iconRotate.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(10, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(-10, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotate.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Glow effect behind icon */}
      <View style={styles.iconRow}>
        <Animated.View
          style={[
            styles.glow,
            { width: sizeConfig.icon * 1.8, height: sizeConfig.icon * 1.8 },
            glowStyle,
          ]}
        />
        <Animated.Text style={[styles.icon, { fontSize: sizeConfig.icon }, iconStyle]}>
          👾
        </Animated.Text>
      </View>

      {/* Title */}
      <Animated.Text
        entering={FadeIn.delay(300).duration(600)}
        style={[styles.title, { fontSize: sizeConfig.title }]}
      >
        Dev
        <Text style={styles.titleAccent}>Busters</Text>
      </Animated.Text>

      {/* Tagline */}
      {showTagline && (
        <Animated.Text
          entering={FadeIn.delay(600).duration(600)}
          style={[styles.tagline, { fontSize: sizeConfig.subtitle }]}
        >
          {tagline}
        </Animated.Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  glow: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: Colors.primary,
  },
  icon: {
    textAlign: 'center',
  },
  title: {
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  titleAccent: {
    color: Colors.primary,
  },
  tagline: {
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing['2xl'],
    lineHeight: 24,
  },
});
