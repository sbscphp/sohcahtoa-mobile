import { useQuery } from '@tanstack/react-query';
import { getSupportTicketByReference } from '../../../services/support';
import { GetSupportTicketByIdResponse } from '../../../types/api/support';

export const useGetSupportTicketByReferenceQuery = (reference: string) => {
    return useQuery<GetSupportTicketByIdResponse, Error>({
        queryKey: ['supportTicketByReference', reference],
        queryFn: () => getSupportTicketByReference(reference),
        enabled: !!reference,
    });
};
