import CurrencyConverter from '@/components/CurrencyConverter';
import Header from '@/components/Header';
import { Notification } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
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
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
    const [currencyGet, setCurrencyGet] = useState<Currency>(currencies[0]); // USD
    const [currencySend, setCurrencySend] = useState<Currency>(currencies[1]); // NGN
    const [amountGet, setAmountGet] = useState('1');
    const [amountSend, setAmountSend] = useState('1500');


    const ratesData = [
        { currency: 'US Dollar ($)', buy: '₦1450 / $1', sell: '₦1450 / $1' },
        { currency: 'Naira (₦)', buy: '₦1750 / £1', sell: '₦1750 / £1' }, // Keeping consistent with screenshot text even if weird
    ];

    return (
        <View style={styles.container}>
            <Header title="FX Rate" rightIcon={<Notification size={moderateScale(28)} color="rgba(143, 139, 139, 1)" variant="Linear" />}/>
            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <CurrencyConverter
                    transactionType={transactionType}
                    onTransactionTypeChange={setTransactionType}
                    currencyGet={currencyGet}
                    onCurrencyGetChange={setCurrencyGet}
                    currencySend={currencySend}
                    onCurrencySendChange={setCurrencySend}
                    amountGet={amountGet}
                    amountSend={amountSend}
                    rate="USD1 - NGN1500"
                />

                <View style={styles.otherRatesContainer}>
                    <Text style={styles.otherRatesTitle}>Other FX rate</Text>

                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Currency</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>We buy at</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>We Sell at</Text>
                        </View>

                        {ratesData.map((item, index) => (
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
        paddingHorizontal: '20@ms',
        paddingBottom: '40@vs',
        gap: '24@vs',
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
        backgroundColor: 'rgba(248, 248, 248, 1)', // Light gray background for the whole table/header area if needed, or just header. Screenshot shows a container.
        // Actually screenshot shows a list. Let's make the header gray.
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
        borderBottomWidth: 0, // No visible separators in screenshot
    },
    tableCellText: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#334155',
    },
});
