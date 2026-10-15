import { render } from '@testing-library/react-native';
import React from 'react';
import HospitalBankDetailsStep from '../components/transaction-flow/HospitalBankDetailsStep';

describe('HospitalBankDetailsStep', () => {
    const defaultProps = {
        control: {},
        watch: jest.fn(),
        setValue: jest.fn(),
        errors: {},
    };

    it('renders the title', () => {
        const { getByText } = render(<HospitalBankDetailsStep {...defaultProps} />);
        expect(getByText('Where would you like to send the fund to?')).toBeTruthy();
    });

    it('renders all ControlledInput mocks', () => {
        const { getAllByText } = render(<HospitalBankDetailsStep {...defaultProps} />);
        const inputs = getAllByText(/ControlledInput/);
        expect(inputs.length).toBe(17);
    });
});