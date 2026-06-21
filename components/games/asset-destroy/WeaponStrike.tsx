import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, runOnJS } from 'react-native-reanimated';

interface Props {
  id: string;
  x: number;
  y: number;
  weaponId: string;
  emoji: string;
  onComplete: (id: string) => void;
}

export default function WeaponStrike({ id, x, y, weaponId, emoji, onComplete }: Props) {
  const rotation = useSharedValue(-45);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1.5);

  useEffect(() => {
    if (weaponId === 'gun') {
      // recoil
      rotation.value = withSequence(
        withTiming(-20, { duration: 50 }),
        withTiming(-45, { duration: 150 })
      );
    } else {
      // swing down
      rotation.value = withSequence(
        withTiming(45, { duration: 80 }),
        withTiming(-45, { duration: 200 })
      );
    }
    
    opacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 100 }, (finished) => {
        if (finished) runOnJS(onComplete)(id);
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.text, { left: x - 40, top: y - 40 }, animatedStyle]} pointerEvents="none">
      {emoji}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    fontSize: 60,
    zIndex: 1000,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  }
});
