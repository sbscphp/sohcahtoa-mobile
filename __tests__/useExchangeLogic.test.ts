import { renderHook, act } from '@testing-library/react-native';
import { useExchangeLogic, DEFAULT_GET_CURRENCY, DEFAULT_SEND_CURRENCY } from '../hooks/useExchangeLogic';
import { useCalculateExchangeRateMutation } from '../hooks/queries/transactions/useCalculateExchangeRateMutation';
import { useGetExchangeRatesQuery } from '../hooks/queries/transactions/useGetExchangeRatesQuery';

// Mock the query and mutation hooks
jest.mock('../hooks/queries/transactions/useCalculateExchangeRateMutation');
jest.mock('../hooks/queries/transactions/useGetExchangeRatesQuery');

describe('useExchangeLogic', () => {
    const mockMutate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock implementation of useCalculateExchangeRateMutation
        (useCalculateExchangeRateMutation as jest.Mock).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        });

        // Mock implementation of useGetExchangeRatesQuery
        (useGetExchangeRatesQuery as jest.Mock).mockReturnValue({
            data: { 
                success: true, 
                data: [
                    { fromCurrency: 'USD', toCurrency: 'NGN', sellRate: 1550, buyRate: 1450, rate: 1500 },
                    { fromCurrency: 'EUR', toCurrency: 'NGN', sellRate: 1650, buyRate: 1600, rate: 1620 },
                ] 
            },
            isLoading: false,
        });
    });

    it('should initialize with default currencies and initial amount', () => {
        const { result } = renderHook(() => useExchangeLogic({ initialAmount: '10' }));

        expect(result.current.currencyGet).toEqual(DEFAULT_GET_CURRENCY);
        expect(result.current.currencySend).toEqual(DEFAULT_SEND_CURRENCY);
        expect(result.current.amountGetStr).toBe('10');
        expect(result.current.currentRate).toBe(1450);
        expect(result.current.isRateAvailable).toBe(true);
    });

    it('should update amountGetStr and trigger calculateExchangeRate mutation', () => {
        const { result } = renderHook(() => useExchangeLogic());

        act(() => {
            result.current.setAmountGetStr('500');
        });

        expect(result.current.amountGetStr).toBe('500');
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                amount: 500,
                fromCurrency: DEFAULT_GET_CURRENCY.code,
                toCurrency: DEFAULT_SEND_CURRENCY.code,
            }),
            expect.any(Object)
        );
    });

    it('should update currencyGet without triggering backend mutation when rate is found in-memory', () => {
        const { result } = renderHook(() => useExchangeLogic());
        const newCurrency = {
            code: 'EUR',
            country: 'Europe',
            currencyName: 'Euro',
            flagUrl: 'https://flagcdn.com/w80/eu.png'
        };

        act(() => {
            result.current.setCurrencyGet(newCurrency);
        });

        expect(result.current.currencyGet).toEqual(newCurrency);
        expect(result.current.currentRate).toBe(1600);
        expect(result.current.isRateAvailable).toBe(true);
        expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should not fall back to EUR when selecting an unsupported currency like GBP', () => {
        const { result } = renderHook(() => useExchangeLogic({ initialAmount: '0' }));
        const gbpCurrency = {
            code: 'GBP',
            country: 'United Kingdom',
            currencyName: 'Pound',
            flagUrl: 'https://flagcdn.com/w80/gb.png'
        };

        act(() => {
            result.current.setCurrencyGet(gbpCurrency);
        });

        expect(result.current.currencyGet).toEqual(gbpCurrency);
        // Must NOT fall back to EUR (1600) or USD (1450)
        expect(result.current.currentRate).toBe(0);
        expect(result.current.amountSendStr).toBe('0');
        expect(result.current.rateText).toBe('Rate unavailable');
        expect(result.current.isRateAvailable).toBe(false);
    });

    it('should reset currentRate and amountSendStr to 0 when calculateExchangeRate fails', () => {
        const { result } = renderHook(() => useExchangeLogic({ initialAmount: '0' }));

        act(() => {
            result.current.setAmountGetStr('100');
        });

        // Extract onError callback passed to mutate
        const mutateCallArgs = mockMutate.mock.calls[0];
        const options = mutateCallArgs[1];

        act(() => {
            options.onError(new Error('Rate not found'));
        });

        expect(result.current.currentRate).toBe(0);
        expect(result.current.amountSendStr).toBe('0');
        expect(result.current.rateText).toBe('Rate unavailable');
        expect(result.current.isRateAvailable).toBe(false);
    });

    it('should update transactionType', () => {
        const { result } = renderHook(() => useExchangeLogic());

        act(() => {
            result.current.setTransactionType('sell');
        });

        expect(result.current.transactionType).toBe('sell');
    });
});
