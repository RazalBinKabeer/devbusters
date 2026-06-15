import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

interface PlayerRocketProps {
  x: SharedValue<number>;
  y: number;
  width: number;
  height: number;
  gameWidth: number;
  isInvincible: boolean;
}

export default function PlayerRocket({ x, y, width, height, gameWidth, isInvincible }: PlayerRocketProps) {

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      const newX = Math.max(0, Math.min(x.value + event.changeX, gameWidth - width));
      x.value = newX;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: x.value }],
      opacity: isInvincible ? 0.5 : 1, // Flash when invincible
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          {
            top: y,
            width,
            height,
          },
          animatedStyle,
        ]}
      >
        <Text style={[styles.emoji, { fontSize: width * 0.8 }]}>🚀</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0, // Using translateX for performance
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  emoji: {
    textAlign: 'center',
  },
});
