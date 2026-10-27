import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface Tab {
    key: string;
    label: string;
}

interface TransactionViewLayoutProps {
    title: string;
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabKey: string) => void;
    onBack: () => void;
    children: React.ReactNode;
    actionButtonTitle?: string;
    onActionPress?: () => void;
    showActionButton?: boolean;
}

export default function TransactionViewLayout({
    title,
    tabs,
    activeTab,
    onTabChange,
    onBack,
    children,
    actionButtonTitle,
    onActionPress,
    showActionButton = true
}: TransactionViewLayoutProps) {
    const { colors } = useAppTheme();
    const insets = useSafeAreaInsets();
    const reducedMotion = useReducedMotion();
    const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
    const [tabBarWidth, setTabBarWidth] = useState(0);

    const activeIndex = Math.max(0, tabs.findIndex((t) => t.key === activeTab));
    const prevIndexRef = useRef(activeIndex);

    const contentOpacity = useSharedValue(1);
    const contentTranslateX = useSharedValue(0);
    const indicatorIndex = useSharedValue(activeIndex);

    useEffect(() => {
        if (reducedMotion) {
            indicatorIndex.value = activeIndex;
        } else {
            indicatorIndex.value = withSpring(activeIndex, {
                damping: 22,
                stiffness: 240,
            });
        }

        if (prevIndexRef.current === activeIndex) return;

        const direction = activeIndex >= prevIndexRef.current ? 1 : -1;
        prevIndexRef.current = activeIndex;

        scrollViewRef.current?.scrollTo({ y: 0, animated: false });

        if (Platform.OS !== 'web') {
            Haptics.selectionAsync().catch(() => {});
        }

        if (reducedMotion) {
            contentOpacity.value = 1;
            contentTranslateX.value = 0;
            return;
        }

        contentOpacity.value = 0;
        contentTranslateX.value = direction * 20;

        contentOpacity.value = withTiming(1, {
            duration: 210,
            easing: Easing.out(Easing.cubic),
        });
        contentTranslateX.value = withSpring(0, {
            damping: 24,
            stiffness: 260,
        });
    }, [activeIndex, contentOpacity, contentTranslateX, indicatorIndex, reducedMotion]);

    const tabCount = Math.max(1, tabs.length);
    const singleTabWidth = tabBarWidth > 0 ? tabBarWidth / tabCount : 0;

    const animatedIndicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorIndex.value * singleTabWidth }],
    }));

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateX: contentTranslateX.value }],
    }));

    const handleTabBarLayout = (event: LayoutChangeEvent) => {
        setTabBarWidth(event.nativeEvent.layout.width);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            <Header title={title} onBackPress={onBack} />

            <View style={[styles.tabBar, { borderBottomColor: colors.border }]} onLayout={handleTabBarLayout}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <Pressable
                            key={tab.key}
                            style={styles.tabItem}
                            onPress={() => onTabChange(tab.key)}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: isActive }}
                        >
                            <Text style={[styles.tabText, { color: colors.textMuted }, isActive && [styles.activeTabText, { color: colors.primary }]]}>
                                {tab.label}
                            </Text>
                            {tabBarWidth === 0 && isActive && (
                                <View style={[styles.activeTabIndicator, { backgroundColor: colors.primary }]} />
                            )}
                        </Pressable>
                    );
                })}
                {singleTabWidth > 0 && (
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.slidingIndicatorContainer,
                            { width: singleTabWidth },
                            animatedIndicatorStyle,
                        ]}
                    >
                        <View style={[styles.slidingIndicatorBar, { backgroundColor: colors.primary }]} />
                    </Animated.View>
                )}
            </View>

            <View style={{ flex: 1 }}>
                <ScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={animatedContentStyle}>
                        {children}
                    </Animated.View>
                </ScrollView>
            </View>

            {showActionButton && actionButtonTitle && (
                <View style={[
                    styles.footer,
                    {
                        paddingBottom: insets.bottom + moderateScale(10),
                        backgroundColor: colors.surface,
                        borderTopColor: colors.border,
                    },
                ]}>
                    <PrimaryButton
                        title={actionButtonTitle}
                        onPress={onActionPress || (() => { })}
                    />
                </View>
            )}
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    tabItem: {
        flex: 1,
        paddingVertical: '12@vs',
        alignItems: 'center',
    },
    tabText: {
        fontSize: '13@ms',
        color: '#64748B',
        fontWeight: '500',
    },
    activeTabText: {
        color: 'rgba(221, 79, 5, 1)',
        fontWeight: '600',
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: 0,
        height: 2,
        width: '90%',
        backgroundColor: 'rgba(221, 79, 5, 1)',
    },
    slidingIndicatorContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 2,
        alignItems: 'center',
    },
    slidingIndicatorBar: {
        height: 2,
        width: '90%',
        borderRadius: 1,
        backgroundColor: 'rgba(221, 79, 5, 1)',
    },
    scrollContent: {
        paddingHorizontal: '20@s',
        paddingVertical: '20@vs',
        paddingBottom: '40@vs',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: '20@s',
        paddingTop: '10@vs',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
});
