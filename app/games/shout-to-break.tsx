import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withSpring, 
  withRepeat,
  Easing
} from 'react-native-reanimated';
import { Colors, Fonts } from '../../constants/theme';
import GradientBackground from '../../components/GradientBackground';
import GameOverModal from '../../components/games/squash-the-bugs/GameOverModal';
import { soundManager } from '../../utils/sounds';

const { width } = Dimensions.get('window');

const ASSETS = [
  { id: 1, emoji: '🪟', broken: '🏚️', name: 'Window', maxHealth: 100 },
  { id: 2, emoji: '🍷', broken: '💥', name: 'Wine Glass', maxHealth: 60 },
  { id: 3, emoji: '🖥️', broken: '💻', name: 'Monitor', maxHealth: 150 },
  { id: 4, emoji: '🏺', broken: '🏺💥', name: 'Ancient Pot', maxHealth: 80 },
];

export default function ShoutToBreakScreen() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'game-over'>('instructions');
  const gameStateRef = useRef(gameState);
  
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [health, setHealth] = useState(ASSETS[0].maxHealth);
  
  const [isBroken, setIsBroken] = useState(false);
  const isBrokenRef = useRef(isBroken);

  // Combo system
  const [combo, setCombo] = useState(0);
  const lastShatterTimeRef = useRef(0);
  const COMBO_WINDOW = 4000; // 4 seconds to keep combo alive

  // Sync refs
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  useEffect(() => {
    isBrokenRef.current = isBroken;
  }, [isBroken]);
  
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const recordingRef = useRef<Audio.Recording | null>(null);
  
  // Audio Metering state
  const [dbLevel, setDbLevel] = useState(-160);
  const maxDb = 0;
  const minDb = -60; // ignore very quiet noises

  const shakeValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startGame = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        const response = await requestPermission();
        if (response.status !== 'granted') {
          alert('Microphone permission is required to play this game!');
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const options = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      };

      const { recording } = await Audio.Recording.createAsync(
        options,
        (status) => {
          if (status.metering !== undefined) {
            handleAudioLevel(status.metering);
          }
        },
        50 // check every 50ms for high responsiveness
      );

      recordingRef.current = recording;
      
      setScore(0);
      setTimeLeft(30);
      setCurrentAssetIndex(0);
      setHealth(ASSETS[0].maxHealth);
      setIsBroken(false);
      setCombo(0);
      lastShatterTimeRef.current = 0;
      setGameState('playing');

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const endGame = () => {
    setGameState('game-over');
    soundManager.play('game-over');
    stopRecording();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const stopRecording = async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      } catch (err) {
        console.error('Failed to stop recording', err);
      }
    }
  };

  const handleAudioLevel = (db: number) => {
    if (gameStateRef.current !== 'playing' || isBrokenRef.current) return;
    
    setDbLevel(db);

    // Normalize db to 0-1 range (e.g. -60 to 0)
    let normalized = (db - minDb) / (maxDb - minDb);
    if (normalized < 0) normalized = 0;
    if (normalized > 1) normalized = 1;

    // Trigger visual shake based on loudness
    if (normalized > 0.3) {
      shakeValue.value = withSequence(
        withTiming(10 * normalized, { duration: 25, easing: Easing.linear }),
        withTiming(-10 * normalized, { duration: 50, easing: Easing.linear }),
        withTiming(0, { duration: 25, easing: Easing.linear })
      );
    }

    // Apply damage if loud enough
    if (normalized > 0.5) { // Needs to be decently loud to do damage
      const damage = normalized * 10; // Max 10 damage per tick (50ms)
      setHealth((prev) => {
        if (prev <= 0) return 0;
        const newHealth = prev - damage;
        if (newHealth <= 0) {
          shatterCurrentAsset();
          return 0;
        }
        return newHealth;
      });
    }
  };

  const shatterCurrentAsset = () => {
    setIsBroken(true);
    isBrokenRef.current = true;
    soundManager.play('shatter');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Combo logic
    const now = Date.now();
    const timeSinceLast = now - lastShatterTimeRef.current;
    lastShatterTimeRef.current = now;

    let newCombo = 1;
    if (timeSinceLast < COMBO_WINDOW && timeSinceLast > 0) {
      setCombo(prev => {
        newCombo = prev + 1;
        return newCombo;
      });
    } else {
      setCombo(1);
      newCombo = 1;
    }

    // Score: base 1 * combo multiplier
    const points = newCombo;
    setScore(s => s + points);

    // Time bonus: +5s per shatter
    setTimeLeft(t => t + 5);
    
    // Animate break
    scaleValue.value = withSequence(
      withTiming(1.5, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );

    // Load next asset after delay
    setTimeout(() => {
      setCurrentAssetIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % ASSETS.length;
        setHealth(ASSETS[nextIndex].maxHealth);
        setIsBroken(false);
        return nextIndex;
      });
    }, 1000);
  };

  const assetStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: shakeValue.value },
        { translateY: shakeValue.value * (Math.random() > 0.5 ? 1 : -1) },
        { scale: scaleValue.value }
      ]
    };
  });

  const currentAsset = ASSETS[currentAssetIndex];
  const healthPercentage = Math.max(0, health / currentAsset.maxHealth) * 100;
  
  // Calculate noise bar width (0-100%)
  const noisePercentage = Math.max(0, Math.min(100, ((dbLevel - minDb) / (maxDb - minDb)) * 100));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GradientBackground colors={['#1a0b2e', '#4b1d52']} style={styles.container}>
        
        {/* Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>◀</Text>
          </TouchableOpacity>
          <View style={styles.statsBox}>
            <Text style={styles.statsLabel}>SCORE</Text>
            <Text style={styles.statsValue}>{score}</Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsLabel}>TIME</Text>
            <Text style={[styles.statsValue, timeLeft <= 10 && styles.statsValueDanger]}>
              {timeLeft}s
            </Text>
          </View>
        </View>

        {/* Game Area */}
        <View style={styles.gameArea}>
          <Text style={styles.assetName}>{currentAsset.name}</Text>
          
          <View style={styles.healthBarContainer}>
            <View style={[styles.healthBar, { width: `${healthPercentage}%` }]} />
          </View>

          <Animated.View style={[styles.assetContainer, assetStyle]}>
            <Text style={styles.emoji}>
              {isBroken ? currentAsset.broken : currentAsset.emoji}
            </Text>
            {/* Crack overlays */}
            {!isBroken && healthPercentage <= 75 && (
              <Text style={[styles.crackOverlay, { opacity: healthPercentage <= 25 ? 1 : healthPercentage <= 50 ? 0.7 : 0.4 }]}>
                {healthPercentage <= 25 ? '💥' : healthPercentage <= 50 ? '⚡' : '🔸'}
              </Text>
            )}
          </Animated.View>

          {/* Combo Display */}
          {combo > 1 && (
            <Text style={styles.comboText}>x{combo} COMBO!</Text>
          )}

          {/* Volume Meter */}
          <View style={styles.meterContainer}>
            <Text style={styles.meterLabel}>YOUR VOLUME</Text>
            <View style={styles.meterBarBg}>
              <View 
                style={[
                  styles.meterBarFill, 
                  { 
                    width: `${noisePercentage}%`,
                    backgroundColor: noisePercentage > 80 ? Colors.danger : noisePercentage > 50 ? Colors.warning : Colors.accent
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Instructions Overlay */}
        {gameState === 'instructions' && (
          <View style={styles.overlay}>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>SHOUT TO BREAK</Text>
              <Text style={styles.instructionText}>
                The louder you scream into your microphone, the faster you break things! 🗣️💥
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startButtonText}>GRANT MIC & PLAY</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Game Over Modal */}
        {gameState === 'game-over' && (
          <GameOverModal
            score={score}
            onPlayAgain={startGame}
            onExit={() => router.back()}
            highScore={0}
            bugsSquashed={score}
            difficulty={1}
            isNewHighScore={false}
          />
        )}
      </GradientBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#FFF',
    fontSize: 20,
  },
  statsBox: {
    alignItems: 'center',
  },
  statsLabel: {
    color: '#AAA',
    fontFamily: Fonts.pixel,
    fontSize: 10,
    marginBottom: 4,
  },
  statsValue: {
    color: '#FFF',
    fontFamily: Fonts.pixel,
    fontSize: 20,
  },
  statsValueDanger: {
    color: Colors.danger,
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  assetName: {
    fontFamily: Fonts.pixel,
    fontSize: 24,
    color: '#FFF',
    marginBottom: 20,
  },
  healthBarContainer: {
    width: width * 0.8,
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#555',
  },
  healthBar: {
    height: '100%',
    backgroundColor: Colors.danger,
  },
  assetContainer: {
    width: width * 0.6,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  emoji: {
    fontSize: 150,
  },
  crackOverlay: {
    position: 'absolute',
    fontSize: 60,
  },
  comboText: {
    fontFamily: Fonts.pixel,
    fontSize: 18,
    color: Colors.warning,
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  meterContainer: {
    width: '100%',
    alignItems: 'center',
  },
  meterLabel: {
    fontFamily: Fonts.pixel,
    fontSize: 14,
    color: '#FFF',
    marginBottom: 10,
  },
  meterBarBg: {
    width: width * 0.9,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  meterBarFill: {
    height: '100%',
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  instructionCard: {
    backgroundColor: Colors.bgCard,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '85%',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  instructionTitle: {
    fontFamily: Fonts.pixel,
    fontSize: 24,
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: '#CCC',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  startButtonText: {
    fontFamily: Fonts.pixel,
    color: '#FFF',
    fontSize: 16,
  }
});
