import { Audio } from 'expo-av';

class SoundManager {
  private sounds: Record<string, Audio.Sound> = {};
  private isMuted: boolean = false;

  async init() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Pre-load all sounds
      const squashSound = new Audio.Sound();
      await squashSound.loadAsync(require('../assets/sounds/squash.wav'));
      this.sounds['squash'] = squashSound;

      const powerupSound = new Audio.Sound();
      await powerupSound.loadAsync(require('../assets/sounds/powerup.wav'));
      this.sounds['powerup'] = powerupSound;

      const lifeLostSound = new Audio.Sound();
      await lifeLostSound.loadAsync(require('../assets/sounds/life-lost.wav'));
      this.sounds['life-lost'] = lifeLostSound;

      const gameOverSound = new Audio.Sound();
      await gameOverSound.loadAsync(require('../assets/sounds/game-over.wav'));
      this.sounds['game-over'] = gameOverSound;

      console.log('✅ Sounds loaded successfully');
    } catch (e) {
      console.warn('Failed to load sounds', e);
    }
  }

  async play(soundName: 'squash' | 'powerup' | 'life-lost' | 'game-over') {
    if (this.isMuted) return;
    
    try {
      const sound = this.sounds[soundName];
      if (sound) {
        // Replay from start if already playing
        await sound.replayAsync();
      }
    } catch (e) {
      console.warn(`Failed to play sound: ${soundName}`, e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  async cleanup() {
    for (const key in this.sounds) {
      try {
        await this.sounds[key].unloadAsync();
      } catch (e) {
        // ignore
      }
    }
    this.sounds = {};
  }
}

export const soundManager = new SoundManager();
