import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../contexts/AppContext';

export default function Index() {
  const { state, isLoaded } = useApp();

  useEffect(() => {
    if (isLoaded) {
      if (state.user.onboardingComplete) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isLoaded, state.user.onboardingComplete]);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
  },
});
