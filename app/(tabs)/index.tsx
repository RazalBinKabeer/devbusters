/**
 * Home Screen — Game selection grid
 * Shows frustration meter + 5 game cards in a scrollable grid
 */
import React from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import GameCard from '../../components/GameCard';
import FrustrationMeter from '../../components/FrustrationMeter';
import { useAuth } from '../../contexts/AuthContext';
import { GAMES, type GameData } from '../../constants/gameData';
import { Colors, Fonts, FontSizes, Spacing } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const handleGamePress = (game: GameData) => {
    router.push(game.route as any);
  };

  const displayName = user?.displayName || 'Developer';
  const greeting = getGreeting();

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.base },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.header}
        >
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.displayName}>{displayName}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👾</Text>
          </View>
        </Animated.View>

        {/* Frustration meter */}
        <FrustrationMeter
          onLevelChange={(level) => {
            // TODO: Save to Firebase
            console.log('Frustration level:', level);
          }}
        />

        {/* Section title */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>Pick Your Rage 🎯</Text>
          <Text style={styles.sectionSubtitle}>Choose a game and let it all out</Text>
        </Animated.View>

        {/* Featured game (first one) */}
        <View style={styles.featuredContainer}>
          <GameCard
            game={GAMES[0]}
            index={0}
            onPress={handleGamePress}
            featured
          />
        </View>

        {/* Game grid (remaining 4) */}
        <View style={styles.grid}>
          {GAMES.slice(1).map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              index={index + 1}
              onPress={handleGamePress}
            />
          ))}
        </View>

        {/* Bottom spacer */}
        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </GradientBackground>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Late night coding?';
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  displayName: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes['2xl'],
    color: Colors.textPrimary,
    marginTop: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  sectionHeader: {
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  featuredContainer: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
});
