import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withSpring, 
  runOnJS
} from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import { Colors, Fonts } from '../../constants/theme';
import GradientBackground from '../../components/GradientBackground';
import GameOverModal from '../../components/games/squash-the-bugs/GameOverModal';
import { soundManager } from '../../utils/sounds';

const { width } = Dimensions.get('window');

const BOSS_AVATARS = ['👨‍💼', '👩‍💼', '🧑‍💼', '🧛‍♂️', '🧟', '👹', '🤡'];
const FEMALE_AVATARS = ['👩‍💼'];
const MALE_AVATARS = ['👨‍💼', '🧛‍♂️'];

const GRID_SIZE = 3; // 3x3
const TOTAL_HOLES = GRID_SIZE * GRID_SIZE;

const ANNOYING_DIALOGUES = [
  "I need the work yesterday!",
  "You don't have to stay after 6, but finish the work before leaving.",
  "Let's touch base offline.",
  "I need you to give 110%.",
  "Think outside the box!",
  "We're a family here.",
  "I'm gonna need you to come in on Saturday."
];

const OUCH_DIALOGUES = [
  "Ouch!",
  "My bonus!",
  "HR will hear about this!",
  "That's coming out of your paycheck!",
  "Ugh!",
  "Aaargh!"
];

type GameState = 'setup' | 'playing' | 'game-over';

export default function WhackYourBossScreen() {
  const router = useRouter();
  
  const [gameState, setGameState] = useState<GameState>('setup');
  const [bossName, setBossName] = useState('');
  const [bossAvatar, setBossAvatar] = useState(BOSS_AVATARS[0]);
  
  const [frustration, setFrustration] = useState(100);
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [activeDialogue, setActiveDialogue] = useState<{ text: string, type: 'command' | 'pain' } | null>(null);
  const [score, setScore] = useState(0);
  
  const [maleVoice, setMaleVoice] = useState<string | undefined>();
  const [femaleVoice, setFemaleVoice] = useState<string | undefined>();

  const gameLoopRef = useRef<any>(null);

  useEffect(() => {
    const loadVoices = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const enVoices = voices.filter(v => v.language.startsWith('en'));
        
        const female = enVoices.find(v => {
          const n = v.name.toLowerCase();
          const id = v.identifier.toLowerCase();
          return id.includes('female') || ['samantha', 'karen', 'victoria', 'moira'].some(name => n.includes(name));
        });
        
        const male = enVoices.find(v => {
          const n = v.name.toLowerCase();
          const id = v.identifier.toLowerCase();
          return (id.includes('male') && !id.includes('female')) || 
                 ['alex', 'daniel', 'arthur', 'aaron', 'fred'].some(name => n.includes(name));
        });
        
        if (female) setFemaleVoice(female.identifier);
        if (male) setMaleVoice(male.identifier);
      } catch (e) {
        console.log('Failed to load voices', e);
      }
    };
    loadVoices();

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      Speech.stop();
    };
  }, []);

  const startGame = () => {
    if (!bossName.trim()) {
      setBossName('The Boss');
    }
    setFrustration(100);
    setScore(0);
    setGameState('playing');
    
    // Start mole loop
    gameLoopRef.current = setInterval(() => {
      // Pick a random hole
      const randomHole = Math.floor(Math.random() * TOTAL_HOLES);
      setActiveHole(randomHole);
      
      // Say annoying text
      if (Math.random() > 0.4) {
        const text = ANNOYING_DIALOGUES[Math.floor(Math.random() * ANNOYING_DIALOGUES.length)];
        setActiveDialogue({ text, type: 'command' });
        
        const isFemale = FEMALE_AVATARS.includes(bossAvatar);
        const isMale = MALE_AVATARS.includes(bossAvatar);
        const voiceId = isFemale ? femaleVoice : isMale ? maleVoice : undefined;
        // Adjust pitch if voice isn't found
        const pitch = isFemale ? 1.1 : isMale ? 0.6 : 1.0;
        
        Speech.speak(text, { pitch, rate: 1.0, voice: voiceId });
      } else {
        setActiveDialogue(null);
      }
      
      // Hide after a short duration
      setTimeout(() => {
        setActiveHole((current) => (current === randomHole ? null : current));
      }, 900);
    }, 1500);
  };

  const endGame = () => {
    setGameState('game-over');
    Speech.stop();
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  };

  const whack = (holeIndex: number) => {
    if (holeIndex !== activeHole || gameState !== 'playing') return;
    
    soundManager.play('smack');
    Speech.stop();
    const ouchText = OUCH_DIALOGUES[Math.floor(Math.random() * OUCH_DIALOGUES.length)];
    setActiveDialogue({ text: ouchText, type: 'pain' });
    
    const isFemale = FEMALE_AVATARS.includes(bossAvatar);
    const isMale = MALE_AVATARS.includes(bossAvatar);
    const voiceId = isFemale ? femaleVoice : isMale ? maleVoice : undefined;
    
    // Very distinct pain voice: much higher pitch and faster rate
    const pitch = isFemale ? 1.8 : isMale ? 0.9 : 1.6;
    
    Speech.speak(ouchText, { pitch, rate: 1.5, voice: voiceId });
    
    setScore(s => s + 1);
    setActiveHole(null); // Hide immediately

    setFrustration(prev => {
      const next = Math.max(0, prev - 10);
      if (next === 0) {
        endGame();
      }
      return next;
    });
  };

  const renderSetup = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.setupContainer}
    >
      <View style={styles.card}>
        <Text style={styles.title}>WHACK YOUR BOSS</Text>
        
        <Text style={styles.label}>Select an Avatar:</Text>
        <View style={styles.avatarGrid}>
          {BOSS_AVATARS.map((avatar, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.avatarBtn, bossAvatar === avatar && styles.avatarBtnActive]}
              onPress={() => setBossAvatar(avatar)}
            >
              <Text style={styles.avatarEmoji}>{avatar}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Name your Target:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Manager Bob"
          placeholderTextColor="#666"
          value={bossName}
          onChangeText={setBossName}
          maxLength={15}
        />

        <TouchableOpacity style={styles.startBtn} onPress={startGame}>
          <Text style={styles.startBtnText}>START WHACKING</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderGame = () => (
    <View style={styles.gameContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (gameLoopRef.current) clearInterval(gameLoopRef.current);
          router.back();
        }} style={styles.backBtn}>
          <Text style={styles.backText}>◀</Text>
        </TouchableOpacity>
        
        <View style={styles.frustrationContainer}>
          <Text style={styles.frustrationLabel}>FRUSTRATION</Text>
          <View style={styles.frustrationBarBg}>
            <View style={[styles.frustrationBarFill, { width: `${frustration}%` }]} />
          </View>
        </View>
      </View>

      <Text style={styles.targetName}>Target: {bossName || 'The Boss'}</Text>
      
      <View style={[styles.dialogueContainer, { opacity: activeDialogue ? 1 : 0 }]}>
        <View style={[
          styles.dialogueBubble, 
          activeDialogue?.type === 'pain' && styles.dialogueBubblePain
        ]}>
          <Text style={[
            styles.dialogueText, 
            activeDialogue?.type === 'pain' && styles.dialogueTextPain
          ]}>
            {activeDialogue?.text || '...'}
          </Text>
        </View>
        <View style={[
          styles.dialoguePointer,
          activeDialogue?.type === 'pain' && styles.dialoguePointerPain
        ]} />
      </View>

      <View style={styles.grid}>
        {Array.from({ length: TOTAL_HOLES }).map((_, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.hole} 
            activeOpacity={1}
            onPress={() => whack(index)}
          >
            <View style={styles.holeInner} />
            {activeHole === index && (
              <AnimatedBoss avatar={bossAvatar} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GradientBackground colors={[Colors.bgDark, Colors.bgLight]} style={styles.container}>
        {gameState === 'setup' && renderSetup()}
        {gameState === 'playing' && renderGame()}
        {gameState === 'game-over' && (
          <GameOverModal
            score={score}
            onPlayAgain={() => setGameState('setup')}
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

// Separate component for the boss animation so each instance manages its own animation
function AnimatedBoss({ avatar }: { avatar: string }) {
  const translateY = useSharedValue(50); // Start below the hole

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 12, stiffness: 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }]
    };
  });

  return (
    <Animated.View style={[styles.bossContainer, animatedStyle]}>
      <Text style={styles.bossEmoji}>{avatar}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: Colors.bgCard,
    padding: 24,
    borderRadius: 20,
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.pixel,
    fontSize: 20,
    color: '#FFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontFamily: Fonts.pixel,
    fontSize: 12,
    color: '#AAA',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  avatarBtn: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarBtnActive: {
    borderColor: Colors.warning,
    backgroundColor: 'rgba(255, 210, 63, 0.2)',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    color: '#FFF',
    fontFamily: Fonts.body,
    fontSize: 16,
    paddingHorizontal: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#444',
  },
  startBtn: {
    backgroundColor: Colors.danger,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  startBtnText: {
    fontFamily: Fonts.pixel,
    color: '#FFF',
    fontSize: 14,
  },
  
  // Game Area Styles
  gameContainer: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backText: {
    color: '#FFF',
    fontSize: 20,
  },
  frustrationContainer: {
    flex: 1,
  },
  frustrationLabel: {
    fontFamily: Fonts.pixel,
    color: '#AAA',
    fontSize: 10,
    marginBottom: 5,
  },
  frustrationBarBg: {
    width: '100%',
    height: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  frustrationBarFill: {
    height: '100%',
    backgroundColor: Colors.danger,
  },
  targetName: {
    fontFamily: Fonts.pixel,
    fontSize: 16,
    color: Colors.warning,
    marginBottom: 10,
    textAlign: 'center',
  },
  dialogueContainer: {
    alignItems: 'center',
    marginBottom: 20,
    height: 60,
  },
  dialogueBubble: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: width * 0.8,
  },
  dialogueBubblePain: {
    backgroundColor: Colors.danger,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  dialogueText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dialogueTextPain: {
    color: '#FFF',
    fontFamily: Fonts.pixel,
    fontSize: 12,
  },
  dialoguePointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF',
    alignSelf: 'center',
  },
  dialoguePointerPain: {
    borderTopColor: Colors.danger,
  },
  grid: {
    width: width * 0.9,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  hole: {
    width: (width * 0.9 - 30) / 3, // 3 columns, 15px gap
    height: (width * 0.9 - 30) / 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden', // hides the boss when down
    position: 'relative',
  },
  holeInner: {
    position: 'absolute',
    bottom: 10,
    width: '80%',
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
  },
  bossContainer: {
    position: 'absolute',
    bottom: 20, // pop out height
    alignItems: 'center',
  },
  bossEmoji: {
    fontSize: 50,
  }
});
