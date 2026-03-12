import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import Header from '../components/Header';

// Unmock the component so we can test the real implementation
jest.unmock('../components/Header');

// Mock useRouter
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

describe('Header', () => {
    const mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
        back: mockBack,
    });

    it('renders the title correctly', () => {
        const { getByText } = render(<Header title="Payment Details" />);
        expect(getByText('Payment Details')).toBeTruthy();
    });

    it('calls router.back() when back button is pressed if no onBackPress is provided', () => {
        const { getByLabelText } = render(<Header title="Title" />);
        fireEvent.press(getByLabelText('Go back'));
        expect(mockBack).toHaveBeenCalled();
    });

    it('calls onBackPress when provided and back button is pressed', () => {
        const onBackPress = jest.fn();
        const { getByLabelText } = render(<Header title="Title" onBackPress={onBackPress} />);
        fireEvent.press(getByLabelText('Go back'));
        expect(onBackPress).toHaveBeenCalled();
    });

    it('renders rightIcon when provided', () => {
        const { getByTestId } = render(
            <Header
                title="Title"
                rightIcon={<View testID="custom-icon" />}
            />
        );
        expect(getByTestId('custom-icon')).toBeTruthy();
    });
});
