import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { exportTransactions } from '../../../services/transactions';
import { ExportTransactionsParams } from '../../../types/api/transactions';

export const useExportTransactionsMutation = () => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation<Blob, any, ExportTransactionsParams | undefined>({
        mutationFn: exportTransactions,
        onSuccess: (response) => {
            showToast('Transactions exported successfully', 'success');
            console.log(response, "response");
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to export transactions';
            showToast(message, 'error');
            console.log(error, "error");
        },
    });
};
