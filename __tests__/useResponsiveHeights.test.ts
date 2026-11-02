import { renderHook } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { Platform } from 'react-native';
import { verticalScale } from 'react-native-size-matters';
import { useDevicePose, useResponsiveButtonHeight, useResponsiveInputHeight } from '../hooks/useDevicePose';

describe('useResponsiveHeights - Android & iOS parity', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOS;
    jest.restoreAllMocks();
  });

  describe('Standard mobile phone (width: 390, height: 844)', () => {
    beforeEach(() => {
      jest.spyOn(ReactNative.Dimensions, 'get').mockReturnValue({
        width: 390,
        height: 844,
        scale: 3,
        fontScale: 1,
      });
    });

    it('returns 40@vs for inputs and 42@vs for buttons on iOS', () => {
      Platform.OS = 'ios';
      const { result: inputResult } = renderHook(() => useResponsiveInputHeight());
      const { result: buttonResult } = renderHook(() => useResponsiveButtonHeight());

      expect(inputResult.current).toBe(verticalScale(40));
      expect(buttonResult.current).toBe(verticalScale(42));
    });

    it('returns the EXACT same height on Android as iOS for standard phones', () => {
      Platform.OS = 'android';
      const { result: inputResult } = renderHook(() => useResponsiveInputHeight());
      const { result: buttonResult } = renderHook(() => useResponsiveButtonHeight());

      // Android must match iOS exactly (40@vs for inputs, 42@vs for buttons)
      expect(inputResult.current).toBe(verticalScale(40));
      expect(buttonResult.current).toBe(verticalScale(42));
    });

    it('allows an explicit androidHeight override if specifically supplied', () => {
      Platform.OS = 'android';
      const { result: inputResult } = renderHook(() => useResponsiveInputHeight(40, 50, 45));
      const { result: buttonResult } = renderHook(() => useResponsiveButtonHeight(42, 50, 48));

      expect(inputResult.current).toBe(verticalScale(45));
      expect(buttonResult.current).toBe(verticalScale(48));
    });
  });

  describe('Foldable / Large display (width >= 600)', () => {
    beforeEach(() => {
      jest.spyOn(ReactNative.Dimensions, 'get').mockReturnValue({
        width: 700,
        height: 900,
        scale: 2,
        fontScale: 1,
      });
    });

    it('returns duoHeight (50@vs) on both Android and iOS large screens', () => {
      Platform.OS = 'ios';
      const { result: iosInput } = renderHook(() => useResponsiveInputHeight());
      const { result: iosButton } = renderHook(() => useResponsiveButtonHeight());

      Platform.OS = 'android';
      const { result: androidInput } = renderHook(() => useResponsiveInputHeight());
      const { result: androidButton } = renderHook(() => useResponsiveButtonHeight());

      expect(iosInput.current).toBe(verticalScale(50));
      expect(iosButton.current).toBe(verticalScale(50));
      expect(androidInput.current).toBe(verticalScale(50));
      expect(androidButton.current).toBe(verticalScale(50));
    });
  });
});
