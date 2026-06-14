/**
 * AuthButton — Styled authentication button
 * Supports email (primary), Google, and GitHub variants
 */
import React from 'react';
import { StyleSheet, Text, Pressable, View, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type AuthButtonVariant = 'primary' | 'google' | 'github' | 'secondary';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  variant?: AuthButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
}

const variantStyles: Record<AuthButtonVariant, {
  bg: string;
  border: string;
  text: string;
}> = {
  primary: {
    bg: Colors.primary,
    border: Colors.primary,
    text: Colors.textPrimary,
  },
  google: {
    bg: '#FFFFFF',
    border: '#E0E0E0',
    text: '#333333',
  },
  github: {
    bg: '#24292E',
    border: '#24292E',
    text: '#FFFFFF',
  },
  secondary: {
    bg: 'transparent',
    border: Colors.textMuted,
    text: Colors.textSecondary,
  },
};

const variantIcons: Record<AuthButtonVariant, string> = {
  primary: '📧',
  google: '🔍',
  github: '🐙',
  secondary: '',
};

export default function AuthButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
}: AuthButtonProps) {
  const scale = useSharedValue(1);
  const style = variantStyles[variant];
  const defaultIcon = icon ?? variantIcons[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: style.bg,
          borderColor: style.border,
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'primary' && Shadows.button,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={style.text} size="small" />
      ) : (
        <View style={styles.content}>
          {defaultIcon ? <Text style={styles.icon}>{defaultIcon}</Text> : null}
          <Text style={[styles.text, { color: style.text }]}>{title}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  text: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.base,
    letterSpacing: 0.5,
  },
});
