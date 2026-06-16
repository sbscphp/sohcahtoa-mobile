import SearchEmpty from '@/assets/icons/empty-state.svg';
import FilterMailSquare from '@/assets/images/filter-mail-square.svg';
import FilterBottomSheet from '@/components/FilterBottomSheet';
import Header from '@/components/Header';
import { useGetTransactionsQuery } from '@/hooks/queries/transactions/useGetTransactionsQuery';
import { Transaction } from '@/types/api/transactions';
import { useRouter } from 'expo-router';
import { Refresh } from 'iconsax-react-nativejs';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, SectionList, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

// ── Helpers ──────────────────────────────────────────────────────────
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
    const num = Number(amount);
    if (isNaN(num)) return `${symbol}0`;
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${symbol}${parts.join('.')}`;
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

const getSectionTitle = (dateStr: string): string => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: Record<string, Transaction[]> = {};
    transactions.forEach((tx) => {
        const dateKey = new Date(tx.createdAt).toDateString();
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(tx);
    });
    return Object.entries(groups).map(([_, data]) => ({
        title: getSectionTitle(data[0].createdAt),
        data,
    }));
};

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'Pending':
            return { color: '#B54708', bg: '#FFFAEB' };
        case 'In Progress':
            return { color: '#3538CD', bg: '#EEF4FF' };
        case 'Declined':
            return { color: '#B42318', bg: '#FEF3F2' };
        case 'Approved':
        case 'Settled':
            return { color: '#027A48', bg: '#ECFDF3' };
        case 'Draft':
            return { color: '#344054', bg: '#F2F4F7' };
        default:
            return { color: '#344054', bg: '#F2F4F7' };
    }
};

// ── Route Mapping ────────────────────────────────────────────────────
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

// ── Component ────────────────────────────────────────────────────────
export default function AllTransactionsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [filterVisible, setFilterVisible] = useState(false);
    const [queryParams, setQueryParams] = useState<Record<string, string | undefined>>({});

    const { data: transactionsData, isLoading } = useGetTransactionsQuery(queryParams);

    const transactions: Transaction[] = transactionsData?.data || [];
    const sections = useMemo(() => groupTransactionsByDate(transactions), [transactions]);

    const handleFilter = (filters: { startDate: string; endDate: string; status: string; type: string; group: string; currency: string }) => {
        console.log('📋 Filter input:', JSON.stringify(filters, null, 2));
        const params: Record<string, string | undefined> = {};

        // Convert dd/mm/yyyy → ISO 8601 datetime
        if (filters.startDate) {
            const [d, m, y] = filters.startDate.split('/');
            params.startDate = new Date(`${y}-${m}-${d}T00:00:00.000Z`).toISOString();
        }
        if (filters.endDate) {
            const [d, m, y] = filters.endDate.split('/');
            params.endDate = new Date(`${y}-${m}-${d}T23:59:59.999Z`).toISOString();
        }

        if (filters.status) params.status = filters.status;
        if (filters.type) params.type = filters.type;
        if (filters.group) params.group = filters.group;
        if (filters.currency) params.currency = filters.currency;

        console.log('🚀 Query params:', JSON.stringify(params, null, 2));
        setQueryParams(params);
        setFilterVisible(false);
    };

    const renderItem = ({ item, index, section }: { item: Transaction; index: number; section: any }) => {
        const statusLabel = getStatusLabel(item.status);
        const style = getStatusStyle(statusLabel);
        const isFirst = index === 0;
        const isLast = index === section.data.length - 1;

        return (
            <TouchableOpacity
                onPress={() => router.push({ pathname: getTransactionRoute(item.type) as any, params: { transactionId: item.id } })}
                style={[
                    styles.transactionWrapper,
                    isFirst && styles.topRadius,
                    isLast && styles.bottomRadius,
                    isLast && { marginBottom: moderateScale(20) },
                    !isLast && { marginBottom: 0 }
                ]}>
                <View style={styles.itemContainer}>
                    <View style={styles.iconContainer}>
                        <Refresh size={moderateScale(16)} color="#64748B" />
                    </View>
                    <View style={styles.itemContent}>
                        <View style={styles.itemTopRow}>
                            <Text style={styles.itemTitle} numberOfLines={1}>{item.purpose || item.type}</Text>
                            <Text style={styles.itemAmount}>{formatAmount(item.foreignAmount, item.currency)}</Text>
                        </View>
                        <View style={styles.itemBottomRow}>
                            <Text style={styles.itemDate}>{formatDate(item.createdAt)} • {formatTime(item.createdAt)}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
                                <Text style={[styles.statusText, { color: style.color }]}>{statusLabel}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header
                title="All Transactions"
                rightIcon={<FilterMailSquare color="rgba(152, 162, 179, 1)" />}
                onRightPress={() => setFilterVisible(true)}
            />

            {isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#FF6B2C" />
                </View>
            ) : sections.length > 0 ? (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.sectionHeader}>{title}</Text>
                    )}
                    contentContainerStyle={styles.listContent}
                    stickySectionHeadersEnabled={false}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <SearchEmpty width={moderateScale(150)} height={moderateScale(120)} />
                    </View>
                    <Text style={styles.emptyTitle}>No Transaction Yet</Text>
                    <Text style={styles.emptyDesc}>
                        No transaction available. Check back later
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.buyButton} onPress={() => { /* Handle Buy FX */ }}>
                            <Text style={styles.buyButtonText}>Buy FX</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sellButton} onPress={() => { /* Handle Sell FX */ }}>
                            <Text style={styles.sellButtonText}>Sell FX</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <FilterBottomSheet
                visible={filterVisible}
                onClose={() => setFilterVisible(false)}
                onFilter={handleFilter}
            />
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    listContent: {
        paddingHorizontal: '16@s',
        paddingBottom: '20@vs',
    },
    sectionHeader: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginTop: '24@vs',
        marginBottom: '12@vs',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    transactionWrapper: {
        backgroundColor: 'rgba(247, 247, 247, 1)',
        marginHorizontal: '4@s',
        padding: '12@ms',
    },
    topRadius: {
        borderTopLeftRadius: '12@ms',
        borderTopRightRadius: '12@ms',
    },
    bottomRadius: {
        borderBottomLeftRadius: '12@ms',
        borderBottomRightRadius: '12@ms',
    },
    iconContainer: {
        width: '32@ms',
        height: '32@ms',
        borderRadius: '16@ms',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: '12@s',
    },
    itemContent: {
        flex: 1,
        gap: '4@vs',
    },
    itemTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#1E293B',
        flex: 1,
        marginRight: '8@s',
    },
    itemAmount: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    itemDate: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    statusBadge: {
        paddingHorizontal: '8@s',
        paddingVertical: '2@vs',
        borderRadius: '12@ms',
    },
    statusText: {
        fontSize: '11@ms',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '20@s',
        marginBottom: '90@vs',
    },
    emptyIconContainer: {
        marginBottom: '16@vs',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '8@vs',
    },
    emptyDesc: {
        fontSize: '14@ms',
        color: '#64748B',
        textAlign: 'center',
        marginBottom: '32@vs',
    },
    buttonContainer: {
        width: '100%',
        gap: '16@vs',
    },
    buyButton: {
        backgroundColor: '#FF6B00',
        paddingVertical: '16@vs',
        borderRadius: '30@ms',
        alignItems: 'center',
        width: '100%',
    },
    buyButtonText: {
        color: '#FFFFFF',
        fontSize: '16@ms',
        fontWeight: '600',
    },
    sellButton: {
        backgroundColor: '#F8FAFC',
        paddingVertical: '16@vs',
        borderRadius: '30@ms',
        alignItems: 'center',
        width: '100%',
    },
    sellButtonText: {
        color: '#0F172A',
        fontSize: '16@ms',
        fontWeight: '600',
    },
});
