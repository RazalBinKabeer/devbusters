import { Rect, RSEnemy, EnemyType, RSPowerUp, PowerUpType } from '../components/games/rocket-shooter/types';

/**
 * Axis-Aligned Bounding Box (AABB) collision detection
 */
export function checkCollision(rect1: Rect, rect2: Rect): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Enemy configurations
 */
export const ENEMY_CONFIGS: Record<EnemyType, { emoji: string; width: number; height: number; baseSpeed: number; hp: number; points: number; weight: number }> = {
  jira: { emoji: '🎫', width: 40, height: 40, baseSpeed: 100, hp: 1, points: 10, weight: 60 },
  meeting: { emoji: '📅', width: 36, height: 36, baseSpeed: 200, hp: 1, points: 20, weight: 30 },
  pr: { emoji: '🔀', width: 48, height: 48, baseSpeed: 60, hp: 3, points: 50, weight: 10 },
};

export function getRandomEnemyType(difficulty: number): EnemyType {
  // At higher difficulties, spawn more meetings and PRs
  const weights = { ...ENEMY_CONFIGS };
  if (difficulty >= 2) weights.meeting.weight += 10;
  if (difficulty >= 3) weights.pr.weight += 10;
  if (difficulty >= 4) { weights.meeting.weight += 20; weights.pr.weight += 20; }

  const totalWeight = Object.values(weights).reduce((sum, config) => sum + config.weight, 0);
  let rand = Math.random() * totalWeight;

  for (const [type, config] of Object.entries(weights)) {
    rand -= config.weight;
    if (rand <= 0) return type as EnemyType;
  }
  return 'jira';
}

export function spawnEnemy(gameWidth: number, difficulty: number): RSEnemy {
  const type = getRandomEnemyType(difficulty);
  const config = ENEMY_CONFIGS[type];
  const speedMultiplier = 1 + (difficulty - 1) * 0.15;

  return {
    id: generateId(),
    type,
    x: Math.random() * (gameWidth - config.width),
    y: -config.height,
    width: config.width,
    height: config.height,
    speed: config.baseSpeed * speedMultiplier,
    hp: config.hp,
    maxHp: config.hp,
    points: config.points,
    active: true,
    emoji: config.emoji,
  };
}

/**
 * Power-up configurations
 */
export const POWERUP_CONFIGS: Record<PowerUpType, { emoji: string; width: number; height: number; speed: number }> = {
  coffee: { emoji: '☕', width: 36, height: 36, speed: 120 },
  pizza: { emoji: '🍕', width: 36, height: 36, speed: 120 },
};

export function spawnPowerUp(gameWidth: number): RSPowerUp {
  const type: PowerUpType = Math.random() > 0.5 ? 'coffee' : 'pizza';
  const config = POWERUP_CONFIGS[type];

  return {
    id: generateId(),
    type,
    x: Math.random() * (gameWidth - config.width),
    y: -config.height,
    width: config.width,
    height: config.height,
    speed: config.speed,
    active: true,
    emoji: config.emoji,
  };
}
