import { render } from '@testing-library/react-native';
import React from 'react';
import DocumentStep from '../components/transaction-flow/DocumentStep';

describe('DocumentStep', () => {
    const defaultProps = {
        documents: [
            { label: 'Passport', onUpload: jest.fn(), required: true },
            { label: 'Visa', onUpload: jest.fn(), fileName: 'visa.pdf' },
        ],
    };

    it('renders the title', () => {
        const { getByText } = render(<DocumentStep {...defaultProps} />);
        expect(getByText('Upload Relevant Documents')).toBeTruthy();
    });

    it('renders document labels', () => {
        const { getByText } = render(<DocumentStep {...defaultProps} />);
        expect(getByText('Passport *')).toBeTruthy();
        expect(getByText('Visa')).toBeTruthy();
    });

    it('renders FileUpload mocks with correct titles', () => {
        const { getAllByText } = render(<DocumentStep {...defaultProps} />);
        const uploads = getAllByText(/FileUpload Upload or change here./);
        expect(uploads.length).toBe(2);
    });
});
