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
   - _Goal_: Relieve hardware frustration! Destroy computer screens, mechanical keyboards, mice, and office chairs using baseball bats, fists, hammers, or guns.
4. **Whack Your Boss** 🧑‍💼
   - _Goal_: Select or customize a boss avatar (name, gender, appearance) and whack them as much as you need until your frustration levels drop to zero.
5. **Shout to Break** 🗣️
   - _Goal_: Use your microphone's input level (shouting noises) to shatter windows, wine glasses, monitors, and plates.

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
