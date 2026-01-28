import { Tabs } from 'expo-router';
import { Chart21, Home, HomeTrendUp, Profile, Receipt1 } from 'iconsax-react-nativejs';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: '#94A3B8',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: 80,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 10,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            focused ? <HomeTrendUp size={24} color={color} variant="Bold" /> : <Home size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transaction"
        options={{
          title: 'Transaction',
          tabBarIcon: ({ color, focused }) => <Receipt1 size={24} color={color} variant={focused ? "Bold" : "Linear"} />,
        }}
      />
      <Tabs.Screen
        name="fx-rate"
        options={{
          title: 'FX Rate',
          tabBarIcon: ({ color, focused }) => <Chart21 size={24} color={color} variant={focused ? "Bold" : "Linear"} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <Profile size={24} color={color} variant={focused ? "Bold" : "Linear"} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide explore if not needed, or delete file
        }}
      />
    </Tabs>
  );
}
