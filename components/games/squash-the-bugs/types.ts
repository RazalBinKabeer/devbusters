/**
 * Squash the Bugs — Type Definitions
 */

/** Bug variant determines appearance, speed, and point value */
export type BugVariant = 'syntax' | 'runtime' | 'logic' | 'heisenbug';

/** Static config for each bug variant */
export interface BugConfig {
  variant: BugVariant;
  emoji: string;
  label: string;
  points: number;
  speed: number;        // base pixels-per-second fall speed
  color: string;
  size: number;          // width/height of the touch target
  livesLost: number;     // cost if the bug reaches production
}

/** A single bug instance on screen */
export interface BugData {
  id: string;
  variant: BugVariant;
  x: number;             // horizontal pixel position
  spawnedAt: number;      // Date.now() when spawned
  config: BugConfig;
}

/** Brief splat animation left behind after squashing */
export interface SplatData {
  id: string;
  x: number;
  y: number;
  emoji: string;
  createdAt: number;
}

/** Per-power-up cooldown state */
export interface PowerUpState {
  lastUsed: number;      // timestamp of last activation
  cooldown: number;      // total cooldown duration in ms
}

/** Top-level game state */
export interface GameState {
  status: 'ready' | 'playing' | 'gameOver' | 'paused';
  score: number;
  lives: number;
  maxLives: number;
  difficulty: number;    // 1-5
  bugsSquashed: number;
  highScore: number;
  startedAt: number;     // Date.now() when play began
}

/** Configuration that changes per difficulty tier */
export interface DifficultyConfig {
  spawnInterval: number;              // ms between spawns
  speedMultiplier: number;            // multiplied with BugConfig.speed
  bugWeights: Record<BugVariant, number>;  // weighted random selection
  maxBugsOnScreen: number;
}
