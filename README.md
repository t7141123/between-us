# Between Us · 在我們之間

A modern cross-platform relationship conversation card app built with the latest **Expo SDK 52** and **React Native**, designed for deployment across **iOS (App Store)**, **Android (Google Play)**, and **Web**.

Features 2100 thoughtfully crafted questions (700 per language × 3 languages) across 7 relationship themes.

---

## 🌟 Key Features

- **Cross-Platform**: Deploy to iOS App Store, Android Google Play, and Web from a single TypeScript codebase.
- **Multi-Language Architecture**: Independent, structured JSON locale files (`src/locales/{zh-TW,zh-CN,en}.json`) for seamless language switching (Traditional Chinese, Simplified Chinese, English).
- **Dual Theme Support**: Beautiful Clay, Warm Alabaster, and Velvet Charcoal themes supporting both Light and Dark appearance with automatic system detection.
- **3D Flippable Card**: Smooth 60fps Y-axis 3D rotation, gold inner accent borders, and tactile gesture swipe support.
- **Touch & Haptic Feedback**: Native vibration tactile response on mobile (`expo-haptics`).
- **5-Minute Conversation Timer**: Dedicated modal with countdown timer, Web Audio chimes, and celebration confetti.
- **Question Drawer & Search**: Instant full-text search across 700 questions with favorites filter.
- **Zero-Leak Security**: Strict permission policies (zero unnecessary permissions for App Store and Google Play), and hardened `.gitignore` for GitHub security.

---

## 📁 Clean Project Structure

```
between-us/
├── app.json                  # Expo multi-platform configuration & permissions
├── eas.json                  # EAS Build configuration for App Store & Google Play
├── package.json              # Dependencies and scripts (typecheck, lint, validate)
├── tsconfig.json             # Strict TypeScript configuration
├── .eslintrc.js              # ESLint configuration
├── .gitignore                # Security-focused ignore rules
├── assets/                   # Store-ready app icons (1024x1024) and splash screen
├── src/
│   ├── locales/              # Distinct language files (UI strings + 700 questions each)
│   │   ├── zh-TW.json        # Traditional Chinese
│   │   ├── zh-CN.json        # Simplified Chinese
│   │   └── en.json           # English
│   ├── components/           # Reusable UI components
│   │   ├── Card3D.tsx        # 3D interactive flippable card
│   │   ├── CategoryChips.tsx # Category selection chips
│   │   ├── HeaderBar.tsx     # Navigation bar with theme/mute/language toggles
│   │   ├── DrawerModal.tsx   # Question library search & favorites drawer
│   │   └── TimerModal.tsx    # 5-minute conversation timer modal
│   ├── hooks/                # Custom React hooks
│   │   ├── useTheme.ts       # Light/Dark mode state
│   │   ├── useSound.ts       # Cross-platform audio synthesizer
│   │   └── useHaptics.ts     # Native tactile feedback
│   ├── services/             # Core services
│   │   ├── i18n.ts           # Multi-language question bank engine
│   │   └── storage.ts        # Secure AsyncStorage wrapper
│   ├── constants/            # Design tokens and category keys
│   │   ├── colors.ts         # Dual theme color tokens
│   │   └── categories.ts     # 7 dialogue theme categories
│   ├── types/                # TypeScript type definitions
│   └── App.tsx               # Main application coordinator
└── scripts/
    └── validate-locales.js   # Question bank integrity validator
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install Dependencies

```bash
npm install
```

### Development

```bash
# Start Expo development server (scan QR code with Expo Go)
npm start

# Run on Web directly
npm run web

# Run on iOS simulator (macOS required)
npm run ios

# Run on Android emulator
npm run android
```

---

## 🛠️ Verification & Quality Checks

```bash
# 1. TypeScript type check
npm run typecheck

# 2. ESLint code quality check
npm run lint

# 3. Question bank integrity validator (validates 2100 questions, format, and sensitivity)
npm run validate
```

---

## 📦 Deployment & Publishing

### 1. Web Deployment (Cloudflare Pages / Static Hosting)

```bash
# Export static web bundle to dist/
npm run build:web

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name love-between-us --branch main
```

### 2. iOS App Store Deployment (via EAS Build)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Build for iOS App Store
eas build --platform ios --auto-submit
```

### 3. Android Google Play Deployment (via EAS Build)

```bash
# Build Android App Bundle (AAB) for Google Play
eas build --platform android --auto-submit
```

---

## 🔒 Security Best Practices

- **Zero Unnecessary Permissions**: `app.json` declares zero invasive permissions (no camera, microphone, or location permissions requested).
- **GitHub Secret Protection**: `.env`, `credentials.json`, `*.keystore`, and `*.p8` keys are permanently blocked from version control.
- **Dependency Audit**: Verified with `npm audit` and dependency overrides.

---

## 📄 License

MIT License
