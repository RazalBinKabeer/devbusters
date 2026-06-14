/**
 * FloatingElements — Animated comic-book decorations
 * Floating emojis/text that continuously animate in the background
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FloatingItem {
  id: number;
  content: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
}

const DEFAULT_ITEMS: FloatingItem[] = [
  { id: 1, content: '💥', x: 0.1, y: 0.15, size: 32, delay: 0, duration: 3000, rotation: 15 },
  { id: 2, content: '⚡', x: 0.85, y: 0.1, size: 28, delay: 500, duration: 2500, rotation: -10 },
  { id: 3, content: '🐛', x: 0.75, y: 0.3, size: 24, delay: 1000, duration: 3500, rotation: 20 },
  { id: 4, content: '🔨', x: 0.15, y: 0.45, size: 26, delay: 300, duration: 2800, rotation: -15 },
  { id: 5, content: '🚀', x: 0.9, y: 0.55, size: 30, delay: 800, duration: 3200, rotation: 25 },
  { id: 6, content: 'POW!', x: 0.05, y: 0.7, size: 16, delay: 200, duration: 2600, rotation: -8 },
  { id: 7, content: '💻', x: 0.8, y: 0.75, size: 22, delay: 600, duration: 3000, rotation: 12 },
  { id: 8, content: 'ZAP!', x: 0.4, y: 0.05, size: 14, delay: 1200, duration: 2900, rotation: -20 },
  { id: 9, content: '🎯', x: 0.6, y: 0.85, size: 20, delay: 400, duration: 3100, rotation: 18 },
  { id: 10, content: 'BAM!', x: 0.25, y: 0.9, size: 15, delay: 900, duration: 2700, rotation: -12 },
];

interface FloatingElementProps {
  item: FloatingItem;
}

function FloatingElement({ item }: FloatingElementProps) {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0.15);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      item.delay,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: item.duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(20, { duration: item.duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    rotate.value = withDelay(
      item.delay,
      withRepeat(
        withSequence(
          withTiming(item.rotation, { duration: item.duration * 1.5, easing: Easing.inOut(Easing.ease) }),
          withTiming(-item.rotation, { duration: item.duration * 1.5, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      item.delay,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: item.duration }),
          withTiming(0.12, { duration: item.duration })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      item.delay,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: item.duration * 0.8 }),
          withTiming(0.9, { duration: item.duration * 0.8 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const isText = !item.content.match(/[\u{1F000}-\u{1FFFF}]/u);

  return (
    <Animated.View
      style={[
        styles.floatingItem,
        {
          left: item.x * SCREEN_WIDTH,
          top: item.y * SCREEN_HEIGHT,
        },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.floatingText,
          {
            fontSize: item.size,
            ...(isText && styles.comicText),
          },
        ]}
      >
        {item.content}
      </Text>
    </Animated.View>
  );
}

interface FloatingElementsProps {
  items?: FloatingItem[];
}

export default function FloatingElements({ items = DEFAULT_ITEMS }: FloatingElementsProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      {items.map((item) => (
        <FloatingElement key={item.id} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  floatingItem: {
    position: 'absolute',
  },
  floatingText: {
    textAlign: 'center',
  },
  comicText: {
    fontWeight: '900',
    color: 'rgba(255, 107, 53, 0.25)',
    letterSpacing: 1,
  },
});
