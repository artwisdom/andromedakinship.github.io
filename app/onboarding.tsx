import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp, Industry } from '../contexts/AppContext';
import { INDUSTRY_INFO } from '../constants/Objections';
import Theme from '../constants/Theme';

const { width } = Dimensions.get('window');
const industries: Industry[] = ['automotive', 'saas', 'insurance', 'realestate', 'retail', 'financial', 'medical', 'solar', 'telecom', 'hvac', 'fitness', 'general'];

export default function OnboardingScreen() {
  const { setIndustry, setName, completeOnboarding, addGoal } = useApp();
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);

  const handleIndustrySelect = (industry: Industry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedIndustry(industry);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (step === 1 && userName.trim()) {
      setName(userName.trim());
      setStep(2);
    } else if (step === 2 && selectedIndustry) {
      setIndustry(selectedIndustry);
      
      // Add default starter goals
      addGoal({
        title: 'Complete 5 objection practices',
        type: 'skill',
        target: 5,
        current: 0,
        unit: 'practices',
        status: 'active',
      });
      addGoal({
        title: 'Have 3 Chiron coaching sessions',
        type: 'skill',
        target: 3,
        current: 0,
        unit: 'sessions',
        status: 'active',
      });
      
      completeOnboarding();
      router.replace('/(tabs)');
    }
  };

  const canContinue = step === 1 ? userName.trim().length > 0 : selectedIndustry !== null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Theme.colors.background.primary, Theme.colors.background.secondary]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Background glow */}
      <View style={styles.glowContainer}>
        <LinearGradient
          colors={['rgba(0, 245, 212, 0.15)', 'transparent']}
          style={styles.glow}
        />
      </View>
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
              <View style={styles.progressLine} />
              <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
            </View>

            {step === 1 ? (
              <>
                {/* Step 1: Name */}
                <View style={styles.heroSection}>
                  <View style={styles.iconContainer}>
                    <LinearGradient colors={Theme.gradients.primary} style={styles.iconGradient}>
                      <Feather name="user" size={32} color={Theme.colors.background.primary} />
                    </LinearGradient>
                  </View>
                  <Text style={styles.title}>Welcome to SellCraft</Text>
                  <Text style={styles.subtitle}>Where closers are made</Text>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>WHAT'S YOUR NAME?</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your first name"
                    placeholderTextColor={Theme.colors.text.muted}
                    value={userName}
                    onChangeText={setUserName}
                    autoFocus
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={handleNext}
                  />
                </View>
              </>
            ) : (
              <>
                {/* Step 2: Industry */}
                <View style={styles.heroSection}>
                  <View style={styles.iconContainer}>
                    <LinearGradient colors={Theme.gradients.primary} style={styles.iconGradient}>
                      <Feather name="briefcase" size={32} color={Theme.colors.background.primary} />
                    </LinearGradient>
                  </View>
                  <Text style={styles.title}>Hey {userName}! 👋</Text>
                  <Text style={styles.subtitle}>What industry are you in?</Text>
                </View>

                <View style={styles.industriesGrid}>
                  {industries.map((industry) => {
                    const info = INDUSTRY_INFO[industry];
                    const isSelected = selectedIndustry === industry;
                    return (
                      <Pressable
                        key={industry}
                        onPress={() => handleIndustrySelect(industry)}
                        style={({ pressed }) => [
                          styles.industryCard,
                          isSelected && styles.industryCardSelected,
                          pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                        ]}
                      >
                        <Text style={styles.industryEmoji}>{info.icon}</Text>
                        <Text style={[styles.industryName, isSelected && styles.industryNameSelected]}>
                          {info.name}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkmark}>
                            <Feather name="check" size={14} color={Theme.colors.background.primary} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={handleNext}
              disabled={!canContinue}
              style={({ pressed }) => [
                styles.continueButton,
                !canContinue && styles.continueButtonDisabled,
                pressed && { opacity: 0.9 },
              ]}
            >
              <LinearGradient
                colors={canContinue ? Theme.gradients.primary : [Theme.colors.background.card, Theme.colors.background.card]}
                style={styles.continueGradient}
              >
                <Text style={[styles.continueText, !canContinue && { color: Theme.colors.text.muted }]}>
                  {step === 1 ? 'Continue' : 'Get Started'}
                </Text>
                <Feather 
                  name="arrow-right" 
                  size={20} 
                  color={canContinue ? Theme.colors.background.primary : Theme.colors.text.muted} 
                />
              </LinearGradient>
            </Pressable>
          </View>
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
  glowContainer: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    height: 400,
  },
  glow: {
    flex: 1,
    borderRadius: 200,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.border.primary,
  },
  progressDotActive: {
    backgroundColor: Theme.colors.accent.primary,
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: Theme.colors.border.primary,
    marginHorizontal: 12,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 40,
  },
  label: {
    ...Theme.typography.label.small,
    color: Theme.colors.text.tertiary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.radius.xl,
    padding: 20,
    fontSize: 18,
    color: Theme.colors.text.primary,
    borderWidth: 1,
    borderColor: Theme.colors.border.primary,
    textAlign: 'center',
  },
  industriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  industryCard: {
    width: (width - 60) / 2,
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.radius.xl,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.border.primary,
    position: 'relative',
  },
  industryCardSelected: {
    borderColor: Theme.colors.accent.primary,
    backgroundColor: Theme.colors.accent.subtle,
  },
  industryEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  industryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  industryNameSelected: {
    color: Theme.colors.accent.primary,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 24,
  },
  continueButton: {
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.background.primary,
  },
});
