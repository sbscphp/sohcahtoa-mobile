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
                data: [{ sellRate: 1550, buyRate: 1450 }] 
            },
            isLoading: false,
        });
    });

    it('should initialize with default currencies and initial amount', () => {
        const { result } = renderHook(() => useExchangeLogic({ initialAmount: '10' }));

        expect(result.current.currencyGet).toEqual(DEFAULT_GET_CURRENCY);
        expect(result.current.currencySend).toEqual(DEFAULT_SEND_CURRENCY);
        expect(result.current.amountGetStr).toBe('10');
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

    it('should update currencyGet and trigger recalculation', () => {
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
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                fromCurrency: 'EUR',
                toCurrency: DEFAULT_SEND_CURRENCY.code,
            }),
            expect.any(Object)
        );
    });

    it('should update currencySend and trigger recalculation', () => {
        const { result } = renderHook(() => useExchangeLogic());
        const newCurrency = {
            code: 'GBP',
            country: 'United Kingdom',
            currencyName: 'Pound',
            flagUrl: 'https://flagcdn.com/w80/gb.png'
        };

        act(() => {
            result.current.setCurrencySend(newCurrency);
        });

        expect(result.current.currencySend).toEqual(newCurrency);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                fromCurrency: DEFAULT_GET_CURRENCY.code,
                toCurrency: 'GBP',
            }),
            expect.any(Object)
        );
    });

    it('should update transactionType', () => {
        const { result } = renderHook(() => useExchangeLogic());

        act(() => {
            result.current.setTransactionType('sell');
        });

        expect(result.current.transactionType).toBe('sell');
    });
});
