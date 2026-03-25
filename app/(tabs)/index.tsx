import ActionSelectionSheet from '@/components/ActionSelectionSheet';
import CurrencyDropdown, { CurrencyItem } from '@/components/CurrencyDropdown';
import VirtualCard from '@/components/VirtualCard';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useGetTransactionTotalsMutation } from '@/hooks/queries/transactions/useGetTransactionTotalsMutation';
import { useGetTransactionsQuery } from '@/hooks/queries/transactions/useGetTransactionsQuery';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatCurrency, formatDate, formatTime } from '@/utils/helpers';
import { useRouter } from 'expo-router';
import { Add, ArrowDown2, Bank, Buildings, Eye, EyeSlash, Hospital, ImportCircle, Notification, People, Refresh, Teacher, User, WalletAdd1, WalletMinus } from 'iconsax-react-nativejs';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { useGetUnreadCountQuery } from '@/hooks/queries/notifications/useGetUnreadCountQuery';
import Passport from '../../assets/images/passport.svg';
import StandingUser from '../../assets/images/standing-user.svg';
import { Colors } from '../../constants/theme';

const ACTION_BUTTONS = [
    { title: 'Buy FX', icon: WalletAdd1, type: 'buy' },
    { title: 'Sell FX', icon: WalletMinus, type: 'sell' },
    { title: 'Receive money', icon: ImportCircle, type: 'receive' },
];

const Dot = () => (
    <View style={{
        width: moderateScale(10),
        height: moderateScale(10),
        borderRadius: moderateScale(5),
        backgroundColor: '#0F172A',
        marginHorizontal: moderateScale(2),
    }} />
);

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

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'Pending':
            return { color: 'rgba(181, 71, 8, 1)', backgroundColor: 'rgba(255, 250, 235, 1)' };
        case 'In Progress':
            return { color: '#3538CD', backgroundColor: '#EEF4FF' };
        case 'Declined':
            return { color: '#B42318', backgroundColor: '#FEF3F2' };
        case 'Approved':
        case 'Settled':
            return { color: '#166534', backgroundColor: '#F0FDF4' };
        case 'Draft':
            return { color: '#344054', backgroundColor: '#F2F4F7' };
        default:
            return { color: '#344054', backgroundColor: '#F2F4F7' };
    }
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 🌤️';
    if (hour < 17) return 'Good afternoon ☀️';
    return 'Good evening 🌙';
};

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = useAuthStore((state) => state.user);
    useProfileQuery();
    const [showBalance, setShowBalance] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [transactionFilters, setTransactionFilters] = useState(['All', 'Buy FX', 'Sell FX', 'Received FX']);
    const [selectedTxFilter, setSelectedTxFilter] = useState('All');
    const [actionSheetType, setActionSheetType] = useState<'buy' | 'sell' | 'receive' | null>(null);
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState<CurrencyItem>({ id: '4', code: 'USD', flag: '🇺🇸' });

    const { mutate: getTotals, data: totalsData, isPending: isLoadingTotals } = useGetTransactionTotalsMutation();
    const { data: unreadData } = useGetUnreadCountQuery();
    const unreadCount = unreadData?.data?.count || 0;

    useEffect(() => {
        getTotals({});
    }, []);

    const handleActionPress = (action: string) => {
        if (action === 'vacation') {
            setActionSheetType(null);
            router.push('/(buy-fx)/(pta)/create-pta');
        } else if (action === 'business') {
            setActionSheetType(null);
            router.push('/(buy-fx)/(bta)/create-bta');
        } else if (action === 'school') {
            setActionSheetType(null);
            router.push('/(buy-fx)/(school)/create-school');
        } else if (action === 'medical') {
            setActionSheetType(null);
            router.push('/(buy-fx)/(medical)/create-medical');
        } else if (action === 'professional') {
            setActionSheetType(null);
            router.push('/(buy-fx)/(professional)/create-professional');
        } else if (action === 'touring') {
            setActionSheetType(null);
            router.push('/(buy-fx)/(touring)/create-touring');
        } else if (action === 'touring_inbound') {
            setActionSheetType(null);
            router.push('/(sell-fx)/(tourist)/create-tourist');
        } else if (action === 'resident') {
            setActionSheetType(null);
            router.push('/(sell-fx)/(resident)/create-resident');
        } else if (action === 'expatriate') {
            setActionSheetType(null);
            router.push('/(sell-fx)/(expatriate)/create-expatriate');
        } else {
            setActionSheetType(null);
        }
    };

    const handleTopFilterChange = (filter: string) => {
        setSelectedFilter(filter);
        if (filter === 'FX bought') {
            setTransactionFilters(['All', 'PTA', 'BTA', 'Medical']);
            setSelectedTxFilter('All');
        } else if (filter === 'FX sold') {
            setTransactionFilters(['All', 'Resident', 'Tourist', 'Expatriate']);
            setSelectedTxFilter('All');
        } else if (filter === 'Received FX') {
            setTransactionFilters(['All', 'IMTO']);
            setSelectedTxFilter('All');
        } else {
            setTransactionFilters(['All', 'Buy FX', 'Sell FX', 'Received FX']);
            setSelectedTxFilter('All');
        }
    };

    const getSheetConfig = () => {
        switch (actionSheetType) {
            case 'buy':
                return {
                    title: 'Buy FX',
                    headerIcon: <WalletMinus size={moderateScale(24)} color="#FF6B2C" />,
                    actions: [
                        { id: '1', title: 'I am going on a Vacation (PTA)', subtitle: 'Buy FX to cover your travel and accommodation', icon: <User size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('vacation') },
                        { id: '2', title: 'I am travelling for business (BTA)', subtitle: 'Buy FX to cover your business trip abroad', icon: <Bank size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('business') },
                        { id: '3', title: 'Pay School Fees', subtitle: 'Pay tuition for undergraduate & postgraduate studies.', icon: <Teacher size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('school') },
                        { id: '4', title: 'Seek Medical Treatment', subtitle: 'Pay for medical treatment or hospital bills abroad', icon: <Hospital size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('medical') },
                        { id: '5', title: 'Pay a Professional Body', subtitle: 'E.g International membership fee', icon: <People size={moderateScale(24)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('professional') },
                        { id: '6', title: 'I am Touring Nigeria', subtitle: 'Buy FX to cover your travel, accommodation', icon: <Passport width={moderateScale(20)} height={moderateScale(20)} color="#FF6B2C" />, onPress: () => handleActionPress('touring') },
                    ]
                };
            case 'sell':
                return {
                    title: 'Sell FX',
                    headerIcon: <WalletAdd1 size={moderateScale(24)} color="#FF6B2C" />,
                    actions: [
                        { id: '1', title: 'Resident', subtitle: 'I have FX and want Naira', icon: <StandingUser width={moderateScale(20)} height={moderateScale(20)} color="#FF6B2C" />, onPress: () => handleActionPress('resident') },
                        { id: '2', title: 'I am Touring Nigeria', subtitle: 'I am touring Nigeria and want Naira', icon: <Passport width={moderateScale(20)} height={moderateScale(20)} color="#FF6B2C" />, onPress: () => handleActionPress('touring_inbound') },
                        { id: '3', title: 'Expatriate; I am a foreigner who works in Nigeria', subtitle: 'I am a foreigner living or working in Nigeria', icon: <Buildings size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('expatriate') },
                    ]
                };
            case 'receive':
                return {
                    title: 'Receive FX',
                    headerIcon: <WalletAdd1 size={moderateScale(24)} color="#FF6B2C" />,
                    actions: [
                        { id: '1', title: 'Receive Money from Abroad', subtitle: 'Receive international transfer and fund money from relatives, business and associates', icon: <StandingUser width={moderateScale(20)} height={moderateScale(20)} color="#FF6B2C" />, onPress: () => { setActionSheetType(null); router.push('/(receive-fx)/imto'); } },
                    ]
                };
            default:
                return null;
        }
    };

    const activeConfig = getSheetConfig();

    const getBalanceData = () => {
        const totals = totalsData?.data;
        if (!totals) {
            return { label: 'Total FX units', amount: '0' };
        }

        switch (selectedFilter) {
            case 'FX bought':
                return { label: 'Total FX Bought', amount: totals.buy.totalAmount.toLocaleString() };
            case 'FX sold':
                return { label: 'Total FX Sold', amount: totals.sell.totalAmount.toLocaleString() };
            case 'Received FX':
                return { label: 'Total FX Received', amount: totals.remittance.totalAmount.toLocaleString() };
            default:
                return { label: 'Total FX units', amount: totals.all.totalAmount.toLocaleString() };
        }
    };

    const balanceData = getBalanceData();

    const queryParams = useMemo(() => {
        const params: any = { limit: 5 };
        if (selectedFilter === 'All' && selectedTxFilter === 'All') {
            return params;
        }


        if (selectedFilter === 'FX bought') params.group = 'BUY';
        else if (selectedFilter === 'FX sold') params.group = 'SELL';
        else if (selectedFilter === 'Received FX') params.group = 'REMITTANCE';


        const typeMap: Record<string, string> = {
            'PTA': 'PTA',
            'BTA': 'BTA',
            'Medical': 'MEDICAL',
            'Resident': 'RESIDENT_FX',
            'Tourist': 'TOURIST_FX',
            'Expatriate': 'EXPATRIATE_FX',
            'IMTO': 'IMTO_REMITTANCE',
            'Buy FX': 'BUY',
            'Sell FX': 'SELL',
            'Received FX': 'REMITTANCE'
        };

        if (selectedTxFilter !== 'All') {
            const mappedValue = typeMap[selectedTxFilter];
            if (mappedValue) {
                if (['BUY', 'SELL', 'REMITTANCE'].includes(mappedValue)) {
                    if (!params.group) params.group = mappedValue;
                } else {
                    params.type = mappedValue;
                }
            }
        }

        return params;
    }, [selectedFilter, selectedTxFilter]);

    const { data: transactionsData, isLoading: isLoadingTransactions } = useGetTransactionsQuery(queryParams);
    const transactions = transactionsData?.data || [];

    const FILTERS = ['All', 'FX bought', 'FX sold', 'Received FX'];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.profile ? `${user.profile.firstName?.[0] ?? ''}${user.profile.lastName?.[0] ?? ''}`.toUpperCase() : 'U'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <Text style={styles.username}>{user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'User'}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => router.push('/notifications')}>
                        <Notification size={moderateScale(24)} color="#1E293B" variant="Linear" />
                        {unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    {FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                            onPress={() => handleTopFilterChange(filter)}
                        >
                            <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.balanceSection}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

                        <View style={styles.balanceHeader}>
                            <Text style={styles.balanceLabel}>{balanceData.label}</Text>
                            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                                {showBalance ?
                                    <Eye size={moderateScale(18)} color="#1E293B" variant="Bold" /> :
                                    <EyeSlash size={moderateScale(18)} color="#1E293B" variant="Bold" />
                                }
                            </TouchableOpacity>
                        </View>

                        <View style={{ zIndex: 100 }}>
                            <TouchableOpacity
                                style={styles.currencySelector}
                                onPress={() => setCurrencySheetVisible(!currencySheetVisible)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.flagWrapper}>
                                    <Text style={styles.flagText}>{selectedCurrency.flag}</Text>
                                </View>
                                <Text style={styles.currencyCode}>{selectedCurrency.code}</Text>
                                <ArrowDown2 size={moderateScale(14)} color="#FFFFFF" />
                            </TouchableOpacity>

                            {currencySheetVisible && (
                                <CurrencyDropdown
                                    onSelect={(currency: CurrencyItem) => setSelectedCurrency(currency)}
                                    selectedCurrencyCode={selectedCurrency.code}
                                    onClose={() => setCurrencySheetVisible(false)}
                                />
                            )}
                        </View>
                    </View>

                    <View style={styles.balanceRow}>
                        <View style={styles.currencyBadge}>
                            <Text style={styles.currencySymbol}>
                                {selectedCurrency.code === 'NGN' ? '₦' :
                                    selectedCurrency.code === 'GHS' ? '₵' :
                                        selectedCurrency.code === 'KES' ? 'KSh' :
                                            selectedCurrency.code === 'USD' ? '$' :
                                                selectedCurrency.code === 'GBP' ? '£' :
                                                    selectedCurrency.code === 'SEK' ? 'kr' : '$'}
                            </Text>
                        </View>
                        {showBalance ? (
                            isLoadingTotals ? (
                                <ActivityIndicator size="small" color="#1E293B" style={{ marginLeft: moderateScale(10) }} />
                            ) : (
                                <Text style={styles.balanceAmount}>
                                    {balanceData.amount}
                                    <Text style={styles.balanceDecimal}>.00</Text>
                                </Text>
                            )
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', height: moderateScale(38) }}>
                                <Dot /><Dot /><Dot />
                            </View>
                        )}
                    </View>
                </View>


                <View style={styles.actionsGrid}>
                    {ACTION_BUTTONS.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.actionButton}
                            onPress={() => setActionSheetType(action.type as any)}
                        >
                            <View style={styles.actionIcon}>
                                <action.icon size={moderateScale(24)} color="#1E293B" />
                            </View>
                            <Text style={styles.actionText}>{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.divider} />

                <View style={styles.cardsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Cards</Text>
                        <Text style={styles.seeAllBtn}>Manage Cards</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>

                        <View style={styles.card}>
                            <VirtualCard
                                name={user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'User'}
                                last4Digits="7093"
                                expiry="08/27"
                            />
                        </View>
                        
                        <TouchableOpacity style={styles.addCardButton}>
                            <Add size={moderateScale(26)} color="#1E293B" />
                        </TouchableOpacity>
                        
                    </ScrollView>
                </View>


                <View style={styles.transactionsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <TouchableOpacity style={styles.seeAllBtn} onPress={() => router.push('/all-transactions')}>
                            <Text style={styles.seeAllText}>See all</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.transactionFilters}>
                        {transactionFilters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[styles.filterChip, selectedTxFilter === filter && styles.filterChipActive]}
                                onPress={() => setSelectedTxFilter(filter)}
                            >
                                <Text style={[styles.filterText, selectedTxFilter === filter && styles.filterTextActive]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}

                    </View>
                    {isLoadingTransactions && (
                        <View style={{ padding: moderateScale(20) }}>
                            <ActivityIndicator color="#FF6B2C" />
                        </View>
                    )}
                    <View style={styles.transactionList}>
                        {transactions.length > 0 ? (
                            transactions.map((tx: any) => {
                                const statusLabel = getStatusLabel(tx.status);
                                const statusStyle = getStatusStyle(statusLabel);
                                return (
                                    <View key={tx.id} style={styles.transactionItem}>
                                        <View style={[styles.transactionIcon, { backgroundColor: '#F8FAFC' }]}>
                                            <Refresh size={moderateScale(16)} color="#64748B" />
                                        </View>
                                        <View style={styles.transactionInfo}>
                                            <Text style={styles.transactionTitle} numberOfLines={1}>{tx.purpose || tx.type}</Text>
                                            <Text style={styles.transactionDate}>{formatDate(tx.createdAt)} • {formatTime(tx.createdAt)}</Text>
                                        </View>
                                        <View style={styles.transactionAmountContainer}>
                                            <Text style={styles.transactionAmount}>{formatCurrency(tx.foreignAmount, tx.currency === 'USD' ? '$' : tx.currency === 'NGN' ? '₦' : tx.currency)}</Text>
                                            <View style={[styles.transactionStatus, { backgroundColor: statusStyle.backgroundColor }]}>
                                                <Text style={[styles.transactionStatusText, { color: statusStyle.color }]}>
                                                    {statusLabel}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
                        ) : !isLoadingTransactions && (
                            <View style={{ padding: moderateScale(30), alignItems: 'center' }}>
                                <Text style={{ color: '#64748B', fontSize: moderateScale(14) }}>No transactions found</Text>
                            </View>
                        )}
                    </View>
                </View>
 
            </ScrollView>

            {activeConfig && (
                <ActionSelectionSheet
                    visible={!!actionSheetType}
                    onClose={() => setActionSheetType(null)}
                    title={activeConfig.title}
                    headerIcon={activeConfig.headerIcon}
                    actions={activeConfig.actions}
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
    scrollContent: {
        paddingBottom: '100@vs',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '14@s',
        marginVertical: '12@vs',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12@s',
    },
    avatar: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '20@ms',
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#FF6B2C',
    },
    greeting: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    username: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    notificationBtn: {
        padding: '4@ms',
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
    filterContainer: {
        paddingHorizontal: '10@s',
        marginBottom: '24@vs',
    },
    filterChip: {
        paddingHorizontal: '10@s',
        paddingVertical: '6@vs',
        borderRadius: '20@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: '8@s',
    },
    transactionList: {
        backgroundColor: 'rgba(245, 245, 245, 1)',
        borderRadius: '12@ms',
        marginHorizontal: '10@s',
    },
    filterChipActive: {
        backgroundColor: '#FFF7ED',
        borderColor: '#FFEDD5',
    },
    emptyStateText: {
        fontSize: '14@ms',
        color: '#94A3B8',
    },
    unreadBadge: {
        position: 'absolute',
        top: -moderateScale(4),
        right: -moderateScale(4),
        backgroundColor: '#EF4444',
        minWidth: moderateScale(16),
        height: moderateScale(16),
        borderRadius: moderateScale(8),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
        paddingHorizontal: moderateScale(2),
    },
    unreadText: {
        color: '#FFFFFF',
        fontSize: moderateScale(9),
        fontWeight: 'bold',
    },
    filterText: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    filterTextActive: {
        color: Colors.light.primary,
        fontWeight: '500',
    },
    balanceSection: {
        paddingHorizontal: '10@s',
        marginBottom: '24@vs',
    },
    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8@s',
        marginBottom: '8@vs',
    },
    balanceLabel: {
        fontSize: '13@ms',
        color: '#64748B',
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '4@s',
    },
    currencyBadge: {
        width: '28@ms',
        height: '28@ms',
        borderRadius: '14@ms',
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#000000',
    },
    currencySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(35, 35, 35, 1)',
        paddingHorizontal: '12@s',
        paddingVertical: '8@vs',
        borderRadius: '24@ms',
        gap: '6@s',
    },
    flagWrapper: {
        width: '24@ms',
        height: '24@ms',
        borderRadius: '12@ms',
        // backgroundColor: '#000000ff',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    flagText: {
        fontSize: '16@ms',
        lineHeight: '16@ms',
    },
    currencyCode: {
        color: '#FFFFFF',
        fontSize: '14@ms',
        fontWeight: '600',
    },
    balanceAmount: {
        fontSize: '32@ms',
        fontWeight: '700',
        color: '#0F172A',
    },
    balanceDecimal: {
        fontSize: '18@ms',
        fontWeight: '600',
        color: '#64748B',
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        // padding: '4@s',
        gap: '16@s',
        // marginBottom: '1@vs',
        marginHorizontal: '10@s',
    },
    divider: {
        width: '100%',
        height: '1@ms',
        backgroundColor: '#E2E8F0',
        marginVertical: '20@s',
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '20@ms',
        padding: '8@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    actionIcon: {
        marginBottom: '10@vs',
    },
    actionText: {
        fontSize: '12@ms',
        fontWeight: '500',
        color: '#0F172A',
        textAlign: 'center',
    },
    cardsSection: {
        marginBottom: '20@vs',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '10@s',
        marginBottom: '10@vs',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '400',
        color: '#0F172A',
    },
    cardsScroll: {
        paddingHorizontal: '10@s',
        gap: '12@s',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: '275@s',
        height: '145@vs',
        borderRadius: '20@ms',
        overflow: 'hidden',
    },
    cardBg: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    cardContent: {
        flex: 1,
        padding: '20@ms',
        justifyContent: 'space-between',
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    chip: {
        width: '32@ms',
        height: '24@ms',
        backgroundColor: '#FCD34D', // Goldish
        borderRadius: '4@ms',
    },
    cardType: {
        color: '#FFFFFF',
        fontSize: '12@ms',
        position: 'absolute',
        left: '42@ms',
    },
    visaText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: '20@ms',
        fontStyle: 'italic',
    },
    cardBottom: {
        gap: '8@vs',
    },
    cardNumber: {
        color: '#FFFFFF',
        fontSize: '16@ms',
        fontWeight: '600',
        letterSpacing: 2,
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardExpiry: {
        color: '#FFFFFF',
        fontSize: '12@ms',
    },
    cardHolder: {
        color: '#FFFFFF',
        fontSize: '12@ms',
    },
    addCardButton: {
        width: '49@s',
        height: '125@vs',
        borderRadius: '15@ms',
        borderWidth: 1,
        borderColor: '#0F172A',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    transactionsSection: {
        // paddingHorizontal: '15@s',
    },
    seeAllBtn: {
        paddingHorizontal: '12@s',
        paddingVertical: '4@vs',
        borderRadius: '14@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    seeAllText: {
        fontSize: '12@ms',
        fontWeight: '500',
        color: '#0F172A',
    },
    transactionFilters: {
        flexDirection: 'row',
        marginBottom: '16@vs',
        gap: '8@s',
        paddingHorizontal: '10@s',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: '12@vs',
        borderRadius: '12@ms',
        paddingHorizontal: '15@s',
    },
    transactionIcon: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '20@ms',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '12@s',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#0F172A',
        marginBottom: '2@vs',
    },
    transactionDate: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    transactionAmountContainer: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '4@vs',
    },
    transactionStatus: {
        paddingHorizontal: '6@s',
        paddingVertical: '4@vs',
        borderRadius: '12@ms',
        overflow: 'hidden',
    },
    transactionStatusText: {
        fontSize: '12@ms',
        fontWeight: '600',
    },
});
