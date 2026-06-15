import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSizes } from '../../../constants/theme';

export interface FloatingTextProps {
  id: string;
  x: number;
  y: number;
  text: string;
  onComplete: (id: string) => void;
}

export default function FloatingText({ id, x, y, text, onComplete }: FloatingTextProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 800 }),
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)(id);
        }
      })
    );

    translateY.value = withTiming(-40, { duration: 1500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        styles.text,
        { left: x, top: y },
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
    fontSize: 12, // Increased size
    color: '#FFD23F', // Bright yellow for high visibility
    textAlign: 'center',
    width: 200,
    marginLeft: -100, // Center based on new width
    zIndex: 999, // On top of everything
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
