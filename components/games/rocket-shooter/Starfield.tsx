import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface StarfieldProps {
  gameHeight: number;
  gameWidth: number;
}

// Generate static star positions once
const STARS_COUNT = 40;
const stars = Array.from({ length: STARS_COUNT }).map(() => ({
  x: Math.random() * 100, // percentage
  y: Math.random() * 100, // percentage
  size: 1 + Math.random() * 3,
  opacity: 0.2 + Math.random() * 0.6,
}));

export default function Starfield({ gameHeight, gameWidth }: StarfieldProps) {
  const translateY1 = useSharedValue(0);
  const translateY2 = useSharedValue(-gameHeight);

  useEffect(() => {
    if (gameHeight === 0) return;

    const duration = 10000; // 10s for a full loop

    translateY1.value = withRepeat(
      withTiming(gameHeight, { duration, easing: Easing.linear }),
      -1,
      false
    );

    // Initial setting for the second layer
    translateY2.value = -gameHeight;
    translateY2.value = withRepeat(
      withTiming(0, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, [gameHeight]);

  const style1 = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY1.value }],
  }));

  const style2 = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY2.value }],
  }));

  const renderStars = () => (
    <View style={StyleSheet.absoluteFill}>
      {stars.map((star, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, style1]}>
        {renderStars()}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, style2]}>
        {renderStars()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 1, // Behind everything
    backgroundColor: '#050B14', // Very deep space blue
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFF',
  },
});
