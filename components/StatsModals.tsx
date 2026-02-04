import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Theme from '../constants/Theme';
import { DailyStats } from '../contexts/AppContext';

const { width } = Dimensions.get('window');

// Level Details Modal
type LevelDetailsProps = {
  visible: boolean;
  onClose: () => void;
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNext: number;
};

export function LevelDetailsModal({ visible, onClose, level, currentXP, totalXP, xpToNext }: LevelDetailsProps) {
  const progress = (currentXP / xpToNext) * 100;
  const milestones = [
    { level: 5, title: 'Rookie', reward: '🥉 Bronze Badge' },
    { level: 10, title: 'Closer', reward: '🥈 Silver Badge' },
    { level: 25, title: 'Expert', reward: '🥇 Gold Badge' },
    { level: 50, title: 'Master', reward: '💎 Diamond Badge' },
    { level: 100, title: 'Legend', reward: '👑 Crown Badge' },
  ];

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={() => {}}>
          <LinearGradient colors={[Theme.colors.background.elevated, Theme.colors.background.card]} style={styles.modalGradient}>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={Theme.colors.text.secondary} />
            </Pressable>

            <View style={styles.headerSection}>
              <LinearGradient colors={['#00F5D4', '#8B5CF6']} style={styles.levelBadge}>
                <Text style={styles.levelNumber}>{level}</Text>
              </LinearGradient>
              <Text style={styles.modalTitle}>Level Progress</Text>
              <Text style={styles.modalSubtitle}>{totalXP.toLocaleString()} total XP earned</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress to Level {level + 1}</Text>
                <Text style={styles.progressValue}>{currentXP}/{xpToNext} XP</Text>
              </View>
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={['#00F5D4', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]}
                />
              </View>
              <View style={styles.progressMarkers}>
                {[0, 25, 50, 75, 100].map((mark) => (
                  <View key={mark} style={styles.marker}>
                    <View style={[styles.markerDot, progress >= mark && styles.markerDotActive]} />
                    <Text style={styles.markerText}>{mark}%</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* XP Breakdown */}
            <View style={styles.breakdownSection}>
              <Text style={styles.sectionTitle}>How to Earn XP</Text>
              <View style={styles.breakdownRow}>
                <View style={[styles.xpBadge, { backgroundColor: 'rgba(0, 245, 212, 0.15)' }]}>
                  <Text style={styles.xpBadgeText}>+25</Text>
                </View>
                <Text style={styles.breakdownText}>Successful objection handling</Text>
              </View>
              <View style={styles.breakdownRow}>
                <View style={[styles.xpBadge, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                  <Text style={[styles.xpBadgeText, { color: '#8B5CF6' }]}>+10</Text>
                </View>
                <Text style={styles.breakdownText}>Practice attempt</Text>
              </View>
              <View style={styles.breakdownRow}>
                <View style={[styles.xpBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Text style={[styles.xpBadgeText, { color: '#F59E0B' }]}>+15</Text>
                </View>
                <Text style={styles.breakdownText}>Complete a goal</Text>
              </View>
            </View>

            {/* Milestones */}
            <View style={styles.milestonesSection}>
              <Text style={styles.sectionTitle}>Milestones</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {milestones.map((m) => (
                  <View key={m.level} style={[styles.milestoneCard, level >= m.level && styles.milestoneUnlocked]}>
                    <Text style={styles.milestoneLevel}>Lv. {m.level}</Text>
                    <Text style={styles.milestoneTitle}>{m.title}</Text>
                    <Text style={styles.milestoneReward}>{m.reward}</Text>
                    {level >= m.level && <Feather name="check-circle" size={16} color={Theme.colors.success} style={styles.milestoneCheck} />}
                  </View>
                ))}
              </ScrollView>
            </View>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Readiness Details Modal
type ReadinessDetailsProps = {
  visible: boolean;
  onClose: () => void;
  onGoToArena: () => void;
  score: number;
  todayStats: DailyStats;
  weeklyStats: DailyStats[];
};

export function ReadinessDetailsModal({ visible, onClose, onGoToArena, score, todayStats, weeklyStats }: ReadinessDetailsProps) {
  const getDayName = (dateStr: string) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dateStr).getDay()];
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return Theme.colors.success;
    if (s >= 50) return Theme.colors.warning;
    return Theme.colors.error;
  };

  const calculateDayScore = (stats: DailyStats) => {
    let s = 0;
    s += Math.min(stats.objectionsCompleted * 10, 40);
    if (stats.objectionsCompleted > 0) {
      s += Math.round((stats.objectionsSuccessful / stats.objectionsCompleted) * 20);
    }
    s += Math.min(stats.coachMessages * 10, 20);
    s += Math.min(Math.round(stats.xpEarned / 5), 20);
    return Math.min(s, 100);
  };

  const weekAverage = Math.round(
    weeklyStats.reduce((sum, d) => sum + calculateDayScore(d), 0) / 7
  );

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={() => {}}>
          <LinearGradient colors={[Theme.colors.background.elevated, Theme.colors.background.card]} style={styles.modalGradient}>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={Theme.colors.text.secondary} />
            </Pressable>

            <View style={styles.headerSection}>
              <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(score) + '25' }]}>
                <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>{score}%</Text>
              </View>
              <Text style={styles.modalTitle}>Sales Readiness</Text>
              <Text style={styles.modalSubtitle}>How prepared you are to crush it today</Text>
            </View>

            {/* Today's Breakdown */}
            <View style={styles.breakdownSection}>
              <Text style={styles.sectionTitle}>Today's Score Breakdown</Text>
              
              <View style={styles.readinessRow}>
                <View style={styles.readinessLabel}>
                  <Feather name="target" size={16} color={Theme.colors.accent.primary} />
                  <Text style={styles.readinessText}>Objections Practiced</Text>
                </View>
                <Text style={styles.readinessValue}>{todayStats.objectionsCompleted} (+{Math.min(todayStats.objectionsCompleted * 10, 40)} pts)</Text>
              </View>

              <View style={styles.readinessRow}>
                <View style={styles.readinessLabel}>
                  <Feather name="check-circle" size={16} color={Theme.colors.success} />
                  <Text style={styles.readinessText}>Success Rate</Text>
                </View>
                <Text style={styles.readinessValue}>
                  {todayStats.objectionsCompleted > 0 
                    ? Math.round((todayStats.objectionsSuccessful / todayStats.objectionsCompleted) * 100)
                    : 0}% (+{todayStats.objectionsCompleted > 0 ? Math.round((todayStats.objectionsSuccessful / todayStats.objectionsCompleted) * 20) : 0} pts)
                </Text>
              </View>

              <View style={styles.readinessRow}>
                <View style={styles.readinessLabel}>
                  <Text style={{ fontSize: 14 }}>⚡</Text>
                  <Text style={styles.readinessText}>Chiron Consultations</Text>
                </View>
                <Text style={styles.readinessValue}>{todayStats.coachMessages} (+{Math.min(todayStats.coachMessages * 10, 20)} pts)</Text>
              </View>

              <View style={styles.readinessRow}>
                <View style={styles.readinessLabel}>
                  <Feather name="award" size={16} color={Theme.colors.warning} />
                  <Text style={styles.readinessText}>XP Earned</Text>
                </View>
                <Text style={styles.readinessValue}>{todayStats.xpEarned} (+{Math.min(Math.round(todayStats.xpEarned / 5), 20)} pts)</Text>
              </View>
            </View>

            {/* Weekly Trend */}
            <View style={styles.trendSection}>
              <View style={styles.trendHeader}>
                <Text style={styles.sectionTitle}>7-Day Trend</Text>
                <Text style={styles.trendAverage}>Avg: {weekAverage}%</Text>
              </View>
              <View style={styles.trendChart}>
                {weeklyStats.map((day, i) => {
                  const dayScore = calculateDayScore(day);
                  return (
                    <View key={day.date} style={styles.trendBar}>
                      <View style={styles.trendBarContainer}>
                        <LinearGradient
                          colors={dayScore >= 80 ? ['#00F5D4', '#00D4AA'] : dayScore >= 50 ? ['#F59E0B', '#D97706'] : ['#EF4444', '#DC2626']}
                          style={[styles.trendBarFill, { height: `${Math.max(dayScore, 5)}%` }]}
                        />
                      </View>
                      <Text style={styles.trendDayLabel}>{getDayName(day.date)}</Text>
                      <Text style={styles.trendDayScore}>{dayScore}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Tips */}
            <View style={styles.tipSection}>
              <Feather name="info" size={14} color={Theme.colors.warning} />
              <Text style={styles.tipText}>
                Reach 100% readiness daily to maximize your sales performance and maintain your streak!
              </Text>
            </View>

            {/* Go to Arena Button */}
            <Pressable 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onClose();
                onGoToArena();
              }} 
              style={styles.arenaButton}
            >
              <LinearGradient
                colors={Theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.arenaButtonGradient}
              >
                <Feather name="target" size={18} color={Theme.colors.background.primary} />
                <Text style={styles.arenaButtonText}>Practice in Arena</Text>
                <Feather name="arrow-right" size={18} color={Theme.colors.background.primary} />
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Streak Details Modal
type StreakDetailsProps = {
  visible: boolean;
  onClose: () => void;
  currentStreak: number;
  longestStreak: number;
  weeklyStats: DailyStats[];
};

export function StreakDetailsModal({ visible, onClose, currentStreak, longestStreak, weeklyStats }: StreakDetailsProps) {
  const getDayName = (dateStr: string) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return days[new Date(dateStr).getDay()];
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.modalContainer, { maxHeight: 400 }]} onPress={() => {}}>
          <LinearGradient colors={[Theme.colors.background.elevated, Theme.colors.background.card]} style={styles.modalGradient}>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={Theme.colors.text.secondary} />
            </Pressable>

            <View style={styles.headerSection}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.modalTitle}>{currentStreak} Day Streak</Text>
              <Text style={styles.modalSubtitle}>Longest: {longestStreak} days</Text>
            </View>

            {/* Week View */}
            <View style={styles.weekViewSection}>
              <Text style={styles.sectionTitle}>This Week</Text>
              <View style={styles.weekDays}>
                {weeklyStats.map((day) => {
                  const wasActive = day.objectionsCompleted > 0 || day.coachMessages > 0;
                  return (
                    <View key={day.date} style={styles.weekDayItem}>
                      <View style={[styles.weekDayCircle, wasActive && styles.weekDayActive]}>
                        {wasActive ? (
                          <Feather name="check" size={14} color={Theme.colors.background.primary} />
                        ) : (
                          <Text style={styles.weekDayText}>{getDayName(day.date)}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Streak Rewards */}
            <View style={styles.streakRewards}>
              <Text style={styles.sectionTitle}>Streak Rewards</Text>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardEmoji}>🎯</Text>
                <Text style={styles.rewardText}>7 days: Week Warrior badge</Text>
                {currentStreak >= 7 && <Feather name="check" size={14} color={Theme.colors.success} />}
              </View>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardEmoji}>💪</Text>
                <Text style={styles.rewardText}>30 days: Monthly Master badge</Text>
                {currentStreak >= 30 && <Feather name="check" size={14} color={Theme.colors.success} />}
              </View>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardEmoji}>👑</Text>
                <Text style={styles.rewardText}>100 days: Legendary status</Text>
                {currentStreak >= 100 && <Feather name="check" size={14} color={Theme.colors.success} />}
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: width - 40, maxWidth: 380, borderRadius: 24, overflow: 'hidden' },
  modalGradient: { padding: 20 },
  closeBtn: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: Theme.colors.background.card, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  headerSection: { alignItems: 'center', marginBottom: 20 },
  levelBadge: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  levelNumber: { fontSize: 28, fontWeight: '800', color: Theme.colors.background.primary },
  scoreBadge: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  scoreNumber: { fontSize: 28, fontWeight: '800' },
  streakEmoji: { fontSize: 48, marginBottom: 8 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: Theme.colors.text.primary, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: Theme.colors.text.tertiary },
  progressSection: { marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: Theme.colors.text.secondary },
  progressValue: { fontSize: 13, fontWeight: '600', color: Theme.colors.accent.primary },
  progressBarBg: { height: 10, backgroundColor: Theme.colors.border.primary, borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  progressMarkers: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  marker: { alignItems: 'center' },
  markerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.border.primary, marginBottom: 4 },
  markerDotActive: { backgroundColor: Theme.colors.accent.primary },
  markerText: { fontSize: 9, color: Theme.colors.text.muted },
  breakdownSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 12 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  xpBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  xpBadgeText: { fontSize: 12, fontWeight: '700', color: Theme.colors.accent.primary },
  breakdownText: { fontSize: 13, color: Theme.colors.text.secondary },
  milestonesSection: { marginBottom: 10 },
  milestoneCard: { width: 100, padding: 12, backgroundColor: Theme.colors.background.card, borderRadius: 16, marginRight: 10, borderWidth: 1, borderColor: Theme.colors.border.primary, position: 'relative' },
  milestoneUnlocked: { borderColor: Theme.colors.success, backgroundColor: 'rgba(0, 245, 212, 0.08)' },
  milestoneLevel: { fontSize: 10, color: Theme.colors.text.muted, marginBottom: 2 },
  milestoneTitle: { fontSize: 13, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 4 },
  milestoneReward: { fontSize: 10, color: Theme.colors.text.tertiary },
  milestoneCheck: { position: 'absolute', top: 8, right: 8 },
  readinessRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Theme.colors.border.secondary },
  readinessLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  readinessText: { fontSize: 13, color: Theme.colors.text.secondary },
  readinessValue: { fontSize: 12, color: Theme.colors.text.tertiary },
  trendSection: { marginBottom: 16 },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  trendAverage: { fontSize: 12, color: Theme.colors.accent.primary, fontWeight: '600' },
  trendChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  trendBar: { alignItems: 'center', flex: 1 },
  trendBarContainer: { width: 24, height: 60, backgroundColor: Theme.colors.border.primary, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  trendBarFill: { width: '100%', borderRadius: 6 },
  trendDayLabel: { fontSize: 10, color: Theme.colors.text.muted, marginTop: 4 },
  trendDayScore: { fontSize: 9, color: Theme.colors.text.tertiary },
  tipSection: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 12, borderRadius: 12 },
  tipText: { flex: 1, fontSize: 11, color: Theme.colors.text.secondary, lineHeight: 16 },
  weekViewSection: { marginBottom: 20 },
  weekDays: { flexDirection: 'row', justifyContent: 'space-around' },
  weekDayItem: { alignItems: 'center' },
  weekDayCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: Theme.colors.border.primary, alignItems: 'center', justifyContent: 'center' },
  weekDayActive: { backgroundColor: Theme.colors.success },
  weekDayText: { fontSize: 11, color: Theme.colors.text.muted },
  streakRewards: {},
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  rewardEmoji: { fontSize: 18 },
  rewardText: { flex: 1, fontSize: 13, color: Theme.colors.text.secondary },
  arenaButton: { marginTop: 16, borderRadius: 16, overflow: 'hidden' },
  arenaButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14 },
  arenaButtonText: { fontSize: 15, fontWeight: '700', color: Theme.colors.background.primary },
});
