import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import ActionSelectionSheet from '@/components/ActionSelectionSheet';
import { CurrencyItem } from '@/components/CurrencyDropdown';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useGetTransactionTotalsMutation } from '@/hooks/queries/transactions/useGetTransactionTotalsMutation';
import { useGetTransactionsQuery } from '@/hooks/queries/transactions/useGetTransactionsQuery';
import { useGetUnreadCountQuery } from '@/hooks/queries/notifications/useGetUnreadCountQuery';
import { useAuthStore } from '@/stores/useAuthStore';
import HomeHeader from '@/components/home/HomeHeader';
import HomeBalanceSection from '@/components/home/HomeBalanceSection';
import HomeQuickActions from '@/components/home/HomeQuickActions';
import HomeCardsSection from '@/components/home/HomeCardsSection';
import HomeTransactionsSection from '@/components/home/HomeTransactionsSection';
import { getActionSheetConfig, getTransactionRoute } from '@/components/home/homeConfig';
import AnimatedTabScreen from '@/components/ui/AnimatedTabScreen';

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = useAuthStore((state) => state.user);
    useProfileQuery();

    const [showBalance, setShowBalance] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('FX bought');
    const [transactionFilters, setTransactionFilters] = useState([
        'All', 'PTA', 'BTA', 'School Fees', 'Medical', 'Professional', 'Touring',
    ]);
    const [selectedTxFilter, setSelectedTxFilter] = useState('All');
    const [actionSheetType, setActionSheetType] = useState<'buy' | 'sell' | 'receive' | null>(null);
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState<CurrencyItem>({ id: '4', code: 'USD', flag: '🇺🇸' });

    const { mutate: getTotals, data: totalsData, isPending: isLoadingTotals } = useGetTransactionTotalsMutation();
    const { data: unreadData } = useGetUnreadCountQuery();
    const unreadCount = unreadData?.data?.count || 0;

    useEffect(() => {
        getTotals({
            currency: selectedCurrency.code,
            customRates: [{ currency: selectedCurrency.code, rate: 1 }],
        });
    }, [selectedCurrency]);

    const handleActionPress = (action: string) => {
        setActionSheetType(null);
        const actionRoutes: Record<string, string> = {
            vacation: '/(buy-fx)/(pta)/create-pta',
            business: '/(buy-fx)/(bta)/create-bta',
            school: '/(buy-fx)/(school)/create-school',
            medical: '/(buy-fx)/(medical)/create-medical',
            professional: '/(buy-fx)/(professional)/create-professional',
            touring: '/(buy-fx)/(touring)/create-touring',
            touring_inbound: '/(sell-fx)/(tourist)/create-tourist',
            resident: '/(sell-fx)/(resident)/create-resident',
            expatriate: '/(sell-fx)/(expatriate)/create-expatriate',
        };
        if (actionRoutes[action]) {
            router.push(actionRoutes[action] as any);
        }
    };

    const handleTopFilterChange = (filter: string) => {
        setSelectedFilter(filter);
        if (filter === 'FX bought') {
            setTransactionFilters(['All', 'PTA', 'BTA', 'School Fees', 'Medical', 'Professional', 'Touring']);
        } else if (filter === 'FX sold') {
            setTransactionFilters(['All', 'Resident', 'Tourist', 'Expatriate']);
        } else if (filter === 'Others' || filter === 'Received FX') {
            setTransactionFilters(['All', 'IMTO', 'Cash']);
        } else {
            setTransactionFilters(['All', 'Buy FX', 'Sell FX', 'Others']);
        }
        setSelectedTxFilter('All');
    };

    const balanceData = useMemo(() => {
        const totals: any = totalsData?.data || totalsData;
        if (!totals) return { label: 'Total FX units', amount: '0' };

        switch (selectedFilter) {
            case 'FX bought':
                return { label: 'Total FX Bought', amount: (totals.buy?.totalAmount ?? 0).toLocaleString() };
            case 'FX sold':
                return { label: 'Total FX Sold', amount: (totals.sell?.totalAmount ?? 0).toLocaleString() };
            case 'Others':
            case 'Received FX':
                return { label: 'Total Others', amount: (totals.remittance?.totalAmount ?? 0).toLocaleString() };
            default:
                return { label: 'Total FX units', amount: (totals.all?.totalAmount ?? 0).toLocaleString() };
        }
    }, [totalsData, selectedFilter]);

    const queryParams = useMemo(() => {
        const params: any = { limit: 5 };
        if (selectedFilter === 'All' && selectedTxFilter === 'All') return params;

        if (selectedFilter === 'FX bought') params.group = 'BUY';
        else if (selectedFilter === 'FX sold') params.group = 'SELL';
        else if (selectedFilter === 'Others' || selectedFilter === 'Received FX') params.group = 'REMITTANCE';

        const typeMap: Record<string, string> = {
            'PTA': 'PTA',
            'BTA': 'BTA',
            'School Fees': 'SCHOOL_FEES',
            'School': 'SCHOOL_FEES',
            'Medical': 'MEDICAL',
            'Professional': 'PROFESSIONAL_BODY',
            'Professional Body': 'PROFESSIONAL_BODY',
            'Touring': 'TOURING',
            'Resident': 'RESIDENT_FX',
            'Tourist': 'TOURIST_FX',
            'Expatriate': 'EXPATRIATE_FX',
            'IMTO': 'IMTO_REMITTANCE',
            'Cash': 'CASH_REMITTANCE',
            'Buy FX': 'BUY',
            'Sell FX': 'SELL',
            'Others': 'REMITTANCE',
            'Received FX': 'REMITTANCE',
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

    const { data: transactionsData, isLoading: isLoadingTransactions, refetch } = useGetTransactionsQuery(queryParams);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const transactions = transactionsData?.pages?.flatMap((p) => p.data) || [];

    const activeConfig = getActionSheetConfig(
        actionSheetType,
        handleActionPress,
        () => {
            setActionSheetType(null);
            router.push('/(receive-fx)/imto');
        }
    );

    return (
        <AnimatedTabScreen style={[styles.container, { paddingTop: insets.top }]}>
            <HomeHeader
                user={user}
                unreadCount={unreadCount}
                onNotificationPress={() => router.push('/notifications')}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <HomeBalanceSection
                    selectedFilter={selectedFilter}
                    onSelectFilter={handleTopFilterChange}
                    balanceLabel={balanceData.label}
                    balanceAmount={balanceData.amount}
                    showBalance={showBalance}
                    onToggleBalance={() => setShowBalance(!showBalance)}
                    selectedCurrency={selectedCurrency}
                    onSelectCurrency={(curr) => setSelectedCurrency(curr)}
                    currencySheetVisible={currencySheetVisible}
                    setCurrencySheetVisible={setCurrencySheetVisible}
                    isLoadingTotals={isLoadingTotals}
                />

                <HomeQuickActions
                    onActionPress={(type) => setActionSheetType(type)}
                />

                <HomeCardsSection
                    userName={user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'User'}
                />

                <HomeTransactionsSection
                    transactionFilters={transactionFilters}
                    selectedTxFilter={selectedTxFilter}
                    onSelectTxFilter={(filter) => setSelectedTxFilter(filter)}
                    transactions={transactions}
                    isLoadingTransactions={isLoadingTransactions}
                    onSeeAll={() => router.push('/all-transactions')}
                    onTransactionPress={(tx) => router.push({
                        pathname: getTransactionRoute(tx.type) as any,
                        params: { transactionId: tx.id },
                    })}
                />
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
        </AnimatedTabScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
});
 