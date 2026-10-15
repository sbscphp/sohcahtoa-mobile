import React from 'react';
import { View } from 'react-native';
import ControlledDatePicker from '@/components/ControlledDatePicker';
import { Control } from 'react-hook-form';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';

export interface PtaDocsState {
    visa: { file: UploadedFile | null; meta: UploadedMetadata | null };
    returnTicket: { file: UploadedFile | null; meta: UploadedMetadata | null };
    passport: { file: UploadedFile | null; meta: UploadedMetadata | null };
}

interface GetPtaDocumentFieldsParams {
    docs: PtaDocsState;
    uploadFile: (type: any) => void;
}

export function getPtaDocumentFields({ docs, uploadFile }: GetPtaDocumentFieldsParams) {
    return [
        {
            label: 'Valid Visa',
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
            fileName: docs.returnTicket.file?.name,
            fileUri: docs.returnTicket.file?.uri,
            fileUrl: docs.returnTicket.meta?.fileUrl,
            fileType: docs.returnTicket.file?.type,
            required: true,
        },
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: docs.passport.file?.name,
            fileUri: docs.passport.file?.uri,
            fileUrl: docs.passport.meta?.fileUrl,
            fileType: docs.passport.file?.type,
            required: true,
        },
    ];
}

export function usePtaDocuments(showToast: (msg: string, type: 'error') => void) {
    const [docs, setDocs] = React.useState<PtaDocsState>({
        visa: { file: null, meta: null },
        returnTicket: { file: null, meta: null },
        passport: { file: null, meta: null },
    });

    const updateDoc = (key: keyof PtaDocsState, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'VISA') updateDoc('visa', file, metadata);
            else if (documentType === 'RETURN_TICKET') updateDoc('returnTicket', file, metadata);
            else if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const documentFields = getPtaDocumentFields({ docs, uploadFile });
    const hasAllDocs = !!(docs.visa.file && docs.returnTicket.file && docs.passport.file);

    return { docs, documentFields, isUploading, hasAllDocs };
}
