import React from 'react';
import SourceOfFundsSheet from '@/components/SourceOfFundsSheet';
import { useDeclarationStore } from '@/stores/useDeclarationStore';

interface SellFxSourceOfFundsSheetProps {
    visible: boolean;
    onClose: () => void;
    user: any;
    passportDocumentNumber?: string;
    transactionTypeTitle: string;
    currencyName?: string;
    currencyCode?: string;
    amountGet?: string;
    onUploadSignature: () => void;
    signatureFileName?: string | null;
    isUploadingSignature: boolean;
    initials: string;
    onChangeInitials: (initials: string) => void;
}

export default function SellFxSourceOfFundsSheet({
    visible,
    onClose,
    user,
    passportDocumentNumber,
    transactionTypeTitle,
    currencyName,
    currencyCode,
    amountGet,
    onUploadSignature,
    signatureFileName,
    isUploadingSignature,
    initials,
    onChangeInitials,
}: SellFxSourceOfFundsSheetProps) {
    return (
        <SourceOfFundsSheet
            visible={visible}
            onClose={onClose}
            onSubmit={(method) => {
                useDeclarationStore.getState().setDeclarationCompleted(true, method, initials);
                onClose();
            }}
            customerInfo={{
                fullName: `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`,
                phoneNumber: user?.phoneNumber || '',
                email: user?.email || '',
                bvn: user?.kyc?.bvn || '',
                address: user?.profile?.address || '',
                passportDocumentNumber: passportDocumentNumber || user?.kyc?.passportDocumentNumber || '',
            }}
            transactionDetails={{
                type: transactionTypeTitle,
                currency: currencyName || '',
                amount: `${currencyCode || ''} ${amountGet || ''}`,
                purpose: 'Exchange',
            }}
            onUploadSignature={onUploadSignature}
            signatureFile={signatureFileName ?? undefined}
            isUploadingSignature={isUploadingSignature}
            initials={initials}
            onChangeInitials={onChangeInitials}
        />
    );
}
