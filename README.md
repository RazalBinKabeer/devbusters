# DevBusters 🚀💥

[![Download APK](https://img.shields.io/badge/Download-Android_APK-green?style=for-the-badge&logo=android)](./devbuster-v1.apk)

DevBusters is a vibrant, comic-themed developer stress-relief gaming platform built with React Native and Expo (SDK 54). It is designed specifically for developers to blow off steam, manage their frustrations, and release work-related stress through interactive and playful mini-games.

---

## 🎮 The Games

1. **Squash the Bugs** 🐛
   - _Goal_: Bugs fall from the sky and you must squash them using finger taps.
   - _Power-ups_: Run `git revert` or `git reset --hard` commands to instantly clear all bugs on the screen.
2. **Rocket Shooter** 🚀
   - _Goal_: Control a developer rocket to shoot down oncoming Jira tickets, endless meetings, blocker issues, and alerts.
   - _Collectibles_: Collect snacks, coffee cups, and energy drinks to power up your weapons.
3. **Assets Destroy** 🔨
   - _Goal_: Relieve hardware frustration! Slice falling assets using a Sword (Fruit Ninja style with glowing trails) or blast them with a Gun (leaving bullet holes).
4. **Whack Your Boss** 🧑‍💼
   - _Goal_: Select an annoying boss avatar, name them, and whack them to relieve your frustration meter while they yell toxic workplace quotes at you.
5. **Shout to Break** 🗣️
   - _Goal_: Use your microphone's input level (shouting noises) to shatter windows, wine glasses, monitors, and ancient pots.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/) with [Expo Router](https://docs.expo.dev/router/introduction) (file-based navigation).
- **Backend & Auth**: [Firebase JS SDK (v10)](https://firebase.google.com/) with Email/Password authentication and AsyncStorage-based persistent session management.
- **Styling**: Comic Pop Design System utilizing curated, high-contrast typography, bubbly gradients, and custom components.
- **Animations**: [React Native Reanimated](https://docs.expo.dev/versions/v54.0.0/sdk/reanimated/) for high-performance fluid animations, floating background particles, and energetic UI feedback.
- **State Management**: React Context API (`AuthContext`) for lightweight authentication state.

---

## 📂 Project Structure

```text
├── app/                      # Expo Router main screens
│   ├── (auth)/               # Authentication stack (Login, Register)
│   ├── (tabs)/               # App dashboard tabs (Games, Leaderboard, Achievements, Profile)
│   ├── games/                # Mini-game screens and execution code
│   └── _layout.tsx           # Global root layout with theme fonts loading
├── components/               # Reusable custom UI components
│   ├── AuthButton.tsx        # Styled button for credentials & OAuth providers
│   ├── FloatingElements.tsx  # Interactive floating background shapes
│   ├── FrustrationMeter.tsx  # Dynamic dashboard frustration gauge
│   ├── GameCard.tsx          # Card display for game selection on home screen
│   ├── GradientBackground.tsx# Universal mesh gradient wrapper
│   └── Logo.tsx              # Animated retro-style DevBusters brand logo
├── config/                   # Configuration files (Firebase initializer)
├── constants/                # Project constants
│   ├── gameData.ts           # Game details, rules, achievements metadata
│   └── theme.ts              # Global colors, typography, spacing tokens
├── contexts/                 # Context Providers (AuthContext)
├── assets/                   # Local media, assets, and custom fonts
└── .env                      # Environment secrets (Git-ignored)
```

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have Node.js and npm (or yarn) installed. You will also need the Expo Go app on your physical iOS/Android device, or configured iOS/Android simulators.

### 2. Installation

Clone this repository to your local workspace, navigate into the directory, and install the dependencies:

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and add your Firebase configuration credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id_here
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

### 4. Running the Development Server

Start the Expo packager:

```bash
npm start
```

Scan the QR code displayed in the terminal using your phone's camera (iOS) or the Expo Go app (Android) to load the application.

---

## 🤝 For Contributors: Testing & Updating

Welcome contributors! Since the iOS build is not fully tested yet, we highly encourage developers to test, report bugs, and submit Pull Requests.

### 🐛 Testing Local Changes

1. Run `npm start` and test your changes inside the Expo Go app.
2. For testing native module changes (like `expo-speech` or `expo-audio`), you must prebuild and compile the app locally:
   - **Android**: Run `npx expo prebuild --clean && npx expo run:android`
   - **iOS**: Run `npx expo prebuild --clean && npx expo run:ios` (Requires Xcode and a Mac)

### 📦 Building the APK

To generate a new release APK locally:

```bash
npx expo prebuild --clean
cd android
./gradlew assembleRelease
cp app/build/outputs/apk/release/app-release.apk ../DevBusters.apk
```

_Note: Always update `DevBusters.apk` in the repository root if you make significant gameplay changes._

---

## 🎯 Features Roadmap

- [x] **Phase 1**: Initial architecture, global theme configuration, Custom fonts loading, Firebase Auth integration, Register & Login screens, Navigation structure (welcome, tabs, and game stubs).
- [x] **Phase 2**: Mini-game implementations (_Squash the Bugs_, _Rocket Shooter_, _Asset Destroy_, _Whack Your Boss_).
- [x] **Phase 3**: Integration of Native Device features (Microphone API for _Shout to Break_, Haptics, Text-to-Speech, and sound effects).
- [ ] **Phase 4**: Leaderboard systems, Firebase Firestore database persistence, and social share integrations.

---

## 🛠️ How We Made the Games

DevBusters is built to provide high-performance, 60fps interactive gameplay without relying on heavy game engines like Unity. We achieved this by pushing the limits of React Native's animation and gesture APIs.

### 1. Squash the Bugs 🐛
- **Animations:** Utilized `react-native-reanimated`'s `useSharedValue` and `withTiming` to animate the Y-axis descent of the bugs.
- **State Management:** A custom hook manages the active bugs, dynamically pushing new bugs to an array with randomized horizontal positions and speeds.
- **Interaction:** Tapping a bug triggers an instantaneous state update and plays a generated "squash" pop sound via `expo-av`.

### 2. Rocket Shooter 🚀
- **Game Loop:** Implemented a custom game loop using `requestAnimationFrame` and React `useRef`s to continuously update the positions of the rocket, bullets, and enemies at 60fps.
- **Collision Detection:** AABB (Axis-Aligned Bounding Box) collision checks inside the loop detect when a bullet hits an enemy.
- **Synthesized Audio:** The laser and explosion sounds were procedurally generated using math functions (sine waves and white noise) mapped into a 16-bit PCM WAV buffer script (`generate-sounds.js`), giving it an authentic retro feel.

### 3. Asset Destroy 🔨
- **Physics Engine:** Constructed a physics-based `requestAnimationFrame` engine that handles gravity, parabolic projectile motion, and dynamic bounds.
- **Sword (Swipe):** Inspired by *Fruit Ninja*, we used `react-native-gesture-handler`'s `Gesture.Pan`. As the finger drags, we capture coordinates and render a glowing trailing light effect using `react-native-svg`.
- **Gun (Tap):** Uses `Gesture.Tap` to instantiate immediate bullet holes (💢) at tap coordinates, which slowly fade out using Reanimated Opacity transitions.

### 4. Shout to Break 🗣️
- **Microphone Metering:** Integrated `expo-av`'s `Audio.Recording` module. We enabled `isMeteringEnabled: true` to stream live decibel levels (-160dB to 0dB) at a 50ms interval.
- **Damage Mapping:** Negative decibel values are normalized into a 0 to 1 scale. If the volume exceeds a threshold, we apply damage.
- **Visual Feedback:** Reanimated `withSequence` and `withTiming` make the asset wildly shake (`translateX/Y`) and pulse (`scale`) proportional to the decibel input.
- **Closure Architecture:** Because the audio listener acts asynchronously outside the React render cycle, we utilized `useRef` to maintain synchronous access to the live game state.

### 5. Whack Your Boss 🧑‍💼
- **Grid System:** A 3x3 grid where a randomized `setInterval` loop updates an `activeHole` state, causing the boss to pop up for short intervals.
- **Advanced Text-to-Speech (TTS):** Integrated `expo-speech` to add auditory life to the boss.
  - **Dynamic Gender Matching:** `Speech.getAvailableVoicesAsync()` fetches native voices. We actively filter for IDs and names like "Samantha" (Female) and "Arthur" (Male).
  - **Command Dialogues:** The boss drops toxic workplace quotes at a normal rate. If a native gendered voice isn't found, we aggressively drop the pitch modifier (`0.6`) to force a masculine tone.
  - **Pain/Attack Dialogues:** When you whack the boss, previous speech is cut off (`Speech.stop()`). They yelp in pain accompanied by a red, pixelated speech bubble. The TTS engine spikes the pitch modifier (up to `1.8`) and speed rate (`1.5`) to simulate an authentic yelp.
