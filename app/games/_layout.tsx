/**
 * Games Stack Layout
 */
import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function GamesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bgDark },
        animation: 'slide_from_bottom',
      }}
    />
  );
}
