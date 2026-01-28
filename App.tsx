import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from './src/screens/MapScreen';
import ListScreen from './src/screens/ListScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ShopDetailScreen from './src/screens/ShopDetailScreen';
import BarberDetailScreen from './src/screens/BarberDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { colors, fontSize, fontWeight, borderRadius } from './src/theme';

// 类型定义
export type RootStackParamList = {
  MainTabs: undefined;
  ShopDetail: { shopId: number };
  BarberDetail: { barberId: number };
  AddRecord: { shopId: number };
};

export type TabParamList = {
  Map: undefined;
  List: undefined;
  Favorites: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// SVG 风格图标组件
const TabIcon = ({ focused, type }: { focused: boolean; type: 'map' | 'list' | 'heart' | 'user' }) => {
  const color = focused ? colors.accent : 'rgba(255,255,255,0.5)';
  const icons: Record<string, string> = {
    map: '📍',
    list: '☰',
    heart: '♡',
    user: '○',
  };
  const focusedIcons: Record<string, string> = {
    map: '📍',
    list: '☰',
    heart: '♥',
    user: '●',
  };
  return (
    <Text style={{ fontSize: 20, color }}>
      {focused ? focusedIcons[type] : icons[type]}
    </Text>
  );
};

// 底部Tab导航 - 4个标签
const MainTabs = () => {
  const isWeb = Platform.OS === 'web';
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#16162A',
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: isWeb ? 12 : 28,
          height: isWeb ? 65 : 85,
          elevation: 0,
          shadowOpacity: 0,
          ...(isWeb && {
            position: 'absolute' as const,
            bottom: 0,
            left: 0,
            right: 0,
          }),
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: '地图',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} type="map" />,
        }}
      />
      <Tab.Screen
        name="List"
        component={ListScreen}
        options={{
          tabBarLabel: '列表',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} type="list" />,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: '收藏',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} type="heart" />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} type="user" />,
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: fontWeight.semibold,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ShopDetail"
          component={ShopDetailScreen}
          options={{ title: '店铺详情' }}
        />
        <Stack.Screen
          name="BarberDetail"
          component={BarberDetailScreen}
          options={{ title: '理发师详情' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
