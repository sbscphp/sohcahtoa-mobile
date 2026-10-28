import { renderHook, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useBiometrics, mapLocalAuthError } from '../hooks/useBiometrics';
import { SECURE_STORE_KEYS } from '../utils/biometrics';

describe('useBiometrics hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
    ]);
  });

  describe('mapLocalAuthError', () => {
    it('correctly maps all known LocalAuthentication error codes', () => {
      expect(mapLocalAuthError('user_cancel')).toBe('USER_CANCELED');
      expect(mapLocalAuthError('system_cancel')).toBe('SYSTEM_CANCELED');
      expect(mapLocalAuthError('app_cancel')).toBe('SYSTEM_CANCELED');
      expect(mapLocalAuthError('not_enrolled')).toBe('NOT_ENROLLED');
      expect(mapLocalAuthError('not_available')).toBe('NO_HARDWARE');
      expect(mapLocalAuthError('lockout')).toBe('LOCKOUT_TEMPORARY');
      expect(mapLocalAuthError('lockout_permanent')).toBe('LOCKOUT_PERMANENT');
      expect(mapLocalAuthError('user_fallback')).toBe('FALLBACK');
      expect(mapLocalAuthError('authentication_failed')).toBe('AUTHENTICATION_FAILED');
      expect(mapLocalAuthError('other')).toBe('UNKNOWN');
      expect(mapLocalAuthError(undefined)).toBe('UNKNOWN');
    });
  });

  describe('Initialization and Biometry Types', () => {
    it('initializes with Face ID on iOS when facial recognition is supported', async () => {
      Platform.OS = 'ios';
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);

      const { result } = renderHook(() => useBiometrics());

      // Wait for async checks to complete
      await act(async () => {});

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isCompatible).toBe(true);
      expect(result.current.isEnrolled).toBe(true);
      expect(result.current.biometryType).toBe('FaceID');
      expect(result.current.biometryTitle).toBe('Face ID');
    });

    it('initializes with Touch ID on iOS when fingerprint is supported', async () => {
      Platform.OS = 'ios';
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);

      const { result } = renderHook(() => useBiometrics());
      await act(async () => {});

      expect(result.current.biometryType).toBe('TouchID');
      expect(result.current.biometryTitle).toBe('Touch ID');
    });

    it('initializes with Biometrics on Android for fingerprint', async () => {
      Platform.OS = 'android';
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);

      const { result } = renderHook(() => useBiometrics());
      await act(async () => {});

      expect(result.current.biometryType).toBe('Biometrics');
      expect(result.current.biometryTitle).toBe('Biometric Unlock');
    });

    it('handles devices without biometric hardware', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useBiometrics());
      await act(async () => {});

      expect(result.current.isCompatible).toBe(false);
      expect(result.current.isEnrolled).toBe(false);
      expect(result.current.biometryType).toBe('None');
    });
  });

  describe('authenticate()', () => {
    it('returns success when authentication succeeds', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useBiometrics());
      await act(async () => {});

      let authResult: any;
      await act(async () => {
        authResult = await result.current.authenticate({ promptMessage: 'Unlock app' });
      });

      expect(authResult.success).toBe(true);
      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Unlock app',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Device Passcode',
        disableDeviceFallback: false,
      });
    });

    it('returns mapped error code on user cancellation', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: 'user_cancel',
      });

      const { result } = renderHook(() => useBiometrics());
      await act(async () => {});

      let authResult: any;
      await act(async () => {
        authResult = await result.current.authenticate();
      });

      expect(authResult.success).toBe(false);
      expect(authResult.errorCode).toBe('USER_CANCELED');
    });

    it('returns lockout error when device is locked out', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: 'lockout',
        warning: 'Too many attempts',
      });

      const { result } = renderHook(() => useBiometrics());
      await act(async () => {});

      let authResult: any;
      await act(async () => {
        authResult = await result.current.authenticate();
      });

      expect(authResult.success).toBe(false);
      expect(authResult.errorCode).toBe('LOCKOUT_TEMPORARY');
      expect(authResult.errorMessage).toBe('Too many attempts');
    });

    it('prevents authentication if hardware is not compatible', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useBiometrics());
      await act(async () => {});

      let authResult: any;
      await act(async () => {
        authResult = await result.current.authenticate();
      });

      expect(authResult.success).toBe(false);
      expect(authResult.errorCode).toBe('NO_HARDWARE');
      expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled();
    });

    it('prevents authentication if no biometrics are enrolled', async () => {
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useBiometrics());
      await act(async () => {});

      let authResult: any;
      await act(async () => {
        authResult = await result.current.authenticate();
      });

      expect(authResult.success).toBe(false);
      expect(authResult.errorCode).toBe('NOT_ENROLLED');
      expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled();
    });
  });

  describe('unlockStoredCredentials()', () => {
    it('retrieves credentials after successful biometric check', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true });
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === SECURE_STORE_KEYS.EMAIL) return Promise.resolve('test@example.com');
        if (key === SECURE_STORE_KEYS.PASSWORD) return Promise.resolve('SuperSecret123!');
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useBiometrics());
      await act(async () => {});

      let unlockResult: any;
      await act(async () => {
        unlockResult = await result.current.unlockStoredCredentials();
      });

      expect(unlockResult.success).toBe(true);
      expect(unlockResult.credentials).toEqual({
        email: 'test@example.com',
        password: 'SuperSecret123!',
      });
    });

    it('does not retrieve credentials if authentication fails', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: 'user_cancel',
      });

      const { result } = renderHook(() => useBiometrics());
      await act(async () => {});

      let unlockResult: any;
      await act(async () => {
        unlockResult = await result.current.unlockStoredCredentials();
      });

      expect(unlockResult.success).toBe(false);
      expect(unlockResult.credentials).toBeUndefined();
      expect(unlockResult.errorCode).toBe('USER_CANCELED');
    });
  });
});
