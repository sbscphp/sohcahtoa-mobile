import React from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';

const mockIsGlassEffectAPIAvailable = jest.fn(() => false);
const mockIsLiquidGlassAvailable = jest.fn(() => false);

jest.mock('expo-glass-effect', () => {
    const { View } = require('react-native');
    return {
        GlassView: ({ children, style, glassEffectStyle, isInteractive, tintColor, ...rest }: any) => (
            <View
                {...rest}
                testID="native-glass-view"
                style={style}
                accessibilityHint={`${glassEffectStyle}-${Boolean(isInteractive)}-${tintColor ?? ''}`}
            >
                {children}
            </View>
        ),
        GlassContainer: ({ children, style, spacing, ...rest }: any) => (
            <View
                testID="native-glass-container"
                style={style}
                accessibilityHint={`spacing-${spacing}`}
                {...rest}
            >
                {children}
            </View>
        ),
        isGlassEffectAPIAvailable: () => mockIsGlassEffectAPIAvailable(),
        isLiquidGlassAvailable: () => mockIsLiquidGlassAvailable(),
    };
});

import { LiquidGlassContainer, LiquidGlassView } from '@/components/ui/LiquidGlassView';

describe('LiquidGlassView & LiquidGlassContainer', () => {
    const originalOS = Platform.OS;

    beforeEach(() => {
        jest.clearAllMocks();
        Platform.OS = 'ios';
        jest.spyOn(AccessibilityInfo, 'isReduceTransparencyEnabled').mockResolvedValue(false);
        jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({
            remove: jest.fn(),
        } as any);
    });

    afterEach(() => {
        Platform.OS = originalOS;
    });

    it('renders native GlassView on iOS 26+ and strips opaque background and border styles', () => {
        mockIsGlassEffectAPIAvailable.mockReturnValue(true);
        mockIsLiquidGlassAvailable.mockReturnValue(true);

        const presentStyle = {
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            borderRadius: 20,
            padding: 12,
        };

        const { getByTestId, getByText } = render(
            <LiquidGlassView
                variant="regular"
                interactive
                tintColor="rgba(255, 104, 19, 0.14)"
                style={presentStyle}
            >
                <Text>Buy FX</Text>
            </LiquidGlassView>
        );

        expect(getByText('Buy FX')).toBeTruthy();
        const glassView = getByTestId('native-glass-view');
        const flattened = StyleSheet.flatten(glassView.props.style);

        expect(flattened.backgroundColor).toBeUndefined();
        expect(flattened.borderWidth).toBeUndefined();
        expect(flattened.borderColor).toBeUndefined();
        expect(flattened.borderRadius).toBe(20);
        expect(flattened.padding).toBe(12);
        expect(flattened.borderCurve).toBe('continuous');
        expect(glassView.props.accessibilityHint).toBe('regular-true-rgba(255, 104, 19, 0.14)');
    });

    it('falls back to the exact present style on iOS 15–25 (when Liquid Glass is unavailable)', () => {
        mockIsGlassEffectAPIAvailable.mockReturnValue(false);
        mockIsLiquidGlassAvailable.mockReturnValue(false);

        const presentStyle = {
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            borderRadius: 20,
            padding: 12,
        };

        const { queryByTestId, getByTestId } = render(
            <LiquidGlassView testID="fallback-view" style={presentStyle}>
                <Text>Sell FX</Text>
            </LiquidGlassView>
        );

        expect(queryByTestId('native-glass-view')).toBeNull();
        const fallbackView = getByTestId('fallback-view');
        const flattened = StyleSheet.flatten(fallbackView.props.style);

        expect(flattened.backgroundColor).toBe('#FFFFFF');
        expect(flattened.borderWidth).toBe(1);
        expect(flattened.borderColor).toBe('#E2E8F0');
        expect(flattened.borderRadius).toBe(20);
    });

    it('falls back to the exact present style when Reduce Transparency is enabled on iOS 26+', async () => {
        mockIsGlassEffectAPIAvailable.mockReturnValue(true);
        mockIsLiquidGlassAvailable.mockReturnValue(true);
        jest.spyOn(AccessibilityInfo, 'isReduceTransparencyEnabled').mockResolvedValue(true);

        const presentStyle = {
            backgroundColor: '#FFF7ED',
            borderColor: '#FFEDD5',
            borderWidth: 1,
            borderRadius: 20,
        };

        const { queryByTestId, getByTestId } = render(
            <LiquidGlassView testID="accessible-fallback" style={presentStyle}>
                <Text>Filter</Text>
            </LiquidGlassView>
        );

        await waitFor(() => {
            expect(queryByTestId('native-glass-view')).toBeNull();
        });

        const fallbackView = getByTestId('accessible-fallback');
        const flattened = StyleSheet.flatten(fallbackView.props.style);
        expect(flattened.backgroundColor).toBe('#FFF7ED');
        expect(flattened.borderColor).toBe('#FFEDD5');
    });

    it('initializes LiquidGlassContainer with a numeric default spacing on iOS 26+', () => {
        mockIsGlassEffectAPIAvailable.mockReturnValue(true);
        mockIsLiquidGlassAvailable.mockReturnValue(true);

        const { getByTestId } = render(
            <LiquidGlassContainer>
                <Text>Grouped Glass</Text>
            </LiquidGlassContainer>
        );

        const container = getByTestId('native-glass-container');
        expect(container.props.accessibilityHint).toBe('spacing-12');
    });
});
