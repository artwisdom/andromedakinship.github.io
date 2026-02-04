import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Switch,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useApp, Industry, PREMIUM_PRICE, NotificationPreferences } from '../../contexts/AppContext';
import { useAI } from '../../contexts/AIContext';
import { INDUSTRY_INFO } from '../../constants/Objections';
import Theme from '../../constants/Theme';
import PremiumPaywall from '../../components/PremiumPaywall';
import { PremiumAnalyticsModal } from '../../components/PremiumAnalytics';

const BADGES = [
  { id: 'first-win', name: 'First Win', emoji: '🏆', requirement: 'Complete your first objection practice successfully' },
  { id: 'streak-7', name: 'Week Warrior', emoji: '🔥', requirement: 'Maintain a 7-day practice streak' },
  { id: 'objection-master', name: 'Objection Master', emoji: '🎯', requirement: 'Complete 50 objection practices with 80%+ success rate' },
  { id: 'coach-fan', name: 'Coach Fan', emoji: '🤖', requirement: 'Have 10 conversations with Chiron AI Coach' },
  { id: 'goal-crusher', name: 'Goal Crusher', emoji: '⭐', requirement: 'Complete 3 goals successfully' },
  { id: 'perfectionist', name: 'Perfectionist', emoji: '💎', requirement: 'Achieve 100% readiness score 5 times' },
  // Milestone badges (tied to levels - matches StatsModals)
  { id: 'rookie', name: 'Rookie', emoji: '🥉', requirement: 'Reach Level 5' },
  { id: 'closer', name: 'Closer', emoji: '🥈', requirement: 'Reach Level 10' },
  { id: 'expert', name: 'Expert', emoji: '🥇', requirement: 'Reach Level 25' },
  { id: 'master', name: 'Master', emoji: '💎', requirement: 'Reach Level 50' },
  { id: 'legend', name: 'Legend', emoji: '👑', requirement: 'Reach Level 100' },
  // Additional achievement badges
  { id: 'streak-30', name: 'Monthly Master', emoji: '📅', requirement: 'Maintain a 30-day practice streak' },
  { id: 'century', name: 'Century Club', emoji: '💯', requirement: 'Complete 100 objection practices' },
];

const SUPPORT_EMAIL = 'support@andromedakinship.com';
const DEVELOPER_URL = 'https://AndromedaKinship.com';
const INDUSTRIES: Industry[] = ['automotive', 'saas', 'insurance', 'realestate', 'retail', 'financial', 'medical', 'solar', 'telecom', 'hvac', 'fitness', 'general'];

export default function ProfileScreen() {
  const { state, resetApp, setName, setIndustry, setPremium, setProfilePicture, updateNotifications, getWeeklyStats, getTodayStats, addXP } = useApp();
  const { openChat } = useAI();
  const { user, goals } = state;
  
  const [showPaywall, setShowPaywall] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<typeof BADGES[0] | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [showStatExplainer, setShowStatExplainer] = useState(false);
  const [selectedStat, setSelectedStat] = useState<{ title: string; value: string; description: string } | null>(null);

  const STAT_EXPLANATIONS = {
    xp: {
      title: '⚡ Total XP',
      description: 'Experience Points earned from all activities in SellCraft. Earn XP by:\n\n• Completing objection practices (+10 XP)\n• Winning objection challenges (+15 XP)\n• Chatting with Chiron (+5 XP per message)\n• Maintaining daily streaks (bonus XP)\n\nLevel up by earning more XP to unlock badges and track your growth!'
    },
    streak: {
      title: '🔥 Current Streak',
      description: 'Your consecutive days of practice. Keep your streak alive by:\n\n• Completing at least one objection practice\n• Chatting with Chiron for coaching\n• Logging into the app daily\n\nLonger streaks earn bonus XP and unlock special badges like "Week Warrior" (7 days) and "Monthly Master" (30 days)!'
    },
    completed: {
      title: '🎯 Objections Completed',
      description: 'Total number of objection practice scenarios you\'ve completed in the Arena. This includes:\n\n• All difficulty levels (Easy, Medium, Hard, Expert)\n• All objection categories\n• Both successful and unsuccessful attempts\n\nMore practice = better real-world performance!'
    },
    success: {
      title: '✅ Success Rate',
      description: 'Your win percentage across all objection practices. This measures how often you choose the optimal response.\n\n• 90%+ = Expert closer\n• 70-89% = Solid performer\n• 50-69% = Room to grow\n• Below 50% = Keep practicing!\n\nFocus on quality responses to improve your rate.'
    }
  };
  
  const weeklyStats = getWeeklyStats();
  const todayStats = getTodayStats();

  const xpToNextLevel = user.level * 100;
  const xpProgress = Math.round((user.xp / xpToNextLevel) * 100);
  const totalXP = (user.level - 1) * 100 + user.xp;
  const industryInfo = user.industry ? INDUSTRY_INFO[user.industry] : null;

  // Calculate unlocked badges
  const getUnlockedBadges = () => {
    const unlocked: string[] = [];
    // Achievement badges
    if (user.objectionsCompleted > 0) unlocked.push('first-win');
    if (user.longestStreak >= 7) unlocked.push('streak-7');
    if (user.longestStreak >= 30) unlocked.push('streak-30');
    if (user.objectionsCompleted >= 50 && user.successRate >= 80) unlocked.push('objection-master');
    if (user.objectionsCompleted >= 100) unlocked.push('century');
    if (goals.filter(g => g.status === 'completed').length >= 3) unlocked.push('goal-crusher');
    if (user.successRate >= 90 && user.objectionsCompleted >= 20) unlocked.push('perfectionist');
    // Milestone badges (level-based - matches StatsModals)
    if (user.level >= 5) unlocked.push('rookie');
    if (user.level >= 10) unlocked.push('closer');
    if (user.level >= 25) unlocked.push('expert');
    if (user.level >= 50) unlocked.push('master');
    if (user.level >= 100) unlocked.push('legend');
    return unlocked;
  };

  const unlockedBadges = getUnlockedBadges();

  const pickImage = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePicture(result.assets[0].uri);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const openEmail = async (subject: string) => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Email', `Please email us at ${SUPPORT_EMAIL}`);
    }
  };

  const handleStatPress = async (statKey: 'xp' | 'streak' | 'completed' | 'success', value: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const explanation = STAT_EXPLANATIONS[statKey];
    setSelectedStat({
      title: explanation.title,
      value: value,
      description: explanation.description,
    });
    setShowStatExplainer(true);
  };

  const handleSettingPress = async (itemId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (itemId) {
      case 'edit-profile':
        setNewName(user.name);
        setShowEditName(true);
        break;
        
      case 'industry':
        setShowIndustryPicker(true);
        break;
        
      case 'notifications':
        setShowNotificationSettings(true);
        break;
        
      case 'upgrade':
        setShowPaywall(true);
        break;
      
      case 'analytics':
        setShowAnalytics(true);
        break;
        
      case 'restore':
        Alert.alert('Restore Purchases', 'Checking for previous purchases...', [{ text: 'OK' }]);
        break;
        
      case 'help':
        openEmail('SellCraft Help Request');
        break;
        
      case 'feedback':
        openEmail('SellCraft Feedback');
        break;
        
      case 'rate':
        Alert.alert(
          'Rate SellCraft',
          'Thank you for using SellCraft! Your review helps other sales professionals discover the app.',
          [
            { text: 'Maybe Later' },
            { text: 'Rate Now', onPress: () => Alert.alert('Thank you!', 'We appreciate your support!') },
          ]
        );
        break;
        
      case 'privacy':
        Linking.openURL('https://andromedakinship.com/privacy');
        break;
        
      case 'terms':
        Linking.openURL('https://andromedakinship.com/terms');
        break;
        
      case 'about':
        Alert.alert(
          'SellCraft',
          'Version 1.0.0\n\nBuilt with ❤️ by Andromeda Kinship\n\nSellCraft: Master the craft of selling. AI-powered sales training with Chiron, trainer of sales heroes.\n\nContact: support@andromedakinship.com',
          [{ text: 'OK' }]
        );
        break;
      
      // Developer Testing Options
      case 'toggle-premium':
        setPremium(!user.isPremium);
        Alert.alert(
          user.isPremium ? 'Premium Disabled' : 'Premium Enabled',
          user.isPremium ? 'You are now on the free plan.' : 'You now have access to all premium features!',
          [{ text: 'OK' }]
        );
        break;
        
      case 'add-xp':
        addXP(50);
        Alert.alert('XP Added', '+50 XP added! Check if you leveled up on the home screen.', [{ text: 'OK' }]);
        break;
        
      case 'reset-app':
        handleReset();
        break;
    }
  };

  const handleSaveName = async () => {
    if (newName.trim()) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setName(newName.trim());
      setShowEditName(false);
    }
  };

  const handleSelectIndustry = async (industry: Industry) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIndustry(industry);
    setShowIndustryPicker(false);
  };

  const handleSubscribe = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPremium(true);
    setShowPaywall(false);
    Alert.alert('Welcome to Premium! 🎉', 'You now have unlimited access to all SellCraft features.', [{ text: 'Let\'s Go!' }]);
  };

  const handleReset = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your progress, goals, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await resetApp();
            router.replace('/');
          },
        },
      ]
    );
  };

  const SETTINGS_SECTIONS = [
    {
      title: 'Account',
      items: [
        { id: 'edit-profile', name: 'Edit Profile', icon: 'edit-2' },
        { id: 'industry', name: 'Change Industry', icon: 'briefcase', value: industryInfo?.name },
        { id: 'notifications', name: 'Notifications', icon: 'bell', hasArrow: true },
      ],
    },
    {
      title: 'Subscription',
      items: [
        { 
          id: 'upgrade', 
          name: user.isPremium ? 'Premium Active' : 'Upgrade to Premium', 
          icon: 'star', 
          accent: !user.isPremium,
          value: user.isPremium ? 'Active' : PREMIUM_PRICE + '/mo',
        },
        { 
          id: 'analytics', 
          name: 'Premium Analytics', 
          icon: 'bar-chart-2',
          accent: user.isPremium,
          value: user.isPremium ? '→' : '🔒',
        },
        { id: 'restore', name: 'Restore Purchases', icon: 'refresh-cw' },
      ],
    },
    {
      title: 'Support',
      items: [
        { id: 'help', name: 'Help Center', icon: 'help-circle' },
        { id: 'feedback', name: 'Send Feedback', icon: 'message-square' },
        { id: 'rate', name: 'Rate App', icon: 'heart' },
      ],
    },
    {
      title: 'About',
      items: [
        { id: 'privacy', name: 'Privacy Policy', icon: 'shield' },
        { id: 'terms', name: 'Terms of Service', icon: 'file-text' },
        { id: 'about', name: 'About SellCraft', icon: 'info' },
      ],
    },
    {
      title: '🛠️ Developer Testing',
      items: [
        { 
          id: 'toggle-premium', 
          name: user.isPremium ? 'Premium: ON' : 'Premium: OFF', 
          icon: 'toggle-right',
          accent: true,
          value: 'Tap to toggle',
        },
        { id: 'add-xp', name: 'Add 50 XP (Test Level Up)', icon: 'zap' },
        { id: 'reset-app', name: 'Reset All Data', icon: 'trash-2' },
      ],
    },
  ];

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
          <Text style={styles.screenTitle}>Profile</Text>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={[Theme.colors.background.elevated, Theme.colors.background.card]}
              style={styles.profileGradient}
            >
              {/* Avatar with tap to change */}
              <Pressable onPress={pickImage} style={styles.avatarContainer}>
                {user.profilePicture ? (
                  <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
                ) : (
                  <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </LinearGradient>
                )}
                <View style={styles.avatarEditBadge}>
                  <Feather name="camera" size={12} color={Theme.colors.background.primary} />
                </View>
              </Pressable>
              
              <Text style={styles.userName}>{user.name || 'User'}</Text>
              
              <View style={[styles.tierBadge, user.isPremium && styles.tierBadgePro]}>
                <Feather 
                  name={user.isPremium ? 'star' : 'user'} 
                  size={12} 
                  color={user.isPremium ? Theme.colors.warning : Theme.colors.text.tertiary} 
                />
                <Text style={[styles.tierText, user.isPremium && styles.tierTextPro]}>
                  {user.isPremium ? 'Premium Member' : 'Free Plan'}
                </Text>
              </View>

              {industryInfo && (
                <View style={styles.industryTag}>
                  <Text style={styles.industryEmoji}>{industryInfo.icon}</Text>
                  <Text style={styles.industryText}>{industryInfo.name}</Text>
                </View>
              )}

              <View style={styles.levelSection}>
                <View style={styles.levelHeader}>
                  <View style={styles.levelInfo}>
                    <Feather name="award" size={14} color={Theme.colors.accent.primary} />
                    <Text style={styles.levelText}>Level {user.level}</Text>
                  </View>
                  <Text style={styles.xpText}>{user.xp}/{xpToNextLevel} XP</Text>
                </View>
                <View style={styles.levelBar}>
                  <LinearGradient
                    colors={['#00F5D4', '#8B5CF6'] as const}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.levelFill, { width: `${xpProgress}%` }]}
                  />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <Pressable style={styles.statItem} onPress={() => handleStatPress('xp', totalXP.toString())}>
              <Text style={styles.statValue}>{totalXP}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable style={styles.statItem} onPress={() => handleStatPress('streak', user.streak.toString())}>
              <Text style={[styles.statValue, { color: Theme.colors.warning }]}>{user.streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable style={styles.statItem} onPress={() => handleStatPress('completed', user.objectionsCompleted.toString())}>
              <Text style={styles.statValue}>{user.objectionsCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable style={styles.statItem} onPress={() => handleStatPress('success', `${user.successRate}%`)}>
              <Text style={[styles.statValue, { color: Theme.colors.success }]}>{user.successRate}%</Text>
              <Text style={styles.statLabel}>Success</Text>
            </Pressable>
          </View>

          {/* Badges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BADGES</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.badgesScrollContent}
              style={styles.badgesScroll}
            >
              {BADGES.map((badge) => {
                const isUnlocked = unlockedBadges.includes(badge.id);
                return (
                  <Pressable 
                    key={badge.id} 
                    style={[styles.badgeItem, !isUnlocked && styles.badgeLocked]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedBadge(badge);
                      setShowBadgeModal(true);
                    }}
                  >
                    <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                    <Text style={[styles.badgeName, !isUnlocked && styles.badgeNameLocked]}>{badge.name}</Text>
                    {!isUnlocked && (
                      <View style={styles.lockOverlay}>
                        <Feather name="lock" size={12} color={Theme.colors.text.muted} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Settings Sections */}
          {SETTINGS_SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
              <View style={styles.settingsCard}>
                {section.items.map((item, index) => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSettingPress(item.id)}
                    style={({ pressed }) => [
                      styles.settingItem,
                      index < section.items.length - 1 && styles.settingItemBorder,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View style={styles.settingLeft}>
                      <Feather 
                        name={item.icon as any} 
                        size={18} 
                        color={item.accent ? Theme.colors.accent.primary : Theme.colors.text.secondary} 
                      />
                      <Text style={[styles.settingText, item.accent && { color: Theme.colors.accent.primary }]}>
                        {item.name}
                      </Text>
                    </View>
                    {item.value ? (
                      <View style={styles.settingRight}>
                        <Text style={styles.settingValue}>{item.value}</Text>
                        <Feather name="chevron-right" size={18} color={Theme.colors.text.muted} />
                      </View>
                    ) : (
                      <Feather name="chevron-right" size={18} color={Theme.colors.text.muted} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          {/* Reset Button */}
          <Pressable onPress={handleReset} style={({ pressed }) => [styles.resetButton, pressed && { opacity: 0.8 }]}>
            <Feather name="trash-2" size={16} color={Theme.colors.error} />
            <Text style={styles.resetText}>Reset All Data</Text>
          </Pressable>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable 
              style={styles.developerBadge}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL(DEVELOPER_URL);
              }}
            >
              <Text style={styles.developerIcon}>🚀</Text>
              <View>
                <Text style={styles.developerLabel}>Developed by</Text>
                <Text style={styles.developerName}>Andromeda Kinship</Text>
              </View>
              <Feather name="external-link" size={16} color={Theme.colors.text.muted} style={{ marginLeft: 'auto' }} />
            </Pressable>
            <Text style={styles.version}>SellCraft v1.0.0</Text>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>

      {/* Premium Paywall Modal */}
      <PremiumPaywall visible={showPaywall} onClose={() => setShowPaywall(false)} onSubscribe={handleSubscribe} />

      {/* Premium Analytics Modal */}
      <PremiumAnalyticsModal
        visible={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        onAskChiron={(question) => {
          openChat(question);
        }}
        onUpgrade={() => setShowPaywall(true)}
        isPremium={user.isPremium}
        stats={{
          level: user.level,
          totalXP: user.totalXpEarned || ((user.level - 1) * 100 + user.xp),
          objectionsCompleted: user.objectionsCompleted,
          successRate: user.successRate,
          streak: user.streak,
          longestStreak: user.longestStreak,
          coachMessages: todayStats.coachMessages,
          weeklyStats,
        }}
        industry={INDUSTRY_INFO[user.industry || 'general']?.name || 'General'}
      />

      {/* Edit Name Modal */}
      <Modal visible={showEditName} animationType="fade" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowEditName(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              placeholderTextColor={Theme.colors.text.muted}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setShowEditName(false)} style={[styles.modalButton, styles.modalButtonCancel]}>
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSaveName} style={[styles.modalButton, styles.modalButtonSave]}>
                <Text style={styles.modalButtonTextSave}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Industry Picker Modal */}
      <Modal visible={showIndustryPicker} animationType="fade" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowIndustryPicker(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Industry</Text>
            <View style={styles.industryList}>
              {INDUSTRIES.map((ind) => {
                const info = INDUSTRY_INFO[ind];
                const isSelected = user.industry === ind;
                return (
                  <Pressable
                    key={ind}
                    onPress={() => handleSelectIndustry(ind)}
                    style={[styles.industryOption, isSelected && styles.industryOptionSelected]}
                  >
                    <Text style={styles.industryOptionEmoji}>{info.icon}</Text>
                    <Text style={[styles.industryOptionText, isSelected && styles.industryOptionTextSelected]}>
                      {info.name}
                    </Text>
                    {isSelected && <Feather name="check" size={18} color={Theme.colors.accent.primary} />}
                  </Pressable>
                );
              })}
            </View>
            <Pressable 
              onPress={() => setShowIndustryPicker(false)} 
              style={{
                backgroundColor: Theme.colors.accent.primary,
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: 'center',
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#000000' }}>Confirm Selection</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal visible={showNotificationSettings} animationType="fade" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowNotificationSettings(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>🔔 Notification Settings</Text>
            
            <View style={styles.notificationRow}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationLabel}>Enable Notifications</Text>
                <Text style={styles.notificationDesc}>Master switch for all notifications</Text>
              </View>
              <Switch
                value={user.notifications.enabled}
                onValueChange={(value) => updateNotifications({ enabled: value })}
                trackColor={{ false: Theme.colors.border.primary, true: Theme.colors.accent.muted }}
                thumbColor={user.notifications.enabled ? Theme.colors.accent.primary : Theme.colors.text.muted}
              />
            </View>

            {user.notifications.enabled && (
              <>
                <View style={styles.notificationRow}>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationLabel}>📜 Daily Quote</Text>
                    <Text style={styles.notificationDesc}>Morning motivation from sales legends</Text>
                  </View>
                  <Switch
                    value={user.notifications.dailyQuotes}
                    onValueChange={(value) => updateNotifications({ dailyQuotes: value })}
                    trackColor={{ false: Theme.colors.border.primary, true: Theme.colors.accent.muted }}
                    thumbColor={user.notifications.dailyQuotes ? Theme.colors.accent.primary : Theme.colors.text.muted}
                  />
                </View>

                <View style={styles.notificationRow}>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationLabel}>🎯 100% Readiness</Text>
                    <Text style={styles.notificationDesc}>Reminder to prepare for your sales day</Text>
                  </View>
                  <Switch
                    value={user.notifications.readinessReminder}
                    onValueChange={(value) => updateNotifications({ readinessReminder: value })}
                    trackColor={{ false: Theme.colors.border.primary, true: Theme.colors.accent.muted }}
                    thumbColor={user.notifications.readinessReminder ? Theme.colors.accent.primary : Theme.colors.text.muted}
                  />
                </View>

                <View style={styles.notificationRow}>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationLabel}>🔥 Streak Reminder</Text>
                    <Text style={styles.notificationDesc}>Evening alert to keep your streak alive</Text>
                  </View>
                  <Switch
                    value={user.notifications.streakReminder}
                    onValueChange={(value) => updateNotifications({ streakReminder: value })}
                    trackColor={{ false: Theme.colors.border.primary, true: Theme.colors.accent.muted }}
                    thumbColor={user.notifications.streakReminder ? Theme.colors.accent.primary : Theme.colors.text.muted}
                  />
                </View>

                <View style={styles.notificationRow}>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationLabel}>🏆 Goal Check-in</Text>
                    <Text style={styles.notificationDesc}>Midday reminder to track progress</Text>
                  </View>
                  <Switch
                    value={user.notifications.goalReminder}
                    onValueChange={(value) => updateNotifications({ goalReminder: value })}
                    trackColor={{ false: Theme.colors.border.primary, true: Theme.colors.accent.muted }}
                    thumbColor={user.notifications.goalReminder ? Theme.colors.accent.primary : Theme.colors.text.muted}
                  />
                </View>
              </>
            )}

            <Pressable onPress={() => setShowNotificationSettings(false)} style={[styles.modalButton, styles.modalButtonFull, { marginTop: 16 }]}>
              <Text style={styles.modalButtonTextSave}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Stat Explainer Modal */}
      <Modal visible={showStatExplainer} animationType="fade" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowStatExplainer(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            {selectedStat && (
              <>
                <Text style={styles.statExplainerTitle}>{selectedStat.title}</Text>
                <Text style={styles.statExplainerValue}>{selectedStat.value}</Text>
                <Text style={styles.statExplainerDesc}>{selectedStat.description}</Text>
                <Pressable onPress={() => setShowStatExplainer(false)} style={[styles.modalButton, styles.modalButtonFull, { marginTop: 20 }]}>
                  <Text style={styles.modalButtonTextSave}>Got It</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Badge Details Modal */}
      <Modal visible={showBadgeModal} animationType="fade" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowBadgeModal(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            {selectedBadge && (
              <>
                <Text style={styles.badgeModalEmoji}>{selectedBadge.emoji}</Text>
                <Text style={styles.badgeModalTitle}>{selectedBadge.name}</Text>
                <View style={styles.badgeStatusContainer}>
                  {unlockedBadges.includes(selectedBadge.id) ? (
                    <View style={styles.badgeUnlockedBadge}>
                      <Feather name="check-circle" size={14} color={Theme.colors.success} />
                      <Text style={styles.badgeUnlockedText}>Unlocked!</Text>
                    </View>
                  ) : (
                    <View style={styles.badgeLockedBadge}>
                      <Feather name="lock" size={14} color={Theme.colors.warning} />
                      <Text style={styles.badgeLockedText}>Locked</Text>
                    </View>
                  )}
                </View>
                <View style={styles.badgeRequirementBox}>
                  <Text style={styles.badgeRequirementLabel}>How to unlock:</Text>
                  <Text style={styles.badgeRequirementText}>{selectedBadge.requirement}</Text>
                </View>
              </>
            )}
            <Pressable 
              onPress={() => setShowBadgeModal(false)} 
              style={{
                backgroundColor: Theme.colors.accent.primary,
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: 'center',
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#000000' }}>Got It!</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background.primary },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  screenTitle: { ...Theme.typography.headline.h1, color: Theme.colors.text.primary, marginBottom: 20 },
  profileCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: Theme.colors.border.primary, marginBottom: 16 },
  profileGradient: { padding: 24, alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 80, height: 80, borderRadius: 24 },
  avatarText: { fontSize: 32, fontWeight: '700', color: Theme.colors.background.primary },
  avatarEditBadge: { position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 14, backgroundColor: Theme.colors.accent.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Theme.colors.background.primary },
  userName: { fontSize: 24, fontWeight: '800', color: Theme.colors.text.primary, marginBottom: 8 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Theme.colors.background.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  tierBadgePro: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  tierText: { fontSize: 12, fontWeight: '600', color: Theme.colors.text.tertiary },
  tierTextPro: { color: Theme.colors.warning },
  industryTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  industryEmoji: { fontSize: 16 },
  industryText: { fontSize: 13, color: Theme.colors.text.secondary },
  levelSection: { width: '100%' },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  levelInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  levelText: { fontSize: 14, fontWeight: '700', color: Theme.colors.accent.primary },
  xpText: { fontSize: 12, color: Theme.colors.text.tertiary },
  levelBar: { height: 8, backgroundColor: Theme.colors.border.primary, borderRadius: 4, overflow: 'hidden' },
  levelFill: { height: '100%', borderRadius: 4 },
  statsGrid: { flexDirection: 'row', backgroundColor: Theme.colors.background.card, borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: Theme.colors.border.primary },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Theme.colors.border.primary, marginVertical: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: Theme.colors.text.primary },
  statLabel: { fontSize: 10, color: Theme.colors.text.tertiary, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: Theme.colors.text.tertiary, marginBottom: 12, letterSpacing: 1 },
  badgesScroll: { marginHorizontal: -20 },
  badgesScrollContent: { paddingHorizontal: 20, gap: 10 },
  badgeItem: { alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background.card, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8, width: 100, height: 85, borderWidth: 1, borderColor: Theme.colors.border.primary, position: 'relative' },
  badgeLocked: { opacity: 0.4 },
  badgeEmoji: { fontSize: 28, marginBottom: 6, textAlign: 'center' },
  badgeName: { fontSize: 10, fontWeight: '600', color: Theme.colors.text.primary, textAlign: 'center', lineHeight: 12 },
  badgeNameLocked: { color: Theme.colors.text.muted },
  lockOverlay: { position: 'absolute', top: 6, right: 6 },
  settingsCard: { backgroundColor: Theme.colors.background.card, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Theme.colors.border.primary },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  settingItemBorder: { borderBottomWidth: 1, borderBottomColor: Theme.colors.border.secondary },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingText: { fontSize: 15, color: Theme.colors.text.primary },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingValue: { fontSize: 13, color: Theme.colors.text.tertiary },
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.08)', marginBottom: 32 },
  resetText: { fontSize: 14, fontWeight: '600', color: Theme.colors.error },
  footer: { alignItems: 'center', paddingVertical: 24, borderTopWidth: 1, borderTopColor: Theme.colors.border.secondary },
  developerBadge: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Theme.colors.background.card, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: Theme.colors.border.primary },
  developerIcon: { fontSize: 24 },
  developerLabel: { fontSize: 10, color: Theme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  developerName: { fontSize: 15, fontWeight: '700', color: Theme.colors.accent.primary, marginTop: 2 },
  version: { fontSize: 12, color: Theme.colors.text.muted },
  bottomSpacing: { height: 140 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: Theme.colors.background.elevated, borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 20, textAlign: 'center' },
  modalInput: { backgroundColor: Theme.colors.background.card, borderRadius: 16, padding: 16, fontSize: 16, color: Theme.colors.text.primary, borderWidth: 1, borderColor: Theme.colors.border.primary, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalButtonCancel: { backgroundColor: Theme.colors.background.card },
  modalButtonSave: { backgroundColor: Theme.colors.accent.primary },
  modalButtonFull: { flex: 0, width: '100%', backgroundColor: Theme.colors.accent.primary, marginTop: 16, paddingVertical: 16 },
  modalButtonTextCancel: { fontSize: 15, fontWeight: '600', color: Theme.colors.text.secondary },
  modalButtonTextSave: { fontSize: 16, fontWeight: '700', color: '#000000', textAlign: 'center' },
  industryList: { marginBottom: 8 },
  industryOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, marginBottom: 8, backgroundColor: Theme.colors.background.card },
  industryOptionSelected: { backgroundColor: Theme.colors.accent.muted, borderWidth: 1, borderColor: Theme.colors.accent.primary },
  industryOptionEmoji: { fontSize: 24, marginRight: 12 },
  industryOptionText: { flex: 1, fontSize: 15, color: Theme.colors.text.primary },
  industryOptionTextSelected: { color: Theme.colors.accent.primary, fontWeight: '600' },
  notificationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border.secondary },
  notificationInfo: { flex: 1, marginRight: 12 },
  notificationLabel: { fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary },
  notificationDesc: { fontSize: 11, color: Theme.colors.text.tertiary, marginTop: 2 },
  badgeModalEmoji: { fontSize: 56, textAlign: 'center', marginBottom: 12 },
  badgeModalTitle: { fontSize: 22, fontWeight: '700', color: Theme.colors.text.primary, textAlign: 'center', marginBottom: 12 },
  badgeStatusContainer: { alignItems: 'center', marginBottom: 16 },
  badgeUnlockedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeUnlockedText: { fontSize: 13, fontWeight: '600', color: Theme.colors.success },
  badgeLockedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeLockedText: { fontSize: 13, fontWeight: '600', color: Theme.colors.warning },
  badgeRequirementBox: { backgroundColor: Theme.colors.background.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Theme.colors.border.primary },
  badgeRequirementLabel: { fontSize: 11, fontWeight: '600', color: Theme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  badgeRequirementText: { fontSize: 14, color: Theme.colors.text.secondary, lineHeight: 20 },
  statExplainerTitle: { fontSize: 24, fontWeight: '700', color: Theme.colors.text.primary, textAlign: 'center', marginBottom: 8 },
  statExplainerValue: { fontSize: 36, fontWeight: '800', color: Theme.colors.accent.primary, textAlign: 'center', marginBottom: 16 },
  statExplainerDesc: { fontSize: 14, color: Theme.colors.text.secondary, lineHeight: 22, textAlign: 'left' },
});
