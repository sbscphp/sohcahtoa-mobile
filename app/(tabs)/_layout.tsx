import MoneyExchange from '@/assets/images/money-exchange-03.svg';
import { Tabs } from 'expo-router';
import { Home, More, User } from 'iconsax-react-nativejs';
import { TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Image, useColorScheme } from 'react-native';
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
          height: 90,
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
          tabBarIcon: ({ color }) => (
            <Home size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transaction"
        options={{
          title: 'Transaction',
          tabBarIcon: ({ color }) => <MoneyExchange color={color} width={24} height={24} />,
        }}
      />
      <Tabs.Screen
        name="fx-rate"
        options={{
          title: 'FX Rate',
          tabBarIcon: ({ color }) => <TrendingUp size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => ( focused ? 
            <Image
              source={require('@/assets/images/user-img-1.jpg')}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                borderWidth: focused ? 2 : 0,
                borderColor: color
              }}
            />
            : <More size={24} color={color} />),
        }}
      />
    </Tabs>
  );
}
