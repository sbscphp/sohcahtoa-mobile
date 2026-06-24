import { useToastStore } from '@/stores/useToastStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reuploadTransactionDocument } from '../../../services/transactions';
import { ReuploadTransactionDocumentPayload, UploadTransactionDocumentResponse } from '../../../types/api/transactions';

export const useReuploadTransactionDocumentMutation = () => {
    const queryClient = useQueryClient();
    const showToast = useToastStore((state) => state.showToast);

    return useMutation<UploadTransactionDocumentResponse, any, ReuploadTransactionDocumentPayload>({
        mutationFn: reuploadTransactionDocument,
        onSuccess: (response: UploadTransactionDocumentResponse, variables: ReuploadTransactionDocumentPayload) => {
            if (response.success) {
                showToast(response.message || 'Document reuploaded successfully', 'success');
                queryClient.invalidateQueries({ queryKey: ['transaction', variables.transactionId] });
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to reupload document';
            showToast(message, 'error');
            console.log(error, "error");
        },
    });
};
