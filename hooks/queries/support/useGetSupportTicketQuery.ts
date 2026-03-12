import { useQuery } from '@tanstack/react-query';
import { getSupportTicketById } from '../../../services/support';
import { GetSupportTicketByIdResponse } from '../../../types/api/support';

export const useGetSupportTicketQuery = (ticketId: string) => {
    return useQuery<GetSupportTicketByIdResponse, Error>({
        queryKey: ['supportTicket', ticketId],
        queryFn: () => getSupportTicketById(ticketId),
        enabled: !!ticketId,
    });
};
