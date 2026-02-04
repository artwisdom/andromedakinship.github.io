# SellCraft — Pre-Launch Audit Report
### Full System Review | February 2, 2026

---

## EXECUTIVE SUMMARY

SellCraft is **feature-rich and architecturally solid** for a v1 app. The core experience — objection practice, AI coaching, goals, gamification — is fully built and polished. The main blockers to launch are **infrastructure gaps** (no real IAP, no real ads, no EAS build config) rather than missing features. The app itself is complete; the store/monetization plumbing is not.

**Verdict: 80% launch-ready.** The 20% remaining is almost entirely store infrastructure, not product.

---

## INVENTORY — WHAT'S BUILT

### Screens (8 total)
| Screen | File | Status |
|--------|------|--------|
| Splash / Router | `app/index.tsx` | ✅ Complete |
| Onboarding | `app/onboarding.tsx` | ✅ Complete (2-step: name + industry, creates 2 starter goals) |
| Home Dashboard | `app/(tabs)/index.tsx` | ✅ Complete (697 lines — level card, stats, quote, quick actions, active goals, progress, level-up celebration) |
| Arena | `app/(tabs)/arena.tsx` | ✅ Complete (stats, readiness bar, quick play, categories, pro tips) |
| Coach | `app/(tabs)/coach.tsx` | ✅ Complete (hero card, Chiron button, 6 coaching topics) |
| Goals | `app/(tabs)/goals.tsx` | ✅ Complete (filters, sorting, status badges, action buttons) |
| Profile | `app/(tabs)/profile.tsx` | ✅ Complete (877 lines — avatar, stats, 13 badges, settings, modals) |
| Practice | `app/practice.tsx` | ✅ Complete (objection display, tips, response input, self-rating) |
| Add Goal | `app/add-goal.tsx` | ✅ Complete (presets, calendar picker, all goal fields) |
| Edit Goal | `app/edit-goal.tsx` | ✅ Complete (edit all fields, delete, pause/resume) |

### Components (8 total)
| Component | Status | Notes |
|-----------|--------|-------|
| AIChatSheet | ✅ Complete (1332 lines) | Full chat UI, markdown rendering, typing indicator, quick actions, swipe-to-close, new conversation, free/premium flows |
| FloatingAIButton | ✅ Complete | Animated pulse, Chiron image |
| PremiumPaywall | ✅ Complete | Feature list, pricing, subscribe/restore buttons |
| PremiumAnalytics | ✅ Complete | Weekly stats, trends, projections, strengths analysis, Chiron integration |
| StatsModals | ✅ Complete | Level details, readiness details, streak details |
| UpgradeBanner | ✅ Complete | Dismissible top banner for free users |
| AdBanner | ⚠️ Placeholder | Styled but no real AdMob — just "Remove Ads with Premium" |
| AdPopup | ⚠️ Placeholder | Styled modal but no real ad content |

### State Management
| System | Status |
|--------|--------|
| AppContext (754 lines) | ✅ Complete — user state, goals (5-status, recurring, priority, streaks), daily stats, XP, readiness score, notifications, AsyncStorage persistence |
| AIContext | ✅ Complete — chat visibility, initial prompt handling |

### Backend
| Item | Status |
|------|--------|
| `/api/chat.js` | ✅ Complete — CORS, model routing (gpt-4.1 → gpt-4.1-mini → gpt-4o-mini), system prompt with industry expertise, goal creation tags, error handling, retry chain |
| Vercel config | ✅ Complete — 60s maxDuration, 1024MB memory |

### Content
| Content | Count | Status |
|---------|-------|--------|
| Objections | 250 total (45 premium) | ✅ Across 12 industries, 8 categories |
| Sales Quotes | ~115 | ✅ With author attribution |
| Industries | 12 | ✅ Automotive, SaaS, Insurance, Real Estate, Retail, Financial, Medical, Solar, Telecom, HVAC, Fitness, General |
| Badges | 13 | ✅ Milestone + achievement badges |
| AI Quick Actions | 6 free / 8 premium | ✅ |
| Coaching Topics | 6 (4 premium-locked) | ✅ |

### Infrastructure
| Item | Status |
|------|--------|
| TypeScript | ✅ Strict mode |
| Expo 54 / React Native 0.81.5 | ✅ Current |
| Dark mode | ✅ Forced dark |
| Haptic feedback | ✅ Throughout app |
| AsyncStorage persistence | ✅ Full state persistence |
| Notifications | ✅ Free + Premium tiers, 4 notification types each |
| Backend (Vercel) | ✅ Deployed at sellcraft-api.vercel.app |

---

## STRENGTHS — What's Working Well

1. **Gamification depth** — XP, levels, streaks, 13 badges, milestone rewards, readiness score (5-factor weighted formula), level-up celebrations with animations. This is genuinely engaging.

2. **AI integration quality** — Chiron has a strong personality, industry-specific expertise data per industry, dual-model routing (premium gets gpt-4.1, free gets gpt-4.1-mini), 5-retry exponential backoff, fallback to template responses, and can even create goals via special response tags. This is production-grade.

3. **Goals system** — Comprehensive: 5 statuses (upcoming, active, paused, completed, overdue), recurring goals (daily/weekly/biweekly/monthly), priority levels, start/end dates, recurring streaks, auto-status transitions, calendar picker. Chiron AI can create goals with correct date calculations. Very solid.

4. **Free vs Premium differentiation** — Clear value prop: free gets 5 daily messages + ads + limited objections vs premium unlimited AI + no ads + all objections + analytics + personalized notifications. Premium feels genuinely valuable.

5. **Notification system** — Two completely separate notification tiers: free (generic motivational) vs premium (personalized with name, stats, readiness %, streak count, goal progress). Four notification types each. Properly scheduled via Expo Notifications.

6. **UI polish** — Consistent design system (Theme.ts), gradient cards, blur effects, animated transitions, custom typing indicator, swipe-to-close chat sheet, calendar date picker, haptic feedback on every interaction.

7. **Content volume** — 250 objections is substantial for launch. Good category spread across Price, Timing, Authority, Need, Trust, Competition, Browsing, Contract.

---

## BUGS FOUND

### Bug 1: Quote Anti-Repeat System is Broken
**File:** `utils/notifications.ts` lines 22-33  
**Issue:** `getUnusedQuote()` stores indices in AsyncStorage but never actually reads them back to exclude used quotes. The `usedIndices` array is loaded but never passed to or checked by `getRandomQuote()`.  
**Impact:** Low — quotes may repeat in notifications, but there are ~115 quotes so repeats are infrequent.  
**Fix:** Pass `usedIndices` to `getRandomQuote()` and filter out previously used quotes.

### Bug 2: Negative "Days Left" on Past-Due Goals in Edit Screen
**File:** `app/edit-goal.tsx` line 91  
**Issue:** `getDaysFromNow()` returns negative numbers for overdue goals, displaying as "-5d left" in the date badge.  
**Impact:** Low-medium — cosmetic but looks broken.  
**Fix:** Show "Overdue" or "X days overdue" instead of negative values.

### Bug 3: Developer Testing Section Visible in Production
**File:** `app/(tabs)/profile.tsx`  
**Issue:** The "Developer Testing" section (Toggle Premium, Add 50 XP, Reset All Data) is always visible. This must be hidden or removed before store submission.  
**Impact:** Critical for launch — Apple/Google will reject.  
**Fix:** Gate behind `__DEV__` check or remove entirely.

### Bug 4: 43 Console.log Statements in Source
**Files:** Throughout  
**Issue:** Debug logging everywhere. Not a crash risk but bad practice for production and may slow the app marginally.  
**Impact:** Low  
**Fix:** Replace with `__DEV__ && console.log()` or remove.

---

## WHAT'S MISSING — LAUNCH BLOCKLIST

### 🔴 CRITICAL — Cannot Ship Without These

**1. EAS Build Configuration (`eas.json`)**  
You have no `eas.json`. Without it, you cannot run `eas build` to create iOS/Android binaries. This is step one of getting into any app store.
```
Needed: eas.json with development, preview, and production profiles
```

**2. Real In-App Purchases (RevenueCat)**  
The Premium subscribe button currently just toggles a state boolean. You need:
- RevenueCat SDK integration (or Expo IAP)
- Apple App Store product setup ($4.99/month subscription)
- Google Play billing setup
- Real "Restore Purchases" functionality
- Receipt validation
- Subscription status checking on app launch

**3. Real Ad Integration (AdMob or similar)**  
AdBanner and AdPopup are styled placeholders with zero ad SDK integration. You need:
- `react-native-google-mobile-ads` or `expo-ads-admob`
- AdMob account with ad unit IDs
- Banner ad in AdBanner component
- Interstitial ad for AdPopup (timed popup every 3 min)
- Test vs production ad IDs

**4. Privacy Policy & Terms of Service**  
Both Apple and Google require real URLs. Currently these are just Alert dialogs with placeholder text. You need:
- Hosted privacy policy page (can be a simple web page)
- Hosted terms of service page
- URLs added to app store listings AND in-app links

**5. Remove Developer Testing Section**  
The "Toggle Premium / Add 50 XP / Reset All Data" section in Profile must be removed or hidden behind `__DEV__` before any store submission.

**6. Expo Notifications Plugin in app.json**  
The `plugins` array only includes `expo-router`. For iOS notification permissions to work in production builds, you need:
```json
"plugins": [
  "expo-router",
  "expo-notifications"
]
```

**7. Error Boundary Component**  
If any screen crashes, the whole app dies with a white screen. You need a root-level error boundary that catches errors and shows a "Something went wrong" screen with a restart option. Apple rejects apps that crash.

---

### 🟡 HIGH PRIORITY — Should Fix Before Launch

**8. Offline Mode / Network Error Handling**  
No internet → silent failures everywhere. The AI chat retries but never tells the user "You're offline." Need a network status check and user-facing offline state.

**9. No Onboarding Notification Prompt**  
Users complete onboarding (name + industry) but are never asked to enable notifications. The notification settings are buried in Profile → Settings. Best practice: prompt after first practice session.

**10. No Chat History Persistence**  
Every time you close the Chiron chat sheet and reopen it, all messages are gone. Users may want to reference previous coaching. Consider persisting at least the last conversation.

**11. "Rate App" Button is Placeholder**  
Profile has a "Rate App" button that shows an Alert. Need `expo-store-review` or `react-native-rate` to trigger the native store review prompt.

**12. "Help Center" / "Send Feedback" are Placeholders**  
These show Alert dialogs. At minimum, "Send Feedback" should open a mailto: link to your support email (already configured in Config.ts as support@sellcraft.app).

**13. No App Store Metadata in app.json**  
Missing fields that help with store submission:
- `ios.buildNumber`
- `android.versionCode`
- `ios.infoPlist` (for notification usage description)
- `expo.description`

---

### 🟢 NICE-TO-HAVE — Post-Launch Improvements

**14. Social Sharing** — Share achievements, level ups, badges  
**15. Data Export/Backup** — Cloud sync or export to prevent data loss  
**16. Chat History Search** — Search old Chiron conversations  
**17. Objection Search** — Text search in Arena  
**18. Light Mode Toggle** — Some users prefer light  
**19. Tutorial/Walkthrough** — Guided first-session experience  
**20. Weekly Summary Notification** — Digest of the week's performance  
**21. Widget Support** — iOS/Android home screen widget with readiness score  
**22. Streak Calendar** — Visual monthly calendar showing active days  

---

## LAUNCH READINESS CHECKLIST

### Pre-Development (Accounts & Setup)
- [ ] Apple Developer Account ($99/yr)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] RevenueCat account (free tier available)
- [ ] Google AdMob account
- [ ] Host Privacy Policy page (e.g., on your website or GitHub Pages)
- [ ] Host Terms of Service page

### Code Changes Required
- [ ] Create `eas.json` with build profiles
- [ ] Add `expo-notifications` to plugins in `app.json`
- [ ] Add `ios.buildNumber: "1"` and `android.versionCode: 1` to `app.json`
- [ ] Integrate RevenueCat SDK for premium subscriptions
- [ ] Integrate AdMob SDK for banner + interstitial ads
- [ ] Wire up Privacy Policy / Terms links to real URLs
- [ ] Remove or `__DEV__`-gate Developer Testing section in Profile
- [ ] Add root Error Boundary component
- [ ] Add network connectivity check / offline state
- [ ] Fix quote anti-repeat bug in notifications
- [ ] Fix negative days display in edit-goal
- [ ] Replace console.log with `__DEV__` gated logging
- [ ] Wire up "Rate App" with expo-store-review
- [ ] Wire up "Send Feedback" with mailto link

### Build & Test
- [ ] Run `eas build --platform ios --profile preview` and test on device
- [ ] Run `eas build --platform android --profile preview` and test on device
- [ ] Test all notification types on real device
- [ ] Test premium purchase flow end-to-end
- [ ] Test ad display (banner + interstitial)
- [ ] Test onboarding flow from fresh install
- [ ] Test offline behavior
- [ ] Test all 12 industry objection sets

### Store Submission
- [ ] App Store screenshots (6.7" iPhone, 5.5" iPhone, iPad if supporting)
- [ ] Google Play screenshots
- [ ] App description & keywords
- [ ] App preview video (optional but recommended)
- [ ] Submit to Apple for review
- [ ] Submit to Google Play

---

## FILE-BY-FILE SUMMARY

| File | Lines | Quality | Notes |
|------|-------|---------|-------|
| `app.json` | 38 | Good | Missing buildNumber, versionCode, notification plugin |
| `package.json` | 30 | ✅ Clean | All deps present |
| `tsconfig.json` | 7 | ✅ | Strict mode |
| `constants/Config.ts` | ~20 | ✅ | API URL, flags |
| `constants/Theme.ts` | ~140 | ✅ Excellent | Complete design system |
| `constants/Objections.ts` | 605 | ✅ Solid | 250 objections, 115 quotes, anti-repeat logic |
| `contexts/AppContext.tsx` | 754 | ✅ Excellent | Comprehensive state management |
| `contexts/AIContext.tsx` | ~30 | ✅ Simple | Does its job |
| `app/index.tsx` | ~35 | ✅ | Splash routing |
| `app/onboarding.tsx` | ~200 | ✅ | Clean 2-step flow |
| `app/(tabs)/_layout.tsx` | ~250 | ✅ | Tab nav + modals + ads + floating button |
| `app/(tabs)/index.tsx` | 697 | ✅ Excellent | Feature-packed dashboard |
| `app/(tabs)/arena.tsx` | 586 | ✅ Solid | Dynamic categories |
| `app/(tabs)/coach.tsx` | 448 | ✅ Good | Clear premium differentiation |
| `app/(tabs)/goals.tsx` | 320 | ✅ Good | All statuses, filters, sorting |
| `app/(tabs)/profile.tsx` | 877 | ✅ Excellent | 13 badges, full settings, modals |
| `app/practice.tsx` | 478 | ✅ Good | Core practice flow |
| `app/add-goal.tsx` | 387 | ✅ Good | Calendar picker, presets |
| `app/edit-goal.tsx` | 361 | ✅ Good | Full edit + delete + pause |
| `components/AIChatSheet.tsx` | 1332 | ✅ Excellent | Full chat engine with API, fallbacks, goal creation |
| `components/FloatingAIButton.tsx` | ~60 | ✅ | Animated |
| `components/PremiumPaywall.tsx` | 303 | ✅ Good | Polished but needs real IAP |
| `components/PremiumAnalytics.tsx` | 549 | ✅ Good | Dual-state (locked/premium) |
| `components/StatsModals.tsx` | 414 | ✅ Good | 3 detailed modals |
| `components/UpgradeBanner.tsx` | 104 | ✅ | Clean |
| `components/AdBanner.tsx` | 77 | ⚠️ Placeholder | No real ads |
| `components/AdPopup.tsx` | 202 | ⚠️ Placeholder | No real ads |
| `backend/api/chat.js` | 237 | ✅ Excellent | Model routing, expertise data, retry chain |
| `backend/vercel.json` | 9 | ✅ | 60s timeout |
| `utils/notifications.ts` | 435 | ✅ Good | Dual-tier, 4 types, minor anti-repeat bug |

---

## BOTTOM LINE

**The app itself is done.** The features, the AI, the gamification, the content — it's all there and well-built. What's missing is the **store infrastructure**: real payments, real ads, build configuration, and compliance items (privacy policy, error boundaries). 

Estimated remaining work to launch:
- **RevenueCat integration**: 4-6 hours
- **AdMob integration**: 2-3 hours  
- **EAS config + build testing**: 2-3 hours
- **Bug fixes + cleanup**: 2-3 hours
- **Store submission prep**: 3-4 hours

**Total: ~15-20 hours to launch-ready.**
