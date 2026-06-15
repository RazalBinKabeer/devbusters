/**
 * Game metadata for the DevBusters platform
 * Each game has its own identity, colors, and description
 */

export interface GameData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;       // Emoji for quick display
  accentColor: string;
  route: string;
  isLocked: boolean;
  comingSoon: boolean;
  tags: string[];
}

export const GAMES: GameData[] = [
  {
    id: 'rocket-shooter',
    title: 'Rocket Shooter',
    subtitle: 'Shoot bugs, avoid blockers!',
    description:
      'Pilot your developer rocket to shoot down Jira tickets, endless meeting invites, and PR reviews. Grab coffee for rapid fire!',
    icon: '🚀',
    accentColor: '#FFD23F',
    route: '/games/rocket-shooter',
    isLocked: false,
    comingSoon: false,
    tags: ['Action', 'Shooter'],
  },
  {
    id: 'shout-to-break',
    title: 'Shout to Break',
    subtitle: 'Scream your stress away!',
    description:
      'Use your real voice to shatter windows, glasses, pots, and monitors. The louder you scream, the more destruction you cause! 🗣️💥',
    icon: '🗣️',
    accentColor: '#FF3366',
    route: '/games/shout-to-break',
    isLocked: false,
    comingSoon: true,
    tags: ['Voice', 'Destruction'],
  },
  {
    id: 'asset-destroy',
    title: 'Asset Destroy',
    subtitle: 'Smash all the things!',
    description:
      'Pick your weapon — baseball bat, fist, or gun — and destroy laptops, monitors, keyboards, and other office equipment. Pure rage therapy! 💻🔨',
    icon: '💻',
    accentColor: '#7B2FF7',
    route: '/games/asset-destroy',
    isLocked: false,
    comingSoon: false,
    tags: ['Destruction', 'Rage'],
  },
  {
    id: 'whack-your-boss',
    title: 'Whack Your Boss',
    subtitle: 'Pick. Name. Whack. Repeat.',
    description:
      'Create a custom avatar, give it a name, and whack it as much as you need. Keep going until your frustration meter hits zero! 🔨😤',
    icon: '🔨',
    accentColor: '#FFD23F',
    route: '/games/whack-your-boss',
    isLocked: false,
    comingSoon: true,
    tags: ['Stress Relief', 'Customizable'],
  },
  {
    id: 'squash-the-bugs',
    title: 'Squash the Bugs',
    subtitle: 'Tap fast, debug faster!',
    description:
      'Bugs rain from the sky — squash them with your fingers! Use Git Revert to clear all bugs at once. Don\'t let them reach the bottom! 🐛👆',
    icon: '🐛',
    accentColor: '#00D4AA',
    route: '/games/squash-the-bugs',
    isLocked: false,
    comingSoon: false,
    tags: ['Arcade', 'Tap'],
  },
];

/** Achievement categories for future use */
export const ACHIEVEMENT_CATEGORIES = [
  { id: 'destruction', label: 'Destruction', icon: '💥' },
  { id: 'speed', label: 'Speed', icon: '⚡' },
  { id: 'endurance', label: 'Endurance', icon: '🏋️' },
  { id: 'rage', label: 'Rage Master', icon: '😤' },
  { id: 'zen', label: 'Zen Mode', icon: '🧘' },
] as const;

/** Frustration level emojis for the mood meter */
export const FRUSTRATION_LEVELS = [
  { level: 0, emoji: '😌', label: 'Calm' },
  { level: 1, emoji: '😐', label: 'Meh' },
  { level: 2, emoji: '😤', label: 'Annoyed' },
  { level: 3, emoji: '🤬', label: 'Furious' },
  { level: 4, emoji: '🤯', label: 'EXPLODING' },
] as const;
