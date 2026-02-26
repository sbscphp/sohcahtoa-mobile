import { useGetTransactionsQuery } from '@/hooks/queries/transactions/useGetTransactionsQuery';
import { Transaction } from '@/types/api/transactions';
import { useRouter } from 'expo-router';
import { Notification, Refresh } from 'iconsax-react-nativejs';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import SearchEmpty from '../../assets/icons/empty-state.svg';
import Header from '../../components/Header';

const FILTER_TO_GROUP: Record<string, string | undefined> = {
    'All': undefined,
    'Buy FX': 'BUY',
    'Sell FX': 'SELL',
    'Receive FX': 'REMITTANCE',
};

const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
};

const formatTime = (dateStr: string): string => {
    const d = new Date(dateStr);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}${minutes > 0 ? ':' + String(minutes).padStart(2, '0') : ''} ${ampm}`;
};

const formatAmount = (amount: number, currency: string): string => {
    const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'NGN' ? '₦' : currency;
    return `${symbol}${amount.toLocaleString()}`;
};

const getStatusLabel = (status: string): string => {
    const map: Record<string, string> = {
        'DRAFT': 'Draft',
        'AWAITING_VERIFICATION': 'Pending',
        'VERIFICATION_IN_PROGRESS': 'In Progress',
        'VERIFICATION_COMPLETED': 'In Progress',
        'AWAITING_DEPOSIT': 'Pending',
        'DEPOSIT_PENDING': 'Pending',
        'DEPOSIT_CONFIRMED': 'In Progress',
        'COMPLIANCE_REVIEW': 'In Progress',
        'ADMIN_APPROVAL_PENDING': 'Pending',
        'APPROVED': 'Approved',
        'DISBURSEMENT_IN_PROGRESS': 'In Progress',
        'COMPLETED': 'Settled',
        'REJECTED': 'Declined',
        'CANCELLED': 'Declined',
    };
    return map[status] || status;
};

const getTransactionRoute = (type: string): string => {
    const routes: Record<string, string> = {
        'PTA': '/(buy-fx)/(pta)/view-pta',
        'BTA': '/(buy-fx)/(bta)/view-bta',
        'MEDICAL': '/(buy-fx)/(medical)/view-medical',
        'SCHOOL_FEES': '/(buy-fx)/(school)/view-school',
        'PROFESSIONAL_BODY': '/(buy-fx)/(professional)/view-professional',
        'TOURING': '/(buy-fx)/(touring)/view-touring',
        'EXPATRIATE_FX': '/(sell-fx)/(expatriate)/view-expatriate',
        'RESIDENT_FX': '/(sell-fx)/(resident)/view-resident',
        'TOURIST_FX': '/(sell-fx)/(tourist)/view-tourist',
        'IMTO_REMITTANCE': '/(receive-fx)/view-receive-fx',
        'CASH_REMITTANCE': '/(receive-fx)/view-receive-fx',
    };
    return routes[type] || '/(buy-fx)/(pta)/view-pta';
};

export default function TransactionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Buy FX', 'Sell FX', 'Receive FX'];

    const group = FILTER_TO_GROUP[activeFilter];
    const { data: transactionsData, isLoading } = useGetTransactionsQuery(
        group ? { group } : undefined
    );



    const transactions: Transaction[] = transactionsData?.data || [];
    const totalCount = transactions.length;

    // console.log('transactions', transactions);

    const statusCounts = useMemo(() => {
        const completed = transactions.filter(t => ['COMPLETED', 'APPROVED'].includes(t.status)).length;
        const declined = transactions.filter(t => ['REJECTED', 'CANCELLED'].includes(t.status)).length;
        const pending = transactions.filter(t => ['DRAFT', 'AWAITING_VERIFICATION', 'VERIFICATION_IN_PROGRESS', 'VERIFICATION_COMPLETED', 'AWAITING_DEPOSIT', 'DEPOSIT_PENDING', 'DEPOSIT_CONFIRMED', 'COMPLIANCE_REVIEW', 'ADMIN_APPROVAL_PENDING', 'DISBURSEMENT_IN_PROGRESS'].includes(t.status)).length;
        return { completed, declined, pending };
    }, [transactions]);

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <SearchEmpty width={moderateScale(150)} height={moderateScale(120)} />
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
                rightIcon={
                    <View>
                        <Notification size={moderateScale(24)} color="rgba(143, 139, 139, 1)" variant="Linear" />
                        <View style={styles.notificationDot} />
                    </View>
                }
                onRightPress={() => router.push('/notifications')}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Total Transactions</Text>
                    <Text style={styles.totalCount}>{totalCount}</Text>
                </View>


                <View style={styles.statusCardsContainer}>
                    <View style={[styles.statusCard, styles.cardCompleted]}>
                        <Text style={styles.cardLabel}>Completed</Text>
                        <Text style={[styles.cardCount, styles.textCompleted]}>{statusCounts.completed}</Text>
                    </View>
                    <View style={[styles.statusCard, styles.cardDeclined]}>
                        <Text style={styles.cardLabel}>Declined</Text>
                        <Text style={[styles.cardCount, styles.textDeclined]}>{statusCounts.declined}</Text>
                    </View>
                    <View style={[styles.statusCard, styles.cardPending]}>
                        <Text style={styles.cardLabel}>Pending</Text>
                        <Text style={[styles.cardCount, styles.textPending]}>{statusCounts.pending}</Text>
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

                {isLoading ? (
                    <View style={{ paddingVertical: moderateScale(40), alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#FF6B2C" />
                    </View>
                ) : transactions.length > 0 ? (
                    <View style={styles.transactionListContainer}>
                        {transactions.map((item) => {
                            const statusLabel = getStatusLabel(item.status);
                            return (
                                <TouchableOpacity key={item.id} style={styles.transactionItem} onPress={() => router.push({ pathname: getTransactionRoute(item.type) as any, params: { transactionId: item.id } })}>
                                    <View style={styles.iconContainer}>
                                        <Refresh size={moderateScale(18)} color="#94A3B8" />
                                    </View>
                                    <View style={styles.itemContent}>
                                        <Text style={styles.itemTitle} numberOfLines={1}>{item.purpose || item.type}</Text>
                                        <Text style={styles.itemDate}>{formatDate(item.createdAt)} • {formatTime(item.createdAt)}</Text>
                                    </View>
                                    <View style={styles.itemRight}>
                                        <Text style={styles.itemAmount}>{formatAmount(item.foreignAmount, item.currency)}</Text>
                                        <View style={[
                                            styles.statusBadge,
                                            statusLabel === 'Pending' && styles.badgePending,
                                            statusLabel === 'More Info' && styles.badgeMoreInfo,
                                            statusLabel === 'Declined' && styles.badgeDeclined,
                                            statusLabel === 'Approved' && styles.badgeApproved,
                                            statusLabel === 'Settled' && styles.badgeSettled,
                                        ]}>
                                            <Text style={[
                                                styles.statusText,
                                                statusLabel === 'Pending' && styles.textStatusPending,
                                                statusLabel === 'More Info' && styles.textStatusMoreInfo,
                                                statusLabel === 'Declined' && styles.textStatusDeclined,
                                                statusLabel === 'Approved' && styles.textStatusApproved,
                                                statusLabel === 'Settled' && styles.textStatusSettled,
                                            ]}>
                                                {statusLabel}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
        backgroundColor: 'rgba(247, 247, 247, 1)',
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
    notificationDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '8@ms',
        height: '8@ms',
        borderRadius: '4@ms',
        backgroundColor: '#FF6B2C',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
});
