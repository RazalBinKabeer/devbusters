export type EnemyType = 'jira' | 'meeting' | 'pr';
export type PowerUpType = 'coffee' | 'pizza';

export interface RSBullet {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number; // Y-axis speed (negative for up)
  active: boolean;
}

export interface RSEnemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number; // Y-axis speed (positive for down)
  hp: number;    // hits to destroy
  maxHp: number;
  points: number;
  active: boolean;
  emoji: string;
}

export interface RSPowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  active: boolean;
  emoji: string;
}

export interface RSSplat {
  id: string;
  x: number;
  y: number;
  emoji: string;
  createdAt: number;
}

export interface FloatingTextData {
  id: string;
  x: number;
  y: number;
  text: string;
}

export interface RSGameState {
  status: 'ready' | 'playing' | 'gameOver' | 'paused';
  score: number;
  lives: number;
  maxLives: number;
  difficulty: number;
  highScore: number;
  bullets: RSBullet[];
  enemies: RSEnemy[];
  powerUps: RSPowerUp[];
  splats: RSSplat[];
  floatingTexts: FloatingTextData[];

  // Power-up state
  overclockUntil: number; // timestamp
  spreadUntil: number;    // timestamp
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
