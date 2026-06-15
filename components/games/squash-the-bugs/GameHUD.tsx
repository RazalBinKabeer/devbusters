/**
 * GameHUD — Heads-up display showing score, lives, and level
 */
import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, FontSizes, Spacing } from '../../../constants/theme';

interface GameHUDProps {
  score: number;
  lives: number;
  maxLives: number;
  difficulty: number;
  onPause: () => void;
}

export default function GameHUD({ score, lives, maxLives, difficulty, onPause }: GameHUDProps) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.container, { paddingTop: insets.top + 4 }]}
    >
      {/* Back / pause */}
      <Pressable onPress={onPause} style={styles.pauseButton} hitSlop={12}>
        <Text style={styles.pauseIcon}>✕</Text>
      </Pressable>

      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
      </View>

      {/* Lives */}
      <View style={styles.livesContainer}>
        {Array.from({ length: maxLives }, (_, i) => (
          <Text key={i} style={styles.heart}>
            {i < lives ? '❤️' : '🖤'}
          </Text>
        ))}
      </View>

      {/* Difficulty */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelLabel}>LV</Text>
        <Text style={styles.levelValue}>{difficulty}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 170, 0.15)',
    zIndex: 50,
  },
  pauseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIcon: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: Fonts.pixel,
    fontSize: 6,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  scoreValue: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.xl,
    color: Colors.accent,
    marginTop: 1,
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  heart: {
    fontSize: 14,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    backgroundColor: 'rgba(123, 47, 247, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(123, 47, 247, 0.3)',
  },
  levelLabel: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
    color: Colors.secondary,
  },
  levelValue: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
  },
});
