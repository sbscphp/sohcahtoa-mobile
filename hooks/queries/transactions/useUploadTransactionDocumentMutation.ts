import { useToastStore } from '@/stores/useToastStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadTransactionDocument } from '../../../services/transactions';
import { UploadTransactionDocumentPayload, UploadTransactionDocumentResponse } from '../../../types/api/transactions';

export const useUploadTransactionDocumentMutation = () => {
    const queryClient = useQueryClient();
    const showToast = useToastStore((state) => state.showToast);

    return useMutation<UploadTransactionDocumentResponse, any, UploadTransactionDocumentPayload>({
        mutationFn: uploadTransactionDocument,
        onSuccess: (response, variables) => {
            if (response.success && response.data) {
                showToast(response.message || 'Document uploaded successfully', 'success');
                queryClient.invalidateQueries({ queryKey: ['transaction', variables.transactionId] });
            }
            console.log(response, "response");
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to upload document';
            showToast(message, 'error');
            console.log(error, "error");
        },
    });
};
