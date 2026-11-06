import * as SecureStore from 'expo-secure-store';
import {
    saveCredentials,
    hasStoredCredentials,
    getStoredCredentials,
    clearStoredCredentials,
    SECURE_STORE_KEYS,
} from '@/utils/biometrics';

describe('Biometrics & Credential Storage Security (MASVS-STORAGE)', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await clearStoredCredentials();
    });

    it('enforces WHEN_UNLOCKED_THIS_DEVICE_ONLY keychain accessibility on stored credentials', async () => {
        const email = 'user@example.com';
        const password = 'SecuredPassword123!';

        const saved = await saveCredentials(email, password);
        expect(saved).toBe(true);

        // Verify setItemAsync was called with device-only accessibility options
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
            SECURE_STORE_KEYS.EMAIL,
            email,
            expect.objectContaining({
                keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            })
        );
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
            SECURE_STORE_KEYS.PASSWORD,
            password,
            expect.objectContaining({
                keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            })
        );
    });

    it('checks credential existence without exposing or decrypting the password', async () => {
        await saveCredentials('trader@fintech.com', 'SuperSecretPass#9');
        jest.clearAllMocks();

        const exists = await hasStoredCredentials();
        expect(exists).toBe(true);

        // Must ONLY query the EMAIL key, never the PASSWORD key for existence check
        expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
            SECURE_STORE_KEYS.EMAIL,
            expect.any(Object)
        );
        expect(SecureStore.getItemAsync).not.toHaveBeenCalledWith(
            SECURE_STORE_KEYS.PASSWORD,
            expect.any(Object)
        );
    });

    it('returns false for hasStoredCredentials when no credentials are saved', async () => {
        const exists = await hasStoredCredentials();
        expect(exists).toBe(false);
    });

    it('retrieves both email and password when getStoredCredentials is legitimately called', async () => {
        await saveCredentials('trader@fintech.com', 'SuperSecretPass#9');
        const creds = await getStoredCredentials();

        expect(creds).toEqual({
            email: 'trader@fintech.com',
            password: 'SuperSecretPass#9',
        });
    });

    it('completely purges stored secrets when clearStoredCredentials is executed', async () => {
        await saveCredentials('trader@fintech.com', 'SuperSecretPass#9');
        const cleared = await clearStoredCredentials();
        expect(cleared).toBe(true);

        const existsAfter = await hasStoredCredentials();
        expect(existsAfter).toBe(false);

        const credsAfter = await getStoredCredentials();
        expect(credsAfter).toBeNull();
    });

    it('rejects empty or invalid email/password combinations', async () => {
        const emptyEmail = await saveCredentials('', 'ValidPass1!');
        const emptyPass = await saveCredentials('user@test.com', '');
        expect(emptyEmail).toBe(false);
        expect(emptyPass).toBe(false);
    });
});
