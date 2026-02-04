import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Theme from '../constants/Theme';

const { width } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
};

export default function AdPopup({ visible, onClose, onUpgrade }: Props) {
  const handleUpgrade = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUpgrade();
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={[Theme.colors.background.elevated, Theme.colors.background.card]}
            style={styles.gradient}
          >
            {/* Close button */}
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Feather name="x" size={20} color={Theme.colors.text.secondary} />
            </Pressable>

            {/* Ad badge */}
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>SPONSORED</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.iconContainer}>
                <Text style={styles.icon}>⚡</Text>
              </LinearGradient>
              
              <Text style={styles.title}>Unlock Your Full Potential</Text>
              <Text style={styles.subtitle}>
                Get unlimited Chiron coaching, remove all ads, and access premium features.
              </Text>

              <View style={styles.features}>
                <View style={styles.featureRow}>
                  <Feather name="check" size={16} color={Theme.colors.success} />
                  <Text style={styles.featureText}>Unlimited AI coaching</Text>
                </View>
                <View style={styles.featureRow}>
                  <Feather name="check" size={16} color={Theme.colors.success} />
                  <Text style={styles.featureText}>Ad-free experience</Text>
                </View>
                <View style={styles.featureRow}>
                  <Feather name="check" size={16} color={Theme.colors.success} />
                  <Text style={styles.featureText}>Advanced analytics</Text>
                </View>
              </View>

              <Pressable
                onPress={handleUpgrade}
                style={({ pressed }) => [styles.upgradeButton, pressed && { opacity: 0.9 }]}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.upgradeGradient}
                >
                  <Text style={styles.upgradeText}>Upgrade to Premium</Text>
                </LinearGradient>
              </Pressable>

              <Pressable onPress={handleClose} style={styles.skipButton}>
                <Text style={styles.skipText}>Maybe later</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: width - 48,
    maxWidth: 340,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  adBadge: {
    alignSelf: 'center',
    backgroundColor: Theme.colors.text.muted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 16,
  },
  adBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.background.primary,
    letterSpacing: 1,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  features: {
    width: '100%',
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: Theme.colors.text.primary,
  },
  upgradeButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  upgradeGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  upgradeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.background.primary,
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    color: Theme.colors.text.muted,
  },
});
