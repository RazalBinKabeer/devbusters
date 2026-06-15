/**
 * BugSplat — Brief explosion animation when a bug is squashed
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface BugSplatProps {
  id: string;
  x: number;
  y: number;
  onComplete: (id: string) => void;
}

const SPLAT_EMOJIS = ['💥', '✨', '💫', '⚡'];

export default function BugSplat({ id, x, y, onComplete }: BugSplatProps) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const randomRotation = (Math.random() - 0.5) * 30;

    scale.value = withSequence(
      withTiming(1.8, { duration: 120, easing: Easing.out(Easing.back(2)) }),
      withTiming(0.3, { duration: 250, easing: Easing.in(Easing.ease) }),
    );

    rotation.value = withTiming(randomRotation, { duration: 200 });

    opacity.value = withTiming(0, { duration: 380 }, (finished) => {
      if (finished) {
        runOnJS(onComplete)(id);
      }
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const splatEmoji = SPLAT_EMOJIS[Math.floor(Math.random() * SPLAT_EMOJIS.length)];

  return (
    <Animated.View
      style={[
        styles.container,
        { left: x - 24, top: y - 24 },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <Text style={styles.emoji}>{splatEmoji}</Text>
      <Text style={styles.pointsText}>+</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  emoji: {
    fontSize: 36,
    textAlign: 'center',
  },
  pointsText: {
    position: 'absolute',
    bottom: -2,
    fontSize: 10,
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD23F',
  },
});
