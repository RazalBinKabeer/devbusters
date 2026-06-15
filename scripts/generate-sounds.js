/**
 * Generate simple WAV sound effects for Squash the Bugs
 * Run: node scripts/generate-sounds.js
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050;
const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');

if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

/**
 * Build a 16-bit mono PCM WAV buffer from a Float64 sample array.
 */
function createWav(samples) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);               // sub-chunk size
  buffer.writeUInt16LE(1, 20);                 // PCM format
  buffer.writeUInt16LE(1, 22);                 // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);       // sample rate
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);   // byte rate
  buffer.writeUInt16LE(2, 32);                 // block align
  buffer.writeUInt16LE(16, 34);                // bits per sample

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  return buffer;
}

/** Generate a sample array from a time-domain generator function. */
function generateSamples(duration, generator) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = generator(i / SAMPLE_RATE, duration);
  }
  return out;
}

// ── Squash: percussive pop ────────────────────────────────────────────
const squash = generateSamples(0.12, (t) => {
  const freq = 600 + 400 * Math.exp(-t * 40);
  const env = Math.exp(-t * 35);
  return Math.sin(2 * Math.PI * freq * t) * env * 0.8 +
    (Math.random() * 2 - 1) * env * 0.12;
});

// ── Power-up: ascending sparkle ───────────────────────────────────────
const powerup = generateSamples(0.35, (t, dur) => {
  const freq = 440 + 1200 * (t / dur);
  const env = Math.sin(Math.PI * t / dur);
  return (
    Math.sin(2 * Math.PI * freq * t) * 0.5 +
    Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.3
  ) * env * 0.7;
});

// ── Life lost: descending buzz ────────────────────────────────────────
const lifeLost = generateSamples(0.3, (t, dur) => {
  const freq = 350 - 200 * (t / dur);
  const env = 1 - t / dur;
  return (
    Math.sin(2 * Math.PI * freq * t) * 0.6 +
    Math.sin(2 * Math.PI * freq * 2.02 * t) * 0.3
  ) * env;
});

// ── Game over: low dramatic tone ──────────────────────────────────────
const gameOver = generateSamples(0.8, (t) => {
  const env = Math.exp(-t * 3);
  return (
    Math.sin(2 * Math.PI * 110 * t) * 0.4 +
    Math.sin(2 * Math.PI * 138.59 * t) * 0.3 +
    Math.sin(2 * Math.PI * 82.41 * t) * 0.2
  ) * env * 0.8;
});

// ── Laser: high descending sweep (Rocket Shooter) ──────────────────────
const laser = generateSamples(0.15, (t, dur) => {
  const freq = 1200 * Math.exp(-t * 15);
  const env = Math.exp(-t * 10);
  return (Math.sin(2 * Math.PI * freq * t) > 0 ? 0.3 : -0.3) * env; // Square wave for retro feel
});

// ── Explosion: white noise burst (Rocket Shooter) ──────────────────────
const explosion = generateSamples(0.3, (t) => {
  const env = Math.exp(-t * 12);
  const noise = Math.random() * 2 - 1;
  const rumble = Math.sin(2 * Math.PI * (50 + Math.random() * 50) * t);
  return (noise * 0.6 + rumble * 0.4) * env;
});

// Write files
fs.writeFileSync(path.join(soundsDir, 'squash.wav'), createWav(squash));
fs.writeFileSync(path.join(soundsDir, 'powerup.wav'), createWav(powerup));
fs.writeFileSync(path.join(soundsDir, 'life-lost.wav'), createWav(lifeLost));
fs.writeFileSync(path.join(soundsDir, 'game-over.wav'), createWav(gameOver));
fs.writeFileSync(path.join(soundsDir, 'laser.wav'), createWav(laser));
fs.writeFileSync(path.join(soundsDir, 'explosion.wav'), createWav(explosion));

console.log('✅ Sound effects generated in assets/sounds/');
