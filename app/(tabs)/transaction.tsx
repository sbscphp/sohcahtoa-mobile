import { useRouter } from 'expo-router';
import { Notification, Refresh, SearchNormal1 } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import Header from '../../components/Header';
import SearchEmpty from '../../assets/icons/empty-state.svg'

export default function TransactionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Buy FX', 'Sell FX', 'Receive FX'];

    // Dummy Data
    const transactions = [
        {
            id: '1',
            title: 'FX purchase request subm....',
            date: 'Dec 8 2025',
            time: '11 am',
            amount: '$200',
            status: 'Pending',
            type: 'buy',
        },
        {
            id: '2',
            title: 'Foreign currency sale initia....',
            date: 'Dec 8 2025',
            time: '11 am',
            amount: '$1,000',
            status: 'More Info',
            type: 'sell',
        },
        {
            id: '3',
            title: 'FX purchase request subm....',
            date: 'Dec 8 2025',
            time: '11 am',
            amount: '$500',
            status: 'Declined',
            type: 'buy',
        },
        {
            id: '4',
            title: 'Foreign currency purchase....',
            date: 'Dec 8 2025',
            time: '11 am',
            amount: '$1,500',
            status: 'Approved',
            type: 'buy',
        },
        {
            id: '5',
            title: 'Foreign currency sale initia....',
            date: 'Dec 8 2025',
            time: '11 am',
            amount: '$300',
            status: 'More Info',
            type: 'sell',
        },
        {
            id: '6',
            title: 'Foreign currency purchase....',
            date: 'Dec 8 2025',
            time: '11 am',
            amount: '$3,000',
            status: 'Settled',
            type: 'buy',
        },
        {
            id: '7',
            title: 'Received funds from Abroad',
            date: 'Dec 9 2025',
            time: '2 pm',
            amount: '$500',
            status: 'Settled',
            type: 'receive',
        },
        {
            id: '8',
            title: 'Funds received from John',
            date: 'Dec 10 2025',
            time: '4 pm',
            amount: '$1,200',
            status: 'Pending',
            type: 'receive',
        },
    ];

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <SearchEmpty width={moderateScale(150)} height={moderateScale(120)}/>
            </View>
            <Text style={styles.emptyTitle}>No Transaction Yet</Text>
            <Text style={styles.emptyDesc}>
                No transaction available. Check back later
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header
                title="Transaction"
                rightIcon={<Notification size={moderateScale(28)} color="rgba(143, 139, 139, 1)" variant="Linear" />}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Total Transactions</Text>
                    <Text style={styles.totalCount}>14</Text>
                </View>


                <View style={styles.statusCardsContainer}>
                    <View style={[styles.statusCard, styles.cardCompleted]}>
                        <Text style={styles.cardLabel}>Completed</Text>
                        <Text style={[styles.cardCount, styles.textCompleted]}>10</Text>
                    </View>
                    <View style={[styles.statusCard, styles.cardDeclined]}>
                        <Text style={styles.cardLabel}>Declined</Text>
                        <Text style={[styles.cardCount, styles.textDeclined]}>2</Text>
                    </View>
                    <View style={[styles.statusCard, styles.cardPending]}>
                        <Text style={styles.cardLabel}>Pending</Text>
                        <Text style={[styles.cardCount, styles.textPending]}>2</Text>
                    </View>
                </View>


                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    <TouchableOpacity onPress={() => router.push('/all-transactions')}>
                        <Text style={styles.seeAllButton}>See all</Text>
                    </TouchableOpacity>
                </View>

                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContainer}
                >
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                activeFilter === filter && styles.activeFilterChip
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                activeFilter === filter && styles.activeFilterText
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {(activeFilter === 'All' ? transactions : transactions.filter(t =>
                    activeFilter === 'Buy FX' ? t.type === 'buy' :
                        activeFilter === 'Sell FX' ? t.type === 'sell' :
                            activeFilter === 'Receive FX' ? t.type === 'receive' : true
                )).length > 0 ? (
                    <View style={styles.transactionListContainer}>
                        {(activeFilter === 'All' ? transactions : transactions.filter(t =>
                            activeFilter === 'Buy FX' ? t.type === 'buy' :
                                activeFilter === 'Sell FX' ? t.type === 'sell' :
                                    activeFilter === 'Receive FX' ? t.type === 'receive' : true
                        )).map((item) => (
                            <TouchableOpacity key={item.id} style={styles.transactionItem}>
                                <View style={styles.iconContainer}>
                                    <Refresh size={moderateScale(18)} color="#94A3B8" />
                                </View>
                                <View style={styles.itemContent}>
                                    <Text style={styles.itemTitle}>{item.title}</Text>
                                    <Text style={styles.itemDate}>{item.date} • {item.time}</Text>
                                </View>
                                <View style={styles.itemRight}>
                                    <Text style={styles.itemAmount}>{item.amount}</Text>
                                    <View style={[
                                        styles.statusBadge,
                                        item.status === 'Pending' && styles.badgePending,
                                        item.status === 'More Info' && styles.badgeMoreInfo,
                                        item.status === 'Declined' && styles.badgeDeclined,
                                        item.status === 'Approved' && styles.badgeApproved,
                                        item.status === 'Settled' && styles.badgeSettled,
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            item.status === 'Pending' && styles.textStatusPending,
                                            item.status === 'More Info' && styles.textStatusMoreInfo,
                                            item.status === 'Declined' && styles.textStatusDeclined,
                                            item.status === 'Approved' && styles.textStatusApproved,
                                            item.status === 'Settled' && styles.textStatusSettled,
                                        ]}>
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    {renderEmpty()}
                  </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingBottom: '20@vs',
    },
    totalSection: {
        paddingHorizontal: '13@s',
        marginTop: '16@vs',
    },
    totalLabel: {
        fontSize: '16@ms',
        color: '#64748B',
        marginBottom: '4@vs',
    },
    totalCount: {
        fontSize: '28@ms',
        fontWeight: '700',
        color: '#0F172A',
    },
    statusCardsContainer: {
        flexDirection: 'row',
        paddingHorizontal: '13@s',
        marginTop: '16@vs',
        gap: '8@s',
    },
    statusCard: {
        flex: 1,
        padding: '12@ms',
        borderRadius: '12@ms',
        borderWidth: 1,
        borderColor: '#dededeff',
        height: '80@vs',
        justifyContent: 'center',
    },
    cardCompleted: {
        // backgroundColor: '#F0FDF4', 
    },
    cardDeclined: {
        // backgroundColor: '#FEF2F2',
    },
    cardPending: {
        // backgroundColor: '#FFFBEB',
    },
    cardLabel: {
        fontSize: '15@ms',
        color: '#64748B',
        marginBottom: '8@vs',
    },
    cardCount: {
        fontSize: '20@ms',
        fontWeight: '600',
    },
    textCompleted: {
        color: '#16A34A',
    },
    textDeclined: {
        color: '#EF4444',
    },
    textPending: {
        color: '#F59E0B',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '13@s',
        marginTop: '24@vs',
        marginBottom: '16@vs',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#334155',
    },
    seeAllButton: {
        fontSize: '13@ms',
        fontWeight: '500',
        color: '#0F172A',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: '13@s',
        paddingVertical: '6@vs',
        borderRadius: '16@ms',
        overflow: 'hidden',
    },
    filterContainer: {
        paddingHorizontal: '13@s',
        paddingBottom: '8@vs',
        gap: '8@s',
        marginBottom: '12@vs',
    },
    filterChip: {
        paddingHorizontal: '14@s',
        paddingVertical: '6@vs',
        borderRadius: '20@ms',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    activeFilterChip: {
        backgroundColor: 'rgba(248, 220, 205, 1)',
        borderColor: '#d8d8d8ff',
    },
    filterText: {
        fontSize: '13@ms',
        color: '#64748B',
    },
    activeFilterText: {
        color: 'rgba(255, 104, 19, 1)',
        fontWeight: '500',
    },
    transactionListContainer: {
        backgroundColor: 'rgba(241, 241, 241, 1)',
        borderRadius: '12@ms',
        marginHorizontal: '13@s',
        paddingVertical: '8@vs',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '8@s',
        paddingVertical: '12@vs',
    },
    iconContainer: {
        width: '30@ms',
        height: '30@ms',
        borderRadius: '20@ms',
        backgroundColor: '#ffffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '12@s',
    },
    itemContent: {
        flex: 1,
        marginRight: '8@s',
    },
    itemTitle: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#334155',
        marginBottom: '4@vs',
    },
    itemDate: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    itemRight: {
        alignItems: 'flex-end',
    },
    itemAmount: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '4@vs',
    },
    statusBadge: {
        paddingHorizontal: '8@s',
        paddingVertical: '2@vs',
        borderRadius: '12@ms',
    },
    badgePending: {
        backgroundColor: '#FFFAEB',
    },
    badgeMoreInfo: {
        backgroundColor: '#F3E8FF',
    },
    badgeDeclined: {
        backgroundColor: '#FEF2F2',
    },
    badgeApproved: {
        backgroundColor: '#F0FDF4',
    },
    badgeSettled: {
        backgroundColor: '#ECFCCB',
    },
    statusText: {
        fontSize: '11@ms',
        fontWeight: '500',
    },
    textStatusPending: {
        color: '#B54708',
    },
    textStatusMoreInfo: {
        color: '#7C3AED',
    },
    textStatusDeclined: {
        color: '#DC2626',
    },
    textStatusApproved: {
        color: '#16A34A',
    },
    textStatusSettled: {
        color: '#4D7C0F',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '20@vs',
    },
    emptyIconContainer: {
        width: '100@ms',
        height: '100@ms',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '16@vs',
    },
    emptyTitle: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '8@vs',
    },
    emptyDesc: {
        fontSize: '16@ms',
        color: '#64748B',
        textAlign: 'center',
        maxWidth: '250@s',
    },
});
