import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface DeviceIntegrityResult {
    isCompromised: boolean;
    reason?: string;
}

/**
 * Checks whether the current device is rooted (Android) or jailbroken (iOS).
 * For fintech and banking compliance (OWASP MASVS-RESILIENCE), devices with
 * broken OS security sandboxes should be blocked from accessing banking functions.
 */
export const checkDeviceIntegrity = async (): Promise<DeviceIntegrityResult> => {
    // In automated tests or simulators where Device is not available, default to safe
    if (!Device || typeof Device.isRootedExperimentalAsync !== 'function') {
        return { isCompromised: false };
    }

    try {
        const isRooted = await Device.isRootedExperimentalAsync();
        if (isRooted) {
            return {
                isCompromised: true,
                reason: Platform.OS === 'ios'
                    ? 'Jailbroken iOS device detected.'
                    : 'Rooted Android device detected.',
            };
        }
        return { isCompromised: false };
    } catch {
        // If detection errors out, fail closed or open depending on policy.
        // For standard runtime, return false to avoid blocking legitimate users on API errors.
        return { isCompromised: false };
    }
};
