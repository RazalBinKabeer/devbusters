/**
 * PowerUpBar — Git Revert & Git Bisect buttons with cooldown timers
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  SlideInDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '../../../constants/theme';

interface PowerUpBarProps {
  gitRevertReady: boolean;
  gitBisectReady: boolean;
  gitRevertCooldown: number;   // total cooldown in seconds
  gitBisectCooldown: number;
  gitRevertRemaining: number;  // seconds remaining (0 = ready)
  gitBisectRemaining: number;
  slowModeActive: boolean;
  onGitRevert: () => void;
  onGitBisect: () => void;
}

export default function PowerUpBar({
  gitRevertReady,
  gitBisectReady,
  gitRevertRemaining,
  gitBisectRemaining,
  slowModeActive,
  onGitRevert,
  onGitBisect,
}: PowerUpBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={SlideInDown.duration(400).springify()}
      style={[styles.container, { paddingBottom: insets.bottom + 8 }]}
    >
      {/* Git Revert */}
      <Pressable
        onPress={gitRevertReady ? onGitRevert : undefined}
        style={[
          styles.powerUpButton,
          styles.revertButton,
          !gitRevertReady && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.powerUpIcon}>⏪</Text>
        <View style={styles.powerUpTextContainer}>
          <Text style={[styles.powerUpName, !gitRevertReady && styles.textDisabled]}>
            git revert
          </Text>
          {gitRevertReady ? (
            <Text style={styles.readyText}>READY</Text>
          ) : (
            <Text style={styles.cooldownText}>{gitRevertRemaining}s</Text>
          )}
        </View>
      </Pressable>

      {/* Git Bisect */}
      <Pressable
        onPress={gitBisectReady ? onGitBisect : undefined}
        style={[
          styles.powerUpButton,
          styles.bisectButton,
          !gitBisectReady && styles.buttonDisabled,
          slowModeActive && styles.bisectActive,
        ]}
      >
        <Text style={styles.powerUpIcon}>🔍</Text>
        <View style={styles.powerUpTextContainer}>
          <Text style={[styles.powerUpName, !gitBisectReady && styles.textDisabled]}>
            git bisect
          </Text>
          {slowModeActive ? (
            <Text style={[styles.readyText, { color: '#60A5FA' }]}>ACTIVE</Text>
          ) : gitBisectReady ? (
            <Text style={styles.readyText}>READY</Text>
          ) : (
            <Text style={styles.cooldownText}>{gitBisectRemaining}s</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 212, 170, 0.1)',
  },
  powerUpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  revertButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    borderColor: 'rgba(255, 107, 53, 0.4)',
  },
  bisectButton: {
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  bisectActive: {
    backgroundColor: 'rgba(96, 165, 250, 0.25)',
    borderColor: '#60A5FA',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  powerUpIcon: {
    fontSize: 22,
  },
  powerUpTextContainer: {
    flex: 1,
  },
  powerUpName: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  readyText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
    color: Colors.accent,
    marginTop: 1,
  },
  cooldownText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  textDisabled: {
    color: Colors.textMuted,
  },
});
