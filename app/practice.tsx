import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '../contexts/AppContext';
import { getRandomObjection, getObjectionsByCategory, Objection, clearRecentObjections } from '../constants/Objections';
import Theme from '../constants/Theme';

export default function PracticeScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const { state, completeObjection } = useApp();
  const [objection, setObjection] = useState<Objection | null>(null);
  const [userResponse, setUserResponse] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Clear recent history when starting a new practice session
  useEffect(() => {
    clearRecentObjections();
    loadNewObjection();
  }, []);

  const loadNewObjection = () => {
    if (state.user.industry) {
      let newObjection: Objection;
      const isPremium = state.user.isPremium;
      
      if (category) {
        // Filter by category - include premium objections for premium users
        const categoryObjections = getObjectionsByCategory(state.user.industry, category, isPremium);
        if (categoryObjections.length > 0) {
          // Better randomization - shuffle and pick
          const shuffled = [...categoryObjections].sort(() => Math.random() - 0.5);
          newObjection = shuffled[0];
        } else {
          // Fallback to random if no objections in category
          newObjection = getRandomObjection(state.user.industry, isPremium);
        }
      } else {
        // Random from all categories with anti-repeat logic
        newObjection = getRandomObjection(state.user.industry, isPremium);
      }
      
      setObjection(newObjection);
      setUserResponse('');
      setShowResult(false);
      setShowTips(false);
    }
  };

  const handleSubmit = async () => {
    if (!userResponse.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowResult(true);
  };

  const handleRate = async (success: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    completeObjection(success);
    
    setTimeout(() => {
      loadNewObjection();
    }, 500);
  };

  const handleClose = () => {
    router.back();
  };

  if (!objection) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[Theme.colors.background.primary, Theme.colors.background.secondary]} style={StyleSheet.absoluteFill} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Theme.colors.background.primary, Theme.colors.background.secondary]} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Feather name="x" size={22} color={Theme.colors.text.primary} />
            </Pressable>
            <Text style={styles.headerTitle}>{category ? `${category} Practice` : 'Practice Mode'}</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Category Badge */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{objection.category}</Text>
            </View>

            {/* Customer Objection */}
            <View style={styles.objectionCard}>
              <View style={styles.customerLabel}>
                <Text style={styles.customerEmoji}>🗣️</Text>
                <Text style={styles.customerText}>Customer says:</Text>
              </View>
              <Text style={styles.objectionText}>"{objection.objection}"</Text>
            </View>

            {/* Tips Button */}
            <Pressable
              onPress={() => setShowTips(!showTips)}
              style={({ pressed }) => [styles.tipsButton, pressed && { opacity: 0.7 }]}
            >
              <Feather name={showTips ? 'eye-off' : 'eye'} size={16} color={Theme.colors.purple.primary} />
              <Text style={styles.tipsButtonText}>{showTips ? 'Hide Tips' : 'Show Tips'}</Text>
            </Pressable>

            {/* Tips Section */}
            {showTips && (
              <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 Tips</Text>
                {objection.tips.map((tip, index) => (
                  <View key={index} style={styles.tipRow}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {!showResult ? (
              <>
                {/* Response Input */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Your Response</Text>
                  <TextInput
                    style={styles.responseInput}
                    placeholder="How would you handle this objection?"
                    placeholderTextColor={Theme.colors.text.muted}
                    value={userResponse}
                    onChangeText={setUserResponse}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                {/* Submit Button */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={!userResponse.trim()}
                  style={({ pressed }) => [
                    styles.submitButton,
                    !userResponse.trim() && styles.submitButtonDisabled,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <LinearGradient
                    colors={userResponse.trim() ? Theme.gradients.primary : [Theme.colors.background.card, Theme.colors.background.card]}
                    style={styles.submitGradient}
                  >
                    <Text style={[styles.submitText, !userResponse.trim() && { color: Theme.colors.text.muted }]}>
                      Submit Response
                    </Text>
                  </LinearGradient>
                </Pressable>
              </>
            ) : (
              <>
                {/* User's Response Display */}
                <View style={styles.userResponseCard}>
                  <Text style={styles.responseLabel}>Your Response</Text>
                  <Text style={styles.userResponseText}>{userResponse}</Text>
                </View>

                {/* Sample Response */}
                <View style={styles.sampleCard}>
                  <Text style={styles.sampleLabel}>✨ Sample Response</Text>
                  <Text style={styles.sampleText}>{objection.sampleResponse}</Text>
                </View>

                {/* Self Rating */}
                <View style={styles.ratingSection}>
                  <Text style={styles.ratingTitle}>How did you do?</Text>
                  <View style={styles.ratingButtons}>
                    <Pressable
                      onPress={() => handleRate(false)}
                      style={({ pressed }) => [styles.rateButton, styles.rateButtonBad, pressed && { opacity: 0.8 }]}
                    >
                      <Text style={styles.rateEmoji}>😅</Text>
                      <Text style={styles.rateText}>Needs Work</Text>
                      <Text style={styles.rateXP}>+10 XP</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleRate(true)}
                      style={({ pressed }) => [styles.rateButton, styles.rateButtonGood, pressed && { opacity: 0.8 }]}
                    >
                      <Text style={styles.rateEmoji}>🎯</Text>
                      <Text style={styles.rateText}>Nailed It!</Text>
                      <Text style={styles.rateXP}>+25 XP</Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  loadingText: {
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginTop: 100,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.accent.muted,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 12,
    color: Theme.colors.accent.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  objectionCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: Theme.radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    marginBottom: 16,
  },
  customerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  customerEmoji: {
    fontSize: 18,
  },
  customerText: {
    fontSize: 13,
    color: Theme.colors.error,
    fontWeight: '600',
  },
  objectionText: {
    fontSize: 18,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    lineHeight: 26,
  },
  tipsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  tipsButtonText: {
    fontSize: 14,
    color: Theme.colors.purple.primary,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: Theme.colors.purple.muted,
    borderRadius: Theme.radius.lg,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  tipsTitle: {
    fontSize: 14,
    color: Theme.colors.purple.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    color: Theme.colors.text.tertiary,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.text.secondary,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    ...Theme.typography.label.small,
    color: Theme.colors.text.tertiary,
    marginBottom: 10,
  },
  responseInput: {
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.radius.lg,
    padding: 16,
    fontSize: 15,
    color: Theme.colors.text.primary,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Theme.colors.border.primary,
  },
  submitButton: {
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.background.primary,
  },
  userResponseCard: {
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.radius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border.primary,
  },
  responseLabel: {
    ...Theme.typography.label.small,
    color: Theme.colors.text.muted,
    marginBottom: 8,
  },
  userResponseText: {
    fontSize: 15,
    color: Theme.colors.text.primary,
    lineHeight: 22,
  },
  sampleCard: {
    backgroundColor: Theme.colors.accent.muted,
    borderRadius: Theme.radius.lg,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Theme.colors.border.accent,
  },
  sampleLabel: {
    fontSize: 14,
    color: Theme.colors.accent.primary,
    fontWeight: '600',
    marginBottom: 10,
  },
  sampleText: {
    fontSize: 15,
    color: Theme.colors.text.primary,
    lineHeight: 22,
  },
  ratingSection: {
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text.primary,
    marginBottom: 16,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rateButton: {
    flex: 1,
    borderRadius: Theme.radius.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  rateButtonBad: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  rateButtonGood: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  rateEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  rateText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  rateXP: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
  },
});
