import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
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

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title={title} onBackPress={onBack} />

            <View style={styles.tabBar}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tabItem, activeTab === tab.key && styles.activeTabItem]}
                        onPress={() => onTabChange(tab.key)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>

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
        paddingHorizontal: '16@s',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    tabItem: {
        marginRight: '30@s',
        paddingVertical: '12@vs',
    },
    activeTabItem: {
        borderBottomWidth: 2,
        borderBottomColor: '#FF6813',
    },
    tabText: {
        fontSize: '13@ms',
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
        paddingBottom: '100@vs',
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
