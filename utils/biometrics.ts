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

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/**
 * Securely stores user credentials for biometric login in device KeyStore/Keychain.
 * Configured with WHEN_UNLOCKED_THIS_DEVICE_ONLY so credentials cannot be migrated
 * to new devices via backups or accessed when device is locked.
 */
export const saveCredentials = async (email: string, password: string): Promise<boolean> => {
    try {
        if (!email || !password) {
            return false;
        }
        await SecureStore.setItemAsync(SECURE_STORE_KEYS.EMAIL, email, SECURE_STORE_OPTIONS);
        await SecureStore.setItemAsync(SECURE_STORE_KEYS.PASSWORD, password, SECURE_STORE_OPTIONS);
        return true;
    } catch (error) {
        console.error('Error saving credentials to SecureStore:', error);
        return false;
    }
};

/**
 * Checks whether credentials exist in SecureStore without decrypting or exposing the password.
 */
export const hasStoredCredentials = async (): Promise<boolean> => {
    try {
        const email = await SecureStore.getItemAsync(SECURE_STORE_KEYS.EMAIL, SECURE_STORE_OPTIONS);
        if (email) return true;
        const creds = await getStoredCredentials();
        return !!creds?.email;
    } catch {
        return false;
    }
};

/**
 * Retrieves stored credentials for biometric login.
 * Should only be called AFTER successful biometric authentication verification.
 */
export const getStoredCredentials = async (): Promise<{ email: string; password: string } | null> => {
    try {
        const email = await SecureStore.getItemAsync(SECURE_STORE_KEYS.EMAIL, SECURE_STORE_OPTIONS);
        const password = await SecureStore.getItemAsync(SECURE_STORE_KEYS.PASSWORD, SECURE_STORE_OPTIONS);
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
 * Clears stored credentials from Keychain/KeyStore.
 */
export const clearStoredCredentials = async (): Promise<boolean> => {
    try {
        await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.EMAIL, SECURE_STORE_OPTIONS);
        await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.PASSWORD, SECURE_STORE_OPTIONS);
        return true;
    } catch (error) {
        console.error('Error clearing credentials from SecureStore:', error);
        return false;
    }
};
