import { useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { useGetTransactionsQuery } from '@/hooks/queries/transactions/useGetTransactionsQuery';
import { formatDateToPickerFormat } from '@/utils/helpers';

interface UsePassportAutofillOptions {
    user: any;
    profile?: any;
    setValue: UseFormSetValue<any>;
    passportDocumentNumber?: string;
    passportIssueDate?: string;
    passportExpiryDate?: string;
    bvn?: string;
    nin?: string;
}

export function usePassportAutofill({
    user,
    profile,
    setValue,
    passportDocumentNumber,
    passportIssueDate,
    passportExpiryDate,
    bvn,
    nin,
}: UsePassportAutofillOptions) {
    const { data: transactionsResponse } = useGetTransactionsQuery();
    const transactions = transactionsResponse?.pages?.flatMap(p => p.data) || [];

    useEffect(() => {
        let foundNin = '';
        let foundPassportNumber = '';
        let foundPassportIssueDate = '';
        let foundPassportExpiryDate = '';

        if (transactions.length > 0) {
            for (const tx of transactions) {
                const ninVal = tx.personalInfo?.nin || (tx as any).nin;
                const passportVal = tx.personalInfo?.passportDocumentNumber || (tx as any).passportDocumentNumber;
                const issueDateVal = tx.personalInfo?.passportIssueDate;
                const expiryDateVal = tx.personalInfo?.passportExpiryDate;

                if (!foundNin && ninVal) foundNin = String(ninVal);
                if (!foundPassportNumber && passportVal) foundPassportNumber = String(passportVal);
                if (!foundPassportIssueDate && issueDateVal) foundPassportIssueDate = String(issueDateVal);
                if (!foundPassportExpiryDate && expiryDateVal) foundPassportExpiryDate = String(expiryDateVal);

                if (foundPassportNumber && foundPassportIssueDate && foundPassportExpiryDate) break;
            }
        }

        const profileBvn = profile?.bvn || user?.kyc?.bvn || '';
        const profilePassportNumber = user?.kyc?.passportDocumentNumber || '';
        const profileNin = profile?.nin || (user?.kyc as any)?.nin || (user as any)?.nin || '';

        const finalNin = foundNin || profileNin;
        const finalPassportNumber = foundPassportNumber || profilePassportNumber;

        if (bvn !== undefined && profileBvn && !bvn) {
            setValue('bvn', profileBvn, { shouldValidate: true, shouldDirty: true });
        }
        if (nin !== undefined && finalNin && !nin) {
            setValue('nin', finalNin, { shouldValidate: true, shouldDirty: true });
        }
        if (finalPassportNumber && !passportDocumentNumber) {
            setValue('passportDocumentNumber', finalPassportNumber, { shouldValidate: true, shouldDirty: true });
        }
        if (foundPassportIssueDate && !passportIssueDate) {
            setValue('passportIssueDate', formatDateToPickerFormat(foundPassportIssueDate), { shouldValidate: true, shouldDirty: true });
        }
        if (foundPassportExpiryDate && !passportExpiryDate) {
            setValue('passportExpiryDate', formatDateToPickerFormat(foundPassportExpiryDate), { shouldValidate: true, shouldDirty: true });
        }
    }, [transactions, user, profile, setValue, passportDocumentNumber, passportIssueDate, passportExpiryDate, bvn, nin]);
}
