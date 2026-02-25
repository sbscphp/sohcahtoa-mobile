import Header from '@/components/Header';
import { Notification } from '@/types/api/notifications';
import { ArrowRight2, Calendar1, Clock } from 'iconsax-react-nativejs';
import React, { useMemo, useState } from 'react';
import { SectionList, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

// ── Mock data (replace with API hook later) ──────────────────────────
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'Transaction Initiated',
        message: 'Your PTA transaction has been initiated',
        date: 'Nov 18 2025',
        time: '11:00 am',
        isRead: false,
        type: 'transaction',
    },
    {
        id: '2',
        title: 'Document Uploaded',
        message: 'Your visa document has been uploaded',
        date: 'Nov 18 2025',
        time: '11:00 am',
        isRead: false,
        type: 'transaction',
    },
    {
        id: '3',
        title: 'KYC Approved',
        message: 'Your identity verification is complete',
        date: 'Nov 18 2025',
        time: '11:00 am',
        isRead: false,
        type: 'system',
    },
    {
        id: '4',
        title: 'Transaction Completed',
        message: 'Your BTA transaction has been completed',
        date: 'Nov 17 2025',
        time: '11:00 am',
        isRead: true,
        type: 'transaction',
    },
];

type FilterTab = 'all' | 'unread' | 'transactions';

// ── Helpers ──────────────────────────────────────────────────────────
const getDateLabel = (dateStr: string): string => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // For mock data we simply pattern match; with real dates use date-fns / dayjs
    if (dateStr.includes('18')) return 'Today';
    if (dateStr.includes('17')) return 'Yesterday';
    return dateStr;
};

interface Section {
    title: string;
    data: Notification[];
}

const groupByDate = (notifications: Notification[]): Section[] => {
    const groups: Record<string, Notification[]> = {};
    notifications.forEach((n) => {
        const label = getDateLabel(n.date);
        if (!groups[label]) groups[label] = [];
        groups[label].push(n);
    });
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
};

// ── Component ────────────────────────────────────────────────────────
export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

    const filtered = useMemo(() => {
        switch (activeFilter) {
            case 'unread':
                return MOCK_NOTIFICATIONS.filter((n) => !n.isRead);
            case 'transactions':
                return MOCK_NOTIFICATIONS.filter((n) => n.type === 'transaction');
            default:
                return MOCK_NOTIFICATIONS;
        }
    }, [activeFilter]);

    const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
    const sections = useMemo(() => groupByDate(filtered), [filtered]);

    const tabs: { key: FilterTab; label: string }[] = [
        { key: 'all', label: `All ${MOCK_NOTIFICATIONS.length}` },
        { key: 'unread', label: `Unread ${unreadCount}` },
        { key: 'transactions', label: 'Transactions' },
    ];

    // ── Renderers ────────────────────────────────────────────────────
    const renderSectionHeader = ({ section }: { section: Section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
    );

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMessage}>{item.message}</Text>
                <View style={styles.cardMeta}>
                    <Calendar1 size={moderateScale(14)} color="#94A3B8" />
                    <Text style={styles.cardMetaText}>{item.date}</Text>
                    <Clock size={moderateScale(14)} color="#94A3B8" />
                    <Text style={styles.cardMetaText}>{item.time}</Text>
                </View>
            </View>
            <View style={styles.cardRight}>
                <Text
                    style={[
                        styles.statusBadge,
                        item.isRead ? styles.statusRead : styles.statusUnread,
                    ]}
                >
                    {item.isRead ? 'Read' : 'Unread'}
                </Text>
                <ArrowRight2 size={moderateScale(16)} color="#94A3B8" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="Notifications" />

            {/* Filter Tabs */}
            <View style={styles.tabRow}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeFilter === tab.key && styles.tabActive]}
                        onPress={() => setActiveFilter(tab.key)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeFilter === tab.key && styles.tabTextActive,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Notification List */}
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderSectionHeader={renderSectionHeader}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No notifications</Text>
                    </View>
                }
            />
        </View>
    );
}

// ── Styles ───────────────────────────────────────────────────────────
const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    tabRow: {
        flexDirection: 'row',
        paddingHorizontal: '16@s',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        gap: '20@s',
    },
    tab: {
        paddingVertical: '12@vs',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#FF6B2C',
    },
    tabText: {
        fontSize: '13@ms',
        fontWeight: '500',
        color: '#64748B',
    },
    tabTextActive: {
        color: '#FF6B2C',
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: '16@s',
        paddingBottom: '40@vs',
    },
    sectionHeader: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginTop: '20@vs',
        marginBottom: '10@vs',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: '12@ms',
        paddingHorizontal: '16@s',
        paddingVertical: '14@vs',
        marginBottom: '10@vs',
    },
    cardContent: {
        flex: 1,
        gap: '4@vs',
    },
    cardTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    cardMessage: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '6@s',
        marginTop: '4@vs',
    },
    cardMetaText: {
        fontSize: '11@ms',
        color: '#94A3B8',
        marginRight: '6@s',
    },
    cardRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8@s',
    },
    statusBadge: {
        fontSize: '12@ms',
        fontWeight: '500',
        paddingHorizontal: '8@s',
        paddingVertical: '3@vs',
        borderRadius: '10@ms',
        overflow: 'hidden',
    },
    statusUnread: {
        color: '#FF6B2C',
        backgroundColor: '#FFF7ED',
    },
    statusRead: {
        color: '#64748B',
        backgroundColor: '#F1F5F9',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: '60@vs',
    },
    emptyStateText: {
        fontSize: '14@ms',
        color: '#94A3B8',
    },
});
