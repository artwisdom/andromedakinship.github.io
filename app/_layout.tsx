import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AppProvider } from '../contexts/AppContext';
import { AIProvider } from '../contexts/AIContext';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#050508' }}>
      <AppProvider>
        <AIProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#050508' } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="practice" options={{ presentation: 'modal' }} />
            <Stack.Screen name="add-goal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="edit-goal" options={{ presentation: 'modal' }} />
          </Stack>
        </AIProvider>
      </AppProvider>
    </View>
  );
}
