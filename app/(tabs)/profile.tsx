/**
 * Profile Screen — User profile with sign out
 */
import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GradientBackground from '../../components/GradientBackground';
import AuthButton from '../../components/AuthButton';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const displayName = user?.displayName || 'Anonymous Dev';
  const email = user?.email || 'no-email@rage.dev';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xl }]}>
        {/* Profile header */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.profileHeader}
        >
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>
        </Animated.View>

        {/* Stats preview */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.statsRow}
        >
          <StatCard emoji="🎮" value="0" label="Games" />
          <StatCard emoji="💥" value="0" label="Destroyed" />
          <StatCard emoji="🏆" value="0" label="Rank" />
        </Animated.View>

        {/* Menu items */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.menuSection}
        >
          <MenuItem emoji="📊" label="Rage History" />
          <MenuItem emoji="🎨" label="Customize Avatar" />
          <MenuItem emoji="🔔" label="Notifications" />
          <MenuItem emoji="⚙️" label="Settings" />
          <MenuItem emoji="📱" label="About DevBusters" />
        </Animated.View>

        {/* Sign out */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.signOutSection}
        >
          <AuthButton
            title="Sign Out"
            onPress={signOut}
            variant="secondary"
            icon="👋"
          />
        </Animated.View>
      </View>
    </GradientBackground>
  );
}

function StatCard({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({ emoji, label }: { emoji: string; label: string }) {
  return (
    <Pressable style={styles.menuItem}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  avatarText: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes['4xl'],
    color: Colors.textPrimary,
  },
  displayName: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes['2xl'],
    color: Colors.textPrimary,
  },
  email: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.bgLight,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  menuSection: {
    gap: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  menuEmoji: {
    fontSize: 20,
  },
  menuLabel: {
    flex: 1,
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  menuArrow: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xl,
    color: Colors.textMuted,
  },
  signOutSection: {
    marginTop: 'auto',
    marginBottom: Spacing['2xl'],
  },
});
