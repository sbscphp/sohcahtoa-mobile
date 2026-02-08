import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import React, { useRef } from 'react';
import { PanResponder, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
    const insets = useSafeAreaInsets();

    // Create pan responder for swipe gestures
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only respond to horizontal swipes
                return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20;
            },
            onPanResponderRelease: (_, gestureState) => {
                const currentIndex = tabs.findIndex(tab => tab.key === activeTab);

                // Swipe left (next tab)
                if (gestureState.dx < -50 && currentIndex < tabs.length - 1) {
                    onTabChange(tabs[currentIndex + 1].key);
                }
                // Swipe right (previous tab)
                else if (gestureState.dx > 50 && currentIndex > 0) {
                    onTabChange(tabs[currentIndex - 1].key);
                }
            },
        })
    ).current;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title={title} onBackPress={onBack} />

            <View style={styles.tabBar}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={styles.tabItem}
                        onPress={() => onTabChange(tab.key)}
                    >
                        <View style={[styles.tabTextContainer, activeTab === tab.key && styles.activeTabItem]}>
                            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                                {tab.label}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ flex: 1 }} {...panResponder.panHandlers}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </ScrollView>
            </View>

            {showActionButton && actionButtonTitle && (
                <View style={[styles.footer, { paddingBottom: insets.bottom + moderateScale(10) }]}>
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
    },
    tabItem: {
        flex: 1,
        paddingVertical: '12@vs',
        alignItems: 'center',
    },
    tabTextContainer: {
        paddingBottom: '10@vs',
    },
    activeTabItem: {
        borderBottomWidth: 2,
        borderBottomColor: '#FF6813',

    },
    tabText: {
        fontSize: '14@ms',
        color: '#64748B',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FF6813',
        fontWeight: '600',
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
