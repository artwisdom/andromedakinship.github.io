# 🎯 SellCraft - Master the Craft of Selling

**AI-Powered Sales Training App with Chiron, Your Legendary Sales Coach**

A premium mobile app built with React Native and Expo that helps salespeople master objection handling with a **Real AI Sales Expert**, practice industry-specific scenarios, track goals, and get motivated — all from their pocket.

![SellCraft](https://img.shields.io/badge/version-1.0.0-blue) ![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-green) ![Expo](https://img.shields.io/badge/expo-54-purple)

---

## ✨ Features

### 🎮 Objection Arena
- **12 Industry-Specific Scenarios**: Automotive, SaaS, Insurance, Real Estate, Retail, Financial Services, Medical/Healthcare, Solar/Energy, Telecom, HVAC, Fitness, General
- **Gamified Practice**: Earn XP, level up, and maintain streaks
- **8 Objection Categories**: Price, Timing, Authority, Need, Trust, Competition, Browsing, Contract
- **Proven Response Scripts**: Learn word-for-word techniques that work

### 🧠 Chiron AI Coach

**Free Tier (5 messages/day):**
- Comprehensive sales tips covering 10+ topics
- Objection handling frameworks (LAER, Feel-Felt-Found)
- Closing techniques (Assumptive, Alternative, Summary)
- Cold calling tips and follow-up strategies
- Negotiation basics and rapport building
- Quick action buttons for instant guidance

**Premium Tier ($19.99/mo):**
- **Unlimited Real AI Sales Expert** powered by GPT-4o-mini
- Deep industry expertise with word-for-word scripts
- Realistic customer roleplay scenarios
- Custom pitch and cold call script creation
- Performance analysis and improvement plans
- Industry-specific closing techniques

### 📊 Goals & Progress Tracking
- **3 Goal Types**: Sales, Personal, Skill Development
- **Visual Progress**: Track with progress bars and deadlines
- **Daily Readiness Score**: Stay prepared for every sales day
- **XP & Leveling System**: From Rookie to Legend

### 🔔 Smart Notifications
- **Daily Quotes**: Start your day with motivation from sales legends
- **Readiness Reminders**: Get to 100% readiness before your day
- **Streak Protection**: Don't break your practice streak
- **Goal Check-ins**: Stay on track with your targets

### 🎨 Premium Design
- Glass morphism UI with smooth animations
- Dark mode optimized
- Haptic feedback throughout
- Industry-specific color coding

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- Expo Go app on your phone (for testing)

### Installation

```bash
# Extract the SellCraft folder
cd SellCraft

# Install dependencies
npm install

# Start development server
npx expo start --clear
```

### Running on Your Device

1. Download **Expo Go** from App Store or Google Play
2. Scan the QR code after running `npx expo start`
3. The app loads on your device!

---

## 🔧 Backend Setup (For AI Features)

The AI coaching requires a backend to securely proxy requests to OpenAI.

### Deploy to Vercel (Free)

```bash
# Navigate to backend folder
cd SellCraft/backend

# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel --prod
```

### Configure API Key

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project → Settings → Environment Variables
3. Add: `OPENAI_API_KEY` = `sk-your-key-here`
4. Redeploy

### Update App Config

Edit `constants/Config.ts`:
```typescript
export const Config = {
  API_URL: 'https://your-project.vercel.app', // Your Vercel URL
  AI_ENABLED: true, // Enable AI features
};
```

---

## 🏭 Supported Industries

Each industry has specialized:
- Common objections and proven responses
- Industry terminology and metrics
- Buying cycle knowledge
- Closing techniques

| Industry | Icon | Focus Areas |
|----------|------|-------------|
| Automotive | 🚗 | Trade-ins, Financing, Test drives |
| SaaS / Tech | 💻 | ROI, Implementation, Competitors |
| Insurance | 🛡️ | Coverage, Claims, Trust building |
| Real Estate | 🏠 | Market timing, Commission, Urgency |
| Retail | 🛍️ | Price matching, Impulse, Returns |
| Financial Services | 💰 | Trust, Fees, Market volatility |
| Medical/Healthcare | ⚕️ | Budget cycles, Physician buy-in |
| Solar/Energy | ☀️ | ROI, Technology, HOA concerns |
| Telecom/Wireless | 📱 | Contracts, Coverage, Switching |
| HVAC/Home Services | 🔧 | Emergency, Quotes, Efficiency |
| Fitness/Wellness | 💪 | Commitment, Time, Past failures |
| General Sales | 💼 | Universal techniques |

---

## 📁 Project Structure

```
SellCraft/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home dashboard
│   │   ├── arena.tsx      # Objection Arena
│   │   ├── coach.tsx      # Chiron AI Coach
│   │   ├── goals.tsx      # Goal tracking
│   │   └── profile.tsx    # Settings & profile
│   ├── practice.tsx       # Practice session
│   ├── add-goal.tsx       # Create goal
│   └── edit-goal.tsx      # Edit goal
├── backend/               # Vercel serverless
│   ├── api/chat.js        # AI proxy endpoint
│   └── README.md          # Deploy instructions
├── components/            # Reusable components
│   ├── AIChatSheet.tsx    # Chiron chat UI
│   ├── FloatingAIButton.tsx
│   ├── PremiumPaywall.tsx
│   └── StatsModals.tsx
├── constants/
│   ├── Config.ts          # App configuration
│   ├── Objections.ts      # Industry objections
│   └── Theme.ts           # Design tokens
├── contexts/
│   └── AppContext.tsx     # Global state
└── utils/
    └── notifications.ts   # Push notifications
```

---

## 💰 Cost Analysis

### For You (Developer)
- Vercel hosting: **Free** (hobby tier)
- OpenAI API: **~$0.001 per conversation**

| Active Premium Users | Est. Monthly Cost |
|---------------------|-------------------|
| 100 | ~$5 |
| 500 | ~$25 |
| 1,000 | ~$50 |

### For Users
- Free tier: $0 (5 messages/day)
- Premium: $19.99/month (unlimited AI)

---

## 📱 Tech Stack

- **Framework**: React Native + Expo SDK 54
- **Navigation**: Expo Router (file-based)
- **State**: React Context + AsyncStorage
- **AI**: OpenAI GPT-4o-mini via Vercel
- **Notifications**: Expo Notifications
- **UI**: Linear Gradients, Blur effects, Haptics

---

## 📄 License

© 2024 Andromeda Kinship. All rights reserved.

---

**Built with ❤️ for salespeople who want to close more deals.**
