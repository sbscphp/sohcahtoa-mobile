import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const SECURE_STORE_KEYS = {
    EMAIL: 'biometric_email',
    PASSWORD: 'biometric_password',
};

/**
 * Checks if the device supports biometrics and has them enrolled.
 */
export const isBiometricsAvailable = async () => {
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
export const getSupportedAuthenticationTypes = async () => {
    try {
        return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
        console.error('Error getting supported authentication types:', error);
        return [];
    }
};

/**
 * Triggers the biometric prompt.
 */
export const authenticateWithBiometrics = async (promptMessage = 'Confirm your identity') => {
    try {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage,
            fallbackLabel: 'Use Password',
            disableDeviceFallback: false,
        });
        return result.success;
    } catch (error) {
        console.error('Biometric authentication error:', error);
        return false;
    }
};

/**
 * Securely stores user credentials for biometric login.
 */
export const saveCredentials = async (email: string, password: string) => {
    try {
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
export const getStoredCredentials = async () => {
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
export const clearStoredCredentials = async () => {
    try {
        await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.EMAIL);
        await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.PASSWORD);
        return true;
    } catch (error) {
        console.error('Error clearing credentials from SecureStore:', error);
        return false;
    }
};
