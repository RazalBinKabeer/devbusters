import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { Colors, Fonts } from '../../../constants/theme';

interface Props {
  timeLeft: number;
  score: number;
}

export default function TopBar({ timeLeft, score }: Props) {
  const scale = useSharedValue(1);
  const color = useSharedValue('#FFFFFF');

  useEffect(() => {
    if (timeLeft <= 10 && timeLeft > 0) {
      scale.value = withRepeat(
        withSequence(withTiming(1.2, { duration: 200 }), withTiming(1, { duration: 200 })),
        -1,
        true
      );
      color.value = Colors.danger;
    } else {
      scale.value = withTiming(1);
      color.value = '#FFFFFF';
    }
  }, [timeLeft]);

  const timeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    color: color.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.label}>TIME</Text>
        <Animated.Text style={[styles.value, timeStyle]}>{timeLeft}s</Animated.Text>
      </View>
      <View style={styles.box}>
        <Text style={styles.label}>SCORE</Text>
        <Text style={styles.value}>{score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  box: {
    alignItems: 'center',
  },
  label: {
    fontFamily: Fonts.pixel,
    color: Colors.accent,
    fontSize: 10,
    marginBottom: 4,
  },
  value: {
    fontFamily: Fonts.pixel,
    color: '#FFF',
    fontSize: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
});
