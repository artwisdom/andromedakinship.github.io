import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Theme from '../constants/Theme';
import { PREMIUM_PRICE, PREMIUM_PERIOD } from '../contexts/AppContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
};

const PREMIUM_FEATURES = [
  { icon: 'cpu', title: 'Elite AI Coach', description: 'Unlimited access to Chiron, powered by OpenAI\'s fastest AI engine' },
  { icon: 'zap', title: 'Advanced Coaching', description: 'Scripts, role play, closing techniques & follow-up strategies' },
  { icon: 'target', title: 'All Objection Scenarios', description: 'Access 200+ industry-specific objection handling scenarios' },
  { icon: 'bell', title: 'Personalized Chiron Notifications', description: 'AI-powered reminders with your readiness, streak & goal stats' },
  { icon: 'trending-up', title: 'Performance Analytics', description: 'Deep insights into your weekly trends and improvement areas' },
  { icon: 'x-circle', title: 'No Ads', description: 'Enjoy a completely ad-free experience' },
];

export default function PremiumPaywall({ visible, onClose, onSubscribe }: Props) {
  const handleSubscribe = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSubscribe();
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.backdrop}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        </View>

        <View style={styles.sheet}>
          <LinearGradient
            colors={[Theme.colors.background.elevated, Theme.colors.background.primary]}
            style={styles.sheetGradient}
          >
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Close Button */}
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Feather name="x" size={20} color={Theme.colors.text.secondary} />
            </Pressable>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Hero */}
              <View style={styles.hero}>
                <LinearGradient colors={Theme.gradients.primary} style={styles.heroIcon}>
                  <Feather name="star" size={32} color={Theme.colors.background.primary} />
                </LinearGradient>
                <Text style={styles.heroTitle}>SellCraft Premium</Text>
                <Text style={styles.heroSubtitle}>
                  Unlock your full sales potential with unlimited AI coaching
                </Text>
              </View>

              {/* Price */}
              <View style={styles.priceCard}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceAmount}>{PREMIUM_PRICE}</Text>
                  <Text style={styles.pricePeriod}>/{PREMIUM_PERIOD}</Text>
                </View>
                <Text style={styles.priceNote}>Cancel anytime. 7-day free trial.</Text>
              </View>

              {/* Features */}
              <View style={styles.features}>
                {PREMIUM_FEATURES.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <View style={styles.featureIcon}>
                      <Feather name={feature.icon as any} size={18} color={Theme.colors.accent.primary} />
                    </View>
                    <View style={styles.featureText}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDesc}>{feature.description}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Subscribe Button */}
              <Pressable
                onPress={handleSubscribe}
                style={({ pressed }) => [styles.subscribeButton, pressed && { opacity: 0.9 }]}
              >
                <LinearGradient
                  colors={Theme.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.subscribeGradient}
                >
                  <Text style={styles.subscribeText}>Start Free Trial</Text>
                </LinearGradient>
              </Pressable>

              {/* Restore */}
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [styles.restoreButton, pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.restoreText}>Restore Purchases</Text>
              </Pressable>

              {/* Terms */}
              <Text style={styles.terms}>
                By subscribing, you agree to our Terms of Service and Privacy Policy.
                Payment will be charged to your Apple ID account at confirmation of purchase.
              </Text>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    height: SCREEN_HEIGHT * 0.88,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetGradient: {
    flex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.text.muted,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  priceCard: {
    backgroundColor: Theme.colors.accent.subtle,
    borderRadius: Theme.radius.xl,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Theme.colors.border.accent,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: Theme.colors.accent.primary,
  },
  pricePeriod: {
    fontSize: 18,
    color: Theme.colors.text.tertiary,
    marginBottom: 10,
    marginLeft: 4,
  },
  priceNote: {
    fontSize: 13,
    color: Theme.colors.text.secondary,
    marginTop: 8,
  },
  features: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Theme.colors.accent.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: Theme.colors.text.tertiary,
    lineHeight: 18,
  },
  subscribeButton: {
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
    marginBottom: 12,
  },
  subscribeGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  subscribeText: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.background.primary,
  },
  restoreButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 14,
    color: Theme.colors.accent.primary,
    fontWeight: '600',
  },
  terms: {
    fontSize: 11,
    color: Theme.colors.text.muted,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 16,
  },
});
