import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PassportVerificationScreen from '../app/(auth)/passport-verification';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVerifyPassportMutation } from '../hooks/queries/auth/useVerifyPassportMutation';
import { useVerifyExpatriatePassportMutation } from '../hooks/queries/auth/useVerifyExpatriatePassportMutation';
import { useUploadPassportMutation } from '../hooks/queries/auth/useUploadPassportMutation';
import { useAuthStore } from '../stores/useAuthStore';
import * as DocumentPicker from 'expo-document-picker';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({
    getDocumentAsync: jest.fn(),
}));

jest.mock('../components/ControlledInput', () => {
    const { View, Text, TextInput } = require('react-native');
    const { Controller } = require('react-hook-form');
    return ({ label, placeholder, name, control }: any) => (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }: any) => (
                <View>
                    <Text>{label}</Text>
                    <TextInput
                        placeholder={placeholder}
                        value={value}
                        onChangeText={onChange}
                        testID={`input-${name}`}
                    />
                    {error && <Text>{error.message}</Text>}
                </View>
            )}
        />
    );
});

jest.mock('../components/FileUpload', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return ({ onUpload, fileName }: any) => (
        <TouchableOpacity testID="file-upload" onPress={onUpload}>
            <Text>{fileName || 'Upload or change here.'}</Text>
        </TouchableOpacity>
    );
});

jest.mock('@/hooks/queries/auth/useVerifyPassportMutation');
jest.mock('@/hooks/queries/auth/useVerifyExpatriatePassportMutation');
jest.mock('@/hooks/queries/auth/useUploadPassportMutation');
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

describe('PassportVerificationScreen', () => {
    const mockPush = jest.fn();
    const mockVerifyPassport = jest.fn();
    const mockVerifyExpatriatePassport = jest.fn();
    const mockUploadPassport = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });

        (useVerifyPassportMutation as jest.Mock).mockReturnValue({
            mutate: mockVerifyPassport,
            isPending: false,
        });

        (useVerifyExpatriatePassportMutation as jest.Mock).mockReturnValue({
            mutate: mockVerifyExpatriatePassport,
            isPending: false,
        });

        (useUploadPassportMutation as jest.Mock).mockReturnValue({
            mutate: mockUploadPassport,
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

    describe('Tourist Flow', () => {
        beforeEach(() => {
            (useLocalSearchParams as jest.Mock).mockReturnValue({ userType: 'tourist' });
        });

        it('should render title header, subtitle, and fields for tourist', () => {
            const { getByText, getByPlaceholderText } = render(<PassportVerificationScreen />, { wrapper });

            expect(getByText('Upload Passport.')).toBeTruthy();
            expect(getByText('Verify Your Identity')).toBeTruthy();
            expect(getByText('We require your international passport to confirm your identity as a tourist')).toBeTruthy();
            expect(getByPlaceholderText('Enter first name')).toBeTruthy();
            expect(getByPlaceholderText('Enter last name')).toBeTruthy();
            expect(getByPlaceholderText('Enter passport number')).toBeTruthy();
            expect(getByText(/Upload International Passport/)).toBeTruthy();
        });

        it('should call verifyPassport on valid tourist form submit with document', async () => {
            (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
                canceled: false,
                assets: [
                    {
                        uri: 'file://test/tourist-passport.jpg',
                        name: 'tourist-passport.jpg',
                        mimeType: 'image/jpeg',
                        size: 1024,
                    },
                ],
            });

            mockUploadPassport.mockImplementation((formData, { onSuccess }) => {
                onSuccess({
                    success: true,
                    data: {
                        passportDocumentUrl: 'https://res.cloudinary.com/demo/image/upload/passport/tourist.jpg',
                    },
                });
            });

            mockVerifyPassport.mockImplementation((payload, { onSuccess }) => {
                onSuccess({
                    success: true,
                    data: {
                        verificationToken: 'tourist-token-123',
                        firstName: 'John',
                        lastName: 'Doe',
                        phoneNumber: '+1234567890',
                        email: 'john@example.com',
                    },
                });
            });

            const { getByPlaceholderText, getByText, getByTestId, getByRole } = render(<PassportVerificationScreen />, { wrapper });

            fireEvent.changeText(getByPlaceholderText('Enter first name'), 'John');
            fireEvent.changeText(getByPlaceholderText('Enter last name'), 'Doe');
            fireEvent.changeText(getByPlaceholderText('Enter passport number'), 'A12345678');

            const uploadButton = getByTestId('file-upload');
            fireEvent.press(uploadButton);

            await waitFor(() => {
                expect(mockUploadPassport).toHaveBeenCalled();
            });

            const submitBtn = getByRole('button', { name: 'Verify Passport' });
            await waitFor(() => {
                expect(submitBtn.props.accessibilityState?.disabled).toBeFalsy();
            });

            fireEvent.press(submitBtn);

            await waitFor(() => {
                expect(mockVerifyPassport).toHaveBeenCalledWith(
                    expect.objectContaining({
                        passportNumber: 'A12345678',
                        firstName: 'John',
                        lastName: 'Doe',
                        passportDocumentUrl: 'https://res.cloudinary.com/demo/image/upload/passport/tourist.jpg',
                    }),
                    expect.any(Object)
                );
                expect(mockPush).toHaveBeenCalledWith({
                    pathname: '/(auth)/bvn-confirmation',
                    params: expect.objectContaining({
                        userType: 'tourist',
                        verificationToken: 'tourist-token-123',
                        firstName: 'John',
                        lastName: 'Doe',
                    }),
                });
            });
        });
    });

    describe('Expatriate Flow', () => {
        beforeEach(() => {
            (useLocalSearchParams as jest.Mock).mockReturnValue({ userType: 'expatriate' });
        });

        it('should render title header, subtitle, and fields for expatriate', () => {
            const { getByText, getByPlaceholderText } = render(<PassportVerificationScreen />, { wrapper });

            expect(getByText('Upload Passport.')).toBeTruthy();
            expect(getByText('Verify Your Identity')).toBeTruthy();
            expect(getByText('We require your international passport to confirm your identity as an expatriate')).toBeTruthy();
            expect(getByPlaceholderText('Enter first name')).toBeTruthy();
            expect(getByPlaceholderText('Enter last name')).toBeTruthy();
            expect(getByPlaceholderText('Enter passport number')).toBeTruthy();
            expect(getByText(/Upload International Passport/)).toBeTruthy();
        });

        it('should handle document picking and submit expatriate passport data', async () => {
            (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
                canceled: false,
                assets: [
                    {
                        uri: 'file://test/passport.jpg',
                        name: 'passport.jpg',
                        mimeType: 'image/jpeg',
                        size: 1024,
                    },
                ],
            });

            mockUploadPassport.mockImplementation((formData, { onSuccess }) => {
                onSuccess({
                    success: true,
                    data: {
                        passportDocumentUrl: 'https://res.cloudinary.com/demo/image/upload/passport/xyz789.jpg',
                    },
                });
            });

            mockVerifyExpatriatePassport.mockImplementation((payload, { onSuccess }) => {
                onSuccess({
                    success: true,
                    data: {
                        verificationToken: 'xyz789abc123',
                        message: 'Passport verified successfully.',
                        firstName: 'Maria',
                        lastName: 'Garcia',
                        dateOfBirth: '1988-05-15',
                        email: 'm***@example.com',
                        phoneNumber: '+34****5678',
                        nationality: 'Spain',
                    },
                });
            });

            const { getByPlaceholderText, getByText, getByTestId } = render(<PassportVerificationScreen />, { wrapper });

            fireEvent.changeText(getByPlaceholderText('Enter first name'), 'Maria');
            fireEvent.changeText(getByPlaceholderText('Enter last name'), 'Garcia');
            fireEvent.changeText(getByPlaceholderText('Enter passport number'), 'ES987654321');

            // Trigger file upload
            const uploadButton = getByTestId('file-upload');
            fireEvent.press(uploadButton);

            await waitFor(() => {
                expect(mockUploadPassport).toHaveBeenCalled();
            });

            // Submit form
            const submitButton = getByText('Verify Passport');
            fireEvent.press(submitButton);

            await waitFor(() => {
                expect(mockVerifyExpatriatePassport).toHaveBeenCalledWith(
                    expect.objectContaining({
                        passportNumber: 'ES987654321',
                        firstName: 'Maria',
                        lastName: 'Garcia',
                        passportDocumentUrl: 'https://res.cloudinary.com/demo/image/upload/passport/xyz789.jpg',
                    }),
                    expect.any(Object)
                );
                expect(mockPush).toHaveBeenCalledWith({
                    pathname: '/(auth)/bvn-confirmation',
                    params: expect.objectContaining({
                        userType: 'expatriate',
                        verificationToken: 'xyz789abc123',
                        firstName: 'Maria',
                        lastName: 'Garcia',
                        flowContext: 'passport',
                    }),
                });
            });
        });
    });
});
