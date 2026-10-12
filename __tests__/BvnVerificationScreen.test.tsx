import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BvnVerificationScreen from '../app/(auth)/bvn-verification';
import { useRouter } from 'expo-router';
import { useVerifyBvnMutation } from '../hooks/queries/auth/useVerifyBvnMutation';
import { useSendOtpMutation } from '../hooks/queries/auth/useSendOtpMutation';
import { useInitiateIgreeMutation } from '../hooks/queries/auth/useInitiateIgreeMutation';
import { useIgreeCallbackMutation } from '../hooks/queries/auth/useIgreeCallbackMutation';
import { useRetrieveIgreeMutation } from '../hooks/queries/auth/useRetrieveIgreeMutation';
import { useAuthStore } from '../stores/useAuthStore';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: () => ({ userType: 'citizen' }),
}));

jest.mock('expo-web-browser', () => ({
    maybeCompleteAuthSession: jest.fn(),
    openAuthSessionAsync: jest.fn(),
}));

jest.mock('expo-linking', () => ({
    createURL: jest.fn((path) => `sohcahtoa://${path}`),
    parse: jest.fn((url) => ({ queryParams: { code: 'test-code', state: 'test-state' } })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('../components/NibssIgreeWebViewModal', () => {
    const { TouchableOpacity, Text, View } = require('react-native');
    return ({ isVisible, onConsentCaptured, onClose }: any) => {
        if (!isVisible) return null;
        return (
            <View testID="nibss-webview-modal">
                <TouchableOpacity
                    testID="nibss-consent-trigger"
                    onPress={() => onConsentCaptured && onConsentCaptured('test-code', 'test-state')}
                >
                    <Text>Simulate Consent</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="nibss-close-trigger" onPress={onClose}>
                    <Text>Close Modal</Text>
                </TouchableOpacity>
            </View>
        );
    };
});

jest.mock('../components/DatePickerField', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return ({ label, onDateChange, value }: any) => (
        <TouchableOpacity testID="date-picker-field" onPress={() => onDateChange && onDateChange('01/01/1990')}>
            <Text>{value || label}</Text>
        </TouchableOpacity>
    );
});

jest.mock('@/hooks/queries/auth/useVerifyBvnMutation');
jest.mock('@/hooks/queries/auth/useSendOtpMutation');
jest.mock('@/hooks/queries/auth/useInitiateIgreeMutation');
jest.mock('@/hooks/queries/auth/useIgreeCallbackMutation');
jest.mock('@/hooks/queries/auth/useRetrieveIgreeMutation');
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
    const mockInitiateIgree = jest.fn();
    const mockSubmitCallback = jest.fn();
    const mockRetrieveIgree = jest.fn();
    const mockRetrieveIgreeAsync = jest.fn();

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

        (useInitiateIgreeMutation as jest.Mock).mockReturnValue({
            mutate: mockInitiateIgree,
            isPending: false,
        });

        (useIgreeCallbackMutation as jest.Mock).mockReturnValue({
            mutateAsync: mockSubmitCallback,
            isPending: false,
        });

        (useRetrieveIgreeMutation as jest.Mock).mockReturnValue({
            mutate: mockRetrieveIgree,
            mutateAsync: mockRetrieveIgreeAsync,
            isPending: false,
        });

        const mockAuthState = {
            verificationToken: 'test-token',
            setVerificationToken: jest.fn(),
            setTempUserInfo: jest.fn(),
        };

        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
            if (typeof selector === 'function') return selector(mockAuthState);
            return mockAuthState;
        });
        (useAuthStore as any).getState = jest.fn(() => mockAuthState);
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

    it('should render the BVN helper hint text', () => {
        const { getByText } = render(<BvnVerificationScreen />, { wrapper });

        expect(getByText(/If you can't remember, please dial/)).toBeTruthy();
        expect(getByText('*565*0#')).toBeTruthy();
        expect(getByText(/with your registered SIM to get started\./)).toBeTruthy();
    });

    it('should call initiateIgree with formatted fields on valid form submission for citizen', async () => {
        const { getByPlaceholderText, getByText, getByTestId } = render(<BvnVerificationScreen />, { wrapper });

        fireEvent.changeText(getByPlaceholderText('Enter your first name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Enter your last name'), 'Smith');
        fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'john@example.com');
        fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '08012345678');
        fireEvent.changeText(getByPlaceholderText('Enter your BVN'), '22222222248');

        const dobField = getByTestId('date-picker-field');
        fireEvent.press(dobField);

        const continueButton = getByText('Continue');
        fireEvent.press(continueButton);

        await waitFor(() => {
            expect(mockInitiateIgree).toHaveBeenCalledWith(
                expect.objectContaining({
                    firstName: 'John',
                    lastName: 'Smith',
                    email: 'john@example.com',
                    phoneNumber: '+2348012345678',
                    bvn: '22222222248',
                }),
                expect.any(Object)
            );
        });
    });

    it('should submit callback first, retrieve customer data, and navigate to bvn-confirmation on COMPLETED', async () => {
        mockInitiateIgree.mockImplementation((payload, { onSuccess }) => {
            onSuccess({
                success: true,
                data: {
                    state: 'a1b2c3d4e5f6',
                    authUrl: 'https://idsandbox.nibss-plc.com.ng/oxauth/restv1/authorize?...',
                    message: 'iGree consent initiated. Please authenticate to continue.',
                },
            });
        });

        mockSubmitCallback.mockResolvedValue({
            success: true,
            message: 'Consent received',
        });

        mockRetrieveIgreeAsync.mockResolvedValue({
            success: true,
            data: {
                status: 'COMPLETED',
                verificationToken: 'verified-jwt-token-123',
                customer: {
                    firstName: 'Chinedu',
                    lastName: 'Okafor',
                    middleName: 'Y',
                    dateOfBirth: '1990-05-15',
                    gender: 'Male',
                    nationality: 'Nigeria',
                    stateOfOrigin: 'Jigawa',
                    lgaOfOrigin: 'Garki',
                    nin: '*******2758',
                    email: 'ch***@example.com',
                    phoneNumber: '*******5678',
                    bvn: '*******8901',
                },
                message: 'Retrieved successfully',
            },
        });

        const { getByPlaceholderText, getByText, getByTestId } = render(<BvnVerificationScreen />, { wrapper });

        fireEvent.changeText(getByPlaceholderText('Enter your first name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Enter your last name'), 'Smith');
        fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'john@example.com');
        fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '08012345678');
        fireEvent.changeText(getByPlaceholderText('Enter your BVN'), '22222222248');

        fireEvent.press(getByTestId('date-picker-field'));
        fireEvent.press(getByText('Continue'));

        await waitFor(() => {
            expect(getByTestId('nibss-webview-modal')).toBeTruthy();
        });

        // Simulate successful consent capture from intercepted redirect URL
        fireEvent.press(getByTestId('nibss-consent-trigger'));

        await waitFor(() => {
            expect(mockSubmitCallback).toHaveBeenCalledWith({
                code: 'test-code',
                state: 'test-state',
            });
            expect(mockRetrieveIgreeAsync).toHaveBeenCalledWith({
                sessionId: 'test-state',
            });
            expect(mockPush).toHaveBeenCalledWith({
                pathname: '/(auth)/bvn-confirmation',
                params: expect.objectContaining({
                    userType: 'citizen',
                    verificationToken: 'verified-jwt-token-123',
                    firstName: 'Chinedu',
                    lastName: 'Okafor',
                }),
            });
        });
    });

    it('should NOT poll retrieve if user dismisses WebView modal without redirect, and show consent sheet', async () => {
        mockInitiateIgree.mockImplementation((payload, { onSuccess }) => {
            onSuccess({
                success: true,
                data: {
                    state: 'a1b2c3d4e5f6',
                    authUrl: 'https://idsandbox.nibss-plc.com.ng/oxauth/restv1/authorize?...',
                    message: 'iGree consent initiated',
                },
            });
        });

        const { getByPlaceholderText, getByText, getByTestId } = render(<BvnVerificationScreen />, { wrapper });

        fireEvent.changeText(getByPlaceholderText('Enter your first name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Enter your last name'), 'Smith');
        fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'john@example.com');
        fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '08012345678');
        fireEvent.changeText(getByPlaceholderText('Enter your BVN'), '22222222248');

        fireEvent.press(getByTestId('date-picker-field'));
        fireEvent.press(getByText('Continue'));

        await waitFor(() => {
            expect(getByTestId('nibss-webview-modal')).toBeTruthy();
        });

        // User closes the modal before consent redirect
        fireEvent.press(getByTestId('nibss-close-trigger'));

        await waitFor(() => {
            expect(mockRetrieveIgreeAsync).not.toHaveBeenCalled();
            expect(getByText('Consent Verification')).toBeTruthy();
            expect(getByText('Check Verification Status')).toBeTruthy();
        });
    });

    it('should show error toast and stop polling when retrieve status is FAILED', async () => {
        mockInitiateIgree.mockImplementation((payload, { onSuccess }) => {
            onSuccess({
                success: true,
                data: {
                    state: 'a1b2c3d4e5f6',
                    authUrl: 'https://idsandbox.nibss-plc.com.ng/oxauth/restv1/authorize?...',
                    message: 'iGree consent initiated',
                },
            });
        });

        mockSubmitCallback.mockResolvedValue({
            success: true,
            message: 'Consent received',
        });

        mockRetrieveIgreeAsync.mockResolvedValue({
            success: false,
            data: {
                status: 'FAILED',
                message: 'Consent denied or mismatch',
            },
        });

        const { getByPlaceholderText, getByText, getByTestId } = render(<BvnVerificationScreen />, { wrapper });

        fireEvent.changeText(getByPlaceholderText('Enter your first name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Enter your last name'), 'Smith');
        fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'john@example.com');
        fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '08012345678');
        fireEvent.changeText(getByPlaceholderText('Enter your BVN'), '22222222248');

        fireEvent.press(getByTestId('date-picker-field'));
        fireEvent.press(getByText('Continue'));

        await waitFor(() => {
            expect(getByTestId('nibss-webview-modal')).toBeTruthy();
        });

        fireEvent.press(getByTestId('nibss-consent-trigger'));

        await waitFor(() => {
            expect(mockSubmitCallback).toHaveBeenCalled();
            expect(mockRetrieveIgreeAsync).toHaveBeenCalled();
            // Should not navigate to bvn-confirmation
            expect(mockPush).not.toHaveBeenCalledWith(
                expect.objectContaining({ pathname: '/(auth)/bvn-confirmation' })
            );
        });
    });
});
