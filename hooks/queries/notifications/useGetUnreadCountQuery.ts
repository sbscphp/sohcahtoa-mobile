import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../../../services/notifications';

export const useGetUnreadCountQuery = () => {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: getUnreadCount,
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};
