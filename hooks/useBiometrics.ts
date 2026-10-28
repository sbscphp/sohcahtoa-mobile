import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { getStoredCredentials } from '@/utils/biometrics';

export type BiometryType = 'FaceID' | 'TouchID' | 'Iris' | 'Biometrics' | 'None';

export type BiometricErrorCode =
  | 'USER_CANCELED'
  | 'SYSTEM_CANCELED'
  | 'NOT_ENROLLED'
  | 'NO_HARDWARE'
  | 'LOCKOUT_TEMPORARY'
  | 'LOCKOUT_PERMANENT'
  | 'FALLBACK'
  | 'AUTHENTICATION_FAILED'
  | 'UNKNOWN';

export interface BiometricAuthResult {
  success: boolean;
  errorCode?: BiometricErrorCode;
  errorMessage?: string;
}

export interface AuthenticateOptions {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackLabel?: string;
  disableDeviceFallback?: boolean;
}

export interface UseBiometricsReturn {
  isCompatible: boolean;
  isEnrolled: boolean;
  biometryType: BiometryType;
  biometryTitle: string;
  isLoading: boolean;
  refreshStatus: () => Promise<void>;
  authenticate: (options?: AuthenticateOptions) => Promise<BiometricAuthResult>;
  unlockStoredCredentials: (options?: AuthenticateOptions) => Promise<{
    success: boolean;
    credentials?: { email: string; password: string } | null;
    errorCode?: BiometricErrorCode;
    errorMessage?: string;
  }>;
}

export function mapLocalAuthError(error?: string): BiometricErrorCode {
  switch (error) {
    case 'user_cancel':
      return 'USER_CANCELED';
    case 'system_cancel':
    case 'app_cancel':
      return 'SYSTEM_CANCELED';
    case 'not_enrolled':
      return 'NOT_ENROLLED';
    case 'not_available':
      return 'NO_HARDWARE';
    case 'lockout':
      return 'LOCKOUT_TEMPORARY';
    case 'lockout_permanent':
      return 'LOCKOUT_PERMANENT';
    case 'user_fallback':
      return 'FALLBACK';
    case 'authentication_failed':
      return 'AUTHENTICATION_FAILED';
    default:
      return 'UNKNOWN';
  }
}

export function useBiometrics(): UseBiometricsReturn {
  const [isCompatible, setIsCompatible] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryType>('None');
  const [isLoading, setIsLoading] = useState(true);

  const checkBiometricStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      const supportedTypes = hasHardware
        ? await LocalAuthentication.supportedAuthenticationTypesAsync()
        : [];

      setIsCompatible(hasHardware);
      setIsEnrolled(enrolled);

      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometryType(Platform.OS === 'ios' ? 'FaceID' : 'Biometrics');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometryType(Platform.OS === 'ios' ? 'TouchID' : 'Biometrics');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometryType('Iris');
      } else {
        setBiometryType('None');
      }
    } catch {
      setIsCompatible(false);
      setIsEnrolled(false);
      setBiometryType('None');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkBiometricStatus();
  }, [checkBiometricStatus]);

  const getBiometryTitle = (): string => {
    switch (biometryType) {
      case 'FaceID':
        return 'Face ID';
      case 'TouchID':
        return 'Touch ID';
      case 'Iris':
        return 'Iris Recognition';
      case 'Biometrics':
        return 'Biometric Unlock';
      default:
        return 'Biometrics';
    }
  };

  const authenticate = useCallback(
    async (options?: AuthenticateOptions): Promise<BiometricAuthResult> => {
      if (!isCompatible) {
        return {
          success: false,
          errorCode: 'NO_HARDWARE',
          errorMessage: 'Biometric hardware is not available on this device.',
        };
      }

      if (!isEnrolled) {
        return {
          success: false,
          errorCode: 'NOT_ENROLLED',
          errorMessage: 'No biometric credentials are enrolled on this device.',
        };
      }

      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: options?.promptMessage ?? `Authenticate with ${getBiometryTitle()}`,
          cancelLabel: options?.cancelLabel ?? 'Cancel',
          fallbackLabel: options?.fallbackLabel ?? 'Use Device Passcode',
          disableDeviceFallback: options?.disableDeviceFallback ?? false,
        });

        if (result.success) {
          return { success: true };
        }

        return {
          success: false,
          errorCode: mapLocalAuthError(result.error),
          errorMessage: result.warning || result.error,
        };
      } catch (err: any) {
        return {
          success: false,
          errorCode: 'UNKNOWN',
          errorMessage: err?.message || 'Biometric authentication failed unexpectedly.',
        };
      }
    },
    [isCompatible, isEnrolled, biometryType]
  );

  const unlockStoredCredentials = useCallback(
    async (options?: AuthenticateOptions) => {
      const authResult = await authenticate(options);
      if (!authResult.success) {
        return {
          success: false,
          errorCode: authResult.errorCode,
          errorMessage: authResult.errorMessage,
        };
      }

      const credentials = await getStoredCredentials();
      return {
        success: true,
        credentials,
      };
    },
    [authenticate]
  );

  return {
    isCompatible,
    isEnrolled,
    biometryType,
    biometryTitle: getBiometryTitle(),
    isLoading,
    refreshStatus: checkBiometricStatus,
    authenticate,
    unlockStoredCredentials,
  };
}
