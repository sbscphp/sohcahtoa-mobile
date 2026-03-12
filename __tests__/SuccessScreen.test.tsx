import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import SuccessScreen from '../components/SuccessScreen';

// Unmock the component
jest.unmock('../components/SuccessScreen');

// Mock useRouter
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

describe('SuccessScreen', () => {
    const mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
        back: mockBack,
    });

    const defaultProps = {
        headerTitle: 'Success',
        title: 'Transaction Successful',
        description: 'Your transaction was completed.',
        onViewTransaction: jest.fn(),
        onGoHome: jest.fn(),
    };

    it('renders the title and description correctly', () => {
        const { getByText } = render(<SuccessScreen {...defaultProps} />);
        expect(getByText('Transaction Successful')).toBeTruthy();
        expect(getByText('Your transaction was completed.')).toBeTruthy();
    });

    it('renders the header title', () => {
        const { getByText } = render(<SuccessScreen {...defaultProps} />);
        // Header mock renders the title as is.
        // Use exact match to avoid matching 'Transaction Successful'
        expect(getByText('Success', { exact: true })).toBeTruthy();
    });

    it('calls onViewTransaction when primary button is pressed', () => {
        const { getByText } = render(<SuccessScreen {...defaultProps} />);
        fireEvent.press(getByText('View Transaction'));
        expect(defaultProps.onViewTransaction).toHaveBeenCalled();
    });

    it('calls onGoHome when secondary button is pressed', () => {
        const { getByText } = render(<SuccessScreen {...defaultProps} />);
        fireEvent.press(getByText('Go to Home'));
        expect(defaultProps.onGoHome).toHaveBeenCalled();
    });
});
