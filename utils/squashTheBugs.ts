import { BugConfig, BugVariant, DifficultyConfig } from '../components/games/squash-the-bugs/types';

// Static configuration for each bug type
export const BUG_CONFIGS: Record<BugVariant, BugConfig> = {
  syntax: {
    variant: 'syntax',
    emoji: '🐛',
    label: 'Syntax Bug',
    points: 10,
    speed: 100, // base px per second
    color: '#00D4AA', // Theme accent (mint)
    size: 48,
    livesLost: 1,
  },
  runtime: {
    variant: 'runtime',
    emoji: '🪲',
    label: 'Runtime Bug',
    points: 25,
    speed: 150,
    color: '#FFD23F', // Theme warning (yellow)
    size: 40,
    livesLost: 1,
  },
  logic: {
    variant: 'logic',
    emoji: '🦗',
    label: 'Logic Bug',
    points: 50,
    speed: 250,
    color: '#FF3366', // Theme danger (pink)
    size: 36,
    livesLost: 1,
  },
  heisenbug: {
    variant: 'heisenbug',
    emoji: '👀',
    label: 'Heisenbug',
    points: 100,
    speed: 180,
    color: '#7B2FF7', // Theme secondary (purple)
    size: 56,
    livesLost: 2, // Boss bug costs 2 lives!
  },
};

// Difficulty curve definitions
export const DIFFICULTY_TIERS: Record<number, DifficultyConfig> = {
  1: {
    spawnInterval: 1500,
    speedMultiplier: 1.0,
    bugWeights: { syntax: 80, runtime: 20, logic: 0, heisenbug: 0 },
    maxBugsOnScreen: 5,
  },
  2: {
    spawnInterval: 1200,
    speedMultiplier: 1.2,
    bugWeights: { syntax: 60, runtime: 30, logic: 10, heisenbug: 0 },
    maxBugsOnScreen: 8,
  },
  3: {
    spawnInterval: 900,
    speedMultiplier: 1.5,
    bugWeights: { syntax: 40, runtime: 40, logic: 20, heisenbug: 5 }, // Introduce Heisenbug chance
    maxBugsOnScreen: 12,
  },
  4: {
    spawnInterval: 700,
    speedMultiplier: 1.8,
    bugWeights: { syntax: 30, runtime: 40, logic: 30, heisenbug: 8 },
    maxBugsOnScreen: 15,
  },
  5: {
    spawnInterval: 450,
    speedMultiplier: 2.2,
    bugWeights: { syntax: 20, runtime: 40, logic: 40, heisenbug: 12 },
    maxBugsOnScreen: 20,
  },
};

/**
 * Returns a random bug variant based on the weighted probabilities of the current difficulty tier
 */
export function getRandomBugVariant(difficulty: number): BugVariant {
  const tier = DIFFICULTY_TIERS[Math.min(difficulty, 5)];
  const weights = tier.bugWeights;
  
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (const [variant, weight] of Object.entries(weights)) {
    random -= weight as number;
    if (random <= 0) {
      return variant as BugVariant;
    }
  }
  
  return 'syntax'; // fallback
}

/**
 * Generate a unique ID for bugs/splats
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
