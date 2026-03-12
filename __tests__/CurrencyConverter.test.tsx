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
});
