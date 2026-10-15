import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../app/(tabs)/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
    }),
    useFocusEffect: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/stores/useAuthStore', () => ({
    useAuthStore: (selector: any) => selector({
        user: {
            profile: {
                firstName: 'John',
                lastName: 'Doe',
            },
        },
    }),
}));

jest.mock('@/hooks/queries/auth/useProfileQuery', () => ({
    useProfileQuery: () => ({ data: null }),
}));

jest.mock('@/hooks/queries/notifications/useGetUnreadCountQuery', () => ({
    useGetUnreadCountQuery: () => ({ data: { data: { count: 0 } } }),
}));

jest.mock('@/hooks/queries/transactions/useGetTransactionTotalsMutation', () => ({
    useGetTransactionTotalsMutation: () => ({
        mutate: jest.fn(),
        data: {
            data: {
                buy: { totalAmount: 1000 },
                sell: { totalAmount: 500 },
                remittance: { totalAmount: 200 },
                all: { totalAmount: 1700 },
            },
        },
        isPending: false,
    }),
}));

jest.mock('@/hooks/queries/transactions/useGetTransactionsQuery', () => ({
    useGetTransactionsQuery: () => ({
        data: { pages: [{ data: [] }] },
        isLoading: false,
        refetch: jest.fn(),
    }),
}));

jest.mock('iconsax-react-nativejs', () => {
    const { View } = require('react-native');
    const MockIcon = () => <View testID="mock-icon" />;
    return {
        Add: MockIcon,
        ArrowDown2: MockIcon,
        Bank: MockIcon,
        Buildings: MockIcon,
        Eye: MockIcon,
        EyeSlash: MockIcon,
        Hospital: MockIcon,
        ImportCircle: MockIcon,
        Notification: MockIcon,
        People: MockIcon,
        Refresh: MockIcon,
        Teacher: MockIcon,
        User: MockIcon,
        WalletAdd1: MockIcon,
        WalletMinus: MockIcon,
    };
});

jest.mock('../assets/images/passport.svg', () => {
    const { View } = require('react-native');
    return () => <View testID="passport-svg" />;
});

jest.mock('../assets/images/standing-user.svg', () => {
    const { View } = require('react-native');
    return () => <View testID="standing-user-svg" />;
});

jest.mock('@/components/VirtualCard', () => {
    const { View, Text } = require('react-native');
    return () => <View testID="virtual-card"><Text>Virtual Card</Text></View>;
});

jest.mock('@/components/CurrencyDropdown', () => {
    const { View } = require('react-native');
    return () => <View testID="currency-dropdown" />;
});

jest.mock('@/components/ActionSelectionSheet', () => {
    const { View } = require('react-native');
    return () => <View testID="action-sheet" />;
});

describe('HomeScreen Top Filters', () => {
    const queryClient = new QueryClient();

    const renderHomeScreen = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <HomeScreen />
            </QueryClientProvider>
        );
    };

    it('renders FX bought, FX sold, and Others at top, and does NOT render All in top filters', () => {
        const { getByText, queryAllByText, queryByText } = renderHomeScreen();

        expect(getByText('FX bought')).toBeTruthy();
        expect(getByText('FX sold')).toBeTruthy();
        expect(getByText('Others')).toBeTruthy();
        expect(queryByText('Received FX')).toBeNull();

        // The top filter row should NOT contain 'All'.
        // Only the recent transaction sub-filters may contain 'All'.
        const allElements = queryAllByText('All');
        expect(allElements.length).toBe(1); // Exactly one in Recent Transactions, none in top filters
    });

    it('switches balance label and sub-filters when selecting different top filter tabs', () => {
        const { getByText } = renderHomeScreen();

        // Initially on 'FX bought'
        expect(getByText('Total FX Bought')).toBeTruthy();
        expect(getByText('PTA')).toBeTruthy();
        expect(getByText('BTA')).toBeTruthy();
        expect(getByText('School Fees')).toBeTruthy();
        expect(getByText('Medical')).toBeTruthy();
        expect(getByText('Professional')).toBeTruthy();
        expect(getByText('Touring')).toBeTruthy();

        // Switch to 'FX sold'
        fireEvent.press(getByText('FX sold'));
        expect(getByText('Total FX Sold')).toBeTruthy();
        expect(getByText('Resident')).toBeTruthy();
        expect(getByText('Tourist')).toBeTruthy();
        expect(getByText('Expatriate')).toBeTruthy();

        // Switch to 'Others'
        fireEvent.press(getByText('Others'));
        expect(getByText('Total Others')).toBeTruthy();
        expect(getByText('IMTO')).toBeTruthy();
        expect(getByText('Cash')).toBeTruthy();
    });
});
