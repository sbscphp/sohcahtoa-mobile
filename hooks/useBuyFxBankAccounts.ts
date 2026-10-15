import { useMemo, useState, useEffect } from 'react';
import { UseFormSetValue, UseFormTrigger } from 'react-hook-form';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useGetSavedAccountsQuery } from '@/hooks/queries/banks/useGetSavedAccountsQuery';
import { useLookupAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { useSaveAccountMutation } from '@/hooks/queries/banks/useSaveAccountMutation';
import { useToastStore } from '@/stores/useToastStore';

interface UseBuyFxBankAccountsOptions {
    setValue: UseFormSetValue<any>;
    trigger: UseFormTrigger<any>;
    customerAccountNumber?: string;
    customerBankName?: string;
    customerBankCode?: string;
    customerAccountName?: string;
}

export function useBuyFxBankAccounts({
    setValue,
    trigger,
    customerAccountNumber,
    customerBankName,
    customerBankCode,
    customerAccountName,
}: UseBuyFxBankAccountsOptions) {
    const showToast = useToastStore(s => s.showToast);
    const [selectedSavedAccountId, setSelectedSavedAccountId] = useState<string | null>('');
    const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);

    const { data: banksResponse } = useGetBanksQuery();
    const banks = useMemo(() =>
        (banksResponse?.data || []).map(b => ({ id: b.code, label: b.name, value: b.code })),
        [banksResponse]);

    const { data: savedAccountsResponse } = useGetSavedAccountsQuery();
    const savedAccounts = useMemo(() => {
        return (savedAccountsResponse?.data || []).map(a => {
            const clean = (str: string) => {
                return (str || '')
                    .toLowerCase()
                    .replace(/\b(plc|limited|ltd|bank|microfinance|mgb|mfd)\b/g, '')
                    .replace(/[^a-z0-9]/g, '')
                    .trim();
            };
            const cleanedTarget = clean(a.bankName);
            const foundBank = (banksResponse?.data || []).find(b => {
                const cleanedBank = clean(b.name);
                return cleanedBank === cleanedTarget || cleanedBank.includes(cleanedTarget) || cleanedTarget.includes(cleanedBank);
            });
            return {
                id: a.id,
                bankName: a.bankName,
                accountNumber: a.accountNumber,
                accountName: a.accountName,
                bankCode: foundBank?.code || '',
            };
        });
    }, [savedAccountsResponse, banksResponse]);

    const saveAccountMutation = useSaveAccountMutation();
    const resolveAccount = useLookupAccountMutation();

    useEffect(() => {
        if (!isAddingNewAccount) return;
        if (customerAccountNumber?.length === 10 && customerBankCode) {
            resolveAccount.mutate({
                accountNumber: customerAccountNumber,
                bankName: customerBankName || '',
            }, {
                onSuccess: (res) => {
                    if (res.success) {
                        setValue('customerAccountName', res.data.accountName, { shouldValidate: true, shouldDirty: true });
                    }
                },
                onError: () => {
                    setValue('customerAccountName', '', { shouldValidate: true, shouldDirty: true });
                    showToast('Could not resolve account name', 'error');
                },
            });
        } else {
            if (customerAccountName) {
                setValue('customerAccountName', '', { shouldValidate: true, shouldDirty: true });
            }
        }
    }, [customerAccountNumber, customerBankCode, isAddingNewAccount]);

    const handleSaveNewAccount = async () => {
        const isValid = await trigger([
            'customerBankName',
            'customerBankCode',
            'customerAccountNumber',
            'customerAccountName',
        ]);

        if (isValid) {
            saveAccountMutation.mutate({
                bankName: customerBankName || '',
                accountNumber: customerAccountNumber || '',
                accountName: customerAccountName || '',
            }, {
                onSuccess: (res) => {
                    if (res.data?.id) {
                        setSelectedSavedAccountId(res.data.id);
                    }
                    setIsAddingNewAccount(false);
                },
            });
        }
    };

    return {
        banks,
        savedAccounts,
        selectedSavedAccountId,
        setSelectedSavedAccountId,
        isAddingNewAccount,
        setIsAddingNewAccount,
        saveAccountMutation,
        resolveAccount,
        handleSaveNewAccount,
    };
}
