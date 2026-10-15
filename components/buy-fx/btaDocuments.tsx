import React from 'react';
import { View } from 'react-native';
import ControlledDatePicker from '@/components/ControlledDatePicker';
import { Control } from 'react-hook-form';
import { UploadedFile, UploadedMetadata } from '@/hooks/useDocumentUpload';

export interface BtaDocsState {
    tcc: { file: UploadedFile | null; meta: UploadedMetadata | null };
    passport: { file: UploadedFile | null; meta: UploadedMetadata | null };
    visa: { file: UploadedFile | null; meta: UploadedMetadata | null };
    returnTicket: { file: UploadedFile | null; meta: UploadedMetadata | null };
    corporateBodyLetter: { file: UploadedFile | null; meta: UploadedMetadata | null };
    partnerInvitationLetter: { file: UploadedFile | null; meta: UploadedMetadata | null };
}

interface GetBtaDocumentFieldsParams {
    docs: BtaDocsState;
    uploadFile: (type: any) => void;
    control: any;
}

export function getBtaDocumentFields({ docs, uploadFile, control }: GetBtaDocumentFieldsParams) {
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
            label: 'Tax Clearance Certificate (TCC)',
            onUpload: () => uploadFile('TCC'),
            fileName: docs.tcc.file?.name,
            fileUri: docs.tcc.file?.uri,
            fileUrl: docs.tcc.meta?.fileUrl,
            fileType: docs.tcc.file?.type,
            required: true,
        },
        {
            label: 'Letter of Request from Employer',
            onUpload: () => uploadFile('CORPORATE_BODY_LETTER'),
            fileName: docs.corporateBodyLetter.file?.name,
            fileUri: docs.corporateBodyLetter.file?.uri,
            fileUrl: docs.corporateBodyLetter.meta?.fileUrl,
            fileType: docs.corporateBodyLetter.file?.type,
            required: true,
        },
        {
            label: 'Letter of Invitation from Overseas Partner',
            onUpload: () => uploadFile('PARTNER_INVITATION_LETTER'),
            fileName: docs.partnerInvitationLetter.file?.name,
            fileUri: docs.partnerInvitationLetter.file?.uri,
            fileUrl: docs.partnerInvitationLetter.meta?.fileUrl,
            fileType: docs.partnerInvitationLetter.file?.type,
            required: true,
        },
    ];
}

export function useBtaDocuments(control: any, showToast: (msg: string, type: 'error') => void) {
    const [docs, setDocs] = React.useState<BtaDocsState>({
        tcc: { file: null, meta: null },
        passport: { file: null, meta: null },
        visa: { file: null, meta: null },
        returnTicket: { file: null, meta: null },
        corporateBodyLetter: { file: null, meta: null },
        partnerInvitationLetter: { file: null, meta: null },
    });

    const updateDoc = (key: keyof BtaDocsState, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = require('@/hooks/useDocumentUpload').useDocumentUpload({
        onSuccess: (type: string, { file, metadata }: any) => {
            const map: Record<string, keyof BtaDocsState> = {
                TCC: 'tcc', PASSPORT: 'passport', VISA: 'visa',
                RETURN_TICKET: 'returnTicket', CORPORATE_BODY_LETTER: 'corporateBodyLetter',
                PARTNER_INVITATION_LETTER: 'partnerInvitationLetter',
            };
            if (map[type]) updateDoc(map[type], file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const documentFields = getBtaDocumentFields({ docs, uploadFile, control });
    const hasAllDocs = !!(docs.tcc.file && docs.passport.file && docs.visa.file && docs.returnTicket.file && docs.corporateBodyLetter.file && docs.partnerInvitationLetter.file);

    return { docs, documentFields, isUploading, hasAllDocs };
}

