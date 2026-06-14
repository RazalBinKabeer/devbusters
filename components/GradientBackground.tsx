/**
 * GradientBackground — Reusable gradient wrapper
 * Comic-book styled background with optional floating elements
 */
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/theme';

interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: readonly string[];
  style?: ViewStyle;
}

export default function GradientBackground({
  children,
  colors = Colors.gradientPrimary,
  style,
}: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={colors as any}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
