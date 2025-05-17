import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import BettingDashboardScreen from '../screens/BettingDashboardScreen';
import LiveBettingScreen from '../screens/LiveBettingScreen';
import TournamentsScreen from '../screens/TournamentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SportScreen from '../screens/SportScreen';
import BetDetailsScreen from '../screens/BetDetailsScreen';
import AuthScreen from '../screens/AuthScreen';
import VipFeaturesScreen from '../screens/VipFeaturesScreen';
import FantasySportsScreen from '../screens/FantasySportsScreen';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Tab Navigator
function TabNavigator() {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Betting" 
        component={BettingDashboardScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Live" 
        component={LiveBettingScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="access-point" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Tournaments" 
        component={TournamentsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="trophy" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Drawer Navigator
function DrawerNavigator() {
  const { colors } = useTheme();
  
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#FFFFFF',
        drawerStyle: {
          backgroundColor: colors.background,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
      }}
    >
      <Drawer.Screen 
        name="Main" 
        component={TabNavigator} 
        options={{ 
          headerShown: false,
          drawerIcon: ({ color }) => (
            <Icon name="view-dashboard" color={color} size={24} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          drawerIcon: ({ color }) => (
            <Icon name="cog" color={color} size={24} />
          ),
        }}
      />
      <Drawer.Screen 
        name="VIP Features" 
        component={VipFeaturesScreen} 
        options={{
          drawerIcon: ({ color }) => (
            <Icon name="star" color={color} size={24} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Fantasy Sports" 
        component={FantasySportsScreen} 
        options={{
          drawerIcon: ({ color }) => (
            <Icon name="basketball" color={color} size={24} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// Root Stack Navigator
function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen name="Sport" component={SportScreen} options={{ headerShown: true }} />
      <Stack.Screen name="BetDetails" component={BetDetailsScreen} options={{ headerShown: true }} />
    </Stack.Navigator>
  );
}

export default AppNavigator;