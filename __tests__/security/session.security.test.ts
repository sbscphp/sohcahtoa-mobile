import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/services/api';

describe('Session & Auth Security (MASVS-AUTH)', () => {
    beforeEach(() => {
        useAuthStore.getState().logout();
    });

    it('clears all session tokens, user data, and temporary info on logout', () => {
        const store = useAuthStore.getState();

        // Simulate authenticated state
        store.setAuth('jwt_access_token_123', 'jwt_refresh_token_456', {
            id: 'user_1',
            email: 'user@example.com',
            firstName: 'Fin',
            lastName: 'Tech',
        } as any);
        store.setVerificationToken('verif_token_789');
        store.setTempUserInfo({ nin: '12345678901', bvn: '22223333444' });
        store.setPendingBiometricCredentials({ email: 'user@example.com', password: 'SecretPassword123!' });
        store.setPendingResetToken('mock_reset_token_xyz_789');

        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().token).toBe('jwt_access_token_123');
        expect(useAuthStore.getState().verificationToken).toBe('verif_token_789');
        expect(useAuthStore.getState().tempUserInfo).not.toBeNull();
        expect(useAuthStore.getState().pendingBiometricCredentials).toEqual({
            email: 'user@example.com',
            password: 'SecretPassword123!',
        });
        expect(useAuthStore.getState().pendingResetToken).toBe('mock_reset_token_xyz_789');

        // Perform logout
        useAuthStore.getState().logout();

        const stateAfter = useAuthStore.getState();
        expect(stateAfter.isAuthenticated).toBe(false);
        expect(stateAfter.token).toBeNull();
        expect(stateAfter.refreshToken).toBeNull();
        expect(stateAfter.verificationToken).toBeNull();
        expect(stateAfter.user).toBeNull();
        expect(stateAfter.tempUserInfo).toBeNull();
        expect(stateAfter.pendingBiometricCredentials).toBeNull();
        expect(stateAfter.pendingResetToken).toBeNull();
    });

    it('injects Bearer token dynamically into API request headers', async () => {
        useAuthStore.getState().setToken('bearer_mock_jwt_token_999');

        // Test Axios request interceptor directly
        const requestInterceptor = (api.interceptors.request as any).handlers[0]?.fulfilled;
        expect(requestInterceptor).toBeDefined();

        const mockConfig = { headers: {} as Record<string, string> };
        const updatedConfig = await requestInterceptor(mockConfig);

        expect(updatedConfig.headers.Authorization).toBe('Bearer bearer_mock_jwt_token_999');
    });

    it('does not attach Authorization header when user is unauthenticated', async () => {
        useAuthStore.getState().logout();

        const requestInterceptor = (api.interceptors.request as any).handlers[0]?.fulfilled;
        const mockConfig = { headers: {} as Record<string, string> };
        const updatedConfig = await requestInterceptor(mockConfig);

        expect(updatedConfig.headers.Authorization).toBeUndefined();
    });
});
