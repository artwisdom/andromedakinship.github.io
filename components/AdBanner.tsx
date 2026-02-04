import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Theme from '../constants/Theme';

const { width } = Dimensions.get('window');

type Props = {
  onPress?: () => void;
};

export default function AdBanner({ onPress }: Props) {
  const handlePress = async () => {
    if (onPress) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View style={styles.adContent}>
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>AD</Text>
        </View>
        <View style={styles.textContent}>
          <Text style={styles.adTitle}>🚀 Remove Ads with Premium</Text>
          <Text style={styles.adSubtitle}>Unlock unlimited features • Tap to learn more</Text>
        </View>
        <Feather name="chevron-right" size={18} color={Theme.colors.text.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.background.card,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adBadge: {
    backgroundColor: Theme.colors.text.muted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 10,
  },
  adBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.background.primary,
    letterSpacing: 0.5,
  },
  textContent: {
    flex: 1,
  },
  adTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  adSubtitle: {
    fontSize: 11,
    color: Theme.colors.text.tertiary,
    marginTop: 1,
  },
});
