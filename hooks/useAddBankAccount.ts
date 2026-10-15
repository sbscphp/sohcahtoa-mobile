import { useEffect, useMemo, useState } from 'react';
import { SelectionItem } from '@/components/GenericSelectionSheet';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useLookupAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { useSaveAccountMutation } from '@/hooks/queries/banks/useSaveAccountMutation';
import { useToastStore } from '@/stores/useToastStore';

interface UseAddBankAccountOptions {
    onSuccess?: (newAccountId?: string) => void;
}

export function useAddBankAccount(options?: UseAddBankAccountOptions) {
    const showToast = useToastStore((state) => state.showToast);
    const { data: banksResponse } = useGetBanksQuery();
    const resolveAccount = useLookupAccountMutation();
    const saveAccountMutation = useSaveAccountMutation();

    const [addModalVisible, setAddModalVisible] = useState(false);
    const [bankSheetVisible, setBankSheetVisible] = useState(false);
    const [selectedBank, setSelectedBank] = useState<SelectionItem | null>(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [isResolving, setIsResolving] = useState(false);

    const banks = useMemo(
        () => (banksResponse?.data || []).map((b) => ({ id: b.code, label: b.name, value: b.code })),
        [banksResponse]
    );

    useEffect(() => {
        if (!addModalVisible) {
            setSelectedBank(null);
            setAccountNumber('');
            setAccountName('');
            setIsResolving(false);
        }
    }, [addModalVisible]);

    useEffect(() => {
        if (accountNumber.length === 10 && selectedBank) {
            setIsResolving(true);
            resolveAccount.mutate(
                {
                    accountNumber,
                    bankName: selectedBank.label,
                },
                {
                    onSuccess: (res) => {
                        setIsResolving(false);
                        if (res.success) {
                            setAccountName(res.data.accountName);
                        }
                    },
                    onError: () => {
                        setIsResolving(false);
                        setAccountName('');
                        showToast('Could not resolve account name', 'error');
                    },
                }
            );
        } else {
            setAccountName('');
        }
    }, [accountNumber, selectedBank]);

    const handleSave = () => {
        if (!selectedBank || accountNumber.length !== 10 || !accountName) {
            showToast('Please fill out all bank account details.', 'error');
            return;
        }

        saveAccountMutation.mutate(
            {
                bankName: selectedBank.label,
                accountNumber,
                accountName,
            },
            {
                onSuccess: (res) => {
                    if (res.success) {
                        setAddModalVisible(false);
                        options?.onSuccess?.(res.data?.id);
                    }
                },
            }
        );
    };

    return {
        addModalVisible,
        setAddModalVisible,
        bankSheetVisible,
        setBankSheetVisible,
        selectedBank,
        setSelectedBank,
        accountNumber,
        setAccountNumber,
        accountName,
        isResolving,
        banks,
        handleSave,
        isSaving: saveAccountMutation.isPending,
    };
}
