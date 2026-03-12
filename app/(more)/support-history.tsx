import Header from '@/components/Header';
import { useGetSupportTicketsQuery } from '@/hooks/queries/support/useGetSupportTicketsQuery';
import { SupportTicketListItem } from '@/types/api/support';
import { useRouter } from 'expo-router';
import { Refresh } from 'iconsax-react-nativejs';
import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

const StatusBadge = ({ status }: { status: string }) => {
    const isApproved = status.toLowerCase() === 'approved' || status.toLowerCase() === 'resolved';
    return (
        <View style={[styles.badge, isApproved ? styles.approvedBadge : styles.otherBadge]}>
            <Text style={[styles.badgeText, isApproved ? styles.approvedText : styles.otherText]}>
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
            </Text>
        </View>
    );
};

const SupportHistoryItem = ({ item, onPress }: { item: SupportTicketListItem; onPress: () => void }) => {
    const date = new Date(item.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            <View style={styles.iconWrapper}>
                <Refresh size={moderateScale(20)} color="#94A3B8" />
            </View>
            <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                    <Text style={styles.category} numberOfLines={1}>{item.category}</Text>
                    <StatusBadge status={item.status} />
                </View>
                <Text style={styles.dateText}>{`${formattedDate} • ${formattedTime}`}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default function SupportHistoryScreen() {
    const router = useRouter();
    const { data, isLoading, refetch } = useGetSupportTicketsQuery();

    const tickets = data?.data || [];

    // console.log(tickets);

    return (
        <View style={styles.container}>
            <Header title="Support" />
            <View style={styles.content}>
                <Text style={styles.title}>View and track the status of your past support request</Text>

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
                                <Text style={styles.emptyText}>No support requests found</Text>
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
