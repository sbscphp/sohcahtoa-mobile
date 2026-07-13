import { useToastStore } from '@/stores/useToastStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attachBankAccounts } from '../../../services/transactions';
import { AttachBankAccountsPayload, AttachBankAccountsResponse } from '../../../types/api/transactions';

export const useAttachBankAccountsMutation = () => {
    const queryClient = useQueryClient();
    const showToast = useToastStore((state) => state.showToast);

    return useMutation<AttachBankAccountsResponse, any, AttachBankAccountsPayload>({
        mutationFn: attachBankAccounts,
        onSuccess: (response: AttachBankAccountsResponse, variables: AttachBankAccountsPayload) => {
            if (response.success) {
                showToast(response.message || 'Bank accounts attached successfully', 'success');
            }
            // Invalidate the specific transaction query to refresh the transaction details
            queryClient.invalidateQueries({ queryKey: ['transaction', variables.transactionId] });
        },
        onError: (error: any) => {
            // console.log(error,"ERROR------------------------------")
            const message = error.response?.data?.error?.message || 'Failed to attach bank accounts';

            showToast(message, 'error');
        },
    });
};
