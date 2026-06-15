/**
 * Bug — Individual falling bug component
 * Animates from top to bottom; tappable to squash
 */
import React, { useEffect, useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import { BugData } from './types';

interface BugProps {
  bug: BugData;
  gameAreaHeight: number;
  gameAreaWidth: number;
  speedMultiplier: number;
  slowMode: boolean;
  onSquash: (id: string, x: number, y: number, points: number) => void;
  onMissed: (id: string, livesLost: number) => void;
}

const Bug = React.memo(function Bug({
  bug,
  gameAreaHeight,
  gameAreaWidth,
  speedMultiplier,
  slowMode,
  onSquash,
  onMissed,
}: BugProps) {
  const isHeisenbug = bug.variant === 'heisenbug';

  // ── Shared values ──────────────────────────────────────────────────
  const translateY = useSharedValue(-bug.config.size);
  const wobbleX = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(1);

  // Heisenbug-specific
  const heisenX = useSharedValue(bug.x);
  const heisenY = useSharedValue(
    isHeisenbug ? Math.random() * gameAreaHeight * 0.5 + gameAreaHeight * 0.1 : 0,
  );

  const prevSlowMode = useRef(slowMode);
  const squashedRef = useRef(false);

  // ── Calculate fall duration ────────────────────────────────────────
  const getFallDuration = useCallback(
    (distance: number) => {
      const effectiveSpeed = bug.config.speed * speedMultiplier * (slowMode ? 0.5 : 1);
      return (distance / effectiveSpeed) * 1000;
    },
    [bug.config.speed, speedMultiplier, slowMode],
  );

  // ── Start falling (regular bugs) ──────────────────────────────────
  useEffect(() => {
    if (isHeisenbug) return;

    const totalDistance = gameAreaHeight + bug.config.size * 2;
    const duration = getFallDuration(totalDistance);

    // Entry pop
    scale.value = withSequence(
      withTiming(1.3, { duration: 120 }),
      withTiming(1, { duration: 80 }),
    );

    // Wobble
    wobbleX.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 250 + Math.random() * 150 }),
        withTiming(-8, { duration: 250 + Math.random() * 150 }),
      ),
      -1,
      true,
    );

    // Fall
    translateY.value = withTiming(
      gameAreaHeight + bug.config.size,
      { duration, easing: Easing.linear },
      (finished) => {
        if (finished && !squashedRef.current) {
          runOnJS(onMissed)(bug.id, bug.config.livesLost);
        }
      },
    );
  }, []);

  // ── React to slow-mode changes mid-flight ──────────────────────────
  useEffect(() => {
    if (isHeisenbug) return;
    if (prevSlowMode.current === slowMode) return;
    prevSlowMode.current = slowMode;

    const currentY = translateY.value;
    if (currentY >= gameAreaHeight) return;

    const remainingDistance = gameAreaHeight + bug.config.size - currentY;
    const newDuration = getFallDuration(remainingDistance);

    cancelAnimation(translateY);
    translateY.value = withTiming(
      gameAreaHeight + bug.config.size,
      { duration: Math.max(newDuration, 100), easing: Easing.linear },
      (finished) => {
        if (finished && !squashedRef.current) {
          runOnJS(onMissed)(bug.id, bug.config.livesLost);
        }
      },
    );
  }, [slowMode]);

  // ── Heisenbug teleportation ────────────────────────────────────────
  useEffect(() => {
    if (!isHeisenbug) return;

    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 600 }),
        withTiming(0.9, { duration: 600 }),
      ),
      -1,
      true,
    );

    let teleportCount = 0;
    const maxTeleports = 5;

    const interval = setInterval(() => {
      if (squashedRef.current) {
        clearInterval(interval);
        return;
      }

      teleportCount++;
      if (teleportCount >= maxTeleports) {
        clearInterval(interval);
        onMissed(bug.id, bug.config.livesLost);
        return;
      }

      // Fade out → move → fade in
      opacity.value = withTiming(0, { duration: 120 }, () => {
        heisenX.value = bug.config.size + Math.random() * (gameAreaWidth - bug.config.size * 2);
        heisenY.value = Math.random() * gameAreaHeight * 0.6 + gameAreaHeight * 0.05;
        opacity.value = withTiming(1, { duration: 120 });
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // ── Tap handler ────────────────────────────────────────────────────
  const handleSquash = useCallback(() => {
    if (squashedRef.current) return;
    squashedRef.current = true;

    const currentY = isHeisenbug ? heisenY.value : translateY.value;
    const currentX = isHeisenbug ? heisenX.value : bug.x;

    cancelAnimation(translateY);
    cancelAnimation(wobbleX);
    cancelAnimation(opacity);

    onSquash(bug.id, currentX, currentY, bug.config.points);
  }, [bug.id, bug.x, bug.config.points, isHeisenbug]);

  // ── Animated styles ────────────────────────────────────────────────
  const regularStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: wobbleX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const heisenbugStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    left: heisenX.value,
    top: heisenY.value,
    opacity: opacity.value,
  }));

  const animatedStyle = isHeisenbug ? heisenbugStyle : regularStyle;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: isHeisenbug ? 0 : bug.x - bug.config.size / 2,
          width: bug.config.size + 16,
          height: bug.config.size + 16,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={handleSquash}
        style={styles.touchArea}
        hitSlop={8}
      >
        {isHeisenbug && (
          <View style={[styles.heisenbugGlow, { shadowColor: bug.config.color }]} />
        )}
        <Text style={[styles.emoji, { fontSize: bug.config.size * 0.75 }]}>
          {bug.config.emoji}
        </Text>
        {isHeisenbug && <Text style={styles.bossLabel}>HEISENBUG</Text>}
      </Pressable>
    </Animated.View>
  );
});

export default Bug;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  touchArea: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  emoji: {
    textAlign: 'center',
  },
  heisenbugGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    shadowOpacity: 0.9,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  bossLabel: {
    position: 'absolute',
    bottom: -6,
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 5,
    color: '#C084FC',
    letterSpacing: 1,
  },
});
