import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../app/(auth)/login';
import { useRouter } from 'expo-router';
import { useLoginMutation } from '../hooks/queries/auth/useLoginMutation';
import { useAuthStore } from '../stores/useAuthStore';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/hooks/queries/auth/useLoginMutation');
jest.mock('@/stores/useAuthStore');
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock icons to avoid rendering issues in tests
jest.mock('lucide-react-native', () => ({
    ScanFaceIcon: () => null,
    Fingerprint: () => null,
}));
jest.mock('../../assets/icons/user-sharing.svg', () => 'UserSharing');

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('LoginScreen', () => {
    const mockReplace = jest.fn();
    const mockPush = jest.fn();
    const mockMutate = jest.fn();
    let mockAuthState: any;

    beforeEach(() => {
        jest.clearAllMocks();

        (useRouter as jest.Mock).mockReturnValue({
            replace: mockReplace,
            push: mockPush,
        });

        (useLoginMutation as jest.Mock).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        });

        mockAuthState = {
            user: null,
            isBiometricEnabled: false,
            biometricType: null,
            setBiometricType: jest.fn(),
            isAuthenticated: false,
            hasCredentials: false,
            checkCredentials: jest.fn().mockResolvedValue(undefined),
            setBiometricEnabled: jest.fn(),
            disableBiometrics: jest.fn().mockResolvedValue(undefined),
        };

        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
            if (typeof selector === 'function') {
                return selector(mockAuthState);
            }
            return mockAuthState;
        });

        (useAuthStore as any).getState = jest.fn(() => mockAuthState);
    });

    it('should render the login form correctly', () => {
        const { getByText, getByPlaceholderText, getByRole } = render(<LoginScreen />, { wrapper });

        expect(getByText('Welcome to SohCahToa BDC')).toBeTruthy();
        expect(getByPlaceholderText('Enter your email address')).toBeTruthy();
        expect(getByPlaceholderText('Enter your password')).toBeTruthy();
        expect(getByRole('button', { name: 'Login' })).toBeTruthy();
    });

    it('should show validation errors for invalid input', async () => {
        const { getByPlaceholderText, findByText } = render(<LoginScreen />, { wrapper });

        const emailInput = getByPlaceholderText('Enter your email address');

        fireEvent.changeText(emailInput, 'invalid-email');
        fireEvent(emailInput, 'blur');

        expect(await findByText('Please enter a valid email address')).toBeTruthy();
    });

    it('should call login mutation on valid form submission', async () => {
        const { getByPlaceholderText, getByRole } = render(<LoginScreen />, { wrapper });

        fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Enter your password'), 'Password123!');

        const loginButton = getByRole('button', { name: 'Login' });
        fireEvent.press(loginButton);

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'Password123!',
            });
        });
    });

    it('should navigate to signup when clicking signup text', () => {
        const { getByText } = render(<LoginScreen />, { wrapper });

        const signUpButton = getByText('Sign Up');
        fireEvent.press(signUpButton);

        expect(mockPush).toHaveBeenCalledWith('/signup');
    });

    it('should navigate to forgot password screen', () => {
        const { getByText } = render(<LoginScreen />, { wrapper });

        const forgotPasswordButton = getByText('Forgot Password ?');
        fireEvent.press(forgotPasswordButton);

        expect(mockPush).toHaveBeenCalledWith('/(auth)/forget-password');
    });

    it('should render the biometric login button', () => {
        const { getByTestId } = render(<LoginScreen />, { wrapper });

        const biometricButton = getByTestId('biometric-login-button');
        expect(biometricButton).toBeTruthy();
    });

    it('should trigger biometric login when credentials exist and user presses biometric button', async () => {
        const biometricsUtil = require('../utils/biometrics');
        jest.spyOn(biometricsUtil, 'getBiometricCapabilities').mockResolvedValue({
            hasHardware: true,
            isEnrolled: true,
            supportedTypes: [2],
            primaryType: 'face',
        });
        jest.spyOn(biometricsUtil, 'authenticateWithBiometrics').mockResolvedValue(true);
        jest.spyOn(biometricsUtil, 'getStoredCredentials').mockResolvedValue({
            email: 'bio@test.com',
            password: 'BioPassword123!',
        });

        mockAuthState.hasCredentials = true;

        const { getByTestId } = render(<LoginScreen />, { wrapper });
        const biometricButton = getByTestId('biometric-login-button');

        await waitFor(() => {
            expect(biometricButton.props.accessibilityState?.disabled).toBe(false);
        });

        fireEvent.press(biometricButton);

        await waitFor(() => {
            expect(biometricsUtil.authenticateWithBiometrics).toHaveBeenCalled();
            expect(mockMutate).toHaveBeenCalledWith({
                email: 'bio@test.com',
                password: 'BioPassword123!',
            });
        });
    });
});
