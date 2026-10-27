# Fitness Tracking App

A comprehensive, offline-first Progressive Web App (PWA) for fitness tracking with AI-powered nutrition parsing and adaptive workout generation. Built with React, TypeScript, and modern web technologies following Apple Human Interface Guidelines.

## 🌟 Features

### 🍽️ AI-Powered Nutrition Tracker
- **Egyptian Cuisine Recognition**: Parse natural language descriptions of Egyptian dishes (koshari, ful medames, molokhia, etc.) using Google Gemini 1.5 Pro
- **Structured JSON Output**: Get accurate macro breakdowns (calories, protein, carbs, fat) with confidence scores
- **Smart Fallback Strategies**: Automatic retry logic with exponential backoff and circuit breaker pattern
- **Offline-First**: All nutrition logs stored locally in IndexedDB, synced to cloud when online

### 💪 Adaptive Workout Generator
- **Progressive Overload**: Automatically adjusts volume, intensity, and exercise selection based on your history
- **Equipment-Aware**: Works with dumbbells, bodyweight, or full gym equipment
- **Muscle Group Balancing**: Ensures balanced development across all major muscle groups
- **Daily Routines**: Generates complete workout plans with warmup, main sets, and cooldown

### 📊 Progress Dashboard
- **Interactive Charts**: Weight trends, body fat %, muscle mass, measurements (Recharts)
- **Macro Tracking**: Daily/weekly nutrition summaries with target vs actual comparisons
- **Workout Analytics**: Volume progression, frequency heatmaps, personal records
- **Export Data**: CSV export for external analysis

### 📱 iOS-Native PWA Experience
- **Standalone Installation**: Add to Home Screen with native app feel
- **Offline Support**: Full functionality without internet connection
- **Scriptable Widget**: iOS home screen widget showing today's workout and macro progress
- **App Shortcuts**: Quick access to "Log Workout" and "View Progress" from home screen
- **Push Notifications**: Workout reminders and goal achievements

### ☁️ Cloud Sync (Vercel KV)
- **Background Sync**: Automatic synchronization when online
- **Conflict Resolution**: Last-write-wins with manual override option
- **Cross-Device**: Seamless experience across iPhone, iPad, and desktop
- **Privacy-First**: No personal data sent without explicit consent

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript, Vite 5 |
| **Styling** | Tailwind CSS, CSS Variables (Apple HIG colors) |
| **Animations** | Framer Motion (spring physics, layout animations) |
| **Charts** | Recharts (responsive, accessible) |
| **Database** | Dexie.js (IndexedDB wrapper with live queries) |
| **AI** | Google Gemini 1.5 Pro (@google/generative-ai) |
| **Cloud** | Vercel KV (Redis-compatible key-value store) |
| **PWA** | Workbox (generateSW strategy), vite-plugin-pwa |
| **Icons** | Lucide React |
| **Dates** | date-fns |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Google Gemini API key (for AI nutrition parsing)
- Vercel account (optional, for cloud sync)

### Installation

```bash
# Clone the repository
git clone https://github.com/Mmilfslayer/fitness-tracking-app.git
cd fitness-tracking-app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API keys to .env
# VITE_GEMINI_API_KEY=your_gemini_key
# VITE_VERCEL_KV_URL=your_vercel_kv_url
# VITE_VERCEL_KV_REST_API_TOKEN=your_vercel_kv_token

# Start development server
npm run dev
```

### Build for Production

```bash
# Type-check and build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base components (Button, Card, Input, Modal, etc.)
│   ├── charts/          # Chart components (WeightChart, MacroChart, etc.)
│   └── forms/           # Form components (WorkoutForm, NutritionForm, etc.)
├── pages/               # Page components (Dashboard, Workout, Nutrition, Progress, Settings)
├── services/
│   ├── ai/              # Gemini AI client, nutrition/workout services
│   ├── database/        # Dexie schema, hooks, CRUD operations
│   ├── kv/              # Vercel KV sync service
│   └── notifications/   # Push notification handling
├── hooks/               # Custom React hooks
├── utils/               # Utility functions (formatting, calculations)
├── types/               # TypeScript type definitions
├── styles/              # Global styles, Tailwind config
└── sw.ts                # Service Worker (Workbox injectManifest)
```

## ⌨️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint with TypeScript support |

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | Yes | Google Gemini API key for AI nutrition parsing |
| `VITE_VERCEL_KV_URL` | No | Vercel KV REST API URL for cloud sync |
| `VITE_VERCEL_KV_REST_API_TOKEN` | No | Vercel KV REST API token |

### PWA Configuration

The app is configured as a full PWA with:
- **Manifest**: `public/manifest.webmanifest`
- **Icons**: Multiple sizes (192x192, 512x512, 180x180 for Apple)
- **Service Worker**: `src/sw.ts` with Workbox caching strategies
- **Shortcuts**: Quick actions for Workout and Progress pages

## 📱 iOS Installation

1. Open the app in Safari on iOS
2. Tap the Share button → "Add to Home Screen"
3. The app installs as a standalone PWA
4. Optional: Add the Scriptable widget for home screen glance

### Scriptable Widget Setup
1. Install [Scriptable](https://apps.apple.com/app/scriptable/id1405459188) from App Store
2. Create new script, paste content from `widgets/ios-scriptable-widget.js`
3. Add widget to home screen → select your script
4. Widget shows today's workout and macro progress

## 🧪 Testing

```bash
# Run type checking
npx tsc --noEmit

# Run linting
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for AI-powered nutrition parsing
- [Dexie.js](https://dexie.org/) for excellent IndexedDB wrapper
- [Workbox](https://developers.google.com/web/tools/workbox) for PWA service worker
- [Framer Motion](https://www.framer.com/motion/) for beautiful animations
- [Recharts](https://recharts.org/) for responsive charts
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- Apple Human Interface Guidelines for design inspiration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Mmilfslayer/fitness-tracking-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Mmilfslayer/fitness-tracking-app/discussions)

---

Built with ❤️ for fitness enthusiasts who want a privacy-first, AI-enhanced tracking experience.