import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { Colors } from '../../constants/theme';
import { soundManager } from '../../utils/sounds';
import GradientBackground from '../../components/GradientBackground';
import GameOverModal from '../../components/games/squash-the-bugs/GameOverModal';

import TopBar from '../../components/games/asset-destroy/TopBar';
import WeaponSelector from '../../components/games/asset-destroy/WeaponSelector';
import BulletHole from '../../components/games/asset-destroy/BulletHole';
import Svg, { Polyline } from 'react-native-svg';
import { Fonts } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface Stroke {
  id: string;
  points: {x: number, y: number, time: number}[];
}

const WEAPONS = [
  { id: 'sword', name: 'Sword', emoji: '🗡️', damage: 1 },
  { id: 'gun', name: 'Gun', emoji: '🔫', damage: 1 },
];

const ASSETS = ['💻', '🖥️', '⌨️', '🗄️'];

interface AssetItem {
  id: string;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface BrokenHalf {
  id: string;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vrot: number;
}

export default function AssetDestroyScreen() {
  const router = useRouter();

  const [selectedWeapon, setSelectedWeapon] = useState(WEAPONS[0]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'game-over'>('instructions');

  // Physics state (using refs for high freq updates, frame for render trigger)
  const [frame, setFrame] = useState(0);
  const activeAssetsRef = useRef<AssetItem[]>([]);
  const brokenHalvesRef = useRef<BrokenHalf[]>([]);

  const [bulletHoles, setBulletHoles] = useState<{ id: string; x: number; y: number }[]>([]);

  // Current swipe paths
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeIdRef = useRef<string>('');

  const timerRef = useRef<any>(null);
  const spawnRef = useRef<any>(null);
  const requestRef = useRef<any>(null);

  useEffect(() => {
    soundManager.init();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const updatePhysics = () => {
    if (gameState !== 'playing') return;
    
    // Update assets
    activeAssetsRef.current.forEach(asset => {
      asset.x += asset.vx;
      asset.y += asset.vy;
      asset.vy += 0.4; // Gravity
    });
    
    // Remove off-screen
    activeAssetsRef.current = activeAssetsRef.current.filter(a => a.y < height + 100);
    
    // Update broken halves
    brokenHalvesRef.current.forEach(half => {
      half.x += half.vx;
      half.y += half.vy;
      half.vy += 0.4;
      half.rotation += half.vrot;
    });
    
    brokenHalvesRef.current = brokenHalvesRef.current.filter(h => h.y < height + 100);

    // Decay swipe trails
    const now = Date.now();
    strokesRef.current.forEach(stroke => {
      stroke.points = stroke.points.filter(p => now - p.time < 200);
    });
    strokesRef.current = strokesRef.current.filter(s => s.points.length > 0);

    setFrame(f => f + 1); // trigger re-render
    requestRef.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('game-over');
          soundManager.play('game-over');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    spawnRef.current = setInterval(() => {
      const newAsset = {
        id: Math.random().toString(36).substr(2, 9),
        emoji: ASSETS[Math.floor(Math.random() * ASSETS.length)],
        x: width / 2 + (Math.random() * 200 - 100),
        y: height,
        vx: (Math.random() - 0.5) * 8, // horizontal speed
        vy: -18 - Math.random() * 6, // vertical jump
      };
      activeAssetsRef.current.push(newAsset);
    }, 1000);

    requestRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  const breakAsset = (asset: AssetItem) => {
    // Add two broken halves
    brokenHalvesRef.current.push({
      id: Math.random().toString(36).substr(2, 9),
      emoji: asset.emoji,
      x: asset.x - 20,
      y: asset.y,
      vx: asset.vx - 3,
      vy: asset.vy - 2,
      rotation: 0,
      vrot: -10,
    });
    brokenHalvesRef.current.push({
      id: Math.random().toString(36).substr(2, 9),
      emoji: asset.emoji,
      x: asset.x + 20,
      y: asset.y,
      vx: asset.vx + 3,
      vy: asset.vy - 2,
      rotation: 0,
      vrot: 10,
    });
  };

  const checkHit = (tx: number, ty: number, weapon: string) => {
    const hitRadius = 50;
    let hitCount = 0;

    activeAssetsRef.current = activeAssetsRef.current.filter(asset => {
      const dist = Math.sqrt((asset.x - tx) ** 2 + (asset.y - ty) ** 2);
      if (dist < hitRadius) {
        hitCount++;
        breakAsset(asset);
        return false;
      }
      return true;
    });
    
    if (hitCount > 0) {
      if (weapon === 'gun') soundManager.play('gunfire');
      else soundManager.play('slice');
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setScore(s => s + hitCount);
      setTimeLeft(t => t + hitCount);
    }
  };

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      if (selectedWeapon.id !== 'sword') return;
      const id = Math.random().toString(36).substr(2, 9);
      currentStrokeIdRef.current = id;
      strokesRef.current.push({ id, points: [{ x: e.x, y: e.y, time: Date.now() }] });
    })
    .onChange((e) => {
      if (selectedWeapon.id !== 'sword') return;
      const stroke = strokesRef.current.find(s => s.id === currentStrokeIdRef.current);
      if (stroke) {
        stroke.points.push({ x: e.x, y: e.y, time: Date.now() });
      }
    })
    .onEnd(() => {
      currentStrokeIdRef.current = '';
    })
    .runOnJS(true);

  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      if (selectedWeapon.id !== 'gun') return;
      // Gun shoots instantly
      const id = Math.random().toString(36).substr(2, 9);
      setBulletHoles(prev => [...prev, { id, x: e.x, y: e.y }]);
      soundManager.play('gunfire');
      checkHit(e.x, e.y, 'gun');
    })
    .runOnJS(true);

  // Combine gestures using Race so they don't block each other depending on mode
  const composedGesture = Gesture.Race(panGesture, tapGesture);

  // We need to continuously check hits during pan manually
  useEffect(() => {
    if (selectedWeapon.id === 'sword') {
      const activeStroke = strokesRef.current.find(s => s.id === currentStrokeIdRef.current);
      if (activeStroke && activeStroke.points.length > 0) {
        const lastPoint = activeStroke.points[activeStroke.points.length - 1];
        checkHit(lastPoint.x, lastPoint.y, 'sword');
      }
    }
  }, [frame]); // Using frame to check every tick while swiping

  const removeBulletHole = (id: string) => {
    setBulletHoles(prev => prev.filter(b => b.id !== id));
  };

  const resetGame = () => {
    activeAssetsRef.current = [];
    brokenHalvesRef.current = [];
    strokesRef.current = [];
    setBulletHoles([]);
    setScore(0);
    setTimeLeft(30);
    setGameState('playing');
  };

  const startGame = () => {
    setGameState('playing');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Asset Destroy', headerTransparent: true, headerTintColor: '#fff' }} />
      <GradientBackground colors={[Colors.bgDark, '#7B2FF7']}>
        <GestureDetector gesture={composedGesture}>
          <View style={styles.container}>
            <View style={styles.topArea} pointerEvents="box-none">
              <TopBar timeLeft={timeLeft} score={score} />
            </View>

            {/* Render Active Assets */}
            {activeAssetsRef.current.map(asset => (
              <Text 
                key={asset.id} 
                style={[styles.emoji, { left: asset.x - 40, top: asset.y - 40 }]}
                pointerEvents="none"
              >
                {asset.emoji}
              </Text>
            ))}

            {/* Render Broken Halves */}
            {brokenHalvesRef.current.map(half => (
              <Text 
                key={half.id} 
                style={[
                  styles.emoji, 
                  { 
                    left: half.x - 40, top: half.y - 40, 
                    transform: [{ rotate: `${half.rotation}deg` }, { scale: 0.6 }],
                    opacity: 0.7
                  }
                ]}
                pointerEvents="none"
              >
                {half.emoji}
              </Text>
            ))}

            {/* Render Bullet Holes */}
            {bulletHoles.map(hole => (
              <BulletHole key={hole.id} id={hole.id} x={hole.x} y={hole.y} onComplete={removeBulletHole} />
            ))}

            {/* Render Fading Trails */}
            {strokesRef.current.map(stroke => {
              if (stroke.points.length < 2) return null;
              const pointsString = stroke.points.map(p => `${p.x},${p.y}`).join(' ');
              return (
                <View key={stroke.id} style={StyleSheet.absoluteFill} pointerEvents="none">
                  <Svg height="100%" width="100%">
                    <Polyline
                      points={pointsString}
                      fill="none"
                      stroke="rgba(0, 255, 255, 0.3)"
                      strokeWidth="24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Polyline
                      points={pointsString}
                      fill="none"
                      stroke="rgba(0, 255, 255, 0.6)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Polyline
                      points={pointsString}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              );
            })}

            <View style={styles.bottomArea} pointerEvents="box-none">
              <WeaponSelector
                weapons={WEAPONS}
                selectedWeaponId={selectedWeapon.id}
                onSelect={(w) => setSelectedWeapon(w as any)}
              />
            </View>
          </View>
        </GestureDetector>

        {gameState === 'instructions' && (
          <View style={styles.overlay}>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>HOW TO PLAY</Text>
              <Text style={styles.instructionText}>
                The servers are crashing! Take out your frustration on the hardware.
              </Text>
              <View style={styles.instructionRow}>
                <Text style={styles.instructionEmoji}>🗡️</Text>
                <Text style={styles.instructionText}>Swipe to slice!</Text>
              </View>
              <View style={styles.instructionRow}>
                <Text style={styles.instructionEmoji}>🔫</Text>
                <Text style={styles.instructionText}>Tap to shoot!</Text>
              </View>
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startButtonText}>START SMASHING</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {gameState === 'game-over' && (
          <GameOverModal
            score={score}
            onPlayAgain={resetGame}
            onExit={() => router.back()}
            highScore={0}
            bugsSquashed={0}
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
  topArea: {
    height: '20%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    paddingTop: 80, // Safe area for header
    zIndex: 100,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
    zIndex: 100,
  },
  emoji: {
    position: 'absolute',
    fontSize: 80,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  instructionEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  startButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  startButtonText: {
    fontFamily: Fonts.pixel,
    color: '#FFF',
    fontSize: 16,
  }
});
