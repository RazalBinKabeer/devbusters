/**
 * Bottom Tab Layout — Main app navigation
 * 4 tabs: Home, Leaderboard, Achievements, Profile
 */
import { Tabs } from 'expo-router';
import { Text, StyleSheet, View } from 'react-native';
import { Colors, Fonts, FontSizes, Spacing } from '../../constants/theme';

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
  color: string;
}

function TabIcon({ emoji, label, focused, color }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
        {emoji}
      </Text>
      <Text
        style={[
          styles.tabLabel,
          { color },
          focused && styles.tabLabelActive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🎮" label="Games" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏆" label="Ranks" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="⭐" label="Awards" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bgCard,
    borderTopColor: Colors.bgLight,
    borderTopWidth: 1,
    height: 75,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.6,
  },
  tabEmojiActive: {
    opacity: 1,
    fontSize: 24,
  },
  tabLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
  },
  tabLabelActive: {
    fontFamily: Fonts.bodySemiBold,
  },
});
