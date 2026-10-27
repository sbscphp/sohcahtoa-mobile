import Header from '@/components/Header';
import { useAppTheme } from '@/context/ThemeContext';
import { useGetSupportTicketsQuery } from '@/hooks/queries/support/useGetSupportTicketsQuery';
import { SupportTicketListItem } from '@/types/api/support';
import { useRouter } from 'expo-router';
import { Refresh } from 'iconsax-react-nativejs';
import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

const StatusBadge = ({ status, isDark }: { status: string; isDark: boolean }) => {
    const isApproved = status.toLowerCase() === 'approved' || status.toLowerCase() === 'resolved';
    return (
        <View
            style={[
                styles.badge,
                isApproved ? styles.approvedBadge : styles.otherBadge,
                isDark && {
                    backgroundColor: isApproved ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    borderColor: isApproved ? 'rgba(34, 197, 94, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                    borderWidth: 1,
                },
            ]}
        >
            <Text
                style={[
                    styles.badgeText,
                    isApproved ? styles.approvedText : styles.otherText,
                    isDark && { color: isApproved ? '#4ADE80' : '#FBBF24' },
                ]}
            >
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
            </Text>
        </View>
    );
};

const SupportHistoryItem = ({
    item,
    onPress,
    colors,
    isDark,
}: {
    item: SupportTicketListItem;
    onPress: () => void;
    colors: any;
    isDark: boolean;
}) => {
    const date = new Date(item.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
        <TouchableOpacity
            style={[styles.itemContainer, { borderBottomColor: colors.divider }]}
            onPress={onPress}
        >
            <View style={[styles.iconWrapper, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC' }]}>
                <Refresh size={moderateScale(20)} color={colors.iconMuted} />
            </View>
            <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                    <Text style={[styles.category, { color: colors.text }]} numberOfLines={1}>{item.category}</Text>
                    <StatusBadge status={item.status} isDark={isDark} />
                </View>
                <Text style={[styles.dateText, { color: colors.textMuted }]}>{`${formattedDate} • ${formattedTime}`}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default function SupportHistoryScreen() {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const { data, isLoading, refetch } = useGetSupportTicketsQuery();

    const tickets = data?.data || [];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Support" />
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>View and track the status of your past support request</Text>

                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator color="#F97316" size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={tickets}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <SupportHistoryItem
                                item={item}
                                colors={colors}
                                isDark={isDark}
                                onPress={() => router.push({
                                    pathname: '/(more)/support-details',
                                    params: { id: item.id }
                                })}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        onRefresh={refetch}
                        refreshing={isLoading}
                        ListEmptyComponent={
                            <View style={styles.centerContainer}>
                                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No support requests found</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: '40@vs',
    },
    content: {
        flex: 1,
        paddingHorizontal: '20@ms',
    },
    title: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginTop: '24@vs',
        marginBottom: '14@vs',
        // lineHeight: '26@ms',
    },
    listContent: {
        paddingBottom: '40@vs',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: '16@vs',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    iconWrapper: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '20@ms',
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '12@s',
    },
    itemContent: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4@vs',
    },
    category: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#0F172A',
        flex: 1,
        marginRight: '8@s',
    },
    dateText: {
        fontSize: '13@ms',
        color: '#64748B',
    },
    badge: {
        paddingHorizontal: '8@ms',
        paddingVertical: '3@vs',
        borderRadius: '5@ms',
    },
    approvedBadge: {
        backgroundColor: '#DCFCE7',
    },
    otherBadge: {
        backgroundColor: '#FEF3C7',
    },
    badgeText: {
        fontSize: '12@ms',
        fontWeight: '500',
    },
    approvedText: {
        color: '#15803D',
    },
    otherText: {
        color: '#B45309',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '50@vs',
    },
    emptyText: {
        fontSize: '14@ms',
        color: '#94A3B8',
    },
});
