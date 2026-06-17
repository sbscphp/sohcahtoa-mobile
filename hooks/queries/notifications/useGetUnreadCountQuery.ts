import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUnreadCount } from '../../../services/notifications';
import { GetNotificationsResponse } from '../../../types/api/notifications';

export const useGetUnreadCountQuery = () => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: async () => {
           
            const countResponse = await getUnreadCount();
            
            const cached = queryClient.getQueryData<GetNotificationsResponse>(['notifications']);
            const notifications = cached?.data?.notifications;

            if (notifications && Array.isArray(notifications)) {
                const clientUnreadCount = notifications.filter(n => !n.isRead).length;
                return { ...countResponse, data: { count: clientUnreadCount } };
            }

            return countResponse;
        },
        refetchInterval: 30000,
    });
};
