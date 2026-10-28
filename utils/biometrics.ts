import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export const SECURE_STORE_KEYS = {
    EMAIL: 'biometric_email',
    PASSWORD: 'biometric_password',
};

export interface BiometricCapabilities {
    hasHardware: boolean;
    isEnrolled: boolean;
    supportedTypes: LocalAuthentication.AuthenticationType[];
    primaryType: 'face' | 'fingerprint' | null;
}

export interface AuthenticateOptions {
    promptMessage?: string;
    fallbackLabel?: string;
    cancelLabel?: string;
    disableDeviceFallback?: boolean;
}

/**
 * Checks if the device supports biometrics and has them enrolled.
 */
export const isBiometricsAvailable = async (): Promise<boolean> => {
    try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return hasHardware && isEnrolled;
    } catch (error) {
        console.error('Error checking biometrics availability:', error);
        return false;
    }
};

/**
 * Returns the supported biometric types.
 */
export const getSupportedAuthenticationTypes = async (): Promise<LocalAuthentication.AuthenticationType[]> => {
    try {
        return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
        console.error('Error getting supported authentication types:', error);
        return [];
    }
};

/**
 * Inspects all biometric capabilities of the device in a single call.
 */
export const getBiometricCapabilities = async (): Promise<BiometricCapabilities> => {
    try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
        const supportedTypes = hasHardware ? await LocalAuthentication.supportedAuthenticationTypesAsync() : [];

        let primaryType: 'face' | 'fingerprint' | null = null;
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            primaryType = 'face';
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            primaryType = 'fingerprint';
        }

        return {
            hasHardware,
            isEnrolled,
            supportedTypes,
            primaryType,
        };
    } catch (error) {
        console.error('Error getting biometric capabilities:', error);
        return {
            hasHardware: false,
            isEnrolled: false,
            supportedTypes: [],
            primaryType: null,
        };
    }
};

/**
 * Triggers the native biometric prompt (Face ID, Touch ID, BiometricPrompt).
 */
export const authenticateWithBiometrics = async (
    optionsOrPrompt: string | AuthenticateOptions = 'Confirm your identity'
): Promise<boolean> => {
    const options: AuthenticateOptions = typeof optionsOrPrompt === 'string'
        ? { promptMessage: optionsOrPrompt }
        : optionsOrPrompt;

    try {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: options.promptMessage || 'Confirm your identity',
            fallbackLabel: options.fallbackLabel ?? 'Use Password',
            cancelLabel: options.cancelLabel ?? 'Cancel',
            disableDeviceFallback: options.disableDeviceFallback ?? false,
        });
        return result.success;
    } catch (error) {
        console.error('Biometric authentication error:', error);
        return false;
    }
};

/**
 * Securely stores user credentials for biometric login in device KeyStore/Keychain.
 */
export const saveCredentials = async (email: string, password: string): Promise<boolean> => {
    try {
        if (!email || !password) {
            return false;
        }
        await SecureStore.setItemAsync(SECURE_STORE_KEYS.EMAIL, email);
        await SecureStore.setItemAsync(SECURE_STORE_KEYS.PASSWORD, password);
        return true;
    } catch (error) {
        console.error('Error saving credentials to SecureStore:', error);
        return false;
    }
};

/**
 * Retrieves stored credentials for biometric login.
 */
export const getStoredCredentials = async (): Promise<{ email: string; password: string } | null> => {
    try {
        const email = await SecureStore.getItemAsync(SECURE_STORE_KEYS.EMAIL);
        const password = await SecureStore.getItemAsync(SECURE_STORE_KEYS.PASSWORD);
        if (email && password) {
            return { email, password };
        }
        return null;
    } catch (error) {
        console.error('Error getting credentials from SecureStore:', error);
        return null;
    }
};

/**
 * Clears stored credentials.
 */
export const clearStoredCredentials = async (): Promise<boolean> => {
    try {
        await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.EMAIL);
        await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.PASSWORD);
        return true;
    } catch (error) {
        console.error('Error clearing credentials from SecureStore:', error);
        return false;
    }
};
