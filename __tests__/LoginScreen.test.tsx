import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../app/(auth)/login';
import { useRouter } from 'expo-router';
import { useLoginMutation } from '@/hooks/queries/auth/useLoginMutation';
import { useAuthStore } from '@/stores/useAuthStore';
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
jest.mock('iconsax-react-nativejs', () => ({
    Lock: () => null,
    Sms: () => null,
}));
jest.mock('lucide-react-native', () => ({
    ScanFaceIcon: () => null,
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

        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => selector({
            user: null
        }));
    });

    it('should render the login form correctly', () => {
        const { getByText, getByPlaceholderText } = render(<LoginScreen />, { wrapper });

        expect(getByText('Welcome to SohCahToa BDC')).toBeTruthy();
        expect(getByPlaceholderText('Enter your email address')).toBeTruthy();
        expect(getByPlaceholderText('Enter your password')).toBeTruthy();
        expect(getByText('Login')).toBeTruthy();
    });

    it('should show validation errors for invalid input', async () => {
        const { getByPlaceholderText, findByText } = render(<LoginScreen />, { wrapper });

        const emailInput = getByPlaceholderText('Enter your email address');
        
        fireEvent.changeText(emailInput, 'invalid-email');
        fireEvent(emailInput, 'blur');

        expect(await findByText('Invalid email address')).toBeTruthy();
    });

    it('should call login mutation on valid form submission', async () => {
        const { getByText, getByPlaceholderText } = render(<LoginScreen />, { wrapper });

        fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Enter your password'), 'Password123!');
        
        const loginButton = getByText('Login');
        fireEvent.press(loginButton);

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'test@example.com',
                    password: 'Password123!',
                }),
                expect.any(Object)
            );
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

        const forgotPasswordButton = getByText('Forget Password ?');
        fireEvent.press(forgotPasswordButton);

        expect(mockPush).toHaveBeenCalledWith('/(auth)/forget-password');
    });
});
