import { render } from '@testing-library/react-native';
import React from 'react';
import BankDetailsStep from '../components/transaction-flow/BankDetailsStep';

describe('BankDetailsStep', () => {
    const defaultProps = {
        control: {},
    };

    it('renders the title', () => {
        const { getByText } = render(<BankDetailsStep {...defaultProps} />);
        expect(getByText('Where would you like to send the fund to?')).toBeTruthy();
    });

    it('renders all ControlledInput mocks', () => {
        const { getAllByText } = render(<BankDetailsStep {...defaultProps} />);
        const inputs = getAllByText(/ControlledInput/);
        expect(inputs.length).toBe(4);
    });
});
