import { render } from '@testing-library/react-native';
import React from 'react';
import MedicalBankDetailsStep from '../components/transaction-flow/MedicalBankDetailsStep';

describe('MedicalBankDetailsStep', () => {
    const defaultProps = {
        control: {},
    };

    it('renders the title', () => {
        const { getByText } = render(<MedicalBankDetailsStep {...defaultProps} />);
        expect(getByText('Where would you like to send the fund to?')).toBeTruthy();
    });

    it('renders all ControlledInput mocks', () => {
        const { getAllByText } = render(<MedicalBankDetailsStep {...defaultProps} />);
        const inputs = getAllByText(/ControlledInput/);
        expect(inputs.length).toBe(8);
    });
});
