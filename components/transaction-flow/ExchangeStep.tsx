import CurrencyConverter from '@/components/CurrencyConverter';
import React from 'react';
import { Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

interface Currency {
    code: string;
    country: string;
    currencyName: string;
    flagUrl: string;
}

interface ExchangeStepProps {
    transactionType: 'buy' | 'sell';
    onTransactionTypeChange: (type: 'buy' | 'sell') => void;

    currencyGet: Currency;
    onCurrencyGetChange: (currency: Currency) => void;

    currencySend: Currency;
    onCurrencySendChange: (currency: Currency) => void;

    amountGet: string;
    amountSend: string;

    rate: string; // e.g., "1 USD = 1500 NGN"
    allowedModes?: ('buy' | 'sell')[];
    onAmountGetChange?: (amount: string) => void;
    onAmountSendChange?: (amount: string) => void;
    showLimitWarning?: boolean;
    onLimitWarningPress?: () => void;
    error?: string;
}

export default function ExchangeStep({
    transactionType,
    onTransactionTypeChange,
    currencyGet,
    onCurrencyGetChange,
    currencySend,
    onCurrencySendChange,
    amountGet,
    amountSend,
    rate,
    allowedModes,
    onAmountGetChange,
    onAmountSendChange,
    showLimitWarning,
    onLimitWarningPress,
    error
}: ExchangeStepProps) {


    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>How much do you want exchange?</Text>

            <CurrencyConverter
                transactionType={transactionType}
                onTransactionTypeChange={onTransactionTypeChange}
                currencyGet={currencyGet}
                onCurrencyGetChange={onCurrencyGetChange}
                currencySend={currencySend}
                onCurrencySendChange={onCurrencySendChange}
                amountGet={amountGet}
                amountSend={amountSend}
                rate={rate}
                allowedModes={allowedModes}
                onAmountGetChange={onAmountGetChange}
                onAmountSendChange={onAmountSendChange}
                showLimitWarning={showLimitWarning}
                onLimitWarningPress={onLimitWarningPress}
                error={error}
            />
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        gap: '1@vs',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '16@vs',
    },
});
