import React, { useState } from 'react';
import { View } from 'react-native';
import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';

export interface ResidentDocsState {
    passport: { file: UploadedFile | null; meta: UploadedMetadata | null };
    utility: { file: UploadedFile | null; meta: UploadedMetadata | null };
    signature: { file: UploadedFile | null; meta: UploadedMetadata | null };
}

interface GetResidentDocumentFieldsParams {
    docs: ResidentDocsState;
    uploadFile: (type: any) => void;
    control: any;
}

export function getResidentDocumentFields({ docs, uploadFile, control }: GetResidentDocumentFieldsParams) {
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
            label: 'Utility bill (must not be more than 3 months old)',
            onUpload: () => uploadFile('UTILITY_BILL'),
            fileName: docs.utility.file?.name,
            fileUri: docs.utility.file?.uri,
            fileUrl: docs.utility.meta?.fileUrl,
            fileType: docs.utility.file?.type,
            required: true,
        },
    ];
}

interface GetResidentCredentialFieldsParams {
    control: any;
    watchedFields: { bvn?: string };
    isBvnDisabled: boolean;
    isNinDisabled: boolean;
    isTinDisabled: boolean;
}

export function getResidentCredentialFields({
    control,
    watchedFields,
    isBvnDisabled,
    isNinDisabled,
    isTinDisabled,
}: GetResidentCredentialFieldsParams) {
    return [
        {
            customComponent: (
                <ControlledInput
                    control={control}
                    name="bvn"
                    label="Bank Verification Number (BVN)"
                    placeholder="Enter BVN"
                    required={false}
                    maxLength={11}
                    keyboardType="numeric"
                    disabled={isBvnDisabled}
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
                    required={!isNinDisabled}
                    keyboardType="default"
                    disabled={isNinDisabled}
                />
            ),
        },
        {
            customComponent: (
                <ControlledInput
                    control={control}
                    name="tinNumber"
                    label={watchedFields.bvn ? 'Tax Identification Number (TIN) (Optional)' : 'Tax Identification Number (TIN)'}
                    placeholder="Enter TIN"
                    required={!watchedFields.bvn && !isTinDisabled}
                    keyboardType="default"
                    disabled={isTinDisabled}
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

export function useResidentDocuments(control: any, showToast: (msg: string, type: 'error') => void) {
    const [docs, setDocs] = useState<ResidentDocsState>({
        passport: { file: null, meta: null },
        utility: { file: null, meta: null },
        signature: { file: null, meta: null },
    });

    const updateDoc = (key: keyof ResidentDocsState, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs((prev) => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
            else if (documentType === 'UTILITY_BILL') updateDoc('utility', file, metadata);
            else if (documentType === 'DIGITAL_SIGNATURE') updateDoc('signature', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const documentFields = getResidentDocumentFields({ docs, uploadFile, control });
    const hasAllDocs = !!(docs.passport.meta && docs.utility.meta);

    return {
        docs,
        documentFields,
        uploadFile,
        isUploading,
        hasAllDocs,
    };
}
