/**
 * DangerZone — Red glowing "PRODUCTION" line at the bottom of the game area
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Fonts } from '../../../constants/theme';

interface DangerZoneProps {
  flashActive?: boolean;
}

export default function DangerZone({ flashActive }: DangerZoneProps) {
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(1, { duration: 800 }),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.lineGlow, glowStyle]} />
      <View style={styles.line} />
      <View style={styles.labelContainer}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.label}>PRODUCTION</Text>
        <Text style={styles.warningIcon}>⚠️</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    justifyContent: 'center',
    zIndex: 20,
  },
  line: {
    height: 2,
    backgroundColor: '#FF3366',
  },
  lineGlow: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
  },
  labelContainer: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 102, 0.3)',
    top: -6,
  },
  warningIcon: {
    fontSize: 8,
  },
  label: {
    fontFamily: Fonts.pixel,
    fontSize: 6,
    color: '#FF3366',
    letterSpacing: 2,
  },
});
