import React from 'react';
import { render, fireEvent, renderHook, act } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { useThemeStore } from '../stores/useThemeStore';
import { useAppTheme, resolveThemeMode } from '../hooks/useAppTheme';
import { AppThemeProvider } from '../context/ThemeContext';
import { ThemeSelectionSheet } from '../components/ThemeSelectionSheet';
import { Colors } from '../constants/theme';

describe('Theme System', () => {
    beforeEach(() => {
        act(() => {
            useThemeStore.setState({ themeMode: 'system' });
        });
        jest.spyOn(ReactNative.Appearance, 'getColorScheme').mockReturnValue('light');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('resolveThemeMode', () => {
        it('resolves light when mode is light regardless of system scheme', () => {
            expect(resolveThemeMode('light', 'dark')).toBe('light');
            expect(resolveThemeMode('light', 'light')).toBe('light');
        });

        it('resolves dark when mode is dark regardless of system scheme', () => {
            expect(resolveThemeMode('dark', 'light')).toBe('dark');
            expect(resolveThemeMode('dark', 'dark')).toBe('dark');
        });

        it('resolves to system scheme when mode is system', () => {
            expect(resolveThemeMode('system', 'dark')).toBe('dark');
            expect(resolveThemeMode('system', 'light')).toBe('light');
            expect(resolveThemeMode('system', null)).toBe('light');
        });
    });

    describe('useThemeStore', () => {
        it('initializes with system theme by default', () => {
            expect(useThemeStore.getState().themeMode).toBe('system');
        });

        it('updates theme mode correctly', () => {
            act(() => {
                useThemeStore.getState().setThemeMode('dark');
            });
            expect(useThemeStore.getState().themeMode).toBe('dark');

            act(() => {
                useThemeStore.getState().setThemeMode('light');
            });
            expect(useThemeStore.getState().themeMode).toBe('light');

            act(() => {
                useThemeStore.getState().setThemeMode('system');
            });
            expect(useThemeStore.getState().themeMode).toBe('system');
        });
    });

    describe('useAppTheme', () => {
        it('resolves light mode tokens when mode is light', () => {
            act(() => {
                useThemeStore.getState().setThemeMode('light');
            });

            const { result } = renderHook(() => useAppTheme());
            expect(result.current.themeMode).toBe('light');
            expect(result.current.resolvedTheme).toBe('light');
            expect(result.current.isDark).toBe(false);
            expect(result.current.colors.background).toBe(Colors.light.background);
            expect(result.current.colors.text).toBe(Colors.light.text);
        });

        it('resolves dark mode tokens when mode is dark', () => {
            act(() => {
                useThemeStore.getState().setThemeMode('dark');
            });

            const { result } = renderHook(() => useAppTheme());
            expect(result.current.themeMode).toBe('dark');
            expect(result.current.resolvedTheme).toBe('dark');
            expect(result.current.isDark).toBe(true);
            expect(result.current.colors.background).toBe(Colors.dark.background);
            expect(result.current.colors.text).toBe(Colors.dark.text);
        });

        it('resolves to device appearance when mode is system', () => {
            jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

            act(() => {
                useThemeStore.getState().setThemeMode('system');
            });

            const { result } = renderHook(() => useAppTheme());
            expect(result.current.themeMode).toBe('system');
            expect(result.current.resolvedTheme).toBe('dark');
            expect(result.current.isDark).toBe(true);
            expect(result.current.colors.background).toBe(Colors.dark.background);
        });

        it('works inside AppThemeProvider', () => {
            act(() => {
                useThemeStore.getState().setThemeMode('dark');
            });

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <AppThemeProvider>{children}</AppThemeProvider>
            );

            const { result } = renderHook(() => useAppTheme(), { wrapper });
            expect(result.current.isDark).toBe(true);
            expect(result.current.colors.background).toBe(Colors.dark.background);
        });
    });

    describe('ThemeSelectionSheet', () => {
        it('renders theme options and marks active theme', () => {
            act(() => {
                useThemeStore.getState().setThemeMode('system');
            });

            const onClose = jest.fn();
            const { getByText, getByTestId } = render(
                <ThemeSelectionSheet visible={true} onClose={onClose} />
            );

            expect(getByText('Appearance')).toBeTruthy();
            expect(getByText('Light')).toBeTruthy();
            expect(getByText('Dark')).toBeTruthy();
            expect(getByText('System Default')).toBeTruthy();
            expect(getByTestId('theme-option-system')).toBeTruthy();
        });

        it('switches theme to Dark when selected', () => {
            const onClose = jest.fn();
            const { getByText } = render(
                <ThemeSelectionSheet visible={true} onClose={onClose} />
            );

            fireEvent.press(getByText('Dark'));

            expect(useThemeStore.getState().themeMode).toBe('dark');
        });

        it('switches theme to Light when selected and closes on close button', () => {
            act(() => {
                useThemeStore.getState().setThemeMode('dark');
            });

            const onClose = jest.fn();
            const { getByText, getByLabelText } = render(
                <ThemeSelectionSheet visible={true} onClose={onClose} />
            );

            fireEvent.press(getByText('Light'));
            expect(useThemeStore.getState().themeMode).toBe('light');

            fireEvent.press(getByLabelText('Close theme settings'));
            expect(onClose).toHaveBeenCalled();
        });
    });
});
