import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen     from '../screens/HomeScreen';
import POIDetailScreen from '../screens/POIDetailScreen';
import MapScreen      from '../screens/MapScreen';
import SettingsScreen from '../screens/SettingsScreen';
import type { RootStackParamList } from '../types';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1A73E8',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { paddingBottom: 4 },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Home:     'explore',
            Map:      'map',
            Settings: 'settings',
          };
          return <Icon name={icons[route.name] ?? 'circle'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     options={{ title: 'Découvrir' }} />
      <Tab.Screen name="Map"      component={MapScreen}      options={{ title: 'Carte' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Paramètres' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="POIDetail"
        component={POIDetailScreen}
        options={{ title: '', headerBackTitle: 'Retour', headerTransparent: true }}
      />
    </Stack.Navigator>
  );
}
