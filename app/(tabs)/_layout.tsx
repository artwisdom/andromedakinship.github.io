import { Tabs } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Alert, AppState, AppStateStatus } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAI } from '../../contexts/AIContext';
import { useApp } from '../../contexts/AppContext';
import FloatingAIButton from '../../components/FloatingAIButton';
import AIChatSheet from '../../components/AIChatSheet';
import PremiumPaywall from '../../components/PremiumPaywall';
import UpgradeBanner from '../../components/UpgradeBanner';
import AdBanner from '../../components/AdBanner';
import AdPopup from '../../components/AdPopup';
import Theme from '../../constants/Theme';

const AD_POPUP_INTERVAL = 180000; // Show ad popup every 3 minutes for free users

export default function TabsLayout() {
  const { isOpen, openChat, closeChat, initialPrompt, clearInitialPrompt } = useAI();
  const { state, setPremium } = useApp();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false); // Start hidden
  const [showAdPopup, setShowAdPopup] = useState(false);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bannerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);
  const isPremiumRef = useRef(state.user.isPremium);

  // Keep ref in sync with state
  useEffect(() => {
    isPremiumRef.current = state.user.isPremium;
  }, [state.user.isPremium]);

  // Show upgrade banner after 5-10 seconds for free users
  useEffect(() => {
    if (!state.user.isPremium) {
      // Delay showing the upgrade banner by 5-10 seconds (random)
      const delay = 5000 + Math.random() * 5000; // 5-10 seconds
      bannerTimerRef.current = setTimeout(() => {
        setShowUpgradeBanner(true);
      }, delay);
      startAdTimer();
    } else {
      setShowUpgradeBanner(false);
      setShowAdPopup(false);
      clearAdTimer();
    }
    
    return () => {
      clearAdTimer();
      if (bannerTimerRef.current) {
        clearTimeout(bannerTimerRef.current);
      }
    };
  }, [state.user.isPremium]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - use ref to get fresh premium state
        if (!isPremiumRef.current) {
          startAdTimer();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background
        clearAdTimer();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  const startAdTimer = () => {
    clearAdTimer();
    // Use ref to avoid stale closure
    if (!isPremiumRef.current) {
      adTimerRef.current = setInterval(() => {
        // Double-check premium status via ref inside the interval
        if (isPremiumRef.current) {
          clearAdTimer();
          return;
        }
        setShowAdPopup(true);
      }, AD_POPUP_INTERVAL);
    }
  };

  const clearAdTimer = () => {
    if (adTimerRef.current) {
      clearInterval(adTimerRef.current);
      adTimerRef.current = null;
    }
  };

  const handleSubscribe = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPremium(true);
    setShowPaywall(false);
    setShowUpgradeBanner(false);
    setShowAdPopup(false);
    clearAdTimer();
    Alert.alert(
      'Welcome to Premium! 🎉',
      'You now have unlimited access to all SellCraft features including Chiron AI coaching.',
      [{ text: 'Let\'s Go!' }]
    );
  };

  const handleDismissBanner = () => {
    setShowUpgradeBanner(false);
  };

  const handleAdPopupClose = () => {
    setShowAdPopup(false);
  };

  const handleAdPopupUpgrade = () => {
    setShowAdPopup(false);
    setShowPaywall(true);
  };

  return (
    <View style={styles.container}>
      {/* Dismissible upgrade banner at top - only for free users */}
      {!state.user.isPremium && showUpgradeBanner && (
        <View style={styles.topBannerContainer}>
          <UpgradeBanner 
            onUpgrade={() => setShowPaywall(true)} 
            onDismiss={handleDismissBanner}
          />
        </View>
      )}
      
      <View style={styles.tabsContainer}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Theme.colors.accent.primary,
            tabBarInactiveTintColor: Theme.colors.text.muted,
            tabBarShowLabel: true,
            tabBarStyle: {
              position: 'absolute',
              bottom: Platform.OS === 'ios' ? 24 : 16,
              left: 20,
              right: 20,
              height: 70,
              borderRadius: 24,
              backgroundColor: 'rgba(19, 19, 29, 0.95)',
              borderTopWidth: 0,
              borderWidth: 1,
              borderColor: Theme.colors.border.primary,
              paddingTop: 8,
              paddingBottom: Platform.OS === 'ios' ? 8 : 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 8,
            },
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '600',
              marginTop: 4,
            },
            tabBarItemStyle: {
              paddingTop: 4,
            },
          }}
          screenListeners={{
            tabPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <View style={focused ? styles.iconActive : undefined}>
                  <Feather name="home" size={22} color={color} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="arena"
            options={{
              title: 'Arena',
              tabBarIcon: ({ color, focused }) => (
                <View style={focused ? styles.iconActive : undefined}>
                  <Feather name="target" size={22} color={color} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="coach"
            options={{
              title: 'Coach',
              tabBarIcon: ({ color, focused }) => (
                <View style={focused ? styles.iconActive : undefined}>
                  <Feather name="cpu" size={22} color={color} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="goals"
            options={{
              title: 'Goals',
              tabBarIcon: ({ color, focused }) => (
                <View style={focused ? styles.iconActive : undefined}>
                  <Feather name="flag" size={22} color={color} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, focused }) => (
                <View style={focused ? styles.iconActive : undefined}>
                  <Feather name="user" size={22} color={color} />
                </View>
              ),
            }}
          />
        </Tabs>
      </View>
      
      {/* Fixed ad banner at bottom - above tab bar, for free users */}
      {!state.user.isPremium && (
        <View style={styles.adBannerContainer}>
          <AdBanner onPress={() => setShowPaywall(true)} />
        </View>
      )}
      
      {/* Floating Chiron Button */}
      <FloatingAIButton onPress={openChat} />
      
      {/* Chiron Chat Sheet */}
      <AIChatSheet 
        visible={isOpen} 
        onClose={closeChat} 
        onUpgrade={() => {
          closeChat();
          setShowPaywall(true);
        }}
      />

      {/* Ad Popup - shows periodically for free users */}
      <AdPopup
        visible={showAdPopup}
        onClose={handleAdPopupClose}
        onUpgrade={handleAdPopupUpgrade}
      />

      {/* Premium Paywall */}
      <PremiumPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={handleSubscribe}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  topBannerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  tabsContainer: {
    flex: 1,
  },
  adBannerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 92,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  iconActive: {
    backgroundColor: Theme.colors.accent.subtle,
    borderRadius: 12,
    padding: 6,
    marginBottom: -4,
  },
});
