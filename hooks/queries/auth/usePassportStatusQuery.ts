import { useQuery } from '@tanstack/react-query';
import { getPassportStatus } from '../../../services/auth';

export const usePassportStatusQuery = () => {
    return useQuery({
        queryKey: ['passportStatus'],
        queryFn: getPassportStatus,
        // Refetch frequently if pending, or keep it manual depending on UI needs
        refetchInterval: (query: any) => {
            return query.state.data?.data.status === 'PENDING' ? 5000 : false;
        },

    });
};
