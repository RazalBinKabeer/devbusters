import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { Fonts } from '../../../constants/theme';

export interface HitEffectProps {
  id: string;
  x: number;
  y: number;
  text: string;
  color?: string;
  onComplete: (id: string) => void;
}

export default function HitEffect({ id, x, y, text, color = '#FF3366', onComplete }: HitEffectProps) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.5, { damping: 10 }),
      withTiming(2, { duration: 400 })
    );

    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)(id);
        }
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${(Math.random() - 0.5) * 30}deg` } // slight random rotation
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        styles.text,
        { left: x - 50, top: y - 20, color },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    fontFamily: Fonts.pixel,
    fontSize: 24,
    textAlign: 'center',
    width: 100,
    zIndex: 999,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
});
