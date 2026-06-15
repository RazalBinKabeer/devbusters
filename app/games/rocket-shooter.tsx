import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import GameHUD from '../../components/games/squash-the-bugs/GameHUD';
import GameOverModal from '../../components/games/squash-the-bugs/GameOverModal';
import BugSplat from '../../components/games/squash-the-bugs/BugSplat';
import PlayerRocket from '../../components/games/rocket-shooter/PlayerRocket';
import Enemy from '../../components/games/rocket-shooter/Enemy';
import Bullet from '../../components/games/rocket-shooter/Bullet';
import Starfield from '../../components/games/rocket-shooter/Starfield';
import FloatingText from '../../components/games/rocket-shooter/FloatingText';

import { RSGameState, RSBullet, RSEnemy, RSPowerUp, FloatingTextData } from '../../components/games/rocket-shooter/types';
import { checkCollision, spawnEnemy, spawnPowerUp, generateId } from '../../utils/rocketShooter';
import { soundManager } from '../../utils/sounds';
import { Colors, Fonts, FontSizes, Spacing } from '../../constants/theme';

const HIGH_SCORE_KEY = '@devbusters_rocket_high_score';
const MAX_LIVES = 3;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 48;
const BASE_FIRE_RATE = 350; // ms

// We use a React ref for game state to avoid re-render stutter during the tight 60fps game loop.
// We only trigger a React state update for HUD/rendering.
export default function RocketShooterScreen() {
  const router = useRouter();
  
  const [renderTick, setRenderTick] = useState(0);
  const [gameArea, setGameArea] = useState({ width: 0, height: 0 });
  const gameAreaRef = useRef({ width: 0, height: 0 });
  const [highScore, setHighScore] = useState(0);

  // ── Shared Values (UI Thread) ──────────────────────────────────────
  const playerX = useSharedValue(0);
  const screenShakeX = useSharedValue(0);
  const powerUpEnergy = useSharedValue(0);
  const powerUpColor = useSharedValue('#FFFFFF');
  const screenFlashOpacity = useSharedValue(0);

  // ── Game State (JS Thread) ─────────────────────────────────────────
  const state = useRef<RSGameState>({
    status: 'ready',
    score: 0,
    lives: MAX_LIVES,
    maxLives: MAX_LIVES,
    difficulty: 1,
    highScore: 0,
    bullets: [],
    enemies: [],
    powerUps: [],
    splats: [],
    floatingTexts: [] as FloatingTextData[],
    overclockUntil: 0,
    spreadUntil: 0,
  });

  const SARCASTIC_MESSAGES = [
    "Added to backlog...",
    "Moved to Sprint 99",
    "WONTFIX",
    "Someone else's problem",
    "LGTM! 🚢",
    "Closed: Cannot Reproduce",
  ];

  const lastTime = useRef(0);
  const rAF = useRef<number>(undefined);
  const lastFireTime = useRef(0);
  const lastSpawnTime = useRef(0);
  const lastDiffTime = useRef(0);
  const invincibleUntil = useRef(0);

  // Load High Score
  useEffect(() => {
    AsyncStorage.getItem(HIGH_SCORE_KEY).then((v) => {
      if (v) setHighScore(parseInt(v, 10));
    });
    soundManager.init();
    return () => {
      soundManager.cleanup();
      if (rAF.current) cancelAnimationFrame(rAF.current);
    };
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    state.current = {
      status: 'playing',
      score: 0,
      lives: MAX_LIVES,
      maxLives: MAX_LIVES,
      difficulty: 1,
      highScore: highScore,
      bullets: [],
      enemies: [],
      powerUps: [],
      splats: [],
      floatingTexts: [],
      overclockUntil: 0,
      spreadUntil: 0,
    };
    
    playerX.value = gameArea.width / 2 - PLAYER_WIDTH / 2;
    lastTime.current = 0;
    lastFireTime.current = 0;
    lastSpawnTime.current = 0;
    lastDiffTime.current = performance.now();
    invincibleUntil.current = 0;
    
    setRenderTick(t => t + 1);
    
    if (rAF.current) cancelAnimationFrame(rAF.current);
    rAF.current = requestAnimationFrame(gameLoop);
  }, [gameArea.width, highScore]);

  const endGame = useCallback(() => {
    state.current.status = 'gameOver';
    if (state.current.score > highScore) {
      setHighScore(state.current.score);
      AsyncStorage.setItem(HIGH_SCORE_KEY, state.current.score.toString());
    }
    soundManager.play('game-over');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setRenderTick(t => t + 1);
  }, [highScore]);

  const triggerScreenShake = () => {
    screenShakeX.value = withSequence(
      withTiming(-10, { duration: 40 }),
      withTiming(10, { duration: 40 }),
      withTiming(-6, { duration: 40 }),
      withTiming(6, { duration: 40 }),
      withTiming(0, { duration: 40 })
    );
  };

  // ── Game Loop (Runs ~60 times per second) ──────────────────────────
  const gameLoop = (time: number) => {
    if (state.current.status !== 'playing') return;

    // Initialize lastTime on the very first frame to avoid massive delta times
    if (lastTime.current === 0) {
      lastTime.current = time;
      rAF.current = requestAnimationFrame(gameLoop);
      return;
    }

    const dt = Math.min((time - lastTime.current) / 1000, 0.1); // Cap delta time to 100ms
    lastTime.current = time;

    const now = Date.now();
    const { width, height } = gameAreaRef.current; // ALWAYS read from the ref to avoid stale closures!
    const playerRect = { x: playerX.value + 8, y: height - PLAYER_HEIGHT - 20, width: PLAYER_WIDTH - 16, height: PLAYER_HEIGHT - 16 };
    const isInvincible = now < invincibleUntil.current;

    // 1. Difficulty Ramp — Score-based thresholds
    // Lv2 = 500pts, Lv3 = 1500pts, Lv4 = 3000pts, Lv5 = 5000pts
    const DIFFICULTY_THRESHOLDS = [0, 500, 1500, 3000, 5000];
    const newDifficulty = DIFFICULTY_THRESHOLDS.filter(t => state.current.score >= t).length;
    if (newDifficulty > state.current.difficulty) {
      state.current.difficulty = newDifficulty;
      soundManager.play('powerup');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // 2. Firing Logic
    const isOverclock = now < state.current.overclockUntil;
    const isSpread = now < state.current.spreadUntil;
    const fireRate = isOverclock ? BASE_FIRE_RATE / 2 : BASE_FIRE_RATE;

    // Update Energy Bar
    if (isOverclock) {
      powerUpEnergy.value = (state.current.overclockUntil - now) / 5000;
      powerUpColor.value = '#FFD23F'; // Yellow for coffee
    } else if (isSpread) {
      powerUpEnergy.value = (state.current.spreadUntil - now) / 5000;
      powerUpColor.value = '#FF6B35'; // Orange for pizza
    } else {
      powerUpEnergy.value = 0;
    }

    if (now - lastFireTime.current > fireRate) {
      soundManager.play('laser');
      lastFireTime.current = now;

      const bulletY = playerRect.y - 10;
      const bulletSpeed = -600;

      if (isSpread) {
        state.current.bullets.push(
          { id: generateId(), x: playerX.value + 4, y: bulletY, width: 6, height: 16, speed: bulletSpeed, active: true },
          { id: generateId(), x: playerX.value + PLAYER_WIDTH / 2 - 3, y: bulletY - 10, width: 6, height: 16, speed: bulletSpeed, active: true },
          { id: generateId(), x: playerX.value + PLAYER_WIDTH - 10, y: bulletY, width: 6, height: 16, speed: bulletSpeed, active: true }
        );
      } else {
        state.current.bullets.push({ id: generateId(), x: playerX.value + PLAYER_WIDTH / 2 - 3, y: bulletY, width: 6, height: 16, speed: bulletSpeed, active: true });
      }
    }

    // 3. Spawning Logic
    const spawnRate = Math.max(400, 1500 - (state.current.difficulty - 1) * 250);
    if (now - lastSpawnTime.current > spawnRate) {
      if (state.current.enemies.length < 8 + state.current.difficulty) {
        state.current.enemies.push(spawnEnemy(width, state.current.difficulty));
      }
      
      // 5% chance to spawn powerup
      if (Math.random() < 0.05 && state.current.powerUps.length < 2) {
        state.current.powerUps.push(spawnPowerUp(width));
      }
      lastSpawnTime.current = now;
    }

    // 4. Update Positions
    state.current.bullets.forEach(b => { b.y += b.speed * dt; });
    state.current.enemies.forEach(e => { e.y += e.speed * dt; });
    state.current.powerUps.forEach(p => { p.y += p.speed * dt; });

    // Remove offscreen
    state.current.bullets = state.current.bullets.filter(b => b.y > -20);
    
    // Check for missed enemies to show sarcastic messages
    state.current.enemies.forEach(e => {
      if (e.y >= height + 50) {
        const msg = SARCASTIC_MESSAGES[Math.floor(Math.random() * SARCASTIC_MESSAGES.length)];
        // Spawn in the middle of the screen
        const randomYOffset = Math.random() * 40 - 20;
        state.current.floatingTexts.push({ id: generateId(), x: width / 2, y: height / 2 + randomYOffset, text: msg });
      }
    });

    state.current.enemies = state.current.enemies.filter(e => e.y < height + 50);
    state.current.powerUps = state.current.powerUps.filter(p => p.y < height + 50);

    // 5. Collisions
    // Bullet vs Enemy
    for (const bullet of state.current.bullets) {
      if (!bullet.active) continue;
      for (const enemy of state.current.enemies) {
        if (!enemy.active) continue;

        if (checkCollision(bullet, enemy)) {
          bullet.active = false;
          enemy.hp -= 1;
          
          if (enemy.hp <= 0) {
            enemy.active = false;
            state.current.score += enemy.points;
            state.current.splats.push({ id: generateId(), x: enemy.x + enemy.width/2, y: enemy.y + enemy.height/2, emoji: '💥', createdAt: now });
            soundManager.play('explosion');
          }
          break; // bullet destroyed
        }
      }
    }

    // Player vs Enemy
    if (!isInvincible) {
      for (const enemy of state.current.enemies) {
        if (!enemy.active) continue;
        if (checkCollision(playerRect, enemy)) {
          enemy.active = false;
          state.current.lives -= 1;
          soundManager.play('life-lost');
          triggerScreenShake();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          
          if (state.current.lives <= 0) {
            endGame();
            return; // stop loop
          } else {
            invincibleUntil.current = now + 1500; // 1.5s i-frames
          }
        }
      }
    }

    // Player vs PowerUp
    for (const powerUp of state.current.powerUps) {
      if (!powerUp.active) continue;
      if (checkCollision(playerRect, powerUp)) {
        powerUp.active = false;
        soundManager.play('powerup');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Flash screen
        screenFlashOpacity.value = withSequence(
          withTiming(0.4, { duration: 50 }),
          withTiming(0, { duration: 250 })
        );
        
        if (powerUp.type === 'coffee') {
          state.current.overclockUntil = now + 5000;
        } else if (powerUp.type === 'pizza') {
          state.current.spreadUntil = now + 5000;
        }
        
        // +20 points for getting a powerup
        state.current.score += 20; 
      }
    }

    // Cleanup inactive
    state.current.bullets = state.current.bullets.filter(b => b.active);
    state.current.enemies = state.current.enemies.filter(e => e.active);
    state.current.powerUps = state.current.powerUps.filter(p => p.active);

    // Force React render for visual updates
    setRenderTick(t => t + 1);
    
    // Request next frame
    rAF.current = requestAnimationFrame(gameLoop);
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: screenShakeX.value }],
  }));

  const energyBarStyle = useAnimatedStyle(() => ({
    height: `${Math.max(0, powerUpEnergy.value * 100)}%`,
    backgroundColor: powerUpColor.value,
    opacity: powerUpEnergy.value > 0 ? 1 : 0,
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: screenFlashOpacity.value,
  }));

  const isNewHighScore = state.current.score > highScore && state.current.status === 'gameOver';

  return (
    <LinearGradient colors={[Colors.bgDark, '#050B14']} style={styles.root}>
      {/* HUD */}
      {state.current.status === 'playing' && (
        <GameHUD
          score={state.current.score}
          lives={state.current.lives}
          maxLives={state.current.maxLives}
          difficulty={state.current.difficulty}
          onPause={() => {
            if (rAF.current) cancelAnimationFrame(rAF.current);
            router.back();
          }}
        />
      )}

      {/* Game Area */}
      <Animated.View 
        style={[styles.gameArea, shakeStyle]}
        onLayout={(e) => {
          setGameArea(e.nativeEvent.layout);
          gameAreaRef.current = e.nativeEvent.layout;
        }}
      >
        <Starfield gameHeight={gameArea.height} gameWidth={gameArea.width} />

        {/* Screen Flash Effect */}
        <Animated.View style={[styles.screenFlash, flashStyle]} pointerEvents="none" />

        {/* Energy Bar Indicator */}
        <View style={styles.energyBarContainer}>
          <Animated.View style={[styles.energyBar, energyBarStyle]} />
        </View>

        {state.current.status === 'playing' && (
          <>
            {/* Projectiles */}
            {state.current.bullets.map(b => <Bullet key={b.id} bullet={b} />)}
            
            {/* Enemies */}
            {state.current.enemies.map(e => <Enemy key={e.id} enemy={e} />)}

            {/* Power Ups */}
            {state.current.powerUps.map(p => (
              <View key={p.id} style={[styles.powerUp, { left: p.x, top: p.y }]}>
                <Text style={styles.powerUpEmoji}>{p.emoji}</Text>
              </View>
            ))}

            {/* Splats */}
            {state.current.splats.map(s => (
              <BugSplat key={s.id} id={s.id} x={s.x} y={s.y} onComplete={(id) => {
                state.current.splats = state.current.splats.filter(x => x.id !== id);
              }} />
            ))}

            {/* Floating Texts */}
            {state.current.floatingTexts.map(f => (
              <FloatingText key={f.id} id={f.id} x={f.x} y={f.y} text={f.text} onComplete={(id) => {
                state.current.floatingTexts = state.current.floatingTexts.filter(x => x.id !== id);
              }} />
            ))}

            {/* Player */}
            <PlayerRocket
              x={playerX}
              y={gameArea.height - PLAYER_HEIGHT - 20}
              width={PLAYER_WIDTH}
              height={PLAYER_HEIGHT}
              gameWidth={gameArea.width}
              isInvincible={Date.now() < invincibleUntil.current}
            />
          </>
        )}

        {/* Ready Screen */}
        {state.current.status === 'ready' && (
          <Pressable style={styles.overlay} onPress={startGame}>
            <Animated.View entering={FadeInDown.duration(600)} style={styles.readyContent}>
              <Text style={styles.readyIcon}>🚀</Text>
              <Text style={styles.readyTitle}>Rocket Shooter</Text>
              <Text style={styles.readySubtitle}>Shoot tickets, dodge blockers!</Text>

              <View style={styles.instructions}>
                <Text style={styles.instructionText}>👆 Drag anywhere to move</Text>
                <Text style={styles.instructionText}>⚡ Auto-fires straight up</Text>
                <Text style={styles.instructionText}>☕ Coffee = Double speed</Text>
                <Text style={styles.instructionText}>🍕 Pizza = Spread shot</Text>
              </View>

              {highScore > 0 && (
                <Text style={styles.highScoreText}>🏆 Best: {highScore}</Text>
              )}
              <Animated.Text entering={FadeIn.delay(400).duration(600)} style={styles.tapToStart}>
                TAP TO START
              </Animated.Text>
            </Animated.View>
          </Pressable>
        )}
      </Animated.View>

      {/* Game Over Modal */}
      {state.current.status === 'gameOver' && (
        <GameOverModal
          score={state.current.score}
          highScore={Math.max(state.current.score, highScore)}
          bugsSquashed={Math.floor(state.current.score / 10)} // Approximate hits
          difficulty={state.current.difficulty}
          isNewHighScore={isNewHighScore}
          onPlayAgain={startGame}
          onExit={() => router.back()}
          statLabel="Destroyed"
          statEmoji="💥"
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gameArea: { flex: 1, overflow: 'hidden' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 11, 20, 0.7)',
    zIndex: 200,
  },
  readyContent: { alignItems: 'center', gap: Spacing.md },
  readyIcon: { fontSize: 72, marginBottom: Spacing.sm },
  readyTitle: { fontFamily: Fonts.heading, fontSize: FontSizes['4xl'], color: Colors.gameRocketShooter },
  readySubtitle: { fontFamily: Fonts.body, fontSize: FontSizes.base, color: Colors.textSecondary },
  instructions: { marginTop: Spacing.md, gap: 8, alignItems: 'flex-start' },
  instructionText: { fontFamily: Fonts.body, fontSize: FontSizes.sm, color: Colors.textSecondary },
  highScoreText: { fontFamily: Fonts.heading, fontSize: FontSizes.lg, color: Colors.warning, marginTop: Spacing.sm },
  tapToStart: { fontFamily: Fonts.pixel, fontSize: 12, color: Colors.textPrimary, letterSpacing: 3, marginTop: Spacing.xl },
  powerUp: { position: 'absolute', width: 36, height: 36, justifyContent: 'center', alignItems: 'center', zIndex: 15 },
  powerUpEmoji: { fontSize: 28 },
  screenFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 100,
  },
  energyBarContainer: {
    position: 'absolute',
    left: 8,
    top: '20%',
    height: '60%',
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    zIndex: 10,
  },
  energyBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 3,
  },
});
