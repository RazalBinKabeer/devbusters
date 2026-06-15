import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors, Fonts } from '../../../constants/theme';

interface Props {
  health: number;
  maxHealth: number;
}

export default function HealthBar({ health, maxHealth }: Props) {
  const percentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));

  const fillStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${percentage}%`, { damping: 15 }),
      backgroundColor: percentage > 50 ? Colors.accent : percentage > 20 ? Colors.warning : Colors.danger,
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>ASSET INTEGRITY</Text>
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, fillStyle]} />
      </View>
      <Text style={styles.healthText}>{Math.ceil(health)} / {maxHealth}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '80%',
    marginVertical: 20,
  },
  label: {
    fontFamily: Fonts.pixel,
    color: '#FFF',
    fontSize: 12,
    marginBottom: 8,
  },
  barBackground: {
    width: '100%',
    height: 24,
    backgroundColor: '#333',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  healthText: {
    position: 'absolute',
    top: 24, // inside the bar vertically roughly
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: '#FFF',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
