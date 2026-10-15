import React from 'react';
import PayoutMethodStep from '@/components/transaction-flow/PayoutMethodStep';
import AddNewAccountStep from '@/components/transaction-flow/AddNewAccountStep';
import { UseFormSetValue } from 'react-hook-form';

interface SellFxPayoutStepSectionProps {
    isAddingNewAccount: boolean;
    control: any;
    setValue: UseFormSetValue<any>;
    setPayoutSheetVisible: (visible: boolean) => void;
    savedAccounts: any[];
    selectedSavedAccountId: string | null;
    setSelectedSavedAccountId: (id: string | null) => void;
    setIsAddingNewAccount: (adding: boolean) => void;
    banks: any[];
    isResolving: boolean;
    selectedBankCode?: string;
}

export default function SellFxPayoutStepSection({
    isAddingNewAccount,
    control,
    setValue,
    setPayoutSheetVisible,
    savedAccounts,
    selectedSavedAccountId,
    setSelectedSavedAccountId,
    setIsAddingNewAccount,
    banks,
    isResolving,
    selectedBankCode,
}: SellFxPayoutStepSectionProps) {
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
        <PayoutMethodStep
            control={control}
            setValue={setValue}
            setPayoutSheetVisible={setPayoutSheetVisible}
            savedAccounts={savedAccounts}
            selectedSavedAccountId={selectedSavedAccountId}
            setSelectedSavedAccountId={setSelectedSavedAccountId}
            setIsAddingNewAccount={setIsAddingNewAccount}
            isSellFx={true}
            banks={banks}
        />
    );
}
