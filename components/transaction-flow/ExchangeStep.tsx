import CurrencyConverter from '@/components/CurrencyConverter';
import { Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { useAppTheme } from '@/hooks/useAppTheme';

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

    rate: string;
    allowedModes?: ('buy' | 'sell')[];
    onAmountGetChange?: (amount: string) => void;
    onAmountSendChange?: (amount: string) => void;
    showLimitWarning?: boolean;
    onLimitWarningPress?: () => void;
    onDownloadPress?: () => void;
    onTemplateDownloadPress?: () => void;
    error?: string;
    isLoading?: boolean;
    isSchool?: boolean;
    labelGet?: string;
    labelSend?: string;
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
    onDownloadPress,
    onTemplateDownloadPress,
    error,
    isLoading,
    isSchool,
    labelGet,
    labelSend,
}: ExchangeStepProps) {
    const { colors } = useAppTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>How much do you want exchange?</Text>

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
                onDownloadPress={onDownloadPress}
                onTemplateDownloadPress={onTemplateDownloadPress}
                error={error}
                isLoading={isLoading}
                isSchool={isSchool}
                labelGet={labelGet}
                labelSend={labelSend}
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
