import * as Device from 'expo-device';
import { useVerticalBarEdgeIOS, type VerticalBarEdgeIOS } from 'expo-status-bar';
import { Platform, useWindowDimensions } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { verticalScale } from 'react-native-size-matters';

export interface DevicePose {
  /** Reactive window width */
  width: number;
  /** Reactive window height */
  height: number;
  /** Reactive safe area insets */
  insets: EdgeInsets;
  /** Edge where iOS draws the vertical rail ('leading' | 'trailing' | null) */
  railEdge: VerticalBarEdgeIOS | null;
  /** Whether the system has active vertical navigation rail */
  hasRail: boolean;
  /** Whether the device is in landscape orientation */
  isLandscape: boolean;
  /**
   * Whether the display is in a wide/open configuration (unfolded or large canvas).
   * Typically width >= 600pt on iOS/Android.
   */
  isOpenDisplay: boolean;
  /**
   * Whether the device is running in compact/folded phone width.
   */
  isFoldedDisplay: boolean;
  /**
   * Whether the app is likely running in a Split View pane (e.g. 469pt on open display or rail on leading edge).
   */
  isSplitView: boolean;
  /**
   * Whether the device is identified as iPhone Duo (foldable iOS 27 device).
   */
  isIPhoneDuo: boolean;
}

/**
 * Reusable hook to monitor iPhone Duo / foldable device pose,
 * vertical rail placement, safe area boundaries, and responsive display modes.
 */
export function useDevicePose(): DevicePose {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // On iOS 27+, returns 'leading' | 'trailing' when the rail is drawn, null otherwise.
  // On other platforms or in unfolded portrait, returns null.
  const rawRailEdge = useVerticalBarEdgeIOS();
  const railEdge = Platform.OS === 'ios' ? rawRailEdge : null;
  const hasRail = railEdge !== null;

  const isLandscape = width > height;
  const isOpenDisplay = width >= 600;
  const isFoldedDisplay = !isOpenDisplay;

  // In Split View on iPhone Duo open display, the left window is typically ~469pt wide
  // and has railEdge === 'leading'
  const isSplitView = railEdge === 'leading' || (isOpenDisplay && width < 520);

  const isDuoModel = Boolean(
    Device.modelName?.toLowerCase().includes('duo') ||
    Device.deviceName?.toLowerCase().includes('duo')
  );

  const isIPhoneDuo = Platform.OS === 'ios' && (
    isDuoModel ||
    hasRail ||
    insets.left >= 70 ||
    insets.right >= 70 ||
    isOpenDisplay
  );

  return {
    width,
    height,
    insets,
    railEdge,
    hasRail,
    isLandscape,
    isOpenDisplay,
    isFoldedDisplay,
    isSplitView,
    isIPhoneDuo,
  };
}

/**
 * Returns 40@vs on normal iPhone, 50@vs on iPhone Duo, and androidHeight (default 49@vs) on Android.
 */
export function useResponsiveInputHeight(normalHeight = 40, duoHeight = 50, androidHeight = 49): number {
  const { isIPhoneDuo } = useDevicePose();
  if (Platform.OS === 'android') {
    return verticalScale(androidHeight);
  }
  return verticalScale(isIPhoneDuo ? duoHeight : normalHeight);
}

/**
 * Returns 42@vs on normal iPhone, 50@vs on iPhone Duo, and androidHeight (default 50@vs) on Android.
 */
export function useResponsiveButtonHeight(normalHeight = 42, duoHeight = 50, androidHeight = 50): number {
  const { isIPhoneDuo } = useDevicePose();
  if (Platform.OS === 'android') {
    return verticalScale(androidHeight);
  }
  return verticalScale(isIPhoneDuo ? duoHeight : normalHeight);
}

/**
 * Returns minHeight for navigation/screen headers: 56@vs on normal iPhone, 66@vs on iPhone Duo.
 */
export function useResponsiveHeaderHeight(normalHeight = 56, duoHeight = 66): number {
  const { isIPhoneDuo } = useDevicePose();
  return verticalScale(isIPhoneDuo ? duoHeight : normalHeight);
}

