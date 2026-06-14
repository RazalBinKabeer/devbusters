/**
 * FrustrationMeter — Interactive mood gauge
 * "How frustrated are you?" slider with emoji feedback
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '../constants/theme';
import { FRUSTRATION_LEVELS } from '../constants/gameData';

interface FrustrationMeterProps {
  onLevelChange?: (level: number) => void;
}

export default function FrustrationMeter({ onLevelChange }: FrustrationMeterProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const emojiScale = useSharedValue(1);
  const barWidth = useSharedValue(0);

  const handleSelect = (level: number) => {
    setSelectedLevel(level);
    onLevelChange?.(level);

    // Bounce the emoji
    emojiScale.value = withSequence(
      withSpring(1.4, { damping: 5, stiffness: 300 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );

    // Animate the rage bar
    barWidth.value = withSpring((level / 4) * 100, {
      damping: 12,
      stiffness: 100,
    });

    // Haptic feedback intensifies with rage level
    if (level <= 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (level <= 2) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const barAnimatedStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  const getRageColor = (level: number): string => {
    const colors = [Colors.accent, '#8BC34A', Colors.warning, Colors.primary, Colors.danger];
    return colors[level] || Colors.accent;
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(500).springify()}
      style={styles.container}
    >
      <Text style={styles.title}>How frustrated are you? 😤</Text>

      {/* Emoji selector row */}
      <View style={styles.emojiRow}>
        {FRUSTRATION_LEVELS.map((item) => (
          <Pressable
            key={item.level}
            onPress={() => handleSelect(item.level)}
            style={[
              styles.emojiButton,
              selectedLevel === item.level && {
                backgroundColor: `${getRageColor(item.level)}20`,
                borderColor: getRageColor(item.level),
              },
            ]}
          >
            <Animated.Text
              style={[
                styles.emoji,
                selectedLevel === item.level && emojiAnimatedStyle,
              ]}
            >
              {item.emoji}
            </Animated.Text>
            <Text
              style={[
                styles.emojiLabel,
                selectedLevel === item.level && {
                  color: getRageColor(item.level),
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Rage bar */}
      {selectedLevel !== null && (
        <View style={styles.barContainer}>
          <View style={styles.barTrack}>
            <Animated.View
              style={[
                styles.barFill,
                { backgroundColor: getRageColor(selectedLevel) },
                barAnimatedStyle,
              ]}
            />
          </View>
          <Text style={[styles.barLabel, { color: getRageColor(selectedLevel) }]}>
            {selectedLevel === 0
              ? 'Zen mode activated 🧘'
              : selectedLevel === 1
              ? 'A little annoyed...'
              : selectedLevel === 2
              ? 'Time to smash something!'
              : selectedLevel === 3
              ? 'RAGE MODE ACTIVATED! 🔥'
              : 'NUCLEAR MELTDOWN! ☢️💀'}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.bgLight,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  emojiButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  emojiLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  barContainer: {
    marginTop: Spacing.md,
  },
  barTrack: {
    height: 8,
    backgroundColor: Colors.bgLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  barLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
