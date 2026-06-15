/**
 * GameOverModal — Full-screen overlay with final score and replay options
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from '../../../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GameOverModalProps {
  score: number;
  highScore: number;
  bugsSquashed: number;
  difficulty: number;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
  onExit: () => void;
  statLabel?: string;
  statEmoji?: string;
}

export default function GameOverModal({
  score,
  highScore,
  bugsSquashed,
  difficulty,
  isNewHighScore,
  onPlayAgain,
  onExit,
  statLabel = 'Squashed',
  statEmoji = '🐛',
}: GameOverModalProps) {
  const playBtnScale = useSharedValue(1);
  const crownBounce = useSharedValue(0);

  useEffect(() => {
    if (isNewHighScore) {
      crownBounce.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 400 }),
          withTiming(0, { duration: 400 }),
        ),
        -1,
        true,
      );
    }
  }, [isNewHighScore]);

  const crownStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: crownBounce.value }],
  }));

  const playBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playBtnScale.value }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.overlay}>
      <View style={styles.backdrop} />

      <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.card}>
        {/* Title */}
        <Text style={styles.gameOverText}>GAME OVER</Text>

        {/* New high-score crown */}
        {isNewHighScore && (
          <Animated.View style={[styles.crownContainer, crownStyle]}>
            <Text style={styles.crownEmoji}>👑</Text>
            <Text style={styles.newHighScoreText}>NEW HIGH SCORE!</Text>
          </Animated.View>
        )}

        {/* Score */}
        <View style={styles.scoreSection}>
          <Text style={styles.finalScoreLabel}>Final Score</Text>
          <Text style={styles.finalScoreValue}>{score.toLocaleString()}</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>{statEmoji}</Text>
            <Text style={styles.statValue}>{bugsSquashed}</Text>
            <Text style={styles.statLabel}>{statLabel}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>📈</Text>
            <Text style={styles.statValue}>{difficulty}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>{highScore.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Best</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <AnimatedPressable
            onPress={onPlayAgain}
            onPressIn={() => { playBtnScale.value = withSpring(0.94); }}
            onPressOut={() => { playBtnScale.value = withSpring(1); }}
            style={[styles.playAgainButton, playBtnStyle]}
          >
            <Text style={styles.playAgainText}>🔄 Play Again</Text>
          </AnimatedPressable>

          <Pressable onPress={onExit} style={styles.exitButton}>
            <Text style={styles.exitText}>← Exit</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: Spacing['2xl'],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 20, 0.85)',
  },
  card: {
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.2)',
    ...Shadows.card,
  },
  gameOverText: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes['4xl'],
    color: Colors.danger,
    marginBottom: Spacing.sm,
  },
  crownContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  crownEmoji: {
    fontSize: 36,
  },
  newHighScoreText: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: Colors.warning,
    letterSpacing: 2,
    marginTop: 4,
  },
  scoreSection: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  finalScoreLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  finalScoreValue: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.hero,
    color: Colors.accent,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  buttonRow: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  playAgainButton: {
    height: 52,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
  },
  playAgainText: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.lg,
    color: Colors.bgDark,
  },
  exitButton: {
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  exitText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});
