import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from './src/screens/MapScreen';
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
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// 文字图标组件
const TabTextIcon = ({ focused, icon }: { focused: boolean; icon: string }) => (
  <Text style={{
    fontSize: 22,
    color: focused ? colors.accent : 'rgba(255,255,255,0.6)',
  }}>
    {icon}
  </Text>
);

// 底部Tab导航 - 简约风格
const MainTabs = () => {
  // Web 和移动端使用不同的底部间距
  const isWeb = Platform.OS === 'web';
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingTop: 8,
          paddingBottom: isWeb ? 12 : 24,
          height: isWeb ? 60 : 80,
          elevation: 0,
          shadowOpacity: 0,
          // Web 端确保底部导航可见
          ...(isWeb && {
            position: 'absolute' as const,
            bottom: 0,
            left: 0,
            right: 0,
          }),
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.medium,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: '发现',
          tabBarIcon: ({ focused }) => <TabTextIcon focused={focused} icon="◎" />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ({ focused }) => <TabTextIcon focused={focused} icon="○" />,
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
          headerBackTitleVisible: false,
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
