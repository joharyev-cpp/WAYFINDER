/**
 * WAYFINDER App root.
 * Wraps the navigation stack in the Redux store and NavigationContainer.
 */

import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import { store } from './store/store';
import AppNavigator from './navigation/AppNavigator';

// Silence noisy third-party warnings in dev
LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate`',
  '[TrackPlayer]',
]);

export default function App() {
  return (
    <ReduxProvider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </ReduxProvider>
  );
}
