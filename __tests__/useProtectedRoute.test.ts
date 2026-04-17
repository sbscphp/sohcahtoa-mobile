import { renderHook } from '@testing-library/react-native';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { useAuthStore } from '../stores/useAuthStore';
import { useRouter, useSegments } from 'expo-router';

// Mock the dependencies
jest.mock('../stores/useAuthStore', () => ({
    useAuthStore: jest.fn(),
}));

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useSegments: jest.fn(),
}));

describe('useProtectedRoute', () => {
    const mockReplace = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            replace: mockReplace,
        });
    });

    it('should redirect to "/" when unauthenticated and not in auth group', () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => selector({ isAuthenticated: false }));
        (useSegments as jest.Mock).mockReturnValue(['(tabs)']);

        renderHook(() => useProtectedRoute());

        expect(mockReplace).toHaveBeenCalledWith('/');
    });

    it('should redirect to "/(tabs)" when authenticated and in auth group', () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => selector({ isAuthenticated: true }));
        (useSegments as jest.Mock).mockReturnValue(['(auth)']);

        renderHook(() => useProtectedRoute());

        expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });

    it('should not redirect when unauthenticated but already at root', () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => selector({ isAuthenticated: false }));
        (useSegments as jest.Mock).mockReturnValue([undefined]); // Root path

        renderHook(() => useProtectedRoute());

        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should not redirect when unauthenticated and already in auth group', () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => selector({ isAuthenticated: false }));
        (useSegments as jest.Mock).mockReturnValue(['(auth)']);

        renderHook(() => useProtectedRoute());

        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should not redirect when authenticated and not in auth group', () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => selector({ isAuthenticated: true }));
        (useSegments as jest.Mock).mockReturnValue(['(tabs)']);

        renderHook(() => useProtectedRoute());

        expect(mockReplace).not.toHaveBeenCalled();
    });
});
