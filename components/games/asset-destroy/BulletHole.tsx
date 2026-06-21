import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';

interface Props {
  id: string;
  x: number;
  y: number;
  onComplete: (id: string) => void;
}

export default function BulletHole({ id, x, y, onComplete }: Props) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(0, { duration: 1500 }, (finished) => {
      if (finished && onComplete) runOnJS(onComplete)(id);
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    left: x - 20,
    top: y - 20,
  }));

  return (
    <Animated.Text style={[styles.bullet, animatedStyle]} pointerEvents="none">
      💢
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  bullet: {
    position: 'absolute',
    fontSize: 40,
    zIndex: 500,
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
});
