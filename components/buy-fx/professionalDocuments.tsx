import React, { useState } from 'react';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';

export interface ProfessionalDocsState {
    membership: { file: UploadedFile | null; meta: UploadedMetadata | null };
    invoice: { file: UploadedFile | null; meta: UploadedMetadata | null };
    passport: { file: UploadedFile | null; meta: UploadedMetadata | null };
}

export function useProfessionalDocuments(showToast: (msg: string, type: 'error') => void) {
    const [docs, setDocs] = useState<ProfessionalDocsState>({
        membership: { file: null, meta: null },
        invoice: { file: null, meta: null },
        passport: { file: null, meta: null },
    });

    const updateDoc = (key: keyof ProfessionalDocsState, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'MEMBERSHIP_CARD') updateDoc('membership', file, metadata);
            else if (documentType === 'INVOICE') updateDoc('invoice', file, metadata);
            else if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const documentFields = [
        {
            label: 'Evidence of Membership or Registration',
            onUpload: () => uploadFile('MEMBERSHIP_CARD'),
            fileName: docs.membership.file?.name,
            fileUri: docs.membership.file?.uri,
            fileUrl: docs.membership.meta?.fileUrl,
            fileType: docs.membership.file?.type,
            required: true,
        },
        {
            label: 'Invoice from Professional Body',
            onUpload: () => uploadFile('INVOICE'),
            fileName: docs.invoice.file?.name,
            fileUri: docs.invoice.file?.uri,
            fileUrl: docs.invoice.meta?.fileUrl,
            fileType: docs.invoice.file?.type,
            required: true,
        },
        {
            label: 'International Passport (optional)',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: docs.passport.file?.name,
            fileUri: docs.passport.file?.uri,
            fileUrl: docs.passport.meta?.fileUrl,
            fileType: docs.passport.file?.type,
            required: false,
        },
    ];

    const hasRequiredDocs = !!(docs.membership.file && docs.invoice.file);

    return { docs, documentFields, isUploading, hasRequiredDocs, uploadFile };
}

export function buildProfessionalPayload(data: any, docs: ProfessionalDocsState, currencyGet: any) {
    return {
        type: 'PROFESSIONAL_BODY',
        mode: 'BUY',
        currency: currencyGet.code,
        amount: data.amount,
        purpose: 'Professional Fees Payment',
        destinationCountry: currencyGet.country,
        bvn: data.bvn,
        nin: data.nin,
        formAId: data.formAId,
        passportDocumentNumber: data.passportDocumentNumber,
        passportIssueDate: data.passportIssueDate,
        passportExpiryDate: data.passportExpiryDate,
        memberName: data.memberName,
        memberNumber: data.memberNumber,
        documents: [
            ...(docs.membership.meta ? [docs.membership.meta] : []),
            ...(docs.invoice.meta ? [docs.invoice.meta] : []),
            ...(docs.passport.meta ? [docs.passport.meta] : []),
        ],
        beneficiaryDetails: {
            organizationName: data.organizationName || '',
            memberName: data.memberName,
            phone: data.beneficiaryPhone || '',
            email: data.beneficiaryEmail || '',
            address: data.beneficiaryAddress,
            city: data.beneficiaryCity || '',
            state: data.beneficiaryState || '',
            country: data.beneficiaryCountry,
            bankAccountName: data.bankAccountName,
            bankAccountAddress: data.bankAccountAddress,
            bankAccountIban: data.bankAccountIban || '',
            bankAccountSwiftCode: data.bankAccountSwiftCode,
            bankAccountNumber: data.bankAccountNumber,
            bankName: data.bankName,
            paymentReference: data.paymentReference,
            routingNumber: data.routingNumber || '',
            ifscCode: data.ifscCode || '',
            purposeCode: data.purposeCode || '',
            bsbCode: data.bsbCode || '',
            correspondenceBankName: data.correspondenceBankName || '',
            correspondenceBankAddress: data.correspondenceBankAddress || '',
            correspondenceBankSwiftCode: data.correspondenceBankSwiftCode || '',
        },
        refundBankDetails: {
            bankName: data.customerBankName,
            bankCode: data.customerBankCode,
            accountNumber: data.customerAccountNumber,
            accountName: data.customerAccountName,
        },
    };
}
