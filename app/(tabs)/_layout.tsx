import MoneyExchange from '@/assets/images/money-exchange-03.svg';
import { LiquidGlassView, useLiquidGlassAvailable } from '@/components/ui/LiquidGlassView';
import { useAppTheme } from '@/context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Home, More } from 'iconsax-react-nativejs';
import { TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_HOME_ICON = require('@/assets/icons/tabs/tab-home.png');
const TAB_TRANSACTION_ICON = require('@/assets/icons/tabs/tab-transaction.png');
const TAB_FX_RATE_ICON = require('@/assets/icons/tabs/tab-fx-rate.png');
const TAB_MORE_ICON = require('@/assets/icons/tabs/tab-more.png');

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const tintColor = colors.tabIconSelected;
  const inactiveTintColor = colors.tabIconDefault;
  const canUseLiquidGlass = useLiquidGlassAvailable();
  const bottomOffset = insets.bottom > 0 ? insets.bottom + 8 : 16;

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
        backgroundColor={colors.tabBarBackground}
        blurEffect={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
        shadowColor={isDark ? 'rgba(0,0,0,0.8)' : colors.shadow}
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
          <NativeTabs.Trigger.Icon
            src={{ default: TAB_HOME_ICON, selected: TAB_HOME_ICON }}
            renderingMode="template"
            selectedColor={tintColor}
          />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="transaction">
          <NativeTabs.Trigger.Icon
            src={{ default: TAB_TRANSACTION_ICON, selected: TAB_TRANSACTION_ICON }}
            renderingMode="template"
            selectedColor={tintColor}
          />
          <NativeTabs.Trigger.Label>Transaction</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="fx-rate">
          <NativeTabs.Trigger.Icon
            src={{ default: TAB_FX_RATE_ICON, selected: TAB_FX_RATE_ICON }}
            renderingMode="template"
            selectedColor={tintColor}
          />
          <NativeTabs.Trigger.Label>FX Rate</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="more">
          <NativeTabs.Trigger.Icon
            src={{ default: TAB_MORE_ICON, selected: TAB_MORE_ICON }}
            renderingMode="template"
            selectedColor={tintColor}
          />
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
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: bottomOffset,
          height: 64,
          borderRadius: 32,
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.78)' : 'rgba(255, 255, 255, 0.82)',
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.35 : 0.12,
          shadowRadius: 16,
          elevation: 8,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarBackground: () => (
          <LiquidGlassView
            variant="regular"
            colorScheme={isDark ? 'dark' : 'light'}
            borderRadius={32}
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: 32,
                overflow: 'hidden',
              },
            ]}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color ? String(color) : tintColor} />,
        }}
      />
      <Tabs.Screen
        name="transaction"
        options={{
          title: 'Transaction',
          tabBarIcon: ({ color }) => <MoneyExchange color={color ? String(color) : tintColor} width={24} height={24} />,
        }}
      />
      <Tabs.Screen
        name="fx-rate"
        options={{
          title: 'FX Rate',
          tabBarIcon: ({ color }) => <TrendingUp size={24} color={color ? String(color) : tintColor} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <More size={24} color={color ? String(color) : tintColor} />,
        }}
      />
    </Tabs>
  );
}
