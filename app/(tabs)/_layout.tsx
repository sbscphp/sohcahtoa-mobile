import MoneyExchange from '@/assets/images/money-exchange-03.svg';
import { useLiquidGlassAvailable } from '@/components/ui/LiquidGlassView';
import { useAppTheme } from '@/context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Home, More } from 'iconsax-react-nativejs';
import { TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Platform } from 'react-native';

const TAB_HOME_ICON = require('@/assets/icons/tabs/tab-home.png');
const TAB_TRANSACTION_ICON = require('@/assets/icons/tabs/tab-transaction.png');
const TAB_FX_RATE_ICON = require('@/assets/icons/tabs/tab-fx-rate.png');
const TAB_MORE_ICON = require('@/assets/icons/tabs/tab-more.png');

export default function TabLayout() {
  const { colors } = useAppTheme();
  const tintColor = colors.tabIconSelected;
  const inactiveTintColor = colors.tabIconDefault;
  const canUseLiquidGlass = useLiquidGlassAvailable();

  const triggerTabHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
  };

  if (canUseLiquidGlass) {
    return (
      <NativeTabs
        minimizeBehavior="onScrollDown"
        tintColor={tintColor}
        iconColor={{
          default: inactiveTintColor,
          selected: tintColor,
        }}
        labelStyle={{
          default: {
            fontSize: 11,
            fontWeight: '500',
            color: inactiveTintColor,
          },
          selected: {
            fontSize: 11,
            fontWeight: '600',
            color: tintColor,
          },
        }}
        screenListeners={{
          tabPress: triggerTabHaptic,
        }}
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon src={TAB_HOME_ICON} renderingMode="template" />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="transaction">
          <NativeTabs.Trigger.Icon src={TAB_TRANSACTION_ICON} renderingMode="template" />
          <NativeTabs.Trigger.Label>Transaction</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="fx-rate">
          <NativeTabs.Trigger.Icon src={TAB_FX_RATE_ICON} renderingMode="template" />
          <NativeTabs.Trigger.Label>FX Rate</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="more">
          <NativeTabs.Trigger.Icon src={TAB_MORE_ICON} renderingMode="template" />
          <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenListeners={{
        tabPress: triggerTabHaptic,
      }}
      screenOptions={{
        animation: 'fade',
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
          height: 90,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
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
          tabBarIcon: ({ color }) => <More size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
