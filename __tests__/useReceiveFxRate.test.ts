import { renderHook } from '@testing-library/react-native';
import { useReceiveFxRate } from '../hooks/useReceiveFxRate';
import { useGetExchangeRatesQuery } from '../hooks/queries/transactions/useGetExchangeRatesQuery';

jest.mock('../hooks/queries/transactions/useGetExchangeRatesQuery');

describe('useReceiveFxRate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns default rate 1500 and 750,000 NGN when no exchange rates data is present', () => {
        (useGetExchangeRatesQuery as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
        });

        const { result } = renderHook(() => useReceiveFxRate());

        expect(result.current.rate).toBe(1500);
        expect(result.current.cashPickupLimitNaira).toBe(750000);
        expect(result.current.formattedLimitNaira).toBe('₦750,000.00');
    });

    it('calculates the correct rate and limit from USD-to-NGN exchange rate', () => {
        (useGetExchangeRatesQuery as jest.Mock).mockReturnValue({
            data: {
                success: true,
                data: [
                    { fromCurrency: 'USD', toCurrency: 'NGN', sellRate: 1600, buyRate: 1550, rate: 1580 },
                ],
            },
            isLoading: false,
        });

        const { result } = renderHook(() => useReceiveFxRate());

        expect(result.current.rate).toBe(1550);
        expect(result.current.cashPickupLimitNaira).toBe(775000);
        expect(result.current.formattedLimitNaira).toBe('₦775,000.00');
    });

    it('calculates inverse rate correctly when NGN is fromCurrency and USD is toCurrency', () => {
        (useGetExchangeRatesQuery as jest.Mock).mockReturnValue({
            data: {
                success: true,
                data: [
                    { fromCurrency: 'NGN', toCurrency: 'USD', rate: 0.000625 }, // 1 / 0.000625 = 1600
                ],
            },
            isLoading: false,
        });

        const { result } = renderHook(() => useReceiveFxRate());

        expect(result.current.rate).toBe(1600);
        expect(result.current.cashPickupLimitNaira).toBe(800000);
        expect(result.current.formattedLimitNaira).toBe('₦800,000.00');
    });
});
