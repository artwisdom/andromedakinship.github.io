import React from 'react';
import { Pressable, Text, StyleSheet, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Theme from '../constants/Theme';

type Props = {
  onPress: () => void;
};

export default function FloatingAIButton({ onPress }: Props) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.9, transform: [{ scale: 0.95 }] },
      ]}
    >
      {/* Pulse animation ring */}
      <View style={styles.pulseRing} />
      
      {/* Main circular button with Chiron image */}
      <View style={styles.button}>
        <Image 
          source={require('../assets/chiron.png')} 
          style={styles.chironImage}
          resizeMode="cover"
        />
      </View>
      
      {/* Label */}
      <View style={styles.labelBubble}>
        <Text style={styles.label}>Chiron</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  chironImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  labelBubble: {
    position: 'absolute',
    top: -28,
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.background.primary,
  },
});
