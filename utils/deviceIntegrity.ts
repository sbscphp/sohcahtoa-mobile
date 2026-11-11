import * as Device from 'expo-device';
import { NativeModules, Platform } from 'react-native';

export type SecurityCompromiseType = 'root' | 'jailbreak' | 'usb_debugging';

export interface DeviceIntegrityResult {
    isCompromised: boolean;
    type?: SecurityCompromiseType;
    reason?: string;
}

const { SecurityBridge } = NativeModules;

/**
 * Checks if Android USB debugging (ADB) is enabled via the native bridge.
 */
export const isUsbDebuggingActive = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
        return false;
    }

    if (!SecurityBridge || typeof SecurityBridge.isUsbDebuggingEnabled !== 'function') {
        return false;
    }

    try {
        return await SecurityBridge.isUsbDebuggingEnabled();
    } catch {
        return false;
    }
};

/**
 * Launches Android Developer Options settings directly so user can turn off USB Debugging.
 */
export const openDeveloperSettings = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
        return false;
    }

    if (!SecurityBridge || typeof SecurityBridge.openDevelopmentSettings !== 'function') {
        return false;
    }

    try {
        return await SecurityBridge.openDevelopmentSettings();
    } catch {
        return false;
    }
};

/**
 * Comprehensive device security and integrity assessment.
 * Checks for:
 * 1. Rooted Android / Jailbroken iOS devices (OWASP MASVS-RESILIENCE).
 * 2. Active USB Debugging / ADB on Android.
 *
 * For developer experience, USB Debugging checks run in release builds (!__DEV__),
 * or when explicitly forced via EXPO_PUBLIC_ENFORCE_USB_DEBUGGING=true.
 */
export const checkDeviceIntegrity = async (): Promise<DeviceIntegrityResult> => {
    // 1. Root / Jailbreak check
    try {
        if (Device && typeof Device.isRootedExperimentalAsync === 'function') {
            const isRooted = await Device.isRootedExperimentalAsync();
            if (isRooted) {
                return {
                    isCompromised: true,
                    type: Platform.OS === 'ios' ? 'jailbreak' : 'root',
                    reason: Platform.OS === 'ios'
                        ? 'Jailbroken iOS device detected.'
                        : 'Rooted Android device detected.',
                };
            }
        }
    } catch {
        // Continue to other checks if root check fails
    }

    // 2. Android USB Debugging check
    const shouldCheckUsb =
        Platform.OS === 'android' &&
        (!__DEV__ || process.env.EXPO_PUBLIC_ENFORCE_USB_DEBUGGING === 'true');

    if (shouldCheckUsb) {
        try {
            const isAdbOn = await isUsbDebuggingActive();
            if (isAdbOn) {
                return {
                    isCompromised: true,
                    type: 'usb_debugging',
                    reason: 'USB Debugging (ADB) is enabled on this Android device.',
                };
            }
        } catch {
            // Ignore error and proceed
        }
    }

    return { isCompromised: false };
};
