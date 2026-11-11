import * as Device from 'expo-device';
import { NativeModules, Platform } from 'react-native';
import {
    checkDeviceIntegrity,
    isUsbDebuggingActive,
    openDeveloperSettings,
} from '@/utils/deviceIntegrity';

jest.mock('expo-device', () => ({
    isRootedExperimentalAsync: jest.fn(),
}));

describe('Device Integrity & Anti-Tampering (MASVS-RESILIENCE)', () => {
    const originalPlatform = Platform.OS;

    beforeEach(() => {
        jest.clearAllMocks();
        Platform.OS = 'android';
        (Device.isRootedExperimentalAsync as jest.Mock).mockResolvedValue(false);
        (NativeModules.SecurityBridge.isUsbDebuggingEnabled as jest.Mock).mockResolvedValue(false);
        (NativeModules.SecurityBridge.openDevelopmentSettings as jest.Mock).mockResolvedValue(true);
    });

    afterEach(() => {
        Platform.OS = originalPlatform;
        delete process.env.EXPO_PUBLIC_ENFORCE_USB_DEBUGGING;
    });

    describe('Root & Jailbreak Detection', () => {
        it('returns isCompromised: false on clean, unrooted devices', async () => {
            (Device.isRootedExperimentalAsync as jest.Mock).mockResolvedValue(false);

            const result = await checkDeviceIntegrity();
            expect(result.isCompromised).toBe(false);
            expect(result.reason).toBeUndefined();
        });

        it('detects rooted Android devices and returns isCompromised: true with type: root', async () => {
            Platform.OS = 'android';
            (Device.isRootedExperimentalAsync as jest.Mock).mockResolvedValue(true);

            const result = await checkDeviceIntegrity();
            expect(result.isCompromised).toBe(true);
            expect(result.type).toBe('root');
            expect(result.reason).toMatch(/rooted android device detected/i);
        });

        it('detects jailbroken iOS devices and returns isCompromised: true with type: jailbreak', async () => {
            Platform.OS = 'ios';
            (Device.isRootedExperimentalAsync as jest.Mock).mockResolvedValue(true);

            const result = await checkDeviceIntegrity();
            expect(result.isCompromised).toBe(true);
            expect(result.type).toBe('jailbreak');
            expect(result.reason).toMatch(/jailbroken ios device detected/i);
        });

        it('fails safely when root check throws an unexpected error', async () => {
            (Device.isRootedExperimentalAsync as jest.Mock).mockRejectedValue(
                new Error('Hardware security module failure')
            );

            const result = await checkDeviceIntegrity();
            expect(result.isCompromised).toBe(false);
        });
    });

    describe('Android USB Debugging Detection', () => {
        it('detects active USB Debugging on Android when enforced', async () => {
            Platform.OS = 'android';
            process.env.EXPO_PUBLIC_ENFORCE_USB_DEBUGGING = 'true';
            (NativeModules.SecurityBridge.isUsbDebuggingEnabled as jest.Mock).mockResolvedValue(true);

            const result = await checkDeviceIntegrity();
            expect(result.isCompromised).toBe(true);
            expect(result.type).toBe('usb_debugging');
            expect(result.reason).toMatch(/usb debugging \(adb\) is enabled/i);
        });

        it('returns isCompromised: false when USB Debugging is disabled on Android', async () => {
            Platform.OS = 'android';
            process.env.EXPO_PUBLIC_ENFORCE_USB_DEBUGGING = 'true';
            (NativeModules.SecurityBridge.isUsbDebuggingEnabled as jest.Mock).mockResolvedValue(false);

            const result = await checkDeviceIntegrity();
            expect(result.isCompromised).toBe(false);
        });

        it('does not check USB Debugging on iOS devices', async () => {
            Platform.OS = 'ios';
            process.env.EXPO_PUBLIC_ENFORCE_USB_DEBUGGING = 'true';
            (NativeModules.SecurityBridge.isUsbDebuggingEnabled as jest.Mock).mockResolvedValue(true);

            const result = await checkDeviceIntegrity();
            expect(result.isCompromised).toBe(false);
            expect(NativeModules.SecurityBridge.isUsbDebuggingEnabled).not.toHaveBeenCalled();
        });

        it('queries isUsbDebuggingActive directly and handles native response', async () => {
            Platform.OS = 'android';
            (NativeModules.SecurityBridge.isUsbDebuggingEnabled as jest.Mock).mockResolvedValue(true);

            const active = await isUsbDebuggingActive();
            expect(active).toBe(true);
            expect(NativeModules.SecurityBridge.isUsbDebuggingEnabled).toHaveBeenCalled();
        });

        it('invokes openDeveloperSettings to launch Android Developer Options', async () => {
            Platform.OS = 'android';
            (NativeModules.SecurityBridge.openDevelopmentSettings as jest.Mock).mockResolvedValue(true);

            const opened = await openDeveloperSettings();
            expect(opened).toBe(true);
            expect(NativeModules.SecurityBridge.openDevelopmentSettings).toHaveBeenCalled();
        });

        it('returns false from openDeveloperSettings on iOS', async () => {
            Platform.OS = 'ios';
            const opened = await openDeveloperSettings();
            expect(opened).toBe(false);
            expect(NativeModules.SecurityBridge.openDevelopmentSettings).not.toHaveBeenCalled();
        });
    });
});
