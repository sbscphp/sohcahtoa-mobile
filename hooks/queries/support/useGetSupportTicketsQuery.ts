import { useQuery } from '@tanstack/react-query';
import { getSupportTickets } from '../../../services/support';
import { GetSupportTicketsParams, GetSupportTicketsResponse } from '../../../types/api/support';

export const useGetSupportTicketsQuery = (params?: GetSupportTicketsParams) => {
    return useQuery<GetSupportTicketsResponse, Error>({
        queryKey: ['supportTickets', params],
        queryFn: () => getSupportTickets(params),
    });
};
