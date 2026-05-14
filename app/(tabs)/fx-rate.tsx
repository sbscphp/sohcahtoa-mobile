import CurrencyConverter from '@/components/CurrencyConverter';
import Header from '@/components/Header';
import { useGetUnreadCountQuery } from '@/hooks/queries/notifications/useGetUnreadCountQuery';
import { useCalculateExchangeRateMutation } from '@/hooks/queries/transactions/useCalculateExchangeRateMutation';
import { useGetExchangeRatesQuery } from '@/hooks/queries/transactions/useGetExchangeRatesQuery';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'expo-router';
import { Notification } from 'iconsax-react-nativejs';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';

interface Currency {
    code: string;
    country: string;
    currencyName: string;
    flagUrl: string;
}

// Dummy data for currencies
const currencies: Currency[] = [
    { code: 'USD', country: 'United States', currencyName: 'US Dollar', flagUrl: 'https://flagcdn.com/w320/us.png' },
    { code: 'NGN', country: 'Nigeria', currencyName: 'Nigerian Naira', flagUrl: 'https://flagcdn.com/w320/ng.png' },
    { code: 'GBP', country: 'United Kingdom', currencyName: 'British Pound', flagUrl: 'https://flagcdn.com/w320/gb.png' },
    { code: 'EUR', country: 'European Union', currencyName: 'Euro', flagUrl: 'https://flagcdn.com/w320/eu.png' },
];

export default function FxRateScreen() {
    const router = useRouter();
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
    const [currencyGet, setCurrencyGet] = useState<Currency>(currencies[0]); // USD
    const [currencySend, setCurrencySend] = useState<Currency>(currencies[1]); // NGN
    const [amountGet, setAmountGet] = useState('1');
    const [amountSend, setAmountSend] = useState('1500');

    const { data: unreadData } = useGetUnreadCountQuery();
    const unreadCount = unreadData?.data?.count || 0;

    const { data: exchangeRatesData, isLoading: isLoadingRates } = useGetExchangeRatesQuery();
    const { mutate: calculateRate, isPending: isCalculating } = useCalculateExchangeRateMutation();

    const debouncedAmountGet = useDebounce(amountGet, 500);

    useEffect(() => {
        if (debouncedAmountGet && parseFloat(debouncedAmountGet) > 0) {
            calculateRate({
                fromCurrency: currencyGet.code,
                toCurrency: currencySend.code,
                amount: parseFloat(debouncedAmountGet)
            }, {
                onSuccess: (response: any) => {
                    if (response.success && response.data) {
                        setAmountSend(response.data.convertedAmount.toString());
                    }
                }
            });
        }
    }, [debouncedAmountGet, currencyGet.code, currencySend.code, transactionType]);

    const ratesData = exchangeRatesData?.data?.map(rate => ({
        currency: `${rate.fromCurrency} (${rate.fromCurrency === 'USD' ? '$' : rate.fromCurrency === 'GBP' ? '£' : rate.fromCurrency === 'EUR' ? '€' : ''})`,
        buy: `₦${rate.buyRate} / ${rate.fromCurrency === 'USD' ? '$' : '1'}`,
        sell: `₦${rate.sellRate} / ${rate.fromCurrency === 'USD' ? '$' : '1'}`
    })) || [];

    return (
        <View style={styles.container}>
            <Header
                title="FX Rate"
                rightIcon={
                    <TouchableOpacity onPress={() => router.push('/notifications')}>
                        <Notification size={moderateScale(24)} color="#1E293B" variant="Linear" />
                        {unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                }
                onRightPress={() => router.push('/notifications')}
            />
            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <CurrencyConverter
                    transactionType={transactionType}
                    onTransactionTypeChange={setTransactionType}
                    currencyGet={currencyGet}
                    onCurrencyGetChange={setCurrencyGet}
                    currencySend={currencySend}
                    onCurrencySendChange={setCurrencySend}
                    amountGet={amountGet}
                    onAmountGetChange={setAmountGet}
                    amountSend={amountSend}
                    isLoading={isCalculating}
                    rate={`${currencyGet.code} 1 - ${currencySend.code} ${amountSend && amountGet && parseFloat(amountGet) > 0 ? (parseFloat(amountSend) / parseFloat(amountGet)).toFixed(2) : '...'}`}
                    showLimitWarning
                    onLimitWarningPress={() => router.push('/proof-of-fund')}
                />

                <View style={styles.otherRatesContainer}>
                    <Text style={styles.otherRatesTitle}>Other FX rate</Text>

                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Currency</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>We buy at</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>We Sell at</Text>
                        </View>

                        {isLoadingRates ? (
                            <View style={{ padding: moderateScale(20) }}>
                                <ActivityIndicator color="#0F172A" />
                            </View>
                        ) : ratesData.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.tableCellText, { flex: 2 }]}>{item.currency}</Text>
                                <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'center' }]}>{item.buy}</Text>
                                <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'right' }]}>{item.sell}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
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
    },
    scrollContent: {
        paddingHorizontal: '10@ms',
        paddingBottom: '40@vs',
        gap: '24@vs',
        marginTop: '20@vs',
    },
    otherRatesContainer: {
        gap: '12@vs',
    },
    otherRatesTitle: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    table: {
        backgroundColor: 'rgba(248, 248, 248, 1)',
        borderRadius: '12@ms',
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: 'rgba(241, 241, 241, 1)',
        padding: '12@ms',
        alignItems: 'center',
    },
    tableHeaderText: {
        fontSize: '12@ms',
        fontWeight: '500',
        color: '#64748B',
    },
    tableRow: {
        flexDirection: 'row',
        padding: '16@ms',
        alignItems: 'center',
        borderBottomWidth: 0,
    },
    tableCellText: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#334155',
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
});
