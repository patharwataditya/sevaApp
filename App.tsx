import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { NavProvider, useNav, Route } from './src/navigation/Nav';
import { colors } from './src/theme';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LocationScreen from './src/screens/LocationScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import ServiceDetailScreen from './src/screens/ServiceDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const SCREENS: Record<string, React.ComponentType> = {
  welcome: WelcomeScreen,
  location: LocationScreen,
  signup: SignupScreen,
  home: HomeScreen,
  category: CategoryScreen,
  service: ServiceDetailScreen,
  profile: ProfileScreen,
};

function Router() {
  const nav = useNav();
  const Screen = SCREENS[nav.current.name] ?? HomeScreen;
  return <Screen />;
}

function Root() {
  const { ready, onboarded } = useApp();

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const initial: Route = { name: onboarded ? 'home' : 'welcome' };

  return (
    <NavProvider initial={initial}>
      <Router />
    </NavProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
