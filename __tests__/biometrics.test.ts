import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import {
    authenticateWithBiometrics,
    clearStoredCredentials,
    getBiometricCapabilities,
    getStoredCredentials,
    getSupportedAuthenticationTypes,
    isBiometricsAvailable,
    saveCredentials,
    SECURE_STORE_KEYS,
} from '../utils/biometrics';

describe('Biometrics Utility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('isBiometricsAvailable', () => {
        it('returns true when hardware is available and enrolled', async () => {
            (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
            (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

            const result = await isBiometricsAvailable();
            expect(result).toBe(true);
        });

        it('returns false when hardware is missing', async () => {
            (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);
            (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

            const result = await isBiometricsAvailable();
            expect(result).toBe(false);
        });

        it('returns false when biometrics are not enrolled', async () => {
            (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
            (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

            const result = await isBiometricsAvailable();
            expect(result).toBe(false);
        });

        it('handles exceptions and returns false', async () => {
            (LocalAuthentication.hasHardwareAsync as jest.Mock).mockRejectedValue(new Error('Hardware check failed'));

            const result = await isBiometricsAvailable();
            expect(result).toBe(false);
        });
    });

    describe('getSupportedAuthenticationTypes', () => {
        it('returns supported authentication types', async () => {
            const types = [
                LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
                LocalAuthentication.AuthenticationType.FINGERPRINT,
            ];
            (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue(types);

            const result = await getSupportedAuthenticationTypes();
            expect(result).toEqual(types);
        });

        it('returns empty array when error occurs', async () => {
            (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockRejectedValue(new Error('Failed'));

            const result = await getSupportedAuthenticationTypes();
            expect(result).toEqual([]);
        });
    });

    describe('getBiometricCapabilities', () => {
        it('identifies Face ID when facial recognition is available', async () => {
            (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
            (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
            (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
                LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
            ]);

            const capabilities = await getBiometricCapabilities();
            expect(capabilities.hasHardware).toBe(true);
            expect(capabilities.isEnrolled).toBe(true);
            expect(capabilities.primaryType).toBe('face');
        });

        it('identifies Fingerprint when fingerprint is available', async () => {
            (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
            (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
            (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
                LocalAuthentication.AuthenticationType.FINGERPRINT,
            ]);

            const capabilities = await getBiometricCapabilities();
            expect(capabilities.hasHardware).toBe(true);
            expect(capabilities.isEnrolled).toBe(true);
            expect(capabilities.primaryType).toBe('fingerprint');
        });

        it('returns empty capabilities when no hardware is present', async () => {
            (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);

            const capabilities = await getBiometricCapabilities();
            expect(capabilities.hasHardware).toBe(false);
            expect(capabilities.isEnrolled).toBe(false);
            expect(capabilities.primaryType).toBeNull();
        });
    });

    describe('authenticateWithBiometrics', () => {
        it('calls authenticateAsync with default prompt and succeeds', async () => {
            (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true });

            const success = await authenticateWithBiometrics();
            expect(success).toBe(true);
            expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    promptMessage: 'Confirm your identity',
                    fallbackLabel: 'Use Password',
                })
            );
        });

        it('supports string argument for promptMessage', async () => {
            (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true });

            const success = await authenticateWithBiometrics('Custom Prompt');
            expect(success).toBe(true);
            expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    promptMessage: 'Custom Prompt',
                })
            );
        });

        it('supports options object', async () => {
            (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true });

            const success = await authenticateWithBiometrics({
                promptMessage: 'Unlock account',
                fallbackLabel: 'Enter PIN',
                disableDeviceFallback: true,
            });
            expect(success).toBe(true);
            expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
                promptMessage: 'Unlock account',
                fallbackLabel: 'Enter PIN',
                cancelLabel: 'Cancel',
                disableDeviceFallback: true,
            });
        });

        it('returns false when authentication is unsuccessful', async () => {
            (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
                success: false,
                error: 'user_cancel',
            });

            const success = await authenticateWithBiometrics();
            expect(success).toBe(false);
        });

        it('catches exception and returns false', async () => {
            (LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue(new Error('Native error'));

            const success = await authenticateWithBiometrics();
            expect(success).toBe(false);
        });
    });

    describe('SecureStore Credential Helpers', () => {
        it('saves credentials to SecureStore', async () => {
            (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

            const saved = await saveCredentials('test@example.com', 'SecurePass123!');
            expect(saved).toBe(true);
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(SECURE_STORE_KEYS.EMAIL, 'test@example.com');
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(SECURE_STORE_KEYS.PASSWORD, 'SecurePass123!');
        });

        it('returns false when saving with empty credentials', async () => {
            const saved = await saveCredentials('', '');
            expect(saved).toBe(false);
            expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
        });

        it('retrieves stored credentials when present', async () => {
            (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
                if (key === SECURE_STORE_KEYS.EMAIL) return Promise.resolve('user@domain.com');
                if (key === SECURE_STORE_KEYS.PASSWORD) return Promise.resolve('Password123');
                return Promise.resolve(null);
            });

            const credentials = await getStoredCredentials();
            expect(credentials).toEqual({
                email: 'user@domain.com',
                password: 'Password123',
            });
        });

        it('returns null when one or both credentials are missing', async () => {
            (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
                if (key === SECURE_STORE_KEYS.EMAIL) return Promise.resolve('user@domain.com');
                return Promise.resolve(null);
            });

            const credentials = await getStoredCredentials();
            expect(credentials).toBeNull();
        });

        it('clears stored credentials', async () => {
            (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

            const cleared = await clearStoredCredentials();
            expect(cleared).toBe(true);
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SECURE_STORE_KEYS.EMAIL);
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SECURE_STORE_KEYS.PASSWORD);
        });
    });
});
