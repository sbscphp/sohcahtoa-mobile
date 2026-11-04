import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NotificationsScreen from '../app/notifications';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
    }),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockMarkRead = jest.fn();
const mockMarkAllRead = jest.fn();
const mockRefetch = jest.fn();

let mockNotificationsData: any = null;
let mockIsLoading = false;

jest.mock('@/hooks/queries/notifications/useGetNotificationsQuery', () => ({
    useGetNotificationsQuery: () => ({
        data: mockNotificationsData,
        isLoading: mockIsLoading,
        refetch: mockRefetch,
        isRefetching: false,
    }),
}));

jest.mock('@/hooks/queries/notifications/useMarkAsReadMutation', () => ({
    useMarkAsReadMutation: () => ({
        mutate: mockMarkRead,
    }),
}));

jest.mock('@/hooks/queries/notifications/useMarkAllAsReadMutation', () => ({
    useMarkAllAsReadMutation: () => ({
        mutate: mockMarkAllRead,
        isPending: false,
    }),
}));

jest.mock('@/hooks/queries/transactions/useGetTransactionsQuery', () => ({
    useGetTransactionsQuery: () => ({
        data: { pages: [{ data: [] }] },
    }),
}));

describe('NotificationsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsLoading = false;
        mockNotificationsData = {
            data: {
                notifications: [
                    {
                        id: 'notif-1',
                        userId: 'user-1',
                        notificationId: 'notif-1',
                        title: 'Transaction Successful',
                        body: 'Your school fees transaction was approved',
                        icon: null,
                        actionUrl: '/(buy-fx)/(school)/view-school?transactionId=tx-123',
                        data: { transactionId: 'tx-123' },
                        isRead: false,
                        readAt: null,
                        priority: 'NORMAL',
                        expiresAt: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        type: 'transaction',
                    },
                    {
                        id: 'notif-2',
                        userId: 'user-1',
                        notificationId: 'notif-2',
                        title: 'Welcome Bonus',
                        body: 'Welcome to the platform!',
                        icon: null,
                        actionUrl: null,
                        data: {},
                        isRead: true,
                        readAt: new Date().toISOString(),
                        priority: 'NORMAL',
                        expiresAt: null,
                        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                        type: 'system',
                    },
                ],
                total: 2,
                limit: 20,
                offset: 0,
            },
        };
    });

    it('renders notifications and tab filters correctly', () => {
        const { getByText } = render(<NotificationsScreen />);

        expect(getByText('Notifications')).toBeTruthy();
        expect(getByText('All 2')).toBeTruthy();
        expect(getByText('Unread 1')).toBeTruthy();
        expect(getByText('Transactions')).toBeTruthy();
        expect(getByText('Transaction Successful')).toBeTruthy();
        expect(getByText('Welcome Bonus')).toBeTruthy();
    });

    it('filters unread notifications when unread tab is selected', () => {
        const { getByText, queryByText } = render(<NotificationsScreen />);

        fireEvent.press(getByText('Unread 1'));

        expect(getByText('Transaction Successful')).toBeTruthy();
        expect(queryByText('Welcome Bonus')).toBeNull();
    });

    it('filters transactions when transactions tab is selected', () => {
        const { getByText, queryByText } = render(<NotificationsScreen />);

        fireEvent.press(getByText('Transactions'));

        expect(getByText('Transaction Successful')).toBeTruthy();
        expect(queryByText('Welcome Bonus')).toBeNull();
    });

    it('calls markRead and navigates when unread notification is pressed', () => {
        const { getByText } = render(<NotificationsScreen />);

        fireEvent.press(getByText('Transaction Successful'));

        expect(mockMarkRead).toHaveBeenCalledWith('notif-1');
        expect(mockPush).toHaveBeenCalled();
    });

    it('calls markAllRead when Mark All button is pressed', () => {
        const { getByText } = render(<NotificationsScreen />);

        const markAllButton = getByText('Mark All');
        fireEvent.press(markAllButton);

        expect(mockMarkAllRead).toHaveBeenCalled();
    });

    it('renders empty state when there are no notifications', () => {
        mockNotificationsData = { data: { notifications: [] } };
        const { getByText } = render(<NotificationsScreen />);

        expect(getByText('No notifications')).toBeTruthy();
    });
});
