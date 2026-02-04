import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp, FREE_DAILY_COACH_MESSAGES } from '../../contexts/AppContext';
import { useAI } from '../../contexts/AIContext';
import { INDUSTRY_INFO } from '../../constants/Objections';
import Theme from '../../constants/Theme';

const COACHING_TOPICS = [
  {
    id: 'objections',
    title: 'Handle Objections',
    description: 'Get help with specific objections',
    icon: 'target',
    color: Theme.colors.accent.primary,
    prompt: 'I need help handling a customer objection',
    premium: false,
  },
  {
    id: 'confidence',
    title: 'Build Confidence',
    description: 'Boost your sales mindset',
    icon: 'zap',
    color: Theme.colors.warning,
    prompt: 'Help me build confidence for sales calls',
    premium: false,
  },
  {
    id: 'scripts',
    title: 'Sales Scripts',
    description: 'Practice your pitch',
    icon: 'file-text',
    color: Theme.colors.purple.primary,
    prompt: 'Help me with my sales script',
    premium: true,
  },
  {
    id: 'roleplay',
    title: 'Role Play',
    description: 'Practice realistic scenarios',
    icon: 'users',
    color: Theme.colors.blue.primary,
    prompt: 'Let\'s do a role play practice session',
    premium: true,
  },
  {
    id: 'closing',
    title: 'Closing Techniques',
    description: 'Seal the deal',
    icon: 'check-circle',
    color: Theme.colors.success,
    prompt: 'Teach me effective closing techniques',
    premium: true,
  },
  {
    id: 'followup',
    title: 'Follow-up Strategy',
    description: 'Never lose a lead',
    icon: 'phone',
    color: Theme.colors.error,
    prompt: 'Help me with follow-up strategies',
    premium: true,
  },
];

export default function CoachScreen() {
  const { state } = useApp();
  const { openChat } = useAI();
  const { user } = state;
  
  const industryInfo = user.industry ? INDUSTRY_INFO[user.industry] : null;
  const industryName = industryInfo?.name || 'General';
  const remainingMessages = FREE_DAILY_COACH_MESSAGES - (user.dailyCoachMessages || 0);

  const handleTopicPress = async (topic: typeof COACHING_TOPICS[0]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openChat(topic.prompt); // Pass the topic's prompt to pre-fill
  };

  const handleOpenChat = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    openChat(); // No prompt for regular chat - starts blank
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
              <Text style={styles.title}>Chiron</Text>
              <Text style={styles.subtitle}>Trainer of Sales Heroes</Text>
            </View>
          </View>

          {/* Hero Card */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={[Theme.colors.background.elevated, Theme.colors.background.card]}
              style={styles.heroGradient}
            >
              {/* AI Avatar */}
              <View style={styles.aiAvatarContainer}>
                <View style={styles.aiAvatar}>
                  <Image 
                    source={require('../../assets/chiron.png')} 
                    style={styles.chironImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.statusIndicator}>
                  <View style={styles.statusDot} />
                </View>
              </View>

              {/* Premium Badge */}
              {user.isPremium ? (
                <View style={styles.premiumBadge}>
                  <Feather name="star" size={12} color={Theme.colors.warning} />
                  <Text style={styles.premiumBadgeText}>Premium Coach</Text>
                </View>
              ) : (
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>{remainingMessages}/{FREE_DAILY_COACH_MESSAGES} messages today</Text>
                </View>
              )}

              <Text style={styles.heroTitle}>
                {user.isPremium ? 'Unlimited Elite Coaching' : 'Chiron Awaits'}
              </Text>
              <Text style={styles.heroSubtitle}>
                Legendary trainer of heroes, specialized in {industryName} sales.
                {user.isPremium ? ' Unlimited wisdom at your fingertips.' : ' Upgrade for unlimited access.'}
              </Text>

              {/* Start Chat Button */}
              <Pressable
                onPress={handleOpenChat}
                style={({ pressed }) => [
                  styles.startChatButton,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.startChatGradient}
                >
                  <Image 
                    source={require('../../assets/chiron.png')} 
                    style={styles.chironButtonImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.startChatText}>Consult Chiron</Text>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </View>

          {/* Coaching Topics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COACHING TOPICS</Text>
            <View style={styles.topicsGrid}>
              {COACHING_TOPICS.map((topic) => {
                const isLocked = topic.premium && !user.isPremium;
                return (
                  <Pressable
                    key={topic.id}
                    onPress={() => handleTopicPress(topic)}
                    style={({ pressed }) => [
                      styles.topicCard,
                      pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                      isLocked && styles.topicCardLocked,
                    ]}
                  >
                    <View style={[styles.topicIcon, { backgroundColor: `${topic.color}15` }]}>
                      <Feather name={topic.icon as any} size={20} color={isLocked ? Theme.colors.text.muted : topic.color} />
                    </View>
                    <Text style={[styles.topicTitle, isLocked && styles.topicTitleLocked]}>{topic.title}</Text>
                    <Text style={styles.topicDescription}>{topic.description}</Text>
                    {isLocked && (
                      <View style={styles.premiumLock}>
                        <Feather name="lock" size={10} color={Theme.colors.warning} />
                        <Text style={styles.premiumLockText}>PRO</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Tip */}
          <View style={styles.tipBanner}>
            <Feather name="info" size={18} color={Theme.colors.warning} />
            <Text style={styles.tipText}>
              Tap the Chiron button anytime for instant expert coaching!
            </Text>
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
  heroCard: {
    borderRadius: Theme.radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border.primary,
    marginBottom: 24,
  },
  heroGradient: {
    padding: 28,
    alignItems: 'center',
  },
  aiAvatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  aiAvatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  chironImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Theme.colors.success,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.warning,
  },
  freeBadge: {
    backgroundColor: Theme.colors.background.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  freeBadgeText: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.text.primary,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  startChatButton: {
    marginTop: 24,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadows.glow,
  },
  startChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  chironButtonImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  startChatText: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.background.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Theme.typography.label.small,
    color: Theme.colors.text.tertiary,
    marginBottom: 12,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicCard: {
    width: '48%',
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border.primary,
    position: 'relative',
  },
  topicCardLocked: {
    opacity: 0.7,
  },
  topicIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  topicTitleLocked: {
    color: Theme.colors.text.tertiary,
  },
  topicDescription: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
    marginTop: 4,
  },
  premiumLock: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  premiumLockText: {
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.warning,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Theme.colors.accent.subtle,
    borderRadius: Theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border.accent,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Theme.colors.text.secondary,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 120,
  },
});
