import { useMemo } from 'react';
import { useGetExchangeRatesQuery } from '@/hooks/queries/transactions/useGetExchangeRatesQuery';

export const useReceiveFxRate = () => {
    const { data: exchangeRatesData, isLoading } = useGetExchangeRatesQuery();

    const rate = useMemo(() => {
        const rates = exchangeRatesData?.data;
        if (!rates || rates.length === 0) return 1500;

        const direct = rates.find(
            (r) => r.fromCurrency === 'USD' && r.toCurrency === 'NGN'
        );
        if (direct) {
            return direct.buyRate || direct.sellRate || direct.rate || 1500;
        }

        const inverse = rates.find(
            (r) => r.fromCurrency === 'NGN' && r.toCurrency === 'USD'
        );
        if (inverse) {
            const val = inverse.buyRate || inverse.sellRate || inverse.rate || 0;
            if (val > 0) {
                return val < 1 ? Math.round(1 / val) : val;
            }
        }

        return 1500;
    }, [exchangeRatesData]);

    const formatNaira = (amount: number) => {
        return `₦${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const cashPickupLimitUsd = 500;
    const cashPickupLimitNaira = cashPickupLimitUsd * rate;
    const formattedLimitNaira = formatNaira(cashPickupLimitNaira);

    return {
        rate,
        isLoading,
        cashPickupLimitUsd,
        cashPickupLimitNaira,
        formattedLimitNaira,
        formatNaira,
    };
};
