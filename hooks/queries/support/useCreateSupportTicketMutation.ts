import { useToastStore } from '@/stores/useToastStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupportTicket } from '../../../services/support';
import { CreateSupportTicketPayload, CreateSupportTicketResponse } from '../../../types/api/support';

export const useCreateSupportTicketMutation = () => {
    const queryClient = useQueryClient();
    const showToast = useToastStore((state) => state.showToast);

    return useMutation<CreateSupportTicketResponse, any, CreateSupportTicketPayload>({
        mutationFn: createSupportTicket,
        onSuccess: (response: CreateSupportTicketResponse) => {
            if (response.success && response.data) {
                showToast(response.data.message || response.message || 'Support ticket created successfully', 'success');
                queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to create support ticket';
            showToast(message, 'error');
        },
    });
};
