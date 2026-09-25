import { useCalculateExchangeRateMutation } from '@/hooks/queries/transactions/useCalculateExchangeRateMutation';
import { useGetExchangeRatesQuery } from '@/hooks/queries/transactions/useGetExchangeRatesQuery';
import { useEffect, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { ExchangeRate } from '@/types/api/transactions';

export interface Currency {
    code: string;
    country: string;
    currencyName: string;
    flagUrl: string;
}

export const DEFAULT_GET_CURRENCY: Currency = {
    code: 'USD',
    country: 'United States',
    currencyName: 'Dollar',
    flagUrl: 'https://flagcdn.com/w80/us.png'
};

export const DEFAULT_SEND_CURRENCY: Currency = {
    code: 'NGN',
    country: 'Nigeria',
    currencyName: 'Naira',
    flagUrl: 'https://flagcdn.com/w80/ng.png'
};

interface UseExchangeLogicProps {
    setValue?: UseFormSetValue<any>;
    initialAmount?: string;
    maxLimit?: number;
    initialTransactionType?: 'buy' | 'sell';
}

const findExchangeRate = (
    rates: ExchangeRate[] | undefined,
    fromCode: string,
    toCode: string,
    mode: 'buy' | 'sell'
): number | null => {
    if (!rates || rates.length === 0) return null;
    if (fromCode === toCode) return 1;

    // Direct match
    const direct = rates.find((r) => r.fromCurrency === fromCode && r.toCurrency === toCode);
    if (direct) {
        return mode === 'buy' ? (direct.buyRate || direct.rate) : (direct.sellRate || direct.rate);
    }

    // Inverse match
    const inverse = rates.find((r) => r.fromCurrency === toCode && r.toCurrency === fromCode);
    if (inverse) {
        const baseRate = mode === 'buy' ? (inverse.buyRate || inverse.rate) : (inverse.sellRate || inverse.rate);
        return baseRate > 0 ? baseRate : null;
    }

    // Fallback: match either currency
    const anyMatch = rates.find((r) => r.fromCurrency === fromCode || r.toCurrency === fromCode);
    if (anyMatch) {
        return mode === 'buy' ? (anyMatch.buyRate || anyMatch.rate) : (anyMatch.sellRate || anyMatch.rate);
    }

    // Fallback: first available rate
    if (rates[0]) {
        return mode === 'buy' ? (rates[0].buyRate || rates[0].rate) : (rates[0].sellRate || rates[0].rate);
    }

    return null;
};

export const useExchangeLogic = ({ setValue, initialAmount = '1', maxLimit, initialTransactionType = 'buy' }: UseExchangeLogicProps = {}) => {
    const calculateExchangeRate = useCalculateExchangeRateMutation();
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>(initialTransactionType);

    const [currencyGet, setCurrencyGet] = useState<Currency>(DEFAULT_GET_CURRENCY);
    const [currencySend, setCurrencySend] = useState<Currency>(DEFAULT_SEND_CURRENCY);

    const [amountGetStr, setAmountGetStr] = useState(initialAmount);
    const [amountSendStr, setAmountSendStr] = useState('0');
    const [currentRate, setCurrentRate] = useState(0);

    // Fetch all exchange rates upfront without currency params so currency changes don't refetch
    const { data: exchangeRates } = useGetExchangeRatesQuery();

    useEffect(() => {
        const rate = findExchangeRate(exchangeRates?.data, currencyGet.code, currencySend.code, transactionType);
        if (rate && rate > 0) {
            setCurrentRate(rate);

            const numAmount = parseFloat(amountGetStr.replace(/,/g, '')) || 0;
            if (numAmount > 0) {
                const converted = numAmount * rate;
                setAmountSendStr(converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
            }
        }
    }, [exchangeRates, currencyGet.code, currencySend.code, transactionType]);

    const handleAmountGetChange = (amount: string) => {
        let cleanAmount = amount.replace(/[^0-9.]/g, '');
        
        const parts = cleanAmount.split('.');
        if (parts.length > 2) {
            cleanAmount = parts[0] + '.' + parts.slice(1).join('');
        }

        let formatted = cleanAmount;
        if (cleanAmount !== '') {
            const integerPart = parts[0];
            const decimalPart = parts[1] !== undefined ? '.' + parts[1] : '';
            const formattedInteger = integerPart ? parseInt(integerPart, 10).toLocaleString('en-US') : (integerPart === '0' ? '0' : '');
            
            if (integerPart === '') {
                formatted = decimalPart;
            } else {
                formatted = formattedInteger + decimalPart;
            }
        }

        let numAmount = parseFloat(cleanAmount) || 0;

        setAmountGetStr(formatted);

        if (setValue) {
            setValue('amount', numAmount, { shouldValidate: true });
        }

        if (cleanAmount && !isNaN(numAmount) && numAmount > 0) {
            if (currentRate > 0) {
                const localConverted = numAmount * currentRate;
                setAmountSendStr(localConverted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
            }

            calculateExchangeRate.mutate({
                fromCurrency: currencyGet.code,
                toCurrency: currencySend.code,
                amount: numAmount,
                mode: transactionType
            }, {
                onSuccess: (response: any) => {
                    if (response.success && response.data) {
                        setAmountSendStr(response.data.convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                        setCurrentRate(response.data.appliedRate || (transactionType === 'buy' ? response.data.buyRate : response.data.sellRate));
                    }
                }
            });
        } else {
            setAmountSendStr('0');
        }
    };

    const handleCurrencyChange = (type: 'GET' | 'SEND', currency: Currency) => {
        const nextGet = type === 'GET' ? currency : currencyGet;
        const nextSend = type === 'SEND' ? currency : currencySend;

        if (type === 'GET') {
            setCurrencyGet(currency);
        } else {
            setCurrencySend(currency);
        }

        // Calculate rate and conversion locally in-memory without making a backend call
        const rate = findExchangeRate(exchangeRates?.data, nextGet.code, nextSend.code, transactionType);
        if (rate && rate > 0) {
            setCurrentRate(rate);

            const numAmount = parseFloat(amountGetStr.replace(/,/g, '')) || 0;
            if (numAmount > 0) {
                const converted = numAmount * rate;
                setAmountSendStr(converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
            }
        }
    };

    const handleAmountSendChange = (amount: string) => {
        let cleanAmount = amount.replace(/[^0-9.]/g, '');
        const parts = cleanAmount.split('.');
        if (parts.length > 2) {
            cleanAmount = parts[0] + '.' + parts.slice(1).join('');
        }

        let formatted = cleanAmount;
        if (cleanAmount !== '') {
            const integerPart = parts[0];
            const decimalPart = parts[1] !== undefined ? '.' + parts[1] : '';
            const formattedInteger = integerPart ? parseInt(integerPart, 10).toLocaleString('en-US') : (integerPart === '0' ? '0' : '');
            if (integerPart === '') {
                formatted = decimalPart;
            } else {
                formatted = formattedInteger + decimalPart;
            }
        }

        let numAmount = parseFloat(cleanAmount) || 0;
        setAmountSendStr(formatted);

        if (currentRate > 0) {
            const calculatedGet = numAmount / currentRate;
            const formattedGet = calculatedGet.toFixed(2);
            setAmountGetStr(parseFloat(formattedGet).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
            if (setValue) {
                setValue('amount', parseFloat(formattedGet), { shouldValidate: true });
            }
        }
    };

    return {
        transactionType,
        setTransactionType,
        currencyGet,
        setCurrencyGet: (c: Currency) => handleCurrencyChange('GET', c),
        currencySend,
        setCurrencySend: (c: Currency) => handleCurrencyChange('SEND', c),
        amountGetStr,
        setAmountGetStr: handleAmountGetChange,
        amountSendStr,
        setAmountSendStr: handleAmountSendChange,
        currentRate,
        calculateExchangeRate,
        exchangeRates
    };
};
