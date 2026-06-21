import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { TargetAsset } from './types';
import { Colors } from '../../../constants/theme';

interface Props {
  asset: TargetAsset;
  health: number;
}

export default function Asset({ asset, health }: Props) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);

  const prevHealth = React.useRef(health);

  useEffect(() => {
    if (health < prevHealth.current && health > 0) {
      shake.value = withSequence(
        withTiming(15, { duration: 40 }),
        withTiming(-15, { duration: 40 }),
        withTiming(15, { duration: 40 }),
        withTiming(0, { duration: 40 })
      );
      scale.value = withSequence(
        withTiming(0.85, { duration: 50 }),
        withSpring(1, { damping: 8 })
      );
    }
    prevHealth.current = health;
  }, [health]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.value },
      { scale: scale.value }
    ]
  }));

  const isBroken = health <= 0;
  const percentage = Math.max(0, (health / asset.maxHealth) * 100);

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Text style={styles.emoji}>{isBroken ? '💥' : asset.emoji}</Text>
      </Animated.View>
      <View style={styles.healthBarBg}>
        <View style={[styles.healthBarFill, { width: `${percentage}%`, backgroundColor: percentage > 50 ? Colors.accent : percentage > 20 ? Colors.warning : Colors.danger }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 200,
  },
  emoji: {
    fontSize: 160,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 10,
  },
  healthBarBg: {
    width: 100,
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000',
    marginTop: -20,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
  }
});
