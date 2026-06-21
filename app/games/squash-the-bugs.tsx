/**
 * Squash the Bugs — Full game screen
 *
 * Bugs fall from the top of the screen. Tap to squash them before
 * they reach PRODUCTION (the danger zone at the bottom).
 *
 * Power-ups:
 *   ⏪ Git Revert  — clears all bugs on screen
 *   🔍 Git Bisect — slows all bugs for 5 seconds
 *
 * Boss bug:
 *   👀 Heisenbug — teleports every 1.5s, worth 100pts, costs 2 lives
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, AppState, TouchableOpacity } from 'react-native';
import { useRouter, Stack, useNavigation } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import Bug from '../../components/games/squash-the-bugs/Bug';
import BugSplat from '../../components/games/squash-the-bugs/BugSplat';
import GameHUD from '../../components/games/squash-the-bugs/GameHUD';
import PowerUpBar from '../../components/games/squash-the-bugs/PowerUpBar';
import DangerZone from '../../components/games/squash-the-bugs/DangerZone';
import GameOverModal from '../../components/games/squash-the-bugs/GameOverModal';
import PauseModal from '../../components/games/PauseModal';
import { BugData, SplatData, GameState } from '../../components/games/squash-the-bugs/types';
import {
  BUG_CONFIGS,
  DIFFICULTY_TIERS,
  getRandomBugVariant,
  generateId,
} from '../../utils/squashTheBugs';
import { soundManager } from '../../utils/sounds';
import { Colors, Fonts, FontSizes, Spacing } from '../../constants/theme';

const HIGH_SCORE_KEY = '@devbusters_squash_high_score';
const GIT_REVERT_COOLDOWN = 30_000;   // 30s
const GIT_BISECT_COOLDOWN = 20_000;   // 20s
const GIT_BISECT_DURATION = 5_000;    // 5s active
const MAX_LIVES = 5;

const INITIAL_GAME_STATE: GameState = {
  status: 'ready',
  score: 0,
  lives: MAX_LIVES,
  maxLives: MAX_LIVES,
  difficulty: 1,
  bugsSquashed: 0,
  highScore: 0,
  startedAt: 0,
};

const STREAK_WINDOW = 1500; // 1.5 seconds between squashes to maintain streak

export default function SquashTheBugsScreen() {
  const router = useRouter();

  // ── Core state ─────────────────────────────────────────────────────
  const navigation = useNavigation();
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);

  // Intercept back gesture
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (currentGameStateRef.current !== 'playing') return;
      e.preventDefault();
      setGameState(prev => ({ ...prev, status: 'paused' }));
    });
    return unsubscribe;
  }, [navigation]);
  const [bugs, setBugs] = useState<BugData[]>([]);
  const [splats, setSplats] = useState<SplatData[]>([]);

  // ── Power-ups ──────────────────────────────────────────────────────
  const [slowMode, setSlowMode] = useState(false);
  const [gitRevertLastUsed, setGitRevertLastUsed] = useState(0);
  const [gitBisectLastUsed, setGitBisectLastUsed] = useState(0);
  const [gitRevertRemaining, setGitRevertRemaining] = useState(0);
  const [gitBisectRemaining, setGitBisectRemaining] = useState(0);

  // ── Streak system ──────────────────────────────────────────────────
  const [streak, setStreak] = useState(0);
  const lastSquashTimeRef = useRef(0);

  // ── Layout ─────────────────────────────────────────────────────────
  const [gameAreaSize, setGameAreaSize] = useState({ width: 0, height: 0 });

  // ── Refs (avoid stale closures in timers) ──────────────────────────
  const currentGameStateRef = useRef(gameState.status);
  
  // AppState listener for auto-pause
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState.match(/inactive|background/) && currentGameStateRef.current === 'playing') {
        setGameState(prev => ({ ...prev, status: 'paused' }));
      }
    });
    return () => subscription.remove();
  }, []);

  // Update ref
  useEffect(() => {
    currentGameStateRef.current = gameState.status;
  }, [gameState.status]);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const bugsRef = useRef(bugs);
  bugsRef.current = bugs;
  const slowModeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const difficultyTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // ── Screen shake ───────────────────────────────────────────────────
  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // ── Load high score + init sounds ──────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(HIGH_SCORE_KEY);
        if (stored) {
          setGameState((prev) => ({ ...prev, highScore: parseInt(stored, 10) }));
        }
      } catch {}
      await soundManager.init();
    })();

    return () => {
      soundManager.cleanup();
      clearInterval(spawnTimerRef.current);
      clearInterval(difficultyTimerRef.current);
      clearInterval(cooldownTimerRef.current);
      clearTimeout(slowModeTimerRef.current);
    };
  }, []);

  // ── Spawn loop ─────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState.status !== 'playing' || gameAreaSize.width === 0) return;

    const tier = DIFFICULTY_TIERS[Math.min(gameState.difficulty, 5)];

    clearInterval(spawnTimerRef.current);
    spawnTimerRef.current = setInterval(() => {
      if (bugsRef.current.length >= tier.maxBugsOnScreen) return;

      const variant = getRandomBugVariant(gameStateRef.current.difficulty);
      const config = BUG_CONFIGS[variant];
      const padding = config.size;
      const x = padding + Math.random() * (gameAreaSize.width - padding * 2);

      const newBug: BugData = {
        id: generateId(),
        variant,
        x,
        spawnedAt: Date.now(),
        config,
      };

      setBugs((prev) => [...prev, newBug]);
    }, tier.spawnInterval);

    return () => clearInterval(spawnTimerRef.current);
  }, [gameState.status, gameState.difficulty, gameAreaSize.width]);

  // ── Difficulty ramp (every second) ─────────────────────────────────
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    clearInterval(difficultyTimerRef.current);
    difficultyTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - gameStateRef.current.startedAt) / 1000;
      const newDifficulty = Math.min(5, Math.floor(elapsed / 30) + 1);
      if (newDifficulty !== gameStateRef.current.difficulty) {
        setGameState((prev) => ({ ...prev, difficulty: newDifficulty }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }, 1000);

    return () => clearInterval(difficultyTimerRef.current);
  }, [gameState.status]);

  // ── Cooldown ticker (updates remaining seconds) ────────────────────
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      const now = Date.now();
      setGitRevertRemaining(
        Math.max(0, Math.ceil((GIT_REVERT_COOLDOWN - (now - gitRevertLastUsed)) / 1000)),
      );
      setGitBisectRemaining(
        Math.max(0, Math.ceil((GIT_BISECT_COOLDOWN - (now - gitBisectLastUsed)) / 1000)),
      );
    }, 250);

    return () => clearInterval(cooldownTimerRef.current);
  }, [gameState.status, gitRevertLastUsed, gitBisectLastUsed]);

  // ── Handlers ───────────────────────────────────────────────────────

  const startGame = useCallback(() => {
    setGameState({
      ...INITIAL_GAME_STATE,
      status: 'playing',
      startedAt: Date.now(),
      highScore: gameStateRef.current.highScore,
    });
    setBugs([]);
    setSplats([]);
    setSlowMode(false);
    setStreak(0);
    lastSquashTimeRef.current = 0;
    setGitRevertLastUsed(0);
    setGitBisectLastUsed(0);
    setGitRevertRemaining(0);
    setGitBisectRemaining(0);
  }, []);

  const endGame = useCallback(async (finalState: GameState) => {
    clearInterval(spawnTimerRef.current);
    clearInterval(difficultyTimerRef.current);

    const isNewHigh = finalState.score > finalState.highScore;
    const newHighScore = isNewHigh ? finalState.score : finalState.highScore;

    setGameState((prev) => ({
      ...prev,
      status: 'gameOver',
      highScore: newHighScore,
    }));

    if (isNewHigh) {
      try {
        await AsyncStorage.setItem(HIGH_SCORE_KEY, newHighScore.toString());
      } catch {}
    }

    soundManager.play('game-over');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  const handleBugSquash = useCallback(
    (id: string, x: number, y: number, points: number) => {
      // Remove bug
      setBugs((prev) => prev.filter((b) => b.id !== id));

      // Add splat
      const splatId = generateId();
      setSplats((prev) => [...prev, { id: splatId, x, y, emoji: '💥', createdAt: Date.now() }]);

      // Streak logic
      const now = Date.now();
      const timeSinceLast = now - lastSquashTimeRef.current;
      lastSquashTimeRef.current = now;

      let currentStreak = 1;
      if (timeSinceLast < STREAK_WINDOW && timeSinceLast > 0) {
        setStreak(prev => {
          currentStreak = prev + 1;
          return currentStreak;
        });
      } else {
        setStreak(1);
        currentStreak = 1;
      }

      // Bonus points for streaks (double points at 3+, triple at 5+)
      const multiplier = currentStreak >= 5 ? 3 : currentStreak >= 3 ? 2 : 1;
      const totalPoints = points * multiplier;

      // Update score
      setGameState((prev) => ({
        ...prev,
        score: prev.score + totalPoints,
        bugsSquashed: prev.bugsSquashed + 1,
      }));

      soundManager.play('squash');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [],
  );

  const handleBugMissed = useCallback(
    (id: string, livesLost: number) => {
      setBugs((prev) => prev.filter((b) => b.id !== id));

      setGameState((prev) => {
        const newLives = Math.max(0, prev.lives - livesLost);
        if (newLives <= 0) {
          // Schedule endGame on next tick to avoid state update in callback
          setTimeout(() => endGame({ ...prev, lives: 0 }), 0);
        }
        return { ...prev, lives: newLives };
      });

      // Screen shake
      shakeX.value = withSequence(
        withTiming(-8, { duration: 40 }),
        withTiming(8, { duration: 40 }),
        withTiming(-5, { duration: 40 }),
        withTiming(5, { duration: 40 }),
        withTiming(0, { duration: 40 }),
      );

      soundManager.play('life-lost');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    [endGame],
  );

  const handleSplatComplete = useCallback((id: string) => {
    setSplats((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ── Power-up handlers ──────────────────────────────────────────────

  const handleGitRevert = useCallback(() => {
    const now = Date.now();
    if (now - gitRevertLastUsed < GIT_REVERT_COOLDOWN) return;

    // Bonus points for all cleared bugs
    const bonusPoints = bugsRef.current.length * 5;
    const clearedCount = bugsRef.current.length;

    setBugs([]);
    setGameState((prev) => ({
      ...prev,
      score: prev.score + bonusPoints,
      bugsSquashed: prev.bugsSquashed + clearedCount,
    }));
    setGitRevertLastUsed(now);

    soundManager.play('powerup');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [gitRevertLastUsed]);

  const handleGitBisect = useCallback(() => {
    const now = Date.now();
    if (now - gitBisectLastUsed < GIT_BISECT_COOLDOWN) return;

    setSlowMode(true);
    setGitBisectLastUsed(now);

    clearTimeout(slowModeTimerRef.current);
    slowModeTimerRef.current = setTimeout(() => {
      setSlowMode(false);
    }, GIT_BISECT_DURATION);

    soundManager.play('powerup');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [gitBisectLastUsed]);

  // ── Layout measurement ─────────────────────────────────────────────
  const onGameAreaLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      setGameAreaSize({
        width: e.nativeEvent.layout.width,
        height: e.nativeEvent.layout.height,
      });
    },
    [],
  );

  const speedMultiplier = DIFFICULTY_TIERS[Math.min(gameState.difficulty, 5)].speedMultiplier;
  const isNewHighScore = gameState.score > gameState.highScore && gameState.status === 'gameOver';

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <LinearGradient
      colors={[Colors.bgDark, '#0A2A2A', Colors.bgDark]}
      style={styles.root}
    >
      <Stack.Screen 
        options={{ 
          title: 'Squash the Bugs', 
          headerTransparent: true, 
          headerTintColor: '#fff',
          headerRight: () => (
            gameState.status === 'playing' ? (
              <TouchableOpacity onPress={() => setGameState(prev => ({ ...prev, status: 'paused' }))} style={{ marginRight: 15 }}>
                <Text style={{ fontSize: 24, color: '#FFF' }}>⏸️</Text>
              </TouchableOpacity>
            ) : null
          )
        }} 
      />

      {/* HUD */}
      {gameState.status === 'playing' && (
        <GameHUD
          score={gameState.score}
          lives={gameState.lives}
          maxLives={gameState.maxLives}
          difficulty={gameState.difficulty}
          onPause={() => setGameState(prev => ({ ...prev, status: 'paused' }))}
        />
      )}

      {/* Game area */}
      <Animated.View
        style={[styles.gameArea, shakeStyle]}
        onLayout={onGameAreaLayout}
      >
        {/* Slow mode overlay */}
        {slowMode && <View style={styles.slowOverlay} pointerEvents="none" />}

        {/* Streak display */}
        {streak >= 3 && gameState.status === 'playing' && (
          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>x{streak} STREAK!</Text>
            {streak >= 5 && <Text style={styles.streakBonus}>3x POINTS!</Text>}
            {streak >= 3 && streak < 5 && <Text style={styles.streakBonus}>2x POINTS!</Text>}
          </View>
        )}

        {/* Bugs */}
        {bugs.map((bug) => (
          <Bug
            key={bug.id}
            bug={bug}
            gameAreaHeight={gameAreaSize.height}
            gameAreaWidth={gameAreaSize.width}
            speedMultiplier={speedMultiplier}
            slowMode={slowMode}
            onSquash={handleBugSquash}
            onMissed={handleBugMissed}
          />
        ))}

        {/* Splats */}
        {splats.map((splat) => (
          <BugSplat
            key={splat.id}
            id={splat.id}
            x={splat.x}
            y={splat.y}
            onComplete={handleSplatComplete}
          />
        ))}

        {/* Danger zone */}
        {gameState.status === 'playing' && <DangerZone />}

        {/* ── READY overlay ───────────────────────────────────────── */}
        {gameState.status === 'ready' && (
          <Pressable style={styles.readyOverlay} onPress={startGame}>
            <Animated.View entering={FadeInDown.duration(600)} style={styles.readyContent}>
              <Text style={styles.readyIcon}>🐛</Text>
              <Text style={styles.readyTitle}>Squash the Bugs</Text>
              <Text style={styles.readySubtitle}>
                Tap bugs before they reach production!
              </Text>

              <View style={styles.readyInstructions}>
                <Text style={styles.instructionText}>🐛🪲🦗  Tap bugs to squash</Text>
                <Text style={styles.instructionText}>⏪  Git Revert — clear all bugs</Text>
                <Text style={styles.instructionText}>🔍  Git Bisect — slow bugs 5s</Text>
                <Text style={styles.instructionText}>👀  Heisenbug — bonus 100pts!</Text>
              </View>

              {gameState.highScore > 0 && (
                <Text style={styles.highScoreText}>
                  🏆 Best: {gameState.highScore.toLocaleString()}
                </Text>
              )}

              <Animated.Text
                entering={FadeIn.delay(400).duration(600)}
                style={styles.tapToStart}
              >
                TAP TO START
              </Animated.Text>
            </Animated.View>
          </Pressable>
        )}
      </Animated.View>

      {/* Power-up bar */}
      {gameState.status === 'playing' && (
        <PowerUpBar
          gitRevertReady={gitRevertRemaining === 0}
          gitBisectReady={gitBisectRemaining === 0 && !slowMode}
          gitRevertCooldown={GIT_REVERT_COOLDOWN / 1000}
          gitBisectCooldown={GIT_BISECT_COOLDOWN / 1000}
          gitRevertRemaining={gitRevertRemaining}
          gitBisectRemaining={gitBisectRemaining}
          slowModeActive={slowMode}
          onGitRevert={handleGitRevert}
          onGitBisect={handleGitBisect}
        />
      )}

      {/* Game-over modal */}
      {gameState.status === 'gameOver' && (
        <GameOverModal
          score={gameState.score}
          highScore={Math.max(gameState.score, gameState.highScore)}
          bugsSquashed={gameState.bugsSquashed}
          difficulty={gameState.difficulty}
          isNewHighScore={isNewHighScore}
          onPlayAgain={startGame}
          onExit={() => router.back()}
        />
      )}

      {/* Pause Modal */}
      <PauseModal 
        visible={gameState.status === 'paused'}
        onResume={() => setGameState(prev => ({ ...prev, status: 'playing' }))}
        onExit={() => router.back()}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gameArea: {
    flex: 1,
    overflow: 'hidden',
  },
  slowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    zIndex: 5,
  },
  streakContainer: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  streakText: {
    fontFamily: Fonts.pixel,
    fontSize: 16,
    color: Colors.warning,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  streakBonus: {
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: Colors.accent,
    marginTop: 2,
  },
  // ── Ready overlay ────────────────────────────────────────────────
  readyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 20, 0.65)',
    zIndex: 200,
    paddingHorizontal: Spacing['2xl'],
  },
  readyContent: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  readyIcon: {
    fontSize: 72,
    marginBottom: Spacing.sm,
  },
  readyTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes['4xl'],
    color: Colors.accent,
    textAlign: 'center',
  },
  readySubtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  readyInstructions: {
    gap: 8,
    marginTop: Spacing.md,
    alignItems: 'flex-start',
  },
  instructionText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  highScoreText: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.lg,
    color: Colors.warning,
    marginTop: Spacing.sm,
  },
  tapToStart: {
    fontFamily: Fonts.pixel,
    fontSize: 12,
    color: Colors.textPrimary,
    letterSpacing: 3,
    marginTop: Spacing.xl,
    textAlign: 'center',
  },
});
