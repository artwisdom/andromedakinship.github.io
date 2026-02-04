import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRandomQuote, QUOTES } from '../constants/Objections';

// Configure notification handler
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.log('Notifications not available in this environment');
}

// ---- Quote Anti-Repeat System (persisted) ----
const QUOTE_HISTORY_KEY = '@chiron_quote_history';

async function getUnusedQuote(): Promise<{ text: string; author: string }> {
  try {
    // Load previously shown quote indices
    const stored = await AsyncStorage.getItem(QUOTE_HISTORY_KEY);
    let usedIndices: number[] = stored ? JSON.parse(stored) : [];
    
    // If we've shown most quotes, reset to allow repeats (keep last 10 to avoid immediate repeat)
    if (usedIndices.length >= QUOTES.length - 5) {
      usedIndices = usedIndices.slice(-10);
    }
    
    // Find indices that haven't been used recently
    const availableIndices = QUOTES.map((_, i) => i).filter(i => !usedIndices.includes(i));
    
    // Pick a random available index
    const selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    
    // Add to history and save
    usedIndices.push(selectedIndex);
    await AsyncStorage.setItem(QUOTE_HISTORY_KEY, JSON.stringify(usedIndices));
    
    return QUOTES[selectedIndex];
  } catch {
    // Fallback to basic random if storage fails
    return getRandomQuote();
  }
}

// ---- User Stats for Premium Notifications ----
type ChironNotificationStats = {
  name: string;
  level: number;
  streak: number;
  readinessScore: number;
  objectionsCompleted: number;
  successRate: number;
  goalCount: number;
  goalsCompleted: number;
  isPremium: boolean;
};

const STATS_KEY = '@chiron_notification_stats';

export async function updateNotificationStats(stats: ChironNotificationStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.log('Error saving notification stats:', error);
  }
}

async function getStats(): Promise<ChironNotificationStats> {
  try {
    const stored = await AsyncStorage.getItem(STATS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { name: 'Champion', level: 1, streak: 0, readinessScore: 0, objectionsCompleted: 0, successRate: 0, goalCount: 0, goalsCompleted: 0, isPremium: false };
}

// Request permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('chiron', {
        name: 'Chiron AI Coach',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F59E0B',
      });
    }
    return true;
  } catch (error) {
    console.log('Error requesting notification permissions:', error);
    return false;
  }
}

// ===================================================================
// FREE NOTIFICATIONS — Generic, motivational, no personalized stats
// ===================================================================

function scheduleFreeNotifications(hour: number, minute: number, prefs: any) {
  // 1. Daily Sales Quote (morning, at user's reminder time)
  if (prefs.dailyQuotes) {
    scheduleFreeDailyQuote(hour, minute);
  } else {
    cancelById('daily-quote');
  }

  // 2. Readiness Reminder (30 min before reminder time)
  if (prefs.readinessReminder) {
    const rHour = hour === 0 ? 23 : (minute >= 30 ? hour : hour - 1);
    const rMinute = (minute + 30) % 60;
    scheduleFreeReadinessReminder(rHour, rMinute);
  } else {
    cancelById('readiness-reminder');
  }

  // 3. Afternoon Check-In (1:00 PM)
  if (prefs.goalReminder) {
    scheduleFreeAfternoonCheckin(13, 0);
  } else {
    cancelById('goal-reminder');
  }

  // 4. EOD Wrap Up (8:00 PM)
  if (prefs.streakReminder) {
    scheduleFreeEODWrapUp(20, 0);
  } else {
    cancelById('streak-reminder');
  }
}

async function scheduleFreeDailyQuote(hour: number, minute: number) {
  try {
    await cancelById('daily-quote');
    const quote = await getUnusedQuote();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚡ Daily Sales Quote',
        body: `"${quote.text}" — ${quote.author}`,
        data: { type: 'daily-quote' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour, minute,
      },
      identifier: 'daily-quote',
    });
    console.log(`Daily quote scheduled for ${hour}:${String(minute).padStart(2, '0')}`);
  } catch (e) { console.log('Error scheduling free daily quote:', e); }
}

async function scheduleFreeReadinessReminder(hour: number, minute: number) {
  try {
    await cancelById('readiness-reminder');
    const messages = [
      "Start your day sharp — practice one objection before your first call.",
      "Top closers never wing it. Run through a quick practice session now.",
      "Feeling ready? Prove it — knock out a few objections this morning.",
      "Your sales day starts with preparation. Open the arena and warm up!",
      "Champions prepare before they perform. Time to practice!",
    ];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Time to Practice',
        body: messages[Math.floor(Math.random() * messages.length)],
        data: { type: 'readiness-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour, minute,
      },
      identifier: 'readiness-reminder',
    });
    console.log(`Readiness reminder scheduled for ${hour}:${String(minute).padStart(2, '0')}`);
  } catch (e) { console.log('Error scheduling free readiness:', e); }
}

async function scheduleFreeAfternoonCheckin(hour: number, minute: number) {
  try {
    await cancelById('goal-reminder');
    const messages = [
      "Afternoon check-in: How's the day going? Log a quick win or practice a tough objection.",
      "Halfway through the day — have you sharpened your skills yet?",
      "Quick check: Any deals moving? Keep the momentum going with a practice round.",
      "The afternoon slump is where deals die. Stay sharp — open SellCraft.",
    ];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Afternoon Check-In',
        body: messages[Math.floor(Math.random() * messages.length)],
        data: { type: 'goal-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour, minute,
      },
      identifier: 'goal-reminder',
    });
    console.log(`Afternoon check-in scheduled for ${hour}:${String(minute).padStart(2, '0')}`);
  } catch (e) { console.log('Error scheduling afternoon check-in:', e); }
}

async function scheduleFreeEODWrapUp(hour: number, minute: number) {
  try {
    await cancelById('streak-reminder');
    const messages = [
      "End of day — did you practice today? Don't break your streak!",
      "Before you clock out: one quick objection practice keeps the streak alive.",
      "Day's almost over. Even 2 minutes of practice makes a difference tomorrow.",
      "EOD wrap-up: Close out strong. One round in the arena before bed.",
    ];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 End of Day',
        body: messages[Math.floor(Math.random() * messages.length)],
        data: { type: 'streak-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour, minute,
      },
      identifier: 'streak-reminder',
    });
    console.log(`EOD wrap-up scheduled for ${hour}:${String(minute).padStart(2, '0')}`);
  } catch (e) { console.log('Error scheduling EOD wrap-up:', e); }
}

// ===================================================================
// PREMIUM NOTIFICATIONS — Personalized from "Chiron AI" with stats
// ===================================================================

function schedulePremiumNotifications(hour: number, minute: number, prefs: any, stats: ChironNotificationStats) {
  // 1. Chiron AI — Personalized Quote (morning)
  if (prefs.dailyQuotes) {
    schedulePremiumDailyQuote(hour, minute, stats);
  } else {
    cancelById('daily-quote');
  }

  // 2. Chiron AI — Readiness with score
  if (prefs.readinessReminder) {
    const rHour = hour === 0 ? 23 : (minute >= 30 ? hour : hour - 1);
    const rMinute = (minute + 30) % 60;
    schedulePremiumReadiness(rHour, rMinute, stats);
  } else {
    cancelById('readiness-reminder');
  }

  // 3. Chiron AI — Goals check-in
  if (prefs.goalReminder) {
    schedulePremiumGoalCheckin(12, 0, stats);
  } else {
    cancelById('goal-reminder');
  }

  // 4. Chiron AI — Streak alert
  if (prefs.streakReminder) {
    schedulePremiumStreakAlert(20, 0, stats);
  } else {
    cancelById('streak-reminder');
  }
}

async function schedulePremiumDailyQuote(hour: number, minute: number, stats: ChironNotificationStats) {
  try {
    await cancelById('daily-quote');
    const quote = await getUnusedQuote();
    const greetings = [
      `${stats.name}, here's today's wisdom:`,
      `Level ${stats.level} insight for you, ${stats.name}:`,
      `Your daily fire, ${stats.name}:`,
      `Words to close by, ${stats.name}:`,
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚡ Chiron AI',
        body: `${greeting}\n"${quote.text}" — ${quote.author}`,
        data: { type: 'daily-quote' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour, minute,
      },
      identifier: 'daily-quote',
    });
    console.log(`Daily quote scheduled for ${hour}:${String(minute).padStart(2, '0')}`);
  } catch (e) { console.log('Error scheduling premium daily quote:', e); }
}

async function schedulePremiumReadiness(hour: number, minute: number, stats: ChironNotificationStats) {
  try {
    await cancelById('readiness-reminder');
    const r = stats.readinessScore;
    const msgs = r >= 80 ? [
      `${stats.name}, you're at ${r}% readiness — almost battle-ready. One more round and you're unstoppable.`,
      `${r}% readiness. Let's push for 100% before your first call, ${stats.name}.`,
    ] : r >= 40 ? [
      `${stats.name}, readiness is at ${r}%. Good start, but we've got work to do.`,
      `${r}% readiness, ${stats.name}. A few rounds with me and you'll be dangerous today.`,
    ] : [
      `${stats.name}, readiness is ${r}%. Time to wake up and train — your prospects are preparing objections.`,
      `${r}% readiness, ${stats.name}. That's leaving money on the table. Let me get you battle-ready.`,
    ];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🎯 Chiron AI — Readiness: ${r}%`,
        body: msgs[Math.floor(Math.random() * msgs.length)],
        data: { type: 'readiness-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour, minute,
      },
      identifier: 'readiness-reminder',
    });
    console.log(`Readiness reminder scheduled for ${hour}:${String(minute).padStart(2, '0')}`);
  } catch (e) { console.log('Error scheduling premium readiness:', e); }
}

async function schedulePremiumGoalCheckin(hour: number, minute: number, stats: ChironNotificationStats) {
  try {
    await cancelById('goal-reminder');
    const msgs = stats.goalCount > 0 ? [
      `${stats.name}, ${stats.goalsCompleted}/${stats.goalCount} goals hit. Level ${stats.level} closers finish what they start.`,
      `Midday check, ${stats.name}. ${stats.goalCount - stats.goalsCompleted} goals still open. What's blocking you?`,
      `At ${stats.successRate}% success rate and ${stats.goalsCompleted} goals down — keep pushing, ${stats.name}.`,
    ] : [
      `${stats.name}, no active goals? Champions always have targets. Set one today.`,
      `Level ${stats.level} with no goals, ${stats.name}? Let's set a target to push you to Level ${stats.level + 1}.`,
    ];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🏆 Chiron AI — ${stats.goalCount > 0 ? `${stats.goalsCompleted}/${stats.goalCount} Goals` : 'Set a Goal'}`,
        body: msgs[Math.floor(Math.random() * msgs.length)],
        data: { type: 'goal-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour, minute,
      },
      identifier: 'goal-reminder',
    });
    console.log(`Goal check-in scheduled for ${hour}:${String(minute).padStart(2, '0')}`);
  } catch (e) { console.log('Error scheduling premium goal check-in:', e); }
}

async function schedulePremiumStreakAlert(hour: number, minute: number, stats: ChironNotificationStats) {
  try {
    await cancelById('streak-reminder');
    const s = stats.streak;
    const msgs = s > 5 ? [
      `${stats.name}, you're on a ${s}-day streak! Don't let it die tonight. 2 minutes with me.`,
      `${s} days strong, ${stats.name}. Legends don't skip days. Keep the fire burning.`,
    ] : s > 0 ? [
      `${stats.name}, ${s}-day streak going. One quick practice before bed.`,
      `Don't break the chain, ${stats.name}! Day ${s} is done when you say it's done.`,
    ] : [
      `${stats.name}, let's start a new streak tonight. One objection, that's all.`,
      `No streak yet, ${stats.name}? Every champion starts somewhere. Let's go.`,
    ];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔥 Chiron AI — ${s > 0 ? `${s} Day Streak` : 'Start Your Streak'}`,
        body: msgs[Math.floor(Math.random() * msgs.length)],
        data: { type: 'streak-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour, minute,
      },
      identifier: 'streak-reminder',
    });
    console.log(`Streak alert scheduled for ${hour}:${String(minute).padStart(2, '0')}`);
  } catch (e) { console.log('Error scheduling premium streak alert:', e); }
}

// ===================================================================
// SHARED UTILITIES
// ===================================================================

async function cancelById(identifier: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {}
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

// Main setup — routes to free or premium notifications
export async function setupNotifications(preferences: {
  enabled: boolean;
  dailyQuotes: boolean;
  readinessReminder: boolean;
  streakReminder: boolean;
  goalReminder: boolean;
  reminderTime: string;
}): Promise<void> {
  try {
    if (!preferences.enabled) {
      await cancelAllNotifications();
      return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    const [hour, minute] = preferences.reminderTime.split(':').map(Number);
    const stats = await getStats();

    if (stats.isPremium) {
      schedulePremiumNotifications(hour, minute, preferences, stats);
    } else {
      scheduleFreeNotifications(hour, minute, preferences);
    }

    console.log('Notifications setup complete');
  } catch (error) {
    console.log('Error setting up notifications:', error);
  }
}

export async function getScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch {
    return [];
  }
}
