import React from 'react';
import AddDomiciliaryAccountStep from '@/components/transaction-flow/AddDomiciliaryAccountStep';
import RefundBankDetailsStep from '@/components/transaction-flow/RefundBankDetailsStep';
import { UseFormSetValue } from 'react-hook-form';

interface SellFxRefundStepSectionProps {
    isAddingNewAccount: boolean;
    control: any;
    setValue: UseFormSetValue<any>;
    savedAccounts: any[];
    selectedSavedAccountId: string | null;
    setSelectedSavedAccountId: (id: string | null) => void;
    setIsAddingNewAccount: (adding: boolean) => void;
    domiciliaryAccount: {
        bankName?: string;
        accountNumber?: string;
        accountName?: string;
        swiftCode?: string;
        routingNumber?: string;
        bankAddress?: string;
    };
}

export default function SellFxRefundStepSection({
    isAddingNewAccount,
    control,
    setValue,
    savedAccounts,
    selectedSavedAccountId,
    setSelectedSavedAccountId,
    setIsAddingNewAccount,
    domiciliaryAccount,
}: SellFxRefundStepSectionProps) {
    if (isAddingNewAccount) {
        return (
            <AddDomiciliaryAccountStep
                control={control}
                setValue={setValue}
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
            isDomiciliary={true}
            domiciliaryAccount={domiciliaryAccount}
        />
    );
}
