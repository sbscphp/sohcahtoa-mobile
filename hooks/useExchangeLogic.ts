import { useCalculateExchangeRateMutation } from '@/hooks/queries/transactions/useCalculateExchangeRateMutation';
import { useGetExchangeRatesQuery } from '@/hooks/queries/transactions/useGetExchangeRatesQuery';
import { useEffect, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';

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
}

export const useExchangeLogic = ({ setValue, initialAmount = '1' }: UseExchangeLogicProps = {}) => {
    const calculateExchangeRate = useCalculateExchangeRateMutation();
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');

    const [currencyGet, setCurrencyGet] = useState<Currency>(DEFAULT_GET_CURRENCY);
    const [currencySend, setCurrencySend] = useState<Currency>(DEFAULT_SEND_CURRENCY);

    const [amountGetStr, setAmountGetStr] = useState(initialAmount);
    const [amountSendStr, setAmountSendStr] = useState('0');
    const [currentRate, setCurrentRate] = useState(0);

    const { data: exchangeRates } = useGetExchangeRatesQuery({
        fromCurrency: currencyGet.code,
        toCurrency: currencySend.code
    });

    useEffect(() => {
        if (exchangeRates?.data?.[0]?.sellRate) {
            setCurrentRate(exchangeRates.data[0].sellRate);
        }
    }, [exchangeRates]);

    const handleAmountGetChange = (amount: string) => {
        const cleanAmount = amount.replace(/,/g, '');
        setAmountGetStr(amount);

        if (setValue) {
            setValue('amount', parseFloat(cleanAmount) || 0);
        }

        if (cleanAmount && !isNaN(parseFloat(cleanAmount))) {
            calculateExchangeRate.mutate({
                fromCurrency: currencyGet.code,
                toCurrency: currencySend.code,
                amount: parseFloat(cleanAmount)
            }, {
                onSuccess: (response: any) => {
                    if (response.success && response.data) {
                        setAmountSendStr(response.data.convertedAmount.toLocaleString());
                        setCurrentRate(response.data.sellRate);
                    }
                }
            });
        } else {
            setAmountSendStr('0');
        }
    };

    const handleCurrencyChange = (type: 'GET' | 'SEND', currency: Currency) => {
        if (type === 'GET') {
            setCurrencyGet(currency);
        } else {
            setCurrencySend(currency);
        }

        const cleanAmount = amountGetStr.replace(/,/g, '');
        if (cleanAmount && !isNaN(parseFloat(cleanAmount))) {
            calculateExchangeRate.mutate({
                fromCurrency: type === 'GET' ? currency.code : currencyGet.code,
                toCurrency: type === 'SEND' ? currency.code : currencySend.code,
                amount: parseFloat(cleanAmount)
            }, {
                onSuccess: (response: any) => {
                    if (response.success && response.data) {
                        setAmountSendStr(response.data.convertedAmount.toLocaleString());
                        setCurrentRate(response.data.sellRate);
                    }
                }
            });
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
        setAmountSendStr,
        currentRate,
        calculateExchangeRate,
        exchangeRates
    };
};
