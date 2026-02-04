import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Theme from '../constants/Theme';
import { DailyStats } from '../contexts/AppContext';

const { width } = Dimensions.get('window');

type PremiumAnalyticsProps = {
  visible: boolean;
  onClose: () => void;
  onAskChiron: (question: string) => void;
  onUpgrade: () => void;
  isPremium: boolean;
  stats: {
    level: number;
    totalXP: number;
    objectionsCompleted: number;
    successRate: number;
    streak: number;
    longestStreak: number;
    coachMessages: number;
    weeklyStats: DailyStats[];
  };
  industry: string;
};

export function PremiumAnalyticsModal({ 
  visible, 
  onClose, 
  onAskChiron,
  onUpgrade,
  isPremium,
  stats,
  industry 
}: PremiumAnalyticsProps) {
  const { level, totalXP, objectionsCompleted, successRate, streak, longestStreak, coachMessages, weeklyStats } = stats;
  
  // Calculate advanced metrics
  const weeklyObjections = weeklyStats.reduce((sum, d) => sum + d.objectionsCompleted, 0);
  const weeklyXP = weeklyStats.reduce((sum, d) => sum + d.xpEarned, 0);
  const weeklySuccessful = weeklyStats.reduce((sum, d) => sum + d.objectionsSuccessful, 0);
  const weeklySuccessRate = weeklyObjections > 0 ? Math.round((weeklySuccessful / weeklyObjections) * 100) : 0;
  const avgDailyXP = Math.round(weeklyXP / 7);
  const practiceConsistency = weeklyStats.filter(d => d.objectionsCompleted > 0).length;
  
  // Performance trends
  const isImproving = weeklyStats.length >= 2 && 
    weeklyStats[weeklyStats.length - 1]?.objectionsSuccessful > weeklyStats[0]?.objectionsSuccessful;
  
  // Projected metrics
  const projectedMonthlyXP = avgDailyXP * 30;
  const weeksToNextLevel = avgDailyXP > 0 ? Math.ceil((100 - (totalXP % 100)) / (avgDailyXP * 7)) : 0;
  
  // Strength/weakness analysis
  const strengths = [];
  const improvements = [];
  
  if (successRate >= 70) strengths.push('High success rate');
  else improvements.push('Objection handling');
  
  if (streak >= 5) strengths.push('Consistent practice');
  else improvements.push('Daily consistency');
  
  if (practiceConsistency >= 5) strengths.push('Weekly dedication');
  else improvements.push('Practice frequency');
  
  if (coachMessages >= 10) strengths.push('Coaching utilization');
  else improvements.push('Use Chiron more');

  const handleAskChiron = (topic: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    setTimeout(() => onAskChiron(topic), 300);
  };

  if (!isPremium) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <LinearGradient colors={[Theme.colors.background.elevated, Theme.colors.background.card]} style={styles.modalGradient}>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Feather name="x" size={20} color={Theme.colors.text.secondary} />
              </Pressable>
              
              <View style={styles.lockedContainer}>
                <Text style={styles.lockedEmoji}>🔒</Text>
                <Text style={styles.lockedTitle}>Premium Analytics</Text>
                <Text style={styles.lockedSubtitle}>Unlock advanced performance insights</Text>
                
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <Feather name="trending-up" size={18} color={Theme.colors.accent.primary} />
                    <Text style={styles.featureText}>Performance trends & projections</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Feather name="target" size={18} color={Theme.colors.accent.primary} />
                    <Text style={styles.featureText}>Strength & weakness analysis</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Feather name="zap" size={18} color="#F59E0B" />
                    <Text style={styles.featureText}>AI-powered recommendations</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Feather name="bar-chart-2" size={18} color={Theme.colors.accent.primary} />
                    <Text style={styles.featureText}>Weekly & monthly reports</Text>
                  </View>
                </View>
                
                <Pressable 
                  style={styles.upgradeBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onClose();
                    onUpgrade();
                  }}
                >
                  <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.upgradeBtnGradient}>
                    <Feather name="star" size={16} color="#000" />
                    <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, styles.premiumModal]}>
          <LinearGradient colors={[Theme.colors.background.elevated, Theme.colors.background.card]} style={styles.modalGradient}>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={Theme.colors.text.secondary} />
            </Pressable>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.premiumHeader}>
                <View style={styles.premiumBadge}>
                  <Feather name="star" size={14} color="#F59E0B" />
                  <Text style={styles.premiumBadgeText}>Premium Analytics</Text>
                </View>
                <Text style={styles.industryLabel}>{industry} Performance</Text>
              </View>

              {/* Weekly Summary */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 This Week</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{weeklyObjections}</Text>
                    <Text style={styles.statLabel}>Objections</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: weeklySuccessRate >= 70 ? Theme.colors.success : Theme.colors.warning }]}>
                      {weeklySuccessRate}%
                    </Text>
                    <Text style={styles.statLabel}>Success Rate</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{weeklyXP}</Text>
                    <Text style={styles.statLabel}>XP Earned</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{practiceConsistency}/7</Text>
                    <Text style={styles.statLabel}>Days Active</Text>
                  </View>
                </View>
              </View>

              {/* Trend Analysis */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📈 Trend Analysis</Text>
                <View style={styles.trendCard}>
                  <View style={styles.trendHeader}>
                    <Feather 
                      name={isImproving ? "trending-up" : "minus"} 
                      size={24} 
                      color={isImproving ? Theme.colors.success : Theme.colors.warning} 
                    />
                    <Text style={[styles.trendStatus, { color: isImproving ? Theme.colors.success : Theme.colors.warning }]}>
                      {isImproving ? 'Improving' : 'Steady'}
                    </Text>
                  </View>
                  <Text style={styles.trendDetail}>
                    {isImproving 
                      ? "Your performance is trending upward! Keep the momentum going."
                      : "Consistent practice detected. Push harder to see improvement!"}
                  </Text>
                </View>
              </View>

              {/* Projections */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Projections</Text>
                <View style={styles.projectionsRow}>
                  <View style={styles.projectionItem}>
                    <Text style={styles.projectionValue}>{projectedMonthlyXP}</Text>
                    <Text style={styles.projectionLabel}>Projected Monthly XP</Text>
                  </View>
                  <View style={styles.projectionItem}>
                    <Text style={styles.projectionValue}>{weeksToNextLevel || '~1'}</Text>
                    <Text style={styles.projectionLabel}>Weeks to Level {level + 1}</Text>
                  </View>
                </View>
              </View>

              {/* Strengths & Improvements */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💪 Analysis</Text>
                <View style={styles.analysisGrid}>
                  <View style={styles.analysisBox}>
                    <Text style={styles.analysisTitle}>Strengths</Text>
                    {strengths.map((s, i) => (
                      <View key={i} style={styles.analysisItem}>
                        <Feather name="check-circle" size={14} color={Theme.colors.success} />
                        <Text style={styles.analysisText}>{s}</Text>
                      </View>
                    ))}
                    {strengths.length === 0 && (
                      <Text style={styles.analysisEmpty}>Keep practicing!</Text>
                    )}
                  </View>
                  <View style={styles.analysisBox}>
                    <Text style={styles.analysisTitle}>Focus Areas</Text>
                    {improvements.map((s, i) => (
                      <View key={i} style={styles.analysisItem}>
                        <Feather name="target" size={14} color={Theme.colors.warning} />
                        <Text style={styles.analysisText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Ask Chiron Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚡ Ask Chiron</Text>
                <Text style={styles.chironIntro}>Get personalized coaching based on your analytics</Text>
                
                <View style={styles.chironActions}>
                  <Pressable 
                    style={styles.chironBtn} 
                    onPress={() => handleAskChiron(`Based on my ${industry} performance stats - ${weeklySuccessRate}% success rate, ${weeklyObjections} objections this week - what specific areas should I focus on to improve?`)}
                  >
                    <Image source={require('../assets/chiron.png')} style={styles.chironIcon} />
                    <Text style={styles.chironBtnText}>Analyze My Performance</Text>
                  </Pressable>
                  
                  <Pressable 
                    style={styles.chironBtn}
                    onPress={() => handleAskChiron(`I'm a ${industry} sales professional at level ${level}. Create a personalized weekly training plan to help me improve my ${improvements[0] || 'closing rate'}.`)}
                  >
                    <Image source={require('../assets/chiron.png')} style={styles.chironIcon} />
                    <Text style={styles.chironBtnText}>Get Training Plan</Text>
                  </Pressable>
                  
                  <Pressable 
                    style={styles.chironBtn}
                    onPress={() => handleAskChiron(`I've completed ${objectionsCompleted} total objections with a ${successRate}% success rate in ${industry}. What are the top 3 advanced techniques I should learn next?`)}
                  >
                    <Image source={require('../assets/chiron.png')} style={styles.chironIcon} />
                    <Text style={styles.chironBtnText}>Advanced Techniques</Text>
                  </Pressable>
                </View>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width - 40,
    maxHeight: '70%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  premiumModal: {
    maxHeight: '85%',
  },
  modalGradient: {
    padding: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Locked State
  lockedContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  lockedEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  lockedSubtitle: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    marginBottom: 24,
  },
  featuresList: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Theme.colors.background.elevated,
    padding: 14,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 14,
    color: Theme.colors.text.primary,
    flex: 1,
  },
  upgradeBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  upgradeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  upgradeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  
  // Premium Content
  premiumHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  industryLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  
  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text.secondary,
    marginBottom: 12,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Theme.colors.background.elevated,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.accent.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Theme.colors.text.tertiary,
    marginTop: 4,
  },
  
  // Trend
  trendCard: {
    backgroundColor: Theme.colors.background.elevated,
    borderRadius: 12,
    padding: 16,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  trendStatus: {
    fontSize: 16,
    fontWeight: '700',
  },
  trendDetail: {
    fontSize: 13,
    color: Theme.colors.text.secondary,
    lineHeight: 18,
  },
  
  // Projections
  projectionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  projectionItem: {
    flex: 1,
    backgroundColor: Theme.colors.background.elevated,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  projectionValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.purple.primary,
  },
  projectionLabel: {
    fontSize: 11,
    color: Theme.colors.text.tertiary,
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Analysis
  analysisGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  analysisBox: {
    flex: 1,
    backgroundColor: Theme.colors.background.elevated,
    borderRadius: 12,
    padding: 14,
  },
  analysisTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text.primary,
    marginBottom: 10,
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  analysisText: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
    flex: 1,
  },
  analysisEmpty: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  
  // Chiron Integration
  chironIntro: {
    fontSize: 13,
    color: Theme.colors.text.secondary,
    marginBottom: 12,
  },
  chironActions: {
    gap: 10,
  },
  chironBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    padding: 14,
  },
  chironIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  chironBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    flex: 1,
  },
});

export default PremiumAnalyticsModal;
