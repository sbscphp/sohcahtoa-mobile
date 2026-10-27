import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import CurrencyConverter from '../components/CurrencyConverter';

// Unmock the component
jest.unmock('../components/CurrencyConverter');

const mockCurrency = {
    code: 'USD',
    country: 'United States',
    currencyName: 'US Dollar',
    flagUrl: 'https://example.com/flag.png',
};

const mockNGN = {
    code: 'NGN',
    country: 'Nigeria',
    currencyName: 'Naira',
    flagUrl: 'https://example.com/ng-flag.png',
};

describe('CurrencyConverter', () => {
    const defaultProps = {
        transactionType: 'buy' as const,
        onTransactionTypeChange: jest.fn(),
        currencyGet: mockCurrency,
        onCurrencyGetChange: jest.fn(),
        currencySend: mockNGN,
        onCurrencySendChange: jest.fn(),
        amountGet: '1,000',
        amountSend: '1,500,000',
        rate: '1 USD = 1,500 NGN',
    };

    it('renders initial amounts and currencies', () => {
        const { getByText, getByDisplayValue } = render(<CurrencyConverter {...defaultProps} />);
        // Use getByDisplayValue for the inputs
        expect(getByDisplayValue('1,000')).toBeTruthy();
        expect(getByDisplayValue('1,500,000')).toBeTruthy();
        expect(getByText('USD')).toBeTruthy();
        expect(getByText('NGN')).toBeTruthy();
    });

    it('calls onTransactionTypeChange when toggle is pressed', () => {
        const { getByText } = render(<CurrencyConverter {...defaultProps} />);
        fireEvent.press(getByText('Sell FX'));
        expect(defaultProps.onTransactionTypeChange).toHaveBeenCalledWith('sell');
    });

    it('calls onAmountGetChange when input is edited', () => {
        const onAmountGetChange = jest.fn();
        const { getByDisplayValue } = render(
            <CurrencyConverter {...defaultProps} onAmountGetChange={onAmountGetChange} />
        );
        fireEvent.changeText(getByDisplayValue('1,000'), '2000');
        expect(onAmountGetChange).toHaveBeenCalledWith('2000');
    });

    it('renders Rate unavailable when rate is not available', () => {
        const { getByText } = render(
            <CurrencyConverter {...defaultProps} rate="Rate unavailable" />
        );
        expect(getByText('Rate unavailable')).toBeTruthy();
    });

    it('renders Buy FX and Sell FX tabs with tab accessibility roles', () => {
        const { getByLabelText } = render(<CurrencyConverter {...defaultProps} />);
        const buyTab = getByLabelText('Buy FX tab');
        const sellTab = getByLabelText('Sell FX tab');

        expect(buyTab).toBeTruthy();
        expect(sellTab).toBeTruthy();
        expect(buyTab.props.accessibilityRole).toBe('tab');
        expect(sellTab.props.accessibilityRole).toBe('tab');
        expect(buyTab.props.accessibilityState).toEqual({ selected: true });
        expect(sellTab.props.accessibilityState).toEqual({ selected: false });
    });
});
