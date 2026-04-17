import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { verifyExpatriatePassport } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';
import { VerifyPassportResponse } from '@/types/api/auth';

export const useVerifyExpatriatePassportMutation = () => {
    const setVerificationToken = useAuthStore((state) => state.setVerificationToken);
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: verifyExpatriatePassport,
        onSuccess: (response: VerifyPassportResponse) => {
            if (response.success && response.data.verificationToken) {
                setVerificationToken(response.data.verificationToken);
                showToast(response.data.message || 'Passport Verified Successfully', 'success');
            }
            console.log(response, "response");
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.message || 'Passport Verification Failed';
            showToast(message, 'error');
        },
    });
};
