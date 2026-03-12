import { render } from '@testing-library/react-native';
import React from 'react';
import ExchangeStep from '../components/transaction-flow/ExchangeStep';

describe('ExchangeStep', () => {
    const defaultProps = {
        transactionType: 'buy' as const,
        onTransactionTypeChange: jest.fn(),
        currencyGet: { code: 'USD', country: 'USA', currencyName: 'Dollar', flagUrl: '' },
        onCurrencyGetChange: jest.fn(),
        currencySend: { code: 'NGN', country: 'Nigeria', currencyName: 'Naira', flagUrl: '' },
        onCurrencySendChange: jest.fn(),
        amountGet: '100',
        amountSend: '150000',
        rate: '1 USD = 1500 NGN',
    };

    it('renders the section title', () => {
        const { getByText } = render(<ExchangeStep {...defaultProps} />);
        expect(getByText('How much do you want exchange?')).toBeTruthy();
    });

    it('renders the CurrencyConverter mock', () => {
        const { getByText } = render(<ExchangeStep {...defaultProps} />);
        expect(getByText('CurrencyConverter')).toBeTruthy();
    });
});
