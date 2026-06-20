import { render } from '@testing-library/react-native';
import React from 'react';
import TransactionDetailsView from '../components/transaction-flow/TransactionDetailsView';

describe('TransactionDetailsView', () => {
    const defaultProps = {
        details: [
            { label: 'Amount', value: '₦ 50,000' },
            { label: 'Status', value: 'Pending' },
        ],
        documents: [
            { label: 'Passport', fileName: 'my_passport_long_name_example.pdf' },
            { label: 'ID Card', value: 'ID-12345' },
        ],
    };

    it('renders transaction details correctly', () => {
        const { getByText } = render(<TransactionDetailsView {...defaultProps} />);

        expect(getByText('Amount')).toBeTruthy();
        expect(getByText('₦ 50,000')).toBeTruthy();
        expect(getByText('Status')).toBeTruthy();
        expect(getByText('Pending')).toBeTruthy();
    });

    it('renders documents with values correctly', () => {
        const { getByText } = render(<TransactionDetailsView {...defaultProps} />);

        expect(getByText('ID Card')).toBeTruthy();
        expect(getByText('ID-12345')).toBeTruthy();
    });

    it('renders documents with file names and truncates them', () => {
        const { getByText } = render(<TransactionDetailsView {...defaultProps} />);

        expect(getByText('Passport')).toBeTruthy();
        // "my_passport_long_name_example.pdf" (33 chars)
        // truncateFileName(name, 18)
        // ext = pdf (3)
        // base = my_passport_long_name_example (29)
        // keep = 18 - 3 - 8 = 7
        // return base(0, 7) + "..." + ext = "my_pass..." + "pdf" = "my_pass...pdf"
        expect(getByText('my_pass...pdf')).toBeTruthy();
    });

    it('renders section headers correctly', () => {
        const { getByText } = render(<TransactionDetailsView {...defaultProps} />);

        expect(getByText('Transaction Details')).toBeTruthy();
        expect(getByText('Required Document')).toBeTruthy();
    });

    it('renders secondary values when provided', () => {
        const props = {
            ...defaultProps,
            details: [{ label: 'Source', value: 'Bank Transfer', secondaryValue: 'Access Bank' }],
        };
        const { getByText } = render(<TransactionDetailsView {...props} />);

        expect(getByText('Bank Transfer')).toBeTruthy();
        expect(getByText('Access Bank')).toBeTruthy();
    });

    it('injects and renders currentStep and status badges', () => {
        const props = {
            ...defaultProps,
            currentStep: 'DEPOSIT_CONFIRMATION',
        };
        const { getByText } = render(<TransactionDetailsView {...props} />);

        expect(getByText('Current Step')).toBeTruthy();
        expect(getByText('Deposit Confirmation')).toBeTruthy();
    });
});
