import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '../../contexts/AppContext';
import { getObjectionsForIndustry, INDUSTRY_INFO, getPremiumObjectionCount } from '../../constants/Objections';
import Theme from '../../constants/Theme';

const { width } = Dimensions.get('window');

// Dynamic category configuration based on actual data
const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
  'Price': { icon: 'dollar-sign', color: '#00F5D4' },
  'Timing': { icon: 'clock', color: '#8B5CF6' },
  'Authority': { icon: 'users', color: '#3B82F6' },
  'Need': { icon: 'help-circle', color: '#F59E0B' },
  'Trust': { icon: 'shield', color: '#10B981' },
  'Competition': { icon: 'flag', color: '#EF4444' },
  'Browsing': { icon: 'eye', color: '#22D3EE' },
  'Trade-In': { icon: 'repeat', color: '#EC4899' },
  'Decision': { icon: 'git-branch', color: '#A855F7' },
  'Contract': { icon: 'file-text', color: '#EC4899' },
};

export default function ArenaScreen() {
  const { state, getReadinessScore, getTodayStats } = useApp();
  const { user } = state;
  
  const readinessScore = getReadinessScore();
  const todayStats = getTodayStats();
  
  // Get objections based on premium status
  const industryObjections = user.industry ? getObjectionsForIndustry(user.industry, user.isPremium) : [];
  const baseObjectionCount = user.industry ? getObjectionsForIndustry(user.industry, false).length : 0;
  const premiumObjectionCount = user.industry ? getPremiumObjectionCount(user.industry) : 0;
  const industryInfo = user.industry ? INDUSTRY_INFO[user.industry] : null;

  // Get unique categories from actual objections
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    industryObjections.forEach(obj => {
      const current = categoryMap.get(obj.category) || 0;
      categoryMap.set(obj.category, current + 1);
    });
    
    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      id: name,
      name,
      count,
      icon: CATEGORY_CONFIG[name]?.icon || 'help-circle',
      color: CATEGORY_CONFIG[name]?.color || '#A855F7',
    }));
  }, [industryObjections]);

  const handleQuickPlay = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/practice');
  };

  const handleCategoryPress = async (categoryId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/practice', params: { category: categoryId } });
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
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Arena</Text>
              <Text style={styles.subtitle}>Master objection handling</Text>
            </View>
            {industryInfo && (
              <View style={styles.industryBadge}>
                <Text style={styles.industryEmoji}>{industryInfo.icon}</Text>
              </View>
            )}
          </View>

          {/* Stats Overview */}
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <Text style={styles.statValue}>{user.objectionsCompleted}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <Text style={[styles.statValue, { color: Theme.colors.success }]}>
                  {user.successRate}%
                </Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <Text style={[styles.statValue, { color: user.isPremium ? '#F59E0B' : Theme.colors.accent.primary }]}>
                  {industryObjections.length}
                </Text>
                <View style={styles.statLabelRow}>
                  <Text style={styles.statLabel}>Scenarios</Text>
                  {user.isPremium && (
                    <View style={styles.premiumBadgeSmall}>
                      <Feather name="star" size={8} color="#F59E0B" />
                    </View>
                  )}
                </View>
                {!user.isPremium && premiumObjectionCount > 0 && (
                  <Text style={styles.premiumUnlock}>+{premiumObjectionCount} with Premium</Text>
                )}
              </View>
            </View>
          </View>

          {/* Today's Readiness Progress */}
          <View style={styles.readinessCard}>
            <View style={styles.readinessHeader}>
              <View style={styles.readinessLeft}>
                <Feather name="zap" size={16} color={readinessScore >= 100 ? '#F59E0B' : Theme.colors.accent.primary} />
                <Text style={styles.readinessTitle}>Today's Readiness</Text>
              </View>
              <Text style={[
                styles.readinessPercent, 
                readinessScore >= 100 && styles.readinessComplete
              ]}>
                {Math.min(readinessScore, 100)}%
              </Text>
            </View>
            <View style={styles.readinessBarBg}>
              <LinearGradient
                colors={readinessScore >= 100 ? ['#F59E0B', '#D97706'] : ['#00F5D4', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.readinessBarFill, { width: `${Math.min(readinessScore, 100)}%` }]}
              />
            </View>
            <View style={styles.readinessStats}>
              <Text style={styles.readinessStatText}>
                <Text style={styles.readinessStatHighlight}>{todayStats.objectionsCompleted}</Text> objections today
              </Text>
              <Text style={styles.readinessStatText}>
                <Text style={styles.readinessStatHighlight}>{todayStats.xpEarned}</Text> XP earned
              </Text>
            </View>
            {readinessScore >= 100 && (
              <View style={styles.readinessCompleteTag}>
                <Feather name="check-circle" size={12} color="#F59E0B" />
                <Text style={styles.readinessCompleteText}>100% Ready!</Text>
              </View>
            )}
          </View>

          {/* Quick Play Button */}
          <Pressable
            onPress={handleQuickPlay}
            style={({ pressed }) => [
              styles.quickPlayContainer,
              pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
            ]}
          >
            <LinearGradient
              colors={Theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickPlayGradient}
            >
              <View style={styles.quickPlayContent}>
                <View style={styles.quickPlayIcon}>
                  <Feather name="play" size={28} color={Theme.colors.background.primary} />
                </View>
                <View style={styles.quickPlayText}>
                  <Text style={styles.quickPlayTitle}>Quick Play</Text>
                  <Text style={styles.quickPlaySubtitle}>Random objection challenge</Text>
                </View>
              </View>
              <View style={styles.quickPlayRight}>
                <View style={styles.xpBadge}>
                  <Text style={styles.xpBadgeText}>+10-25 XP</Text>
                </View>
                <Feather name="arrow-right" size={24} color={Theme.colors.background.primary} />
              </View>
            </LinearGradient>
          </Pressable>

          {/* XP Info Banner */}
          <View style={styles.xpInfoBanner}>
            <Feather name="info" size={14} color={Theme.colors.accent.primary} />
            <Text style={styles.xpInfoText}>
              Earn <Text style={styles.xpHighlight}>+25 XP</Text> for successful responses, <Text style={styles.xpHighlight}>+10 XP</Text> for attempts
            </Text>
          </View>

          {/* Categories - Dynamically generated from actual objections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CATEGORIES ({categories.length})</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => handleCategoryPress(category.id)}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                    <Feather name={category.icon as any} size={20} color={category.color} />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryCount}>
                    {category.count} scenario{category.count !== 1 ? 's' : ''}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Pro Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PRO TIPS</Text>
            <View style={styles.tipCard}>
              <View style={[styles.tipIcon, { backgroundColor: Theme.colors.purple.muted }]}>
                <Feather name="info" size={16} color={Theme.colors.purple.primary} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Listen First</Text>
                <Text style={styles.tipText}>
                  Let the customer express their concern fully. Acknowledge, then address.
                </Text>
              </View>
            </View>
            <View style={styles.tipCard}>
              <View style={[styles.tipIcon, { backgroundColor: Theme.colors.accent.muted }]}>
                <Feather name="zap" size={16} color={Theme.colors.accent.primary} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Ask Questions</Text>
                <Text style={styles.tipText}>
                  "What specifically concerns you about that?" reveals the real objection.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    ...Theme.typography.headline.h1,
    color: Theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.text.tertiary,
    marginTop: 4,
  },
  industryBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border.primary,
  },
  industryEmoji: {
    fontSize: 22,
  },
  statsCard: {
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.radius.xl,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border.primary,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Theme.colors.border.primary,
    marginVertical: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Theme.colors.text.tertiary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  premiumBadgeSmall: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    padding: 2,
    borderRadius: 4,
  },
  premiumUnlock: {
    fontSize: 9,
    color: '#F59E0B',
    marginTop: 2,
  },
  // Readiness Progress Bar
  readinessCard: {
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.radius.xl,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border.primary,
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  readinessLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readinessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  readinessPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.accent.primary,
  },
  readinessComplete: {
    color: '#F59E0B',
  },
  readinessBarBg: {
    height: 10,
    backgroundColor: Theme.colors.border.primary,
    borderRadius: 5,
    overflow: 'hidden',
  },
  readinessBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  readinessStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  readinessStatText: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
  },
  readinessStatHighlight: {
    fontWeight: '700',
    color: Theme.colors.text.secondary,
  },
  readinessCompleteTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
  },
  readinessCompleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  quickPlayContainer: {
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: Theme.colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  quickPlayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  quickPlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quickPlayIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPlayText: {},
  quickPlayTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.background.primary,
  },
  quickPlaySubtitle: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 2,
  },
  quickPlayRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  xpBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  xpBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.background.primary,
  },
  xpInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 245, 212, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 24,
  },
  xpInfoText: {
    flex: 1,
    fontSize: 12,
    color: Theme.colors.text.secondary,
  },
  xpHighlight: {
    color: Theme.colors.accent.primary,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Theme.typography.label.small,
    color: Theme.colors.text.tertiary,
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 52) / 2,
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border.primary,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  categoryCount: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
    marginTop: 4,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.radius.lg,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border.primary,
    gap: 14,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: Theme.colors.text.secondary,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 120,
  },
});
