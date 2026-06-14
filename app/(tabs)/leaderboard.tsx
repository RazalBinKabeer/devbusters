/**
 * Leaderboard Screen — Coming Soon placeholder
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import GradientBackground from '../../components/GradientBackground';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '../../constants/theme';

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 800 }),
        withTiming(10, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xl }]}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.content}>
          <Animated.Text style={[styles.emoji, bounceStyle]}>🏆</Animated.Text>
          <Text style={styles.title}>Leaderboard</Text>
          <Text style={styles.subtitle}>Coming Soon!</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🚧 Under Construction</Text>
          </View>
          <Text style={styles.description}>
            Compete with other devs worldwide.{'\n'}
            Who can rage the hardest? 💪
          </Text>

          {/* Preview placeholders */}
          {[1, 2, 3].map((rank) => (
            <Animated.View
              key={rank}
              entering={FadeInDown.delay(rank * 150).duration(400)}
              style={styles.rankRow}
            >
              <Text style={styles.rankNumber}>#{rank}</Text>
              <View style={styles.rankBar}>
                <View
                  style={[
                    styles.rankBarFill,
                    { width: `${100 - rank * 20}%` },
                  ]}
                />
              </View>
              <Text style={styles.rankScore}>???</Text>
            </Animated.View>
          ))}
        </Animated.View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emoji: {
    fontSize: 72,
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes['3xl'],
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.primary,
  },
  badge: {
    backgroundColor: `${Colors.warning}20`,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: `${Colors.warning}40`,
  },
  badgeText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.warning,
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  rankNumber: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.lg,
    color: Colors.warning,
    width: 36,
  },
  rankBar: {
    flex: 1,
    height: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  rankBarFill: {
    height: '100%',
    backgroundColor: Colors.bgLight,
    borderRadius: BorderRadius.full,
  },
  rankScore: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    width: 40,
    textAlign: 'right',
  },
});
