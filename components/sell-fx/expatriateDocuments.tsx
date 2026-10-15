import React, { useState } from 'react';
import { View } from 'react-native';
import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';

export interface ExpatriateDocsState {
    workPermit: { file: UploadedFile | null; meta: UploadedMetadata | null };
    passport: { file: UploadedFile | null; meta: UploadedMetadata | null };
    utility: { file: UploadedFile | null; meta: UploadedMetadata | null };
    signature: { file: UploadedFile | null; meta: UploadedMetadata | null };
}

interface GetExpatriateDocumentFieldsParams {
    docs: ExpatriateDocsState;
    uploadFile: (type: any) => void;
    control: any;
}

export function getExpatriateDocumentFields({ docs, uploadFile, control }: GetExpatriateDocumentFieldsParams) {
    return [
        {
            label: 'Work/Residence Permit',
            onUpload: () => uploadFile('WORK_PERMIT'),
            fileName: docs.workPermit.file?.name,
            fileUri: docs.workPermit.file?.uri,
            fileUrl: docs.workPermit.meta?.fileUrl,
            fileType: docs.workPermit.file?.type,
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
            associatedInputs: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <ControlledDatePicker
                            control={control}
                            name="passportIssueDate"
                            label="Passport Issue Date"
                            required
                            maximumDate={new Date()}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ControlledDatePicker
                            control={control}
                            name="passportExpiryDate"
                            label="Passport Expiry Date"
                            required
                            minimumDate={new Date()}
                        />
                    </View>
                </View>
            ),
        },
        {
            label: 'Utility Bill (must not be more than 3 months old)',
            onUpload: () => uploadFile('UTILITY_BILL'),
            fileName: docs.utility.file?.name,
            fileUri: docs.utility.file?.uri,
            fileUrl: docs.utility.meta?.fileUrl,
            fileType: docs.utility.file?.type,
            required: true,
        },
    ];
}

export function getExpatriateCredentialFields(control: any) {
    return [
        {
            customComponent: (
                <ControlledInput
                    control={control}
                    name="bvn"
                    label="Bank Verification Number (BVN)"
                    placeholder="Enter BVN"
                    required
                    maxLength={11}
                    keyboardType="numeric"
                    disabled
                />
            ),
        },
        {
            customComponent: (
                <ControlledInput
                    control={control}
                    name="nin"
                    label="National Identification Number (NIN)"
                    placeholder="Enter NIN"
                    keyboardType="default"
                    disabled
                    required
                />
            ),
        },
        {
            customComponent: (
                <ControlledInput
                    control={control}
                    name="passportDocumentNumber"
                    label="International Passport Number"
                    placeholder="Enter international passport number"
                    required
                    filterType="alphanumeric"
                />
            ),
        },
    ];
}

export function useExpatriateDocuments(control: any, showToast: (msg: string, type: 'error') => void) {
    const [docs, setDocs] = useState<ExpatriateDocsState>({
        workPermit: { file: null, meta: null },
        passport: { file: null, meta: null },
        utility: { file: null, meta: null },
        signature: { file: null, meta: null },
    });

    const updateDoc = (key: keyof ExpatriateDocsState, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs((prev) => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'WORK_PERMIT') updateDoc('workPermit', file, metadata);
            else if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
            else if (documentType === 'UTILITY_BILL') updateDoc('utility', file, metadata);
            else if (documentType === 'DIGITAL_SIGNATURE') updateDoc('signature', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const documentFields = getExpatriateDocumentFields({ docs, uploadFile, control });
    const hasAllDocs = !!(docs.workPermit.file && docs.passport.file && docs.utility.file);

    return {
        docs,
        documentFields,
        uploadFile,
        isUploading,
        hasAllDocs,
    };
}
