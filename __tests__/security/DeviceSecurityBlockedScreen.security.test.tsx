import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import DeviceSecurityBlockedScreen from '@/components/DeviceSecurityBlockedScreen';
import * as deviceIntegrity from '@/utils/deviceIntegrity';
import { BackHandler, Platform } from 'react-native';

jest.mock('@/utils/deviceIntegrity', () => ({
    ...jest.requireActual('@/utils/deviceIntegrity'),
    openDeveloperSettings: jest.fn(() => Promise.resolve(true)),
}));

describe('DeviceSecurityBlockedScreen UI & Actions (MASVS-RESILIENCE)', () => {
    const originalPlatform = Platform.OS;

    beforeEach(() => {
        jest.clearAllMocks();
        Platform.OS = 'android';
        jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => {});
    });

    afterEach(() => {
        Platform.OS = originalPlatform;
    });

    it('renders root/jailbreak restriction message and close button', () => {
        const { getByText, queryByTestId } = render(
            <DeviceSecurityBlockedScreen
                type="root"
                reason="Rooted Android device detected."
            />
        );

        expect(getByText('Security Restriction')).toBeTruthy();
        expect(getByText('SohCahToa detected that your device may be rooted or jailbroken.')).toBeTruthy();
        expect(getByText('Rooted Android device detected.')).toBeTruthy();
        // Should NOT show USB debugging button
        expect(queryByTestId('open-developer-settings-button')).toBeNull();
    });

    it('renders USB debugging message, instructions, and settings action button', async () => {
        const onRecheck = jest.fn();

        const { getByText, getAllByText, getByTestId } = render(
            <DeviceSecurityBlockedScreen
                type="usb_debugging"
                reason="USB Debugging (ADB) is enabled on this Android device."
                onRecheck={onRecheck}
            />
        );

        expect(getByText('USB Debugging Detected')).toBeTruthy();
        expect(getByText('Please turn off USB Debugging to continue')).toBeTruthy();
        expect(getByText('How to turn it off:')).toBeTruthy();
        expect(getAllByText('Turn Off USB Debugging').length).toBeGreaterThanOrEqual(1);
        expect(getByText('Recheck Security')).toBeTruthy();

        // Test clicking "Turn Off USB Debugging" opens settings
        const settingsButton = getByTestId('open-developer-settings-button');
        fireEvent.press(settingsButton);
        expect(deviceIntegrity.openDeveloperSettings).toHaveBeenCalled();

        // Test clicking "Recheck Security" triggers callback
        const recheckButton = getByTestId('recheck-security-button');
        await act(async () => {
            fireEvent.press(recheckButton);
        });
        expect(onRecheck).toHaveBeenCalled();

        // Test clicking "Close Application" triggers BackHandler.exitApp
        const closeButton = getByTestId('close-application-button');
        fireEvent.press(closeButton);
        expect(BackHandler.exitApp).toHaveBeenCalled();
    });
});
