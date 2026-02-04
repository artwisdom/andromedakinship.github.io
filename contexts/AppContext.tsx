import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupNotifications, updateNotificationStats } from '../utils/notifications';

export type Industry = 
  | 'automotive' 
  | 'saas' 
  | 'insurance' 
  | 'realestate' 
  | 'retail' 
  | 'financial' 
  | 'medical' 
  | 'solar' 
  | 'telecom' 
  | 'hvac' 
  | 'fitness' 
  | 'general';

export type GoalRecurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type GoalPriority = 'high' | 'medium' | 'low';
export type GoalStatus = 'upcoming' | 'active' | 'paused' | 'completed' | 'overdue';

export type Goal = {
  id: string;
  title: string;
  type: 'sales' | 'personal' | 'skill';
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  startDate?: string; // ISO date — goal activates on this date
  endDate?: string; // ISO date — goal is due by this date
  recurrence: GoalRecurrence; // none = one-time goal
  recurringStreak: number; // consecutive successful completions for recurring goals
  priority: GoalPriority;
  notes: string; // user notes
  status: GoalStatus;
  pausedAt?: string; // ISO date when paused
  lastResetDate?: string; // ISO date of last recurring reset
  createdAt: string;
};

export type DailyStats = {
  date: string; // YYYY-MM-DD
  objectionsCompleted: number;
  objectionsSuccessful: number;
  xpEarned: number;
  practiceMinutes: number;
  readinessScore: number; // 0-100
  coachMessages: number;
  chironMessages: number; // AI coaching consultations
};

type NotificationPreferences = {
  enabled: boolean;
  dailyQuotes: boolean;
  readinessReminder: boolean;
  streakReminder: boolean;
  goalReminder: boolean;
  reminderTime: string;
};

type UserState = {
  name: string;
  industry: Industry | null;
  level: number;
  xp: number;
  totalXpEarned: number;
  streak: number;
  longestStreak: number;
  objectionsCompleted: number;
  successRate: number;
  onboardingComplete: boolean;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  dailyCoachMessages: number;
  lastCoachMessageDate: string | null;
  profilePicture: string | null;
  notifications: NotificationPreferences;
  lastQuoteRefresh: string | null;
  dailyQuoteRefreshes: number;
  openaiApiKey: string | null; // For real AI responses
};

type AppState = {
  user: UserState;
  goals: Goal[];
  dailyStats: DailyStats[];
};

type AppContextType = {
  state: AppState;
  setIndustry: (industry: Industry) => void;
  setName: (name: string) => void;
  completeOnboarding: () => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  incrementGoalProgress: (id: string) => void;
  pauseGoal: (id: string) => void;
  resumeGoal: (id: string) => void;
  completeObjection: (success: boolean) => void;
  setPremium: (isPremium: boolean) => void;
  setProfilePicture: (uri: string | null) => void;
  setOpenAIApiKey: (key: string | null) => void;
  updateNotifications: (prefs: Partial<NotificationPreferences>) => void;
  useCoachMessage: () => boolean;
  canUseCoach: () => boolean;
  getRemainingMessages: () => number;
  canRefreshQuote: () => boolean;
  useQuoteRefresh: () => boolean;
  getTodayStats: () => DailyStats;
  updateTodayStats: (updates: Partial<DailyStats>) => void;
  getWeeklyStats: () => DailyStats[];
  getReadinessScore: () => number;
  getXpToNextLevel: () => number;
  getXpProgress: () => number;
  resetApp: () => void;
  isLoaded: boolean;
  pendingLevelUp: number | null;
  clearLevelUpNotification: () => void;
};

const FREE_DAILY_MESSAGES = 5;
const FREE_DAILY_QUOTE_REFRESHES = 1;
const XP_PER_LEVEL = 100;

const getTodayString = () => new Date().toISOString().split('T')[0];

const createEmptyDailyStats = (date: string): DailyStats => ({
  date,
  objectionsCompleted: 0,
  objectionsSuccessful: 0,
  xpEarned: 0,
  practiceMinutes: 0,
  readinessScore: 0,
  coachMessages: 0,
  chironMessages: 0,
});

const initialState: AppState = {
  user: {
    name: '',
    industry: null,
    level: 1,
    xp: 0,
    totalXpEarned: 0,
    streak: 0,
    longestStreak: 0,
    objectionsCompleted: 0,
    successRate: 0,
    onboardingComplete: false,
    isPremium: false,
    premiumExpiresAt: null,
    dailyCoachMessages: 0,
    lastCoachMessageDate: null,
    profilePicture: null,
    notifications: {
      enabled: true,
      dailyQuotes: true,
      readinessReminder: true,
      streakReminder: true,
      goalReminder: true,
      reminderTime: '08:00',
    },
    lastQuoteRefresh: null,
    dailyQuoteRefreshes: 0,
    openaiApiKey: null,
  },
  goals: [],
  dailyStats: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = '@quotacrusher_state';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pendingLevelUp, setPendingLevelUp] = useState<number | null>(null);

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveState();
    }
  }, [state, isLoaded]);

  // Check goal statuses: upcoming→active, recurring resets, overdue detection
  useEffect(() => {
    if (!isLoaded) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = getTodayString();
    let changed = false;

    const updatedGoals = state.goals.map(g => {
      let goal = { ...g };
      // Ensure backwards compatibility for old goals missing new fields
      if (!goal.recurrence) goal.recurrence = 'none';
      if (goal.recurringStreak === undefined) goal.recurringStreak = 0;
      if (!goal.priority) goal.priority = 'medium';
      if (goal.notes === undefined) goal.notes = '';
      // Map old statuses
      if ((goal.status as string) !== 'upcoming' && (goal.status as string) !== 'active' && 
          (goal.status as string) !== 'paused' && (goal.status as string) !== 'completed' && (goal.status as string) !== 'overdue') {
        goal.status = 'active';
      }

      // Skip paused goals
      if (goal.status === 'paused') return goal;

      // Upcoming → Active when start date arrives
      if (goal.status === 'upcoming' && goal.startDate) {
        const start = new Date(goal.startDate);
        start.setHours(0, 0, 0, 0);
        if (today >= start) {
          goal.status = 'active';
          changed = true;
        }
      }

      // Recurring goal reset logic
      if (goal.recurrence !== 'none' && goal.status === 'active' && goal.lastResetDate) {
        const lastReset = new Date(goal.lastResetDate);
        lastReset.setHours(0, 0, 0, 0);
        const daysSinceReset = Math.floor((today.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
        
        let shouldReset = false;
        switch (goal.recurrence) {
          case 'daily': shouldReset = daysSinceReset >= 1; break;
          case 'weekly': shouldReset = daysSinceReset >= 7; break;
          case 'biweekly': shouldReset = daysSinceReset >= 14; break;
          case 'monthly': shouldReset = daysSinceReset >= 30; break;
        }
        
        if (shouldReset) {
          const wasCompleted = goal.current >= goal.target;
          goal.recurringStreak = wasCompleted ? goal.recurringStreak + 1 : 0;
          goal.current = 0;
          goal.lastResetDate = todayStr;
          changed = true;
        }
      }

      // Check for overdue (one-time goals only)
      if (goal.status === 'active' && goal.recurrence === 'none' && goal.endDate) {
        const end = new Date(goal.endDate);
        end.setHours(0, 0, 0, 0);
        if (today > end && goal.current < goal.target) {
          goal.status = 'overdue';
          changed = true;
        }
      }

      return goal;
    });

    if (changed) {
      setState(prev => ({ ...prev, goals: updatedGoals }));
    }
  }, [isLoaded, state.goals.length]);

  // Setup notifications when preferences change
  useEffect(() => {
    if (isLoaded && state.user.onboardingComplete) {
      const today = getTodayString();
      const todayData = state.dailyStats.find(s => s.date === today);
      const readiness = todayData?.readinessScore || 0;
      
      // Sync user stats to notification system (premium gets personalized Chiron AI notifications)
      const completedGoals = state.goals.filter(g => g.status === 'completed').length;
      updateNotificationStats({
        name: state.user.name || 'Champion',
        level: state.user.level,
        streak: state.user.streak,
        readinessScore: readiness,
        objectionsCompleted: state.user.objectionsCompleted,
        successRate: state.user.successRate,
        goalCount: state.goals.filter(g => g.status === 'active').length,
        goalsCompleted: completedGoals,
        isPremium: state.user.isPremium,
      }).catch(() => {});

      setupNotifications(state.user.notifications).catch(error => {
        console.error('Failed to setup notifications:', error);
      });
    }
  }, [isLoaded, state.user.notifications, state.user.onboardingComplete, state.user.streak, state.user.level, state.user.xp, state.user.isPremium, state.goals.length]);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({
          ...initialState,
          ...parsed,
          user: { ...initialState.user, ...parsed.user },
          dailyStats: parsed.dailyStats || [],
        });
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveState = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  };

  const updateTodayStats = (updates: Partial<DailyStats>) => {
    const today = getTodayString();
    setState(prev => {
      const existingIndex = prev.dailyStats.findIndex(s => s.date === today);
      let newStats = [...prev.dailyStats];
      
      if (existingIndex >= 0) {
        newStats[existingIndex] = { ...newStats[existingIndex], ...updates };
      } else {
        newStats.push({ ...createEmptyDailyStats(today), ...updates });
      }
      
      // Keep last 90 days
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      newStats = newStats.filter(s => new Date(s.date) >= cutoff);
      
      return { ...prev, dailyStats: newStats };
    });
  };

  const setIndustry = (industry: Industry) => {
    setState(prev => ({ ...prev, user: { ...prev.user, industry } }));
  };

  const setName = (name: string) => {
    setState(prev => ({ ...prev, user: { ...prev.user, name } }));
  };

  const completeOnboarding = () => {
    setState(prev => ({ ...prev, user: { ...prev.user, onboardingComplete: true } }));
  };

  const addXP = (amount: number) => {
    // Get current level before update
    const currentLevel = state.user.level;
    const currentXP = state.user.xp;
    
    // Calculate new level
    let newXP = currentXP + amount;
    let newLevel = currentLevel;
    
    while (newXP >= XP_PER_LEVEL * newLevel) {
      newXP -= XP_PER_LEVEL * newLevel;
      newLevel++;
    }
    
    // Track level up for celebration popup (before setState)
    if (newLevel > currentLevel) {
      setPendingLevelUp(newLevel);
    }
    
    setState(prev => ({
      ...prev,
      user: { 
        ...prev.user, 
        xp: newXP, 
        level: newLevel,
        totalXpEarned: prev.user.totalXpEarned + amount,
      },
    }));
    
    const todayStats = getTodayStats();
    updateTodayStats({ xpEarned: todayStats.xpEarned + amount });
  };

  const incrementStreak = () => {
    setState(prev => {
      const newStreak = prev.user.streak + 1;
      return {
        ...prev,
        user: {
          ...prev.user,
          streak: newStreak,
          longestStreak: Math.max(newStreak, prev.user.longestStreak),
        },
      };
    });
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    // Determine initial status
    let initialStatus: GoalStatus = goal.status || 'active';
    if (goal.startDate) {
      const start = new Date(goal.startDate);
      start.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start > today) {
        initialStatus = 'upcoming';
      }
    }
    
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      recurrence: goal.recurrence || 'none',
      recurringStreak: goal.recurringStreak || 0,
      priority: goal.priority || 'medium',
      notes: goal.notes || '',
      status: initialStatus,
      lastResetDate: goal.recurrence && goal.recurrence !== 'none' ? getTodayString() : undefined,
    };
    setState(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => (g.id === id ? { ...g, ...updates } : g)),
    }));
  };

  const deleteGoal = (id: string) => {
    setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  };

  const pauseGoal = (id: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => 
        g.id === id ? { ...g, status: 'paused' as GoalStatus, pausedAt: new Date().toISOString() } : g
      ),
    }));
  };

  const resumeGoal = (id: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id !== id) return g;
        // Determine correct status on resume
        let newStatus: GoalStatus = 'active';
        if (g.startDate) {
          const start = new Date(g.startDate);
          start.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (start > today) newStatus = 'upcoming';
        }
        return { ...g, status: newStatus, pausedAt: undefined };
      }),
    }));
  };

  const incrementGoalProgress = (id: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id === id && g.current < g.target) {
          const newCurrent = g.current + 1;
          const isComplete = newCurrent >= g.target;
          // Recurring goals stay 'active' when they hit target (they'll reset next period)
          const newStatus = isComplete && g.recurrence === 'none' ? 'completed' as GoalStatus : g.status;
          return { ...g, current: newCurrent, status: newStatus };
        }
        return g;
      }),
    }));
  };

  // Auto-increment goals by unit type (practices, sessions, etc.)
  const autoIncrementGoalsByUnit = (unitType: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        // Only increment active goals that match the unit type
        if (g.status === 'active' && g.unit.toLowerCase().includes(unitType.toLowerCase())) {
          const newCurrent = g.current + 1;
          const isComplete = newCurrent >= g.target;
          const newStatus = isComplete && g.recurrence === 'none' ? 'completed' as GoalStatus : g.status;
          return { ...g, current: newCurrent, status: newStatus };
        }
        return g;
      }),
    }));
  };

  const completeObjection = (success: boolean) => {
    const xpAmount = success ? 25 : 10;
    
    // Get current level before update to detect level-up
    const currentLevel = state.user.level;
    const currentXP = state.user.xp;
    
    // Pre-calculate new level
    let calcXP = currentXP + xpAmount;
    let calcLevel = currentLevel;
    while (calcXP >= XP_PER_LEVEL * calcLevel) {
      calcXP -= XP_PER_LEVEL * calcLevel;
      calcLevel++;
    }
    
    // Trigger level up celebration if leveled up
    if (calcLevel > currentLevel) {
      setPendingLevelUp(calcLevel);
    }
    
    setState(prev => {
      const total = prev.user.objectionsCompleted + 1;
      const currentSuccesses = Math.round((prev.user.successRate / 100) * prev.user.objectionsCompleted);
      const newSuccesses = currentSuccesses + (success ? 1 : 0);
      const newRate = total > 0 ? Math.round((newSuccesses / total) * 100) : 0;
      
      return {
        ...prev,
        user: {
          ...prev.user,
          objectionsCompleted: total,
          successRate: newRate,
          xp: calcXP,
          level: calcLevel,
          totalXpEarned: prev.user.totalXpEarned + xpAmount,
        },
      };
    });
    
    // Auto-increment practice goals
    autoIncrementGoalsByUnit('practice');
    
    const todayStats = getTodayStats();
    updateTodayStats({
      objectionsCompleted: todayStats.objectionsCompleted + 1,
      objectionsSuccessful: todayStats.objectionsSuccessful + (success ? 1 : 0),
      xpEarned: todayStats.xpEarned + xpAmount,
    });
  };

  const setPremium = (isPremium: boolean) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        isPremium,
        premiumExpiresAt: isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
      },
    }));
  };

  const setProfilePicture = (uri: string | null) => {
    setState(prev => ({ ...prev, user: { ...prev.user, profilePicture: uri } }));
  };

  const setOpenAIApiKey = (key: string | null) => {
    setState(prev => ({ ...prev, user: { ...prev.user, openaiApiKey: key } }));
  };

  const updateNotifications = (prefs: Partial<NotificationPreferences>) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, notifications: { ...prev.user.notifications, ...prefs } },
    }));
  };

  const canUseCoach = (): boolean => {
    if (state.user.isPremium) return true;
    const today = getTodayString();
    if (state.user.lastCoachMessageDate !== today) return true;
    return state.user.dailyCoachMessages < FREE_DAILY_MESSAGES;
  };

  const useCoachMessage = (): boolean => {
    const today = getTodayString();
    
    // Always track coach session for goals (both free and premium)
    autoIncrementGoalsByUnit('session');
    
    const todayStats = getTodayStats();
    updateTodayStats({ coachMessages: todayStats.coachMessages + 1 });
    
    // Premium users always allowed
    if (state.user.isPremium) return true;
    
    // Free user limit check
    let dailyMessages = state.user.dailyCoachMessages;
    if (state.user.lastCoachMessageDate !== today) dailyMessages = 0;
    if (dailyMessages >= FREE_DAILY_MESSAGES) return false;
    
    setState(prev => ({
      ...prev,
      user: { ...prev.user, dailyCoachMessages: dailyMessages + 1, lastCoachMessageDate: today },
    }));
    
    return true;
  };

  const getRemainingMessages = (): number => {
    if (state.user.isPremium) return Infinity;
    const today = getTodayString();
    if (state.user.lastCoachMessageDate !== today) return FREE_DAILY_MESSAGES;
    return Math.max(0, FREE_DAILY_MESSAGES - state.user.dailyCoachMessages);
  };

  const canRefreshQuote = (): boolean => {
    if (state.user.isPremium) return true;
    const today = getTodayString();
    if (state.user.lastQuoteRefresh !== today) return true;
    return state.user.dailyQuoteRefreshes < FREE_DAILY_QUOTE_REFRESHES;
  };

  const useQuoteRefresh = (): boolean => {
    if (state.user.isPremium) return true;
    const today = getTodayString();
    let refreshes = state.user.dailyQuoteRefreshes;
    if (state.user.lastQuoteRefresh !== today) refreshes = 0;
    if (refreshes >= FREE_DAILY_QUOTE_REFRESHES) return false;
    
    setState(prev => ({
      ...prev,
      user: { ...prev.user, dailyQuoteRefreshes: refreshes + 1, lastQuoteRefresh: today },
    }));
    return true;
  };

  const getTodayStats = (): DailyStats => {
    const today = getTodayString();
    return state.dailyStats.find(s => s.date === today) || createEmptyDailyStats(today);
  };

  const getWeeklyStats = (): DailyStats[] => {
    const result: DailyStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const existing = state.dailyStats.find(s => s.date === dateStr);
      result.push(existing || createEmptyDailyStats(dateStr));
    }
    return result;
  };

  const getReadinessScore = (): number => {
    const todayStats = getTodayStats();
    let score = 0;
    
    // Objections practiced (max 40 points) - main focus
    score += Math.min(todayStats.objectionsCompleted * 10, 40);
    
    // Success rate bonus (max 20 points)
    if (todayStats.objectionsCompleted > 0) {
      const rate = todayStats.objectionsSuccessful / todayStats.objectionsCompleted;
      score += Math.round(rate * 20);
    }
    
    // Coach consultation (max 15 points)
    score += Math.min(todayStats.coachMessages * 8, 15);
    
    // Chiron AI consultation bonus (max 10 points, 2% per message)
    score += Math.min((todayStats.chironMessages || 0) * 2, 10);
    
    // XP earned bonus (max 15 points)
    score += Math.min(Math.round(todayStats.xpEarned / 5), 15);
    
    return Math.min(score, 100);
  };

  const getXpToNextLevel = (): number => {
    return XP_PER_LEVEL * state.user.level;
  };

  const getXpProgress = (): number => {
    const needed = getXpToNextLevel();
    return Math.round((state.user.xp / needed) * 100);
  };

  const clearLevelUpNotification = () => {
    setPendingLevelUp(null);
  };

  const resetApp = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setIndustry,
        setName,
        completeOnboarding,
        addXP,
        incrementStreak,
        addGoal,
        updateGoal,
        deleteGoal,
        incrementGoalProgress,
        pauseGoal,
        resumeGoal,
        completeObjection,
        setPremium,
        setProfilePicture,
        setOpenAIApiKey,
        updateNotifications,
        useCoachMessage,
        canUseCoach,
        getRemainingMessages,
        canRefreshQuote,
        useQuoteRefresh,
        getTodayStats,
        updateTodayStats,
        getWeeklyStats,
        getReadinessScore,
        getXpToNextLevel,
        getXpProgress,
        resetApp,
        isLoaded,
        pendingLevelUp,
        clearLevelUpNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export const PREMIUM_PRICE = '$19.99';
export const PREMIUM_PERIOD = 'month';
export const FREE_DAILY_COACH_MESSAGES = FREE_DAILY_MESSAGES;
export const XP_FOR_SUCCESS = 25;
export const XP_FOR_ATTEMPT = 10;

export type { NotificationPreferences, DailyStats };
