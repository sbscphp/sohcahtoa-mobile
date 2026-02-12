import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { uploadPassport } from '../../../services/auth';

export const useUploadPassportMutation = () => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: uploadPassport,
        onSuccess: (response) => {
            if (response.success && response.data.passportDocumentUrl) {
                showToast('Passport Uploaded Successfully', 'success');
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Passport Upload Failed';
            showToast(message, 'error');
        },
    });
};
