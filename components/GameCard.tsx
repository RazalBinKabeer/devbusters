/**
 * GameCard — Pressable game selection card
 * Shows game icon, title, description with bounce animations
 */
import React from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from '../constants/theme';
import type { GameData } from '../constants/gameData';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md) / 2;

interface GameCardProps {
  game: GameData;
  index: number;
  onPress: (game: GameData) => void;
  featured?: boolean;
}

export default function GameCard({ game, index, onPress, featured = false }: GameCardProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 12, stiffness: 300 });
    rotation.value = withSpring(featured ? -1 : (index % 2 === 0 ? -2 : 2), {
      damping: 12,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 8, stiffness: 200 });
    rotation.value = withSpring(0, { damping: 8, stiffness: 200 });
  };

  const cardWidth = featured ? SCREEN_WIDTH - Spacing.xl * 2 : CARD_WIDTH;

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(500).springify()}>
      <AnimatedPressable
        onPress={() => onPress(game)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            width: cardWidth,
            borderColor: game.accentColor,
          },
          Shadows.card,
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={[Colors.bgCard, Colors.bgDark]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Accent glow */}
          <View
            style={[
              styles.accentGlow,
              { backgroundColor: game.accentColor },
            ]}
          />

          {/* Icon */}
          <Text style={[styles.icon, featured && styles.iconFeatured]}>
            {game.icon}
          </Text>

          {/* Title */}
          <Text
            style={[styles.title, featured && styles.titleFeatured]}
            numberOfLines={1}
          >
            {game.title}
          </Text>

          {/* Subtitle */}
          <Text
            style={[styles.subtitle, featured && styles.subtitleFeatured]}
            numberOfLines={featured ? 2 : 1}
          >
            {game.subtitle}
          </Text>

          {/* Tags */}
          {featured && (
            <View style={styles.tagsRow}>
              {game.tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: `${game.accentColor}20` }]}
                >
                  <Text style={[styles.tagText, { color: game.accentColor }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Coming Soon badge */}
          {game.comingSoon && (
            <View style={[styles.badge, { backgroundColor: game.accentColor }]}>
              <Text style={styles.badgeText}>SOON</Text>
            </View>
          )}
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    overflow: 'hidden',
  },
  gradient: {
    padding: Spacing.base,
    position: 'relative',
    overflow: 'hidden',
  },
  accentGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.1,
  },
  icon: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  iconFeatured: {
    fontSize: 48,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  titleFeatured: {
    fontSize: FontSizes.xl,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  subtitleFeatured: {
    fontSize: FontSizes.sm,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 8,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
});
