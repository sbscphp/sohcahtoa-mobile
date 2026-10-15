import { render } from '@testing-library/react-native';
import React from 'react';
import SupportDetailsScreen from '../app/(more)/support-details';

jest.mock('expo-router', () => ({
    useLocalSearchParams: () => ({ id: '21ea1487-ff8f-4ce3-9073-66bdcaefb9a7' }),
    useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

jest.mock('@/components/Header', () => 'Header');

const mockTicketData = {
    id: '21ea1487-ff8f-4ce3-9073-66bdcaefb9a7',
    reference: 'TKT-1786954180722-6IO49J',
    category: 'ACCOUNT_ACCESS',
    description: 'Locked out of the system',
    status: 'OPEN',
    priority: 'MEDIUM',
    customer: {
        name: 'Ada Okonkwo',
        email: 'ada.okonkwo@yopmail.com',
    },
    assignedAgent: {
        name: 'Super Admin',
        email: 'superadmin@yopmail.com',
    },
    attachments: [],
    comments: [
        {
            id: '52cd9fb5-7278-4a00-aa84-b7df3ce72f86',
            message: 'we are working on the resolution',
            createdAt: '2026-08-17T08:11:29.839Z',
            author: {
                name: 'Super Admin',
                email: 'superadmin@yopmail.com',
                role: 'ADMIN',
            },
        },
    ],
    createdAt: '2026-08-17T08:09:40.723Z',
    updatedAt: '2026-08-17T08:10:53.160Z',
};

jest.mock('@/hooks/queries/support/useGetSupportTicketQuery', () => ({
    useGetSupportTicketQuery: () => ({
        data: { data: mockTicketData },
        isLoading: false,
    }),
}));

describe('SupportDetailsScreen', () => {
    it('renders ticket basic details and comments correctly', () => {
        const { getByText, getAllByText, queryByText } = render(<SupportDetailsScreen />);

        expect(getAllByText('ACCOUNT_ACCESS').length).toBeGreaterThanOrEqual(1);
        expect(getByText('Locked out of the system')).toBeTruthy();
        expect(getByText('Open')).toBeTruthy();
        expect(getByText('TKT-1786954180722-6IO49J')).toBeTruthy();

        // Comments section
        expect(getByText('Comments')).toBeTruthy();
        expect(getByText('we are working on the resolution')).toBeTruthy();
        expect(queryByText('Super Admin')).toBeNull();
        expect(queryByText('ADMIN')).toBeNull();
    });
});
