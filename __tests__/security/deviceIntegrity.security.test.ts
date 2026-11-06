import * as Device from 'expo-device';
import { checkDeviceIntegrity } from '@/utils/deviceIntegrity';

jest.mock('expo-device', () => ({
    isRootedExperimentalAsync: jest.fn(),
}));

describe('Device Integrity & Anti-Tampering (MASVS-RESILIENCE)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns isCompromised: false on clean, unrooted devices', async () => {
        (Device.isRootedExperimentalAsync as jest.Mock).mockResolvedValue(false);

        const result = await checkDeviceIntegrity();
        expect(result.isCompromised).toBe(false);
        expect(result.reason).toBeUndefined();
    });

    it('detects rooted/jailbroken devices and returns isCompromised: true with security reason', async () => {
        (Device.isRootedExperimentalAsync as jest.Mock).mockResolvedValue(true);

        const result = await checkDeviceIntegrity();
        expect(result.isCompromised).toBe(true);
        expect(result.reason).toBeDefined();
        expect(result.reason).toMatch(/device detected/i);
    });

    it('fails safely when root check throws an unexpected error', async () => {
        (Device.isRootedExperimentalAsync as jest.Mock).mockRejectedValue(new Error('Hardware security module failure'));

        const result = await checkDeviceIntegrity();
        expect(result.isCompromised).toBe(false);
    });
});
