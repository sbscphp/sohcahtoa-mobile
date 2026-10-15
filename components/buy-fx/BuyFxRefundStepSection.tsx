import React from 'react';
import RefundBankDetailsStep from '@/components/transaction-flow/RefundBankDetailsStep';
import AddNewAccountStep from '@/components/transaction-flow/AddNewAccountStep';
import { Control, UseFormSetValue } from 'react-hook-form';

interface BuyFxRefundStepSectionProps {
    isAddingNewAccount: boolean;
    savedAccounts: any[];
    selectedSavedAccountId: string | null;
    setSelectedSavedAccountId: (id: string | null) => void;
    setValue: UseFormSetValue<any>;
    setIsAddingNewAccount: (adding: boolean) => void;
    control: any;
    banks: any[];
    isResolving: boolean;
    selectedBankCode?: string;
}

export default function BuyFxRefundStepSection({
    isAddingNewAccount,
    savedAccounts,
    selectedSavedAccountId,
    setSelectedSavedAccountId,
    setValue,
    setIsAddingNewAccount,
    control,
    banks,
    isResolving,
    selectedBankCode,
}: BuyFxRefundStepSectionProps) {
    if (isAddingNewAccount) {
        return (
            <AddNewAccountStep
                control={control}
                setValue={setValue}
                banks={banks}
                isResolving={isResolving}
                selectedBankCode={selectedBankCode}
            />
        );
    }

    return (
        <RefundBankDetailsStep
            savedAccounts={savedAccounts}
            selectedSavedAccountId={selectedSavedAccountId}
            setSelectedSavedAccountId={setSelectedSavedAccountId}
            setValue={setValue}
            setIsAddingNewAccount={setIsAddingNewAccount}
        />
    );
}
