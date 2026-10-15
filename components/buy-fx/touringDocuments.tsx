import React from 'react';
import { View } from 'react-native';
import ControlledDatePicker from '@/components/ControlledDatePicker';
import { Control } from 'react-hook-form';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';

export interface TouringDocsState {
    passport: { file: UploadedFile | null; meta: UploadedMetadata | null };
    visa: { file: UploadedFile | null; meta: UploadedMetadata | null };
    ticket: { file: UploadedFile | null; meta: UploadedMetadata | null };
    receipt: { file: UploadedFile | null; meta: UploadedMetadata | null };
    signature: { file: UploadedFile | null; meta: UploadedMetadata | null };
}

interface GetTouringDocumentFieldsParams {
    docs: TouringDocsState;
    uploadFile: (type: any) => void;
    control: any;
}

export function getTouringDocumentFields({ docs, uploadFile, control }: GetTouringDocumentFieldsParams) {
    return [
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: docs.passport.file?.name,
            fileUri: docs.passport.file?.uri,
            fileUrl: docs.passport.meta?.fileUrl,
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
            fileUri: docs.visa.file?.uri,
            fileUrl: docs.visa.meta?.fileUrl,
            fileType: docs.visa.file?.type,
            required: true,
        },
        {
            label: 'Return Ticket',
            onUpload: () => uploadFile('RETURN_TICKET'),
            fileName: docs.ticket.file?.name,
            fileUri: docs.ticket.file?.uri,
            fileUrl: docs.ticket.meta?.fileUrl,
            fileType: docs.ticket.file?.type,
            required: true,
        },
        {
            label: 'Receipt for Initial Naira Purchase',
            onUpload: () => uploadFile('RECEIPT'),
            fileName: docs.receipt.file?.name,
            fileUri: docs.receipt.file?.uri,
            fileUrl: docs.receipt.meta?.fileUrl,
            fileType: docs.receipt.file?.type,
            required: true,
        },
    ];
}

export function useTouringDocuments(control: any, showToast: (msg: string, type: 'error') => void) {
    const [docs, setDocs] = React.useState<TouringDocsState>({
        passport: { file: null, meta: null },
        visa: { file: null, meta: null },
        ticket: { file: null, meta: null },
        receipt: { file: null, meta: null },
        signature: { file: null, meta: null },
    });

    const updateDoc = (key: keyof TouringDocsState, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
            else if (documentType === 'VISA') updateDoc('visa', file, metadata);
            else if (documentType === 'RETURN_TICKET') updateDoc('ticket', file, metadata);
            else if (documentType === 'RECEIPT') updateDoc('receipt', file, metadata);
            else if (documentType === 'DIGITAL_SIGNATURE') updateDoc('signature', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const documentFields = getTouringDocumentFields({ docs, uploadFile, control });
    const hasAllDocs = !!(docs.passport.file && docs.visa.file && docs.ticket.file && docs.receipt.file);

    return { docs, documentFields, isUploading, hasAllDocs };
}
