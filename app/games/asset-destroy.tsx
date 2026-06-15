import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

import { Colors } from '../../constants/theme';
import { soundManager } from '../../utils/sounds';
import GradientBackground from '../../components/GradientBackground';
import GameOverModal from '../../components/games/squash-the-bugs/GameOverModal'; // Reuse for now

import { Weapon, TargetAsset } from '../../components/games/asset-destroy/types';
import WeaponSelector from '../../components/games/asset-destroy/WeaponSelector';
import HealthBar from '../../components/games/asset-destroy/HealthBar';
import Asset from '../../components/games/asset-destroy/Asset';
import HitEffect from '../../components/games/asset-destroy/HitEffect';

const { width, height } = Dimensions.get('window');

const WEAPONS: Weapon[] = [
  { id: 'fist', name: 'Fist', emoji: '👊', damage: 1 },
  { id: 'bat', name: 'Bat', emoji: '🏏', damage: 3 },
  { id: 'hammer', name: 'Hammer', emoji: '🔨', damage: 5 },
  { id: 'gun', name: 'Gun', emoji: '🔫', damage: 10 },
];

const ASSETS: TargetAsset[] = [
  { id: 'monitor', name: 'Monitor', emoji: '🖥️', maxHealth: 20 },
  { id: 'laptop', name: 'Laptop', emoji: '💻', maxHealth: 30 },
  { id: 'keyboard', name: 'Keyboard', emoji: '⌨️', maxHealth: 15 },
  { id: 'server', name: 'Server Rack', emoji: '🗄️', maxHealth: 100 },
];

const HIT_TEXTS = ['BAM!', 'POW!', 'SMACK!', 'CRACK!', 'BOOM!'];

export default function AssetDestroyScreen() {
  const router = useRouter();

  const [selectedWeapon, setSelectedWeapon] = useState<Weapon>(WEAPONS[0]);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const currentAsset = ASSETS[currentAssetIndex];

  const [health, setHealth] = useState(currentAsset.maxHealth);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const [hitEffects, setHitEffects] = useState<{ id: string; x: number; y: number; text: string }[]>([]);

  // Simple screen shake state for when asset breaks
  const screenShakeX = useSharedValue(0);
  const screenShakeY = useSharedValue(0);

  useEffect(() => {
    soundManager.init();
    return () => {
      // Don't fully cleanup sounds if we want them globally available, 
      // but if we do, it's handled by soundManager centrally.
    };
  }, []);

  const triggerScreenShake = () => {
    screenShakeX.value = withTiming(20, { duration: 50 }, () => {
      screenShakeX.value = withTiming(-20, { duration: 50 }, () => {
        screenShakeX.value = withTiming(0, { duration: 50 });
      });
    });
    screenShakeY.value = withTiming(20, { duration: 50 }, () => {
      screenShakeY.value = withTiming(-20, { duration: 50 }, () => {
        screenShakeY.value = withTiming(0, { duration: 50 });
      });
    });
  };

  const handleHit = (x: number, y: number) => {
    if (health <= 0 || isGameOver) return;

    // Apply damage
    const newHealth = Math.max(0, health - selectedWeapon.damage);
    setHealth(newHealth);

    // Feedback
    const effectId = Math.random().toString(36).substr(2, 9);
    const text = HIT_TEXTS[Math.floor(Math.random() * HIT_TEXTS.length)];
    setHitEffects((prev) => [...prev, { id: effectId, x, y, text }]);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (selectedWeapon.id === 'gun') {
      soundManager.play('laser'); // using laser as gun proxy for now
    } else {
      soundManager.play('smack');
    }

    // Check if broken
    if (newHealth === 0) {
      soundManager.play('shatter');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      triggerScreenShake();
      
      // Delay to show broken state, then move to next asset or end game
      setTimeout(() => {
        setScore((prev) => prev + currentAsset.maxHealth);
        if (currentAssetIndex < ASSETS.length - 1) {
          // Next asset
          const nextIndex = currentAssetIndex + 1;
          setCurrentAssetIndex(nextIndex);
          setHealth(ASSETS[nextIndex].maxHealth);
        } else {
          // All destroyed!
          setIsGameOver(true);
        }
      }, 1500);
    }
  };

  const tapGesture = Gesture.Tap().onEnd((e) => {
    // Only register hits roughly in the center where the asset is
    if (e.y > height * 0.2 && e.y < height * 0.7) {
      // Must use runOnJS to call react state updates from gesture thread if needed, 
      // but onEnd without runOnJS modifier often just runs on JS thread anyway. 
      // To be safe:
    }
  }).runOnJS(true).onEnd((e) => {
    handleHit(e.x, e.y);
  });

  const removeHitEffect = (id: string) => {
    setHitEffects((prev) => prev.filter((ef) => ef.id !== id));
  };

  const animatedScreenStyle = useAnimatedStyle(() => ({
    flex: 1,
    transform: [
      { translateX: screenShakeX.value },
      { translateY: screenShakeY.value }
    ]
  }));

  const resetGame = () => {
    setCurrentAssetIndex(0);
    setHealth(ASSETS[0].maxHealth);
    setScore(0);
    setIsGameOver(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Asset Destroy', headerTransparent: true, headerTintColor: '#fff' }} />
      <GradientBackground color1={Colors.bgDark} color2="#7B2FF7">
        <GestureDetector gesture={tapGesture}>
          <Animated.View style={animatedScreenStyle}>
            <View style={styles.topArea}>
              <HealthBar health={health} maxHealth={currentAsset.maxHealth} />
            </View>

            <View style={styles.assetArea}>
              <Asset asset={currentAsset} health={health} />
              {hitEffects.map((ef) => (
                <HitEffect
                  key={ef.id}
                  id={ef.id}
                  x={ef.x}
                  y={ef.y}
                  text={ef.text}
                  onComplete={removeHitEffect}
                />
              ))}
            </View>

            <View style={styles.bottomArea}>
              <WeaponSelector
                weapons={WEAPONS}
                selectedWeaponId={selectedWeapon.id}
                onSelect={setSelectedWeapon}
              />
            </View>
          </Animated.View>
        </GestureDetector>

        {isGameOver && (
          <GameOverModal
            score={score}
            onPlayAgain={resetGame}
            onExit={() => router.back()}
            highScore={0}
            bugsSquashed={0}
            difficulty={'normal'}
            isNewHighScore={false}
          />
        )}
      </GradientBackground>
    </>
  );
}

const styles = StyleSheet.create({
  topArea: {
    height: '25%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingTop: 80, // Safe area for header
  },
  assetArea: {
    height: '55%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomArea: {
    height: '20%',
    justifyContent: 'flex-end',
    paddingBottom: 30,
  },
});
