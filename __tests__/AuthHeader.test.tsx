import { render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import AuthHeader from '../components/AuthHeader';

// Unmock the component so we can test the real implementation
jest.unmock('../components/AuthHeader');

// Mock useRouter
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

describe('AuthHeader', () => {
    const mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
        back: mockBack,
    });

    it('renders the title correctly', () => {
        const { getByText } = render(<AuthHeader title="Welcome Back" />);
        expect(getByText('Welcome Back')).toBeTruthy();
    });

    it('renders the back button by default', () => {
        const { getByLabelText } = render(<AuthHeader title="Title" />);
        expect(getByLabelText('Go back')).toBeTruthy();
    });

    it('hides the back button when showBackButton is false', () => {
        const { queryByLabelText } = render(<AuthHeader title="Title" showBackButton={false} />);
        expect(queryByLabelText('Go back')).toBeNull();
    });
});
