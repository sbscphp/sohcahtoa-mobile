import { render, fireEvent } from '@testing-library/react-native';
import BvnVerificationScreen from '../app/(auth)/bvn-verification';
import { useRouter } from 'expo-router';
import { useVerifyBvnMutation } from '../hooks/queries/auth/useVerifyBvnMutation';
import { useSendOtpMutation } from '../hooks/queries/auth/useSendOtpMutation';
import { useAuthStore } from '../stores/useAuthStore';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: () => ({ userType: 'citizen' }),
}));

jest.mock('@/hooks/queries/auth/useVerifyBvnMutation');
jest.mock('@/hooks/queries/auth/useSendOtpMutation');
jest.mock('@/stores/useAuthStore');
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaView: ({ children }: any) => <>{children}</>,
}));

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('BvnVerificationScreen', () => {
    const mockPush = jest.fn();
    const mockVerifyBvn = jest.fn();
    const mockSendOtp = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });

        (useVerifyBvnMutation as jest.Mock).mockReturnValue({
            mutate: mockVerifyBvn,
            isPending: false,
        });

        (useSendOtpMutation as jest.Mock).mockReturnValue({
            mutate: mockSendOtp,
            isPending: false,
        });

        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => selector({
            verificationToken: 'test-token',
            setTempUserInfo: jest.fn(),
        }));
    });

    it('should render all signup fields including Date of Birth and Phone Number', () => {
        const { getByText, getByPlaceholderText } = render(<BvnVerificationScreen />, { wrapper });

        expect(getByText('Enter your Bank verification Number (BVN)')).toBeTruthy();
        expect(getByPlaceholderText('Enter your first name')).toBeTruthy();
        expect(getByPlaceholderText('Enter your last name')).toBeTruthy();
        expect(getByPlaceholderText('Enter your email address')).toBeTruthy();
        expect(getByPlaceholderText('Enter your phone number')).toBeTruthy();
        expect(getByText(/Date of Birth/)).toBeTruthy();
        expect(getByPlaceholderText('Enter your BVN')).toBeTruthy();
    });

    it('should update phone number when user types in phone field', () => {
        const { getByPlaceholderText } = render(<BvnVerificationScreen />, { wrapper });

        const phoneInput = getByPlaceholderText('Enter your phone number');
        fireEvent.changeText(phoneInput, '08012345678');

        expect(phoneInput.props.value).toBe('08012345678');
    });
});
