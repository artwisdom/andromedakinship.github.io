import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Theme from '../constants/Theme';

const { width } = Dimensions.get('window');

type Props = {
  onUpgrade: () => void;
  onDismiss: () => void;
};

export default function UpgradeBanner({ onUpgrade, onDismiss }: Props) {
  const handleUpgrade = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUpgrade();
  };

  const handleDismiss = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(245, 158, 11, 0.15)', 'rgba(217, 119, 6, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Pressable onPress={handleUpgrade} style={styles.content}>
          <View style={styles.iconContainer}>
            <Feather name="star" size={18} color={Theme.colors.warning} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>Elite AI Chiron • Unlimited coaching</Text>
          </View>
        </Pressable>
        
        {/* Swipe up hint & dismiss button */}
        <Pressable onPress={handleDismiss} style={styles.dismissButton}>
          <Feather name="chevron-up" size={20} color={Theme.colors.text.tertiary} />
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 11,
    color: Theme.colors.text.tertiary,
    marginTop: 2,
  },
  dismissButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
