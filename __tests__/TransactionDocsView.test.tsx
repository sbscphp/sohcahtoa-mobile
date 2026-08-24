import { render } from '@testing-library/react-native';
import React from 'react';
import TransactionDocsView from '../components/transaction-flow/TransactionDocsView';

describe('TransactionDocsView', () => {
    const defaultProps = {
        status: 'pending' as const,
        documents: [
            { label: 'Passport', fileName: 'passport.pdf', docStatus: 'APPROVED', required: true },
            { label: 'Visa', fileName: 'visa.pdf', docStatus: 'PENDING', required: true },
            { label: 'ID Number', value: '123456789' },
        ],
    };

    it('renders list of documents correctly', () => {
        const { getByText } = render(<TransactionDocsView {...defaultProps} />);

        expect(getByText('Passport *')).toBeTruthy();
        expect(getByText('Visa *')).toBeTruthy();
        expect(getByText('ID Number')).toBeTruthy();
        expect(getByText('123456789')).toBeTruthy();
    });

    it('displays correct status text for documents', () => {
        const { getByText } = render(<TransactionDocsView {...defaultProps} />);

        expect(getByText('Verified')).toBeTruthy();
        expect(getByText('Pending')).toBeTruthy();
    });

    it('displays rejected status correctly', () => {
        const props = {
            ...defaultProps,
            documents: [{ label: 'Passport', fileName: 'passport.pdf', docStatus: 'REJECTED' }],
        };
        const { getByText } = render(<TransactionDocsView {...props} />);

        expect(getByText('Failed')).toBeTruthy();
    });

    it('renders multiple uploads correctly (e.g. Proof of Funds)', () => {
        const props = {
            status: 'pending' as const,
            documents: [
                {
                    label: 'Proof of Funds',
                    required: true,
                    uploads: [
                        { id: '1', fileName: 'funds_statement1.pdf', status: 'VERIFIED' },
                        { id: '2', fileName: 'funds_statement2.pdf', status: 'PENDING' },
                    ],
                },
            ],
        };
        const { getByText } = render(<TransactionDocsView {...props} />);

        expect(getByText('Proof of Funds *')).toBeTruthy();
        expect(getByText(/Proof of Funds 1/)).toBeTruthy();
        expect(getByText(/Proof of Funds 2/)).toBeTruthy();
        expect(getByText('Verified')).toBeTruthy();
        expect(getByText('Pending')).toBeTruthy();
    });
});
