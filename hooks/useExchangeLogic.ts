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
    maxLimit?: number;
    initialTransactionType?: 'buy' | 'sell';
}

export const useExchangeLogic = ({ setValue, initialAmount = '1', maxLimit, initialTransactionType = 'buy' }: UseExchangeLogicProps = {}) => {
    const calculateExchangeRate = useCalculateExchangeRateMutation();
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>(initialTransactionType);

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
        if (exchangeRates?.data?.[0]) {
            const rate = transactionType === 'buy' ? exchangeRates.data[0].buyRate : exchangeRates.data[0].sellRate;
            if (rate) {
                setCurrentRate(rate);
            }
        }
    }, [exchangeRates, transactionType]);

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

        if (cleanAmount && !isNaN(numAmount)) {
            calculateExchangeRate.mutate({
                fromCurrency: currencyGet.code,
                toCurrency: currencySend.code,
                amount: numAmount,
                mode: transactionType
            }, {
                onSuccess: (response: any) => {
                    if (response.success && response.data) {
                        setAmountSendStr(response.data.convertedAmount.toLocaleString());
                        setCurrentRate(response.data.appliedRate || (transactionType === 'buy' ? response.data.buyRate : response.data.sellRate));
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
                amount: parseFloat(cleanAmount),
                mode: transactionType
            }, {
                onSuccess: (response: any) => {
                    if (response.success && response.data) {
                        setAmountSendStr(response.data.convertedAmount.toLocaleString());
                        setCurrentRate(response.data.appliedRate || (transactionType === 'buy' ? response.data.buyRate : response.data.sellRate));
                    }
                }
            });
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
            setAmountGetStr(parseFloat(formattedGet).toLocaleString());
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
