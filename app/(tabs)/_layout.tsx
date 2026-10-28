import MoneyExchange from '@/assets/images/money-exchange-03.svg';
import { useLiquidGlassAvailable } from '@/components/ui/LiquidGlassView';
import { useAppTheme } from '@/context/ThemeContext';
import { useDevicePose } from '@/hooks/useDevicePose';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Home, More } from 'iconsax-react-nativejs';
import { TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_HOME_ICON = require('@/assets/icons/tabs/tab-home.png');
const TAB_TRANSACTION_ICON = require('@/assets/icons/tabs/tab-transaction.png');
const TAB_FX_RATE_ICON = require('@/assets/icons/tabs/tab-fx-rate.png');
const TAB_MORE_ICON = require('@/assets/icons/tabs/tab-more.png');

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { isIPhoneDuo, isFoldedDisplay } = useDevicePose();
  const isFoldedDuo = isIPhoneDuo && isFoldedDisplay;
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
        preferredPlacement="sidebar"
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
          backgroundColor: colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
          height: isFoldedDuo ? 98 : 90,
          paddingTop: isFoldedDuo ? 6 : 10,
          marginLeft: insets.left,
          marginRight: insets.right,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
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
