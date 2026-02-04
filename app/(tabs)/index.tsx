import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '../../contexts/AppContext';
import { INDUSTRY_INFO, getRandomQuote } from '../../constants/Objections';
import { LevelDetailsModal, ReadinessDetailsModal, StreakDetailsModal } from '../../components/StatsModals';
import Theme from '../../constants/Theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Get milestone badge based on level (matches StatsModals milestones)
const getMilestoneBadge = (level: number): { emoji: string; name: string } | null => {
  if (level >= 100) return { emoji: '👑', name: 'Legend' };
  if (level >= 50) return { emoji: '💎', name: 'Master' };
  if (level >= 25) return { emoji: '🥇', name: 'Expert' };
  if (level >= 10) return { emoji: '🥈', name: 'Closer' };
  if (level >= 5) return { emoji: '🥉', name: 'Rookie' };
  return null;
};

export default function HomeScreen() {
  const { 
    state, 
    canRefreshQuote, 
    useQuoteRefresh, 
    getReadinessScore, 
    getTodayStats, 
    getWeeklyStats,
    getXpToNextLevel,
    getXpProgress,
    pendingLevelUp,
    clearLevelUpNotification,
  } = useApp();
  const { user, goals } = state;
  
  const [quote, setQuote] = useState(getRandomQuote());
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false);
  const [celebrationLevel, setCelebrationLevel] = useState(0);
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const starScale1 = useRef(new Animated.Value(0)).current;
  const starScale2 = useRef(new Animated.Value(0)).current;
  const starScale3 = useRef(new Animated.Value(0)).current;

  // Handle level up celebration
  useEffect(() => {
    if (pendingLevelUp && !showLevelUpCelebration) {
      setCelebrationLevel(pendingLevelUp);
      setShowLevelUpCelebration(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Reset animations first
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      starScale1.setValue(0);
      starScale2.setValue(0);
      starScale3.setValue(0);
      
      // Start animations
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }).start();
      
      // Rotate animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
      
      // Star animations with staggered delays
      Animated.stagger(200, [
        Animated.spring(starScale1, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
        Animated.spring(starScale2, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
        Animated.spring(starScale3, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
      ]).start();
    }
  }, [pendingLevelUp]);

  const dismissLevelUp = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowLevelUpCelebration(false);
      clearLevelUpNotification();
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      starScale1.setValue(0);
      starScale2.setValue(0);
      starScale3.setValue(0);
    });
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const industryInfo = user.industry ? INDUSTRY_INFO[user.industry] : null;
  const xpToNext = getXpToNextLevel();
  const xpProgress = getXpProgress();
  const readinessScore = getReadinessScore();
  const todayStats = getTodayStats();
  const weeklyStats = getWeeklyStats();
  const totalXP = user.totalXpEarned || ((user.level - 1) * 100 + user.xp);
  const milestoneBadge = getMilestoneBadge(user.level);

  const activeGoals = goals.filter(g => g.status === 'active' || g.status === 'overdue');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const handleRefreshQuote = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!user.isPremium && !canRefreshQuote()) {
      Alert.alert(
        '⚡ Premium Feature',
        'Unlimited quote refreshes are available with Premium. Upgrade now for unlimited motivation!',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/(tabs)/profile') },
        ]
      );
      return;
    }
    
    if (useQuoteRefresh()) {
      setQuote(getRandomQuote());
    }
  };

  const handleLevelPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowLevelModal(true);
  };

  const handleReadinessPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowReadinessModal(true);
  };

  const handleStreakPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowStreakModal(true);
  };

  const getReadinessColor = () => {
    if (readinessScore >= 80) return Theme.colors.success;
    if (readinessScore >= 50) return Theme.colors.warning;
    return Theme.colors.error;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Theme.colors.background.primary, Theme.colors.background.secondary]}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Profile Picture */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user.name || 'Champion'}</Text>
              {industryInfo && (
                <View style={styles.industryTag}>
                  <Text style={styles.industryEmoji}>{industryInfo.icon}</Text>
                  <Text style={styles.industryText}>{industryInfo.name}</Text>
                </View>
              )}
            </View>
            <Pressable onPress={() => router.push('/(tabs)/profile')} style={styles.profilePicContainer}>
              {user.profilePicture ? (
                <Image source={{ uri: user.profilePicture }} style={styles.profilePic} />
              ) : (
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.profilePicPlaceholder}>
                  <Text style={styles.profileInitial}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </LinearGradient>
              )}
              {user.isPremium && (
                <View style={styles.premiumBadge}>
                  <Feather name="star" size={10} color={Theme.colors.background.primary} />
                </View>
              )}
            </Pressable>
          </View>

          {/* Level Card - Expandable */}
          <Pressable onPress={handleLevelPress} style={({ pressed }) => [styles.levelCard, pressed && styles.cardPressed]}>
            <LinearGradient
              colors={[Theme.colors.background.elevated, Theme.colors.background.card]}
              style={styles.levelCardGradient}
            >
              <View style={styles.levelCardHeader}>
                <View style={styles.levelBadge}>
                  <LinearGradient colors={['#00F5D4', '#8B5CF6']} style={styles.levelBadgeGradient}>
                    <Text style={styles.levelNumber}>{user.level}</Text>
                  </LinearGradient>
                </View>
                {milestoneBadge && (
                  <View style={styles.milestoneBadge}>
                    <Text style={styles.milestoneBadgeEmoji}>{milestoneBadge.emoji}</Text>
                  </View>
                )}
                <View style={styles.levelInfo}>
                  <View style={styles.levelTitleRow}>
                    <Text style={styles.levelTitle}>Level {user.level}</Text>
                    {milestoneBadge && (
                      <Text style={styles.milestoneTitle}>{milestoneBadge.name}</Text>
                    )}
                  </View>
                  <Text style={styles.levelSubtitle}>{user.xp}/{xpToNext} XP to next level</Text>
                </View>
                <View style={styles.expandIcon}>
                  <Feather name="chevron-right" size={20} color={Theme.colors.text.muted} />
                </View>
              </View>
              
              <View style={styles.xpBarContainer}>
                <View style={styles.xpBarBg}>
                  <LinearGradient
                    colors={['#00F5D4', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.xpBarFill, { width: `${xpProgress}%` }]}
                  />
                </View>
                <Text style={styles.xpPercentage}>{xpProgress}%</Text>
              </View>
              
              <Text style={styles.tapHint}>Tap for details & milestones</Text>
            </LinearGradient>
          </Pressable>

          {/* Quick Stats Row - All Clickable */}
          <View style={styles.statsRow}>
            {/* Sales Readiness */}
            <Pressable onPress={handleReadinessPress} style={({ pressed }) => [styles.statCard, pressed && styles.cardPressed]}>
              <View style={[styles.statIconContainer, { backgroundColor: getReadinessColor() + '20' }]}>
                <Feather name="activity" size={18} color={getReadinessColor()} />
              </View>
              <Text style={[styles.statValue, { color: getReadinessColor() }]}>{readinessScore}%</Text>
              <Text style={styles.statLabel}>Readiness</Text>
              <Feather name="chevron-right" size={14} color={Theme.colors.text.muted} style={styles.statExpand} />
            </Pressable>

            {/* Streak */}
            <Pressable onPress={handleStreakPress} style={({ pressed }) => [styles.statCard, pressed && styles.cardPressed]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Text style={styles.streakEmoji}>🔥</Text>
              </View>
              <Text style={[styles.statValue, { color: Theme.colors.warning }]}>{user.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
              <Feather name="chevron-right" size={14} color={Theme.colors.text.muted} style={styles.statExpand} />
            </Pressable>

            {/* Success Rate */}
            <Pressable 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(
                  '🎯 Success Rate',
                  `Your objection handling success rate is ${user.successRate}%.\n\nTotal attempts: ${user.objectionsCompleted}\nSuccessful: ${Math.round(user.objectionsCompleted * user.successRate / 100)}\n\nKeep practicing to improve!`,
                  [{ text: 'Got it!' }]
                );
              }}
              style={({ pressed }) => [styles.statCard, pressed && styles.cardPressed]}
            >
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(0, 245, 212, 0.15)' }]}>
                <Feather name="target" size={18} color={Theme.colors.accent.primary} />
              </View>
              <Text style={[styles.statValue, { color: Theme.colors.success }]}>{user.successRate}%</Text>
              <Text style={styles.statLabel}>Success</Text>
              <Feather name="info" size={14} color={Theme.colors.text.muted} style={styles.statExpand} />
            </Pressable>
          </View>

          {/* Daily Quote with Refresh */}
          <View style={styles.quoteCard}>
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.12)', 'rgba(217, 119, 6, 0.08)']}
              style={styles.quoteGradient}
            >
              <View style={styles.quoteHeader}>
                <View style={styles.quoteBadge}>
                  <Text style={styles.quoteBadgeText}>⚡ DAILY MOTIVATION</Text>
                </View>
                <Pressable onPress={handleRefreshQuote} style={styles.refreshButton}>
                  <Feather name="refresh-cw" size={16} color={Theme.colors.warning} />
                </Pressable>
              </View>
              <Text style={styles.quoteText}>"{quote.text}"</Text>
              <Text style={styles.quoteAuthor}>— {quote.author}</Text>
            </LinearGradient>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <View style={styles.actionsGrid}>
            <Pressable
              onPress={() => router.push('/practice')}
              style={({ pressed }) => [styles.actionCard, pressed && styles.cardPressed]}
            >
              <LinearGradient colors={['#00F5D4', '#00D4AA']} style={styles.actionIcon}>
                <Feather name="play" size={22} color={Theme.colors.background.primary} />
              </LinearGradient>
              <Text style={styles.actionTitle}>Quick Practice</Text>
              <Text style={styles.actionSubtitle}>Random scenario</Text>
              <View style={styles.xpReward}>
                <Text style={styles.xpRewardText}>+10-25 XP</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/arena')}
              style={({ pressed }) => [styles.actionCard, pressed && styles.cardPressed]}
            >
              <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionIcon}>
                <Feather name="target" size={22} color={Theme.colors.background.primary} />
              </LinearGradient>
              <Text style={styles.actionTitle}>Arena Mode</Text>
              <Text style={styles.actionSubtitle}>Category practice</Text>
              <View style={styles.xpReward}>
                <Text style={styles.xpRewardText}>+10-25 XP</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/coach')}
              style={({ pressed }) => [styles.actionCard, pressed && styles.cardPressed]}
            >
              <View style={styles.chironActionIcon}>
                <Image 
                  source={require('../../assets/chiron.png')} 
                  style={styles.chironActionImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.actionTitle}>Ask Chiron</Text>
              <Text style={styles.actionSubtitle}>AI guidance</Text>
              <View style={[styles.xpReward, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Text style={[styles.xpRewardText, { color: Theme.colors.warning }]}>+Wisdom</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/add-goal')}
              style={({ pressed }) => [styles.actionCard, pressed && styles.cardPressed]}
            >
              <LinearGradient colors={['#EC4899', '#DB2777']} style={styles.actionIcon}>
                <Feather name="flag" size={22} color={Theme.colors.background.primary} />
              </LinearGradient>
              <Text style={styles.actionTitle}>Set Goal</Text>
              <Text style={styles.actionSubtitle}>Track progress</Text>
              <View style={[styles.xpReward, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                <Text style={[styles.xpRewardText, { color: '#EC4899' }]}>+15 XP</Text>
              </View>
            </Pressable>
          </View>

          {/* Active Goals Preview */}
          {activeGoals.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>ACTIVE GOALS</Text>
                <Pressable onPress={() => router.push('/(tabs)/goals')}>
                  <Text style={styles.seeAll}>See all</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.goalsScroll}>
                {activeGoals.slice(0, 5).map((goal) => {
                  const progress = Math.round((goal.current / goal.target) * 100);
                  const daysLeft = goal.endDate 
                    ? Math.ceil((new Date(goal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;
                  const prioColor = goal.priority === 'high' ? '#EF4444' : goal.priority === 'low' ? '#6B7280' : '#F59E0B';
                  const rec = goal.recurrence && goal.recurrence !== 'none';
                  return (
                    <Pressable
                      key={goal.id}
                      onPress={() => router.push({ pathname: '/edit-goal', params: { goalId: goal.id } })}
                      style={({ pressed }) => [styles.goalCard, pressed && styles.cardPressed]}
                    >
                      {/* Priority dot */}
                      <View style={{ position: 'absolute', top: 10, left: 10, width: 6, height: 6, borderRadius: 3, backgroundColor: prioColor }} />
                      <View style={styles.goalHeader}>
                        <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
                        {daysLeft !== null && (
                          <View style={[styles.daysLeftBadge, daysLeft <= 3 && styles.daysLeftUrgent]}>
                            <Text style={[styles.daysLeftText, daysLeft <= 3 && styles.daysLeftTextUrgent]}>
                              {daysLeft > 0 ? `${daysLeft}d` : 'Due!'}
                            </Text>
                          </View>
                        )}
                      </View>
                      {/* Recurrence + streak */}
                      {(rec || (goal.recurringStreak || 0) > 0) && (
                        <View style={{ flexDirection: 'row', gap: 4, marginBottom: 6 }}>
                          {rec && (
                            <View style={{ backgroundColor: 'rgba(0,245,212,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                              <Feather name="repeat" size={8} color={Theme.colors.accent.primary} />
                              <Text style={{ fontSize: 9, fontWeight: '700', color: Theme.colors.accent.primary }}>{goal.recurrence}</Text>
                            </View>
                          )}
                          {(goal.recurringStreak || 0) > 0 && (
                            <View style={{ backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                              <Text style={{ fontSize: 9, fontWeight: '700', color: Theme.colors.warning }}>🔥{goal.recurringStreak}</Text>
                            </View>
                          )}
                        </View>
                      )}
                      <View style={styles.goalProgress}>
                        <View style={styles.goalProgressBg}>
                          <View style={[styles.goalProgressFill, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.goalProgressText}>{goal.current}/{goal.target} {goal.unit}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          )}

          {/* Today's Progress */}
          <Pressable 
            onPress={handleReadinessPress}
            style={({ pressed }) => [styles.todayCard, pressed && styles.cardPressed]}
          >
            <View style={styles.todayHeader}>
              <Text style={styles.todayTitle}>Today's Progress</Text>
              <Feather name="chevron-right" size={18} color={Theme.colors.text.muted} />
            </View>
            <View style={styles.todayStats}>
              <View style={styles.todayStat}>
                <Text style={styles.todayStatValue}>{todayStats.objectionsCompleted}</Text>
                <Text style={styles.todayStatLabel}>Practiced</Text>
              </View>
              <View style={styles.todayStatDivider} />
              <View style={styles.todayStat}>
                <Text style={styles.todayStatValue}>{todayStats.xpEarned}</Text>
                <Text style={styles.todayStatLabel}>XP Earned</Text>
              </View>
              <View style={styles.todayStatDivider} />
              <View style={styles.todayStat}>
                <Text style={styles.todayStatValue}>{todayStats.coachMessages}</Text>
                <Text style={styles.todayStatLabel}>Chiron Chats</Text>
              </View>
            </View>
          </Pressable>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      <LevelDetailsModal
        visible={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        level={user.level}
        currentXP={user.xp}
        totalXP={totalXP}
        xpToNext={xpToNext}
      />
      <ReadinessDetailsModal
        visible={showReadinessModal}
        onClose={() => setShowReadinessModal(false)}
        onGoToArena={() => router.push('/(tabs)/arena')}
        score={readinessScore}
        todayStats={todayStats}
        weeklyStats={weeklyStats}
      />
      <StreakDetailsModal
        visible={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        currentStreak={user.streak}
        longestStreak={user.longestStreak}
        weeklyStats={weeklyStats}
      />

      {/* Level Up Celebration Modal */}
      <Modal visible={showLevelUpCelebration} transparent animationType="fade">
        <Pressable style={styles.levelUpOverlay} onPress={dismissLevelUp}>
          <Pressable onPress={() => {}}>
            <Animated.View style={[styles.levelUpContainer, { transform: [{ scale: scaleAnim }] }]}>
              {/* Rotating glow background */}
              <Animated.View style={[styles.levelUpGlow, { transform: [{ rotate: rotateInterpolate }] }]}>
                <LinearGradient
                  colors={['#F59E0B', '#00F5D4', '#8B5CF6', '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.levelUpGlowGradient}
                />
              </Animated.View>
              
              {/* Stars */}
              <Animated.Text style={[styles.levelUpStar, styles.star1, { transform: [{ scale: starScale1 }] }]}>⭐</Animated.Text>
              <Animated.Text style={[styles.levelUpStar, styles.star2, { transform: [{ scale: starScale2 }] }]}>✨</Animated.Text>
              <Animated.Text style={[styles.levelUpStar, styles.star3, { transform: [{ scale: starScale3 }] }]}>🌟</Animated.Text>
              
              {/* Content */}
              <View style={styles.levelUpContent}>
                <Text style={styles.levelUpEmoji}>🏆</Text>
                <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
                <View style={styles.levelUpBadge}>
                  <Text style={styles.levelUpNumber}>{celebrationLevel}</Text>
                </View>
                <Text style={styles.levelUpSubtitle}>You've reached Level {celebrationLevel}!</Text>
                <Text style={styles.levelUpMessage}>
                  {celebrationLevel >= 10 ? "You're becoming a sales legend! 🔥" :
                   celebrationLevel >= 5 ? "You're on fire! Keep crushing it! 💪" :
                   "Keep practicing to unlock your potential! 🚀"}
                </Text>
                
                <Pressable onPress={dismissLevelUp} style={styles.levelUpButton}>
                  <LinearGradient
                    colors={['#00F5D4', '#00B894']}
                    style={styles.levelUpButtonGradient}
                  >
                    <Text style={styles.levelUpButtonText}>Continue</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 14, color: Theme.colors.text.tertiary },
  userName: { fontSize: 28, fontWeight: '800', color: Theme.colors.text.primary, marginTop: 2 },
  industryTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  industryEmoji: { fontSize: 14 },
  industryText: { fontSize: 12, color: Theme.colors.text.secondary },
  profilePicContainer: { position: 'relative' },
  profilePic: { width: 52, height: 52, borderRadius: 16 },
  profilePicPlaceholder: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 22, fontWeight: '700', color: Theme.colors.background.primary },
  premiumBadge: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: Theme.colors.warning, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Theme.colors.background.primary },
  
  // Level Card
  levelCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: Theme.colors.border.primary },
  levelCardGradient: { padding: 16 },
  levelCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  levelBadge: { marginRight: 12 },
  levelBadgeGradient: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  levelNumber: { fontSize: 20, fontWeight: '800', color: Theme.colors.background.primary },
  milestoneBadge: { marginRight: 10, backgroundColor: 'rgba(255, 215, 0, 0.15)', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.3)' },
  milestoneBadgeEmoji: { fontSize: 20 },
  levelInfo: { flex: 1 },
  levelTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text.primary },
  milestoneTitle: { fontSize: 12, fontWeight: '600', color: '#FFD700', backgroundColor: 'rgba(255, 215, 0, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  levelSubtitle: { fontSize: 12, color: Theme.colors.text.tertiary, marginTop: 2 },
  expandIcon: { padding: 4 },
  xpBarContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  xpBarBg: { flex: 1, height: 8, backgroundColor: Theme.colors.border.primary, borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: '100%', borderRadius: 4 },
  xpPercentage: { fontSize: 12, fontWeight: '600', color: Theme.colors.accent.primary, width: 36 },
  tapHint: { fontSize: 10, color: Theme.colors.text.muted, textAlign: 'center', marginTop: 10 },
  cardPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  
  // Stats Row
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: Theme.colors.background.card, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.border.primary, position: 'relative' },
  statIconContainer: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  streakEmoji: { fontSize: 18 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: Theme.colors.text.muted, marginTop: 2 },
  statExpand: { position: 'absolute', top: 8, right: 8 },
  
  // Quote
  quoteCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)' },
  quoteGradient: { padding: 16 },
  quoteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  quoteBadge: { backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  quoteBadgeText: { fontSize: 10, fontWeight: '700', color: Theme.colors.warning, letterSpacing: 0.5 },
  refreshButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(245, 158, 11, 0.15)', alignItems: 'center', justifyContent: 'center' },
  quoteText: { fontSize: 15, color: Theme.colors.text.primary, fontStyle: 'italic', lineHeight: 22, marginBottom: 8 },
  quoteAuthor: { fontSize: 12, color: Theme.colors.warning, fontWeight: '600' },
  
  // Section
  sectionTitle: { fontSize: 11, fontWeight: '600', color: Theme.colors.text.tertiary, letterSpacing: 1, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { fontSize: 12, color: Theme.colors.accent.primary, fontWeight: '600' },
  
  // Actions Grid
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionCard: { width: '48%', backgroundColor: Theme.colors.background.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Theme.colors.border.primary },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  chironActionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10, overflow: 'hidden', borderWidth: 2, borderColor: '#F59E0B' },
  chironActionImage: { width: 44, height: 44, borderRadius: 10 },
  actionEmoji: { fontSize: 22 },
  actionTitle: { fontSize: 14, fontWeight: '700', color: Theme.colors.text.primary },
  actionSubtitle: { fontSize: 11, color: Theme.colors.text.tertiary, marginTop: 2 },
  xpReward: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0, 245, 212, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  xpRewardText: { fontSize: 10, fontWeight: '700', color: Theme.colors.accent.primary },
  
  // Goals
  goalsScroll: { marginBottom: 20 },
  goalCard: { width: 180, backgroundColor: Theme.colors.background.card, borderRadius: 16, padding: 14, marginRight: 10, borderWidth: 1, borderColor: Theme.colors.border.primary },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  goalTitle: { fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, flex: 1 },
  daysLeftBadge: { backgroundColor: Theme.colors.background.elevated, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
  daysLeftUrgent: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  daysLeftText: { fontSize: 9, color: Theme.colors.text.tertiary, fontWeight: '600' },
  daysLeftTextUrgent: { color: Theme.colors.error },
  goalProgress: { gap: 6 },
  goalProgressBg: { height: 6, backgroundColor: Theme.colors.border.primary, borderRadius: 3, overflow: 'hidden' },
  goalProgressFill: { height: '100%', backgroundColor: Theme.colors.accent.primary, borderRadius: 3 },
  goalProgressText: { fontSize: 11, color: Theme.colors.text.tertiary },
  
  // Today
  todayCard: { backgroundColor: Theme.colors.background.card, borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: Theme.colors.border.primary },
  todayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  todayTitle: { fontSize: 14, fontWeight: '700', color: Theme.colors.text.primary },
  todayStats: { flexDirection: 'row', alignItems: 'center' },
  todayStat: { flex: 1, alignItems: 'center' },
  todayStatValue: { fontSize: 22, fontWeight: '800', color: Theme.colors.accent.primary },
  todayStatLabel: { fontSize: 10, color: Theme.colors.text.muted, marginTop: 2 },
  todayStatDivider: { width: 1, height: 30, backgroundColor: Theme.colors.border.primary },
  
  bottomSpacing: { height: 160 },
  
  // Level Up Celebration
  levelUpOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', alignItems: 'center', justifyContent: 'center' },
  levelUpContainer: { width: SCREEN_WIDTH * 0.85, alignItems: 'center', position: 'relative' },
  levelUpGlow: { position: 'absolute', width: 280, height: 280, borderRadius: 140 },
  levelUpGlowGradient: { width: '100%', height: '100%', borderRadius: 140, opacity: 0.3 },
  levelUpStar: { position: 'absolute', fontSize: 36 },
  star1: { top: -30, left: 30 },
  star2: { top: 20, right: 10 },
  star3: { bottom: 60, left: 10 },
  levelUpContent: { backgroundColor: Theme.colors.background.card, borderRadius: 28, padding: 32, alignItems: 'center', borderWidth: 2, borderColor: '#F59E0B', width: '100%' },
  levelUpEmoji: { fontSize: 64, marginBottom: 8 },
  levelUpTitle: { fontSize: 32, fontWeight: '900', color: '#F59E0B', letterSpacing: 2, marginBottom: 12 },
  levelUpBadge: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(245, 158, 11, 0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 3, borderColor: '#F59E0B' },
  levelUpNumber: { fontSize: 36, fontWeight: '900', color: '#F59E0B' },
  levelUpSubtitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 8 },
  levelUpMessage: { fontSize: 14, color: Theme.colors.text.secondary, textAlign: 'center', marginBottom: 24 },
  levelUpButton: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  levelUpButtonGradient: { paddingVertical: 16, alignItems: 'center' },
  levelUpButtonText: { fontSize: 16, fontWeight: '700', color: Theme.colors.background.primary },
});
