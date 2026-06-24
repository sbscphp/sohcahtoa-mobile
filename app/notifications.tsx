import Header from '@/components/Header';
import { Notification } from '@/types/api/notifications';
import { ArrowRight2, Calendar1, Clock } from 'iconsax-react-nativejs';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { SectionList, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { useGetNotificationsQuery } from '@/hooks/queries/notifications/useGetNotificationsQuery';
import { useMarkAsReadMutation } from '@/hooks/queries/notifications/useMarkAsReadMutation';
import { useMarkAllAsReadMutation } from '@/hooks/queries/notifications/useMarkAllAsReadMutation';
import { useGetTransactionsQuery } from '@/hooks/queries/transactions/useGetTransactionsQuery';
import { ActivityIndicator } from 'react-native';
import { formatDate, formatTime, getNotificationRoute } from '@/utils/helpers';
import { getTransactionById } from '@/services/transactions';

type FilterTab = 'all' | 'unread' | 'transactions';
 
const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();
};

const getDateLabel = (dateStr: string): string => {
    try {
        const date = new Date(dateStr);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return formatDate(dateStr);
    } catch (e) {
        return dateStr;
    }
};

interface Section {
    title: string;
    data: Notification[];
}

const groupByDate = (notifications: Notification[]): Section[] => {
    const groups: Record<string, Notification[]> = {};
    if (Array.isArray(notifications)) {
        notifications.forEach((n) => {
            const label = getDateLabel(n.createdAt);
            if (!groups[label]) groups[label] = [];
            groups[label].push(n);
        });
    }
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
};

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

    const { data: notificationsData, isLoading } = useGetNotificationsQuery();
    const { mutate: markRead } = useMarkAsReadMutation();
    const { mutate: markAllRead } = useMarkAllAsReadMutation();
    const { data: transactionsData } = useGetTransactionsQuery();

    const transactions = useMemo(() => {
        return transactionsData?.pages?.flatMap(p => p.data) || [];
    }, [transactionsData]);

    console.log(JSON.stringify(notificationsData, null, 2));

    const notifications = useMemo(() => {
        if (!notificationsData) return [];
        if (notificationsData.data && Array.isArray(notificationsData.data.notifications)) {
            return notificationsData.data.notifications;
        }
        if (Array.isArray(notificationsData.data)) return notificationsData.data;
        if (Array.isArray(notificationsData)) return notificationsData;
        return [];
    }, [notificationsData]);

    const filtered = useMemo(() => {
        if (!Array.isArray(notifications)) return [];
        switch (activeFilter) {
            case 'unread':
                return notifications.filter((n) => !n.isRead);
            case 'transactions':
                return notifications.filter((n) => n.actionUrl?.includes('/transactions') || n.type === 'transaction');
            default:
                return notifications;
        }
    }, [activeFilter, notifications]);

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const sections = useMemo(() => groupByDate(filtered), [filtered]);

    const tabs: { key: FilterTab; label: string }[] = [
        { key: 'all', label: `All ${notifications.length}` },
        { key: 'unread', label: `Unread ${unreadCount}` }
    ];

    const renderSectionHeader = ({ section }: { section: Section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
    );

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7}
            onPress={async () => {
                if (!item.isRead) {
                    markRead(item.id);
                }
                
                let routeInfo = getNotificationRoute(item.actionUrl, item.data, transactions, item.title, item.body);
                
                // Fallback: If routeInfo is null but we have a transactionId, fetch from server
                if (!routeInfo) {
                    let transactionId = item.data?.transactionId || item.data?.transaction_id || item.data?.id;
                    if (item.actionUrl) {
                        const idMatch = item.actionUrl.match(/[?&](transactionId|transaction_id|id)=([^&]+)/);
                        if (idMatch && idMatch[2]) {
                            transactionId = decodeURIComponent(idMatch[2]);
                        }
                        if (!transactionId) {
                            const pathPart = item.actionUrl.split('?')[0];
                            const segments = pathPart.split('/').filter(Boolean);
                            for (let i = segments.length - 1; i >= 0; i--) {
                                const seg = segments[i];
                                if (seg && (seg.length > 5 || /^\d+$/.test(seg))) {
                                    transactionId = seg;
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (transactionId) {
                        try {
                            const res = await getTransactionById(transactionId);
                            if (res && res.success && res.data && res.data.type) {
                                routeInfo = getNotificationRoute(item.actionUrl, { ...item.data, type: res.data.type, transactionId }, transactions, item.title, item.body);
                            }
                        } catch (e) {
                            console.error('Failed to fetch transaction type:', e);
                        }
                    }
                }

                if (routeInfo) {
                    router.push({
                        pathname: routeInfo.pathname as any,
                        params: routeInfo.params
                    });
                } else if (item.actionUrl) {
                    try {
                        const cleanUrl = item.actionUrl.startsWith('/') ? item.actionUrl : '/' + item.actionUrl;
                        router.push(cleanUrl as any);
                    } catch (e) {
                        console.error('Failed to route actionUrl:', item.actionUrl, e);
                    }
                }
            }}
        >
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMessage}>{item.body}</Text>
                <View style={styles.cardMeta}>
                    <Calendar1 size={moderateScale(14)} color="#94A3B8" />
                    <Text style={styles.cardMetaText}>{formatDate(item.createdAt)}</Text>
                    <Clock size={moderateScale(14)} color="#94A3B8" />
                    <Text style={styles.cardMetaText}>{formatTime(item.createdAt)}</Text>
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

    const MarkAllReadIcon = (
        <Text style={{ fontSize: moderateScale(12), color: '#FF6B2C', fontWeight: '600' }}>
            Mark All
        </Text>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header 
                title="Notifications" 
                rightIcon={unreadCount > 0 ? MarkAllReadIcon : undefined}
                onRightPress={() => markAllRead()}
            />

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
            {isLoading ? (
                <View style={styles.emptyState}>
                    <ActivityIndicator color="#FF6B2C" />
                </View>
            ) : (
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
            )}
        </View>
    );
}


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
