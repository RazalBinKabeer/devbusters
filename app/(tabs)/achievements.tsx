/**
 * Achievements Screen — Coming Soon placeholder
 */
import React, { useEffect } from 'react';
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
import GradientBackground from '../../components/GradientBackground';
import { ACHIEVEMENT_CATEGORIES } from '../../constants/gameData';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '../../constants/theme';

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 1000 }),
        withTiming(-5, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xl }]}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.content}>
          <Animated.Text style={[styles.emoji, spinStyle]}>⭐</Animated.Text>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>Coming Soon!</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🚧 Under Construction</Text>
          </View>
          <Text style={styles.description}>
            Unlock badges for your rage accomplishments.{'\n'}
            Can you get them all? 🎯
          </Text>

          {/* Achievement category previews */}
          <View style={styles.categoriesGrid}>
            {ACHIEVEMENT_CATEGORIES.map((cat, index) => (
              <Animated.View
                key={cat.id}
                entering={FadeInDown.delay(300 + index * 100).duration(400)}
                style={styles.categoryCard}
              >
                <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
                <View style={styles.lockedOverlay}>
                  <Text style={styles.lockIcon}>🔒</Text>
                </View>
              </Animated.View>
            ))}
          </View>
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
    color: Colors.accent,
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  categoryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.bgLight,
    padding: Spacing.base,
    alignItems: 'center',
    width: 90,
    gap: Spacing.xs,
    position: 'relative',
    overflow: 'hidden',
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  lockIcon: {
    fontSize: 20,
  },
});
