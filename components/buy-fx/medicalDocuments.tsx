import React, { useState } from 'react';
import { View } from 'react-native';
import ControlledDatePicker from '@/components/ControlledDatePicker';
import { Control } from 'react-hook-form';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';

export interface MedicalDocsState {
    passport: { file: UploadedFile | null; meta: UploadedMetadata | null };
    visa: { file: UploadedFile | null; meta: UploadedMetadata | null };
    returnTicket: { file: UploadedFile | null; meta: UploadedMetadata | null };
    referenceLetter: { file: UploadedFile | null; meta: UploadedMetadata | null };
    overseaDoctorLetter: { file: UploadedFile | null; meta: UploadedMetadata | null };
    invoice: { file: UploadedFile | null; meta: UploadedMetadata | null };
}

export function useMedicalDocuments(control: any, showToast: (msg: string, type: 'error') => void) {
    const [docs, setDocs] = useState<MedicalDocsState>({
        passport: { file: null, meta: null },
        visa: { file: null, meta: null },
        returnTicket: { file: null, meta: null },
        referenceLetter: { file: null, meta: null },
        overseaDoctorLetter: { file: null, meta: null },
        invoice: { file: null, meta: null },
    });

    const updateDoc = (key: keyof MedicalDocsState, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
            else if (documentType === 'VISA') updateDoc('visa', file, metadata);
            else if (documentType === 'RETURN_TICKET') updateDoc('returnTicket', file, metadata);
            else if (documentType === 'MEDICAL_LETTER') updateDoc('referenceLetter', file, metadata);
            else if (documentType === 'OVERSEAS_MEDICAL_LETTER') updateDoc('overseaDoctorLetter', file, metadata);
            else if (documentType === 'INVOICE') updateDoc('invoice', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const documentFields = [
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: docs.passport.file?.name,
            fileUri: docs.passport.file?.uri, fileUrl: docs.passport.meta?.fileUrl,
            fileType: docs.passport.file?.type,
            required: true,
            associatedInputs: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <ControlledDatePicker control={control} name="passportIssueDate" label="Passport Issue Date" required maximumDate={new Date()} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ControlledDatePicker control={control} name="passportExpiryDate" label="Passport Expiry Date" required minimumDate={new Date()} />
                    </View>
                </View>
            ),
        },
        {
            label: 'Valid Visa ',
            onUpload: () => uploadFile('VISA'),
            fileName: docs.visa.file?.name,
            fileUri: docs.visa.file?.uri, fileUrl: docs.visa.meta?.fileUrl,
            fileType: docs.visa.file?.type,
            required: true,
        },
        {
            label: 'Return Ticket',
            onUpload: () => uploadFile('RETURN_TICKET'),
            fileName: docs.returnTicket.file?.name,
            fileUri: docs.returnTicket.file?.uri, fileUrl: docs.returnTicket.meta?.fileUrl,
            fileType: docs.returnTicket.file?.type,
            required: true,
        },
        {
            label: 'Letter of Reference from a Specialist Doctor',
            onUpload: () => uploadFile('MEDICAL_LETTER'),
            fileName: docs.referenceLetter.file?.name,
            fileUri: docs.referenceLetter.file?.uri, fileUrl: docs.referenceLetter.meta?.fileUrl,
            fileType: docs.referenceLetter.file?.type,
            required: true,
        },
        {
            label: 'Letter from Overseas Doctor',
            onUpload: () => uploadFile('OVERSEAS_MEDICAL_LETTER'),
            fileName: docs.overseaDoctorLetter.file?.name,
            fileUri: docs.overseaDoctorLetter.file?.uri, fileUrl: docs.overseaDoctorLetter.meta?.fileUrl,
            fileType: docs.overseaDoctorLetter.file?.type,
            required: true,
        },
        {
            label: 'Hospital Invoice',
            onUpload: () => uploadFile('INVOICE'),
            fileName: docs.invoice.file?.name,
            fileUri: docs.invoice.file?.uri, fileUrl: docs.invoice.meta?.fileUrl,
            fileType: docs.invoice.file?.type,
            required: true,
        },
    ];

    const hasAllDocs = !!(
        docs.passport.file &&
        docs.visa.file &&
        docs.returnTicket.file &&
        docs.referenceLetter.file &&
        docs.overseaDoctorLetter.file &&
        docs.invoice.file
    );

    return { docs, documentFields, isUploading, hasAllDocs };
}

export function buildMedicalPayload(data: any, docs: MedicalDocsState, currencyGet: any) {
    return {
        type: 'MEDICAL',
        mode: 'BUY',
        currency: currencyGet.code,
        amount: data.amount,
        purpose: 'Medical Fees',
        destinationCountry: data.beneficiaryCountry,
        bvn: data.bvn,
        nin: data.nin,
        formAId: data.formAId,
        passportDocumentNumber: data.passportDocumentNumber,
        passportIssueDate: data.passportIssueDate,
        passportExpiryDate: data.passportExpiryDate,
        documents: [
            ...(docs.passport.meta ? [docs.passport.meta] : []),
            ...(docs.visa.meta ? [docs.visa.meta] : []),
            ...(docs.returnTicket.meta ? [docs.returnTicket.meta] : []),
            ...(docs.referenceLetter.meta ? [docs.referenceLetter.meta] : []),
            ...(docs.overseaDoctorLetter.meta ? [docs.overseaDoctorLetter.meta] : []),
            ...(docs.invoice.meta ? [docs.invoice.meta] : []),
        ],
        beneficiaryDetails: {
            organizationName: data.organizationName || '',
            bankAccountName: data.bankAccountName,
            bankAccountAddress: data.bankAccountAddress,
            bankAccountIban: data.bankAccountIban,
            bankAccountSwiftCode: data.bankAccountSwiftCode,
            bankAccountNumber: data.bankAccountNumber,
            bankName: data.bankName,
            country: data.beneficiaryCountry,
            address: data.beneficiaryAddress,
            email: data.beneficiaryEmail || '',
            phoneNumber: data.beneficiaryPhone || '',
            city: data.beneficiaryCity || '',
            state: data.beneficiaryState || '',
            paymentReference: data.paymentReference,
            routingNumber: data.routingNumber,
            ifscCode: data.ifscCode,
            purposeCode: data.purposeCode,
            bsbCode: data.bsbCode,
            otherBankDetails: data.otherBankDetails,
            correspondenceBankName: data.correspondenceBankName,
            correspondenceBankAddress: data.correspondenceBankAddress,
            correspondenceBankSwiftCode: data.correspondenceBankSwiftCode,
        },
        refundBankDetails: {
            bankName: data.customerBankName,
            bankCode: data.customerBankCode,
            accountNumber: data.customerAccountNumber,
            accountName: data.customerAccountName,
        },
    };
}
