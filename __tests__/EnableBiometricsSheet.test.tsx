import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { EnableBiometricsSheet } from '@/components/EnableBiometricsSheet';

const mockAnimatedBottomSheet = jest.fn(({ children }: { children: React.ReactNode }) => <>{children}</>);

jest.mock('@/components/ui/AnimatedBottomSheet', () => ({
    __esModule: true,
    default: (props: any) => mockAnimatedBottomSheet(props),
}));

jest.mock('@/context/ThemeContext', () => ({
    useAppTheme: () => ({
        isDark: false,
        resolvedTheme: 'light',
        colors: {
            surface: '#FFFFFF',
            surfaceHighlight: '#F1F5F9',
            border: '#E2E8F0',
            text: '#0F172A',
            textMuted: '#64748B',
            textSecondary: '#475569',
            primary: '#FF6813',
            primarySoft: '#FFF7ED',
            inputBackground: '#FFFFFF',
            inputBorder: '#E2E8F0',
            inputDisabledBackground: '#F1F5F9',
            inputDisabledBorder: '#E2E8F0',
            placeholder: '#94A3B8',
            iconMuted: '#64748B',
        },
    }),
}));

jest.mock('@/hooks/useDevicePose', () => ({
    useResponsiveInputHeight: () => 48,
}));

jest.mock('@/stores/useAuthStore', () => ({
    useAuthStore: (selector: any) =>
        selector({
            user: { email: 'user@example.com' },
            setBiometricEnabled: jest.fn(),
            setBiometricType: jest.fn(),
            checkCredentials: jest.fn(),
        }),
}));

jest.mock('@/stores/useToastStore', () => ({
    useToastStore: (selector: any) => selector({ showToast: jest.fn() }),
}));

jest.mock('@/services/auth', () => ({
    loginUser: jest.fn(),
}));

jest.mock('@/utils/biometrics', () => ({
    authenticateWithBiometrics: jest.fn(),
    getBiometricCapabilities: jest.fn(),
    saveCredentials: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
    Fingerprint: () => null,
    ScanFaceIcon: () => null,
}));

jest.mock('iconsax-react-nativejs', () => ({
    Eye: () => null,
    EyeSlash: () => null,
    Lock: () => null,
}));

describe('EnableBiometricsSheet', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('enables keyboard avoidance on AnimatedBottomSheet', () => {
        render(
            <EnableBiometricsSheet
                visible
                onClose={jest.fn()}
                biometricTitle="Face ID"
                biometricType="face"
            />
        );

        expect(mockAnimatedBottomSheet).toHaveBeenCalledWith(
            expect.objectContaining({
                visible: true,
                avoidKeyboard: true,
            })
        );
    });

    it('updates password input and toggles Confirm & Enable button state', () => {
        const { getByPlaceholderText, getByText } = render(
            <EnableBiometricsSheet
                visible
                onClose={jest.fn()}
                biometricTitle="Face ID"
                biometricType="face"
            />
        );

        const input = getByPlaceholderText('Enter your password');
        expect(input.props.value).toBe('');

        fireEvent.changeText(input, 'MySecret123');
        expect(getByPlaceholderText('Enter your password').props.value).toBe('MySecret123');
        expect(getByText('Confirm & Enable')).toBeTruthy();
    });
});
