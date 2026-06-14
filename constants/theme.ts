/**
 * DevBusters Design System
 * Comic-book inspired, colorful & fun theme tokens
 */

export const Colors = {
  primary: '#FF6B35',       // Energetic orange — CTAs, highlights
  secondary: '#7B2FF7',     // Electric purple — accents, badges
  accent: '#00D4AA',        // Mint green — success, achievements
  danger: '#FF3366',        // Hot pink — destructive, rage meter
  warning: '#FFD23F',       // Bright yellow — warnings, stars

  bgDark: '#1A1A2E',        // Deep navy — main background
  bgCard: '#16213E',        // Card backgrounds
  bgLight: '#0F3460',       // Secondary surfaces
  bgOverlay: 'rgba(26, 26, 46, 0.85)', // Overlay with transparency

  textPrimary: '#FFFFFF',
  textSecondary: '#B0B8C8',
  textMuted: '#6C7A8D',

  // Game-specific accent colors
  gameRocketShooter: '#FF6B35',
  gameShoutToBreak: '#FF3366',
  gameAssetDestroy: '#7B2FF7',
  gameWhackYourBoss: '#FFD23F',
  gameSquashTheBugs: '#00D4AA',

  // Gradients
  gradientPrimary: ['#1A1A2E', '#16213E', '#0F3460'] as const,
  gradientWelcome: ['#1A1A2E', '#2D1B69', '#0F3460'] as const,
  gradientCard: ['#16213E', '#1A1A2E'] as const,
  gradientOrange: ['#FF6B35', '#FF3366'] as const,
  gradientPurple: ['#7B2FF7', '#4A0E8F'] as const,
} as const;

export const Fonts = {
  heading: 'BubblegumSans_400Regular',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  display: 'FredokaOne_400Regular',
  pixel: 'PressStart2P_400Regular',
} as const;

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  hero: 56,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  }),
} as const;
