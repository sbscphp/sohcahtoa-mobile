import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import SourceOfFundsSheet from '../components/SourceOfFundsSheet';
import { getInitials } from '../utils/helpers';

describe('getInitials helper', () => {
    it('returns empty string for empty input', () => {
        expect(getInitials('')).toBe('');
        expect(getInitials(undefined)).toBe('');
    });

    it('returns first letter of first and last name', () => {
        expect(getInitials('Ada Okonkwo')).toBe('AO');
        expect(getInitials('ada okonkwo')).toBe('AO');
    });

    it('handles middle names by taking first letter of first and last word', () => {
        expect(getInitials('Ada Chinedu Okonkwo')).toBe('AO');
    });

    it('handles single name', () => {
        expect(getInitials('Ada')).toBe('AD');
        expect(getInitials('A')).toBe('A');
    });
});

describe('SourceOfFundsSheet', () => {
    const defaultProps = {
        visible: true,
        onClose: jest.fn(),
        onSubmit: jest.fn(),
        customerInfo: {
            fullName: 'Ada Okonkwo',
            phoneNumber: '08012345678',
            email: 'ada@example.com',
            bvn: '12345678901',
            address: '123 Lagos St',
            passportDocumentNumber: 'A12345678',
        },
        transactionDetails: {
            type: 'Sell FX (Resident)',
            currency: 'US Dollar',
            amount: 'USD 500',
            purpose: 'Exchange',
        },
        onUploadSignature: jest.fn(),
    };

    it('auto-fills initials with first and last name first letter when initials is empty', () => {
        const handleChangeInitials = jest.fn();
        render(
            <SourceOfFundsSheet
                {...defaultProps}
                initials=""
                onChangeInitials={handleChangeInitials}
            />
        );

        expect(handleChangeInitials).toHaveBeenCalledWith('AO');
    });

    it('does not overwrite initials if already provided', () => {
        const handleChangeInitials = jest.fn();
        render(
            <SourceOfFundsSheet
                {...defaultProps}
                initials="JD"
                onChangeInitials={handleChangeInitials}
            />
        );

        expect(handleChangeInitials).not.toHaveBeenCalled();
    });

    it('submits with initials method when Use Initials is selected', () => {
        const handleSubmit = jest.fn();
        const { getByText } = render(
            <SourceOfFundsSheet
                {...defaultProps}
                initials="AO"
                onSubmit={handleSubmit}
            />
        );

        const submitBtn = getByText('Submit');
        fireEvent.press(submitBtn);

        expect(handleSubmit).toHaveBeenCalledWith('initials');
    });

    it('submits with signature method when Upload Signature is selected and file is provided', () => {
        const handleSubmit = jest.fn();
        const { getByText } = render(
            <SourceOfFundsSheet
                {...defaultProps}
                signatureFile="my-signature.png"
                onSubmit={handleSubmit}
            />
        );

        const submitBtn = getByText('Submit');
        fireEvent.press(submitBtn);

        expect(handleSubmit).toHaveBeenCalledWith('signature');
    });
});
