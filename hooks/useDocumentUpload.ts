import { useUploadTransactionDocumentMutation } from '@/hooks/queries/transactions/useUploadTransactionDocumentMutation';
import { useReuploadTransactionDocumentMutation } from '@/hooks/queries/transactions/useReuploadTransactionDocumentMutation';
import { useAuthStore } from '@/stores/useAuthStore';
import * as DocumentPicker from 'expo-document-picker';

export interface UploadedFile {
    uri: string;
    name: string;
    type: string;
    size: number;
}

export interface UploadedMetadata {
    documentType: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
}

export interface DocumentUploadResult {
    file: UploadedFile;
    metadata: UploadedMetadata;
    response: any;
}

interface UseDocumentUploadOptions {
    onSuccess: (documentType: string, result: DocumentUploadResult) => void;
    onError?: (error: unknown) => void;
    transactionId?: string;
}


export function useDocumentUpload({ onSuccess, onError, transactionId }: UseDocumentUploadOptions) {
    const user = useAuthStore((state) => state.user);
    const uploadDocument = useUploadTransactionDocumentMutation();
    const reuploadDocument = useReuploadTransactionDocumentMutation();

    const upload = async (documentType: string, isReupload?: boolean) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) return;

            const asset = result.assets[0];

            if (!user?.id) {
                console.error('User ID not found');
                return;
            }

            if (transactionId && isReupload) {
                reuploadDocument.mutate(
                    {
                        transactionId,
                        documentType,
                        document: {
                            uri: asset.uri,
                            name: asset.name,
                            type: asset.mimeType || 'application/octet-stream',
                        },
                    },
                    {
                        onSuccess: (response: any) => {
                            const uploaded = response.data;
                            if (uploaded) {
                                const file: UploadedFile = {
                                    uri: asset.uri,
                                    name: asset.name,
                                    type: asset.mimeType || 'application/octet-stream',
                                    size: asset.size || 0,
                                };
                                const metadata: UploadedMetadata = {
                                    documentType,
                                    fileUrl: uploaded.fileUrl,
                                    fileName: uploaded.fileName,
                                    fileSize: uploaded.fileSize || asset.size || 0,
                                };
                                onSuccess(documentType, { file, metadata, response });
                            }
                        },
                    }
                );
            } else {
                uploadDocument.mutate(
                    {
                        userId: user.id,
                        transactionId,
                        documentType,
                        document: {
                            uri: asset.uri,
                            name: asset.name,
                            type: asset.mimeType || 'application/octet-stream',
                        },
                    },
                    {
                        onSuccess: (response: any) => {
                            const uploaded = response.data;
                            if (uploaded) {
                                const file: UploadedFile = {
                                    uri: asset.uri,
                                    name: asset.name,
                                    type: asset.mimeType || 'application/octet-stream',
                                    size: asset.size || 0,
                                };
                                const metadata: UploadedMetadata = {
                                    documentType,
                                    fileUrl: uploaded.fileUrl,
                                    fileName: uploaded.fileName,
                                    fileSize: uploaded.fileSize || asset.size || 0,
                                };
                                onSuccess(documentType, { file, metadata, response });
                            }
                        },
                    }
                );
            }
        } catch (error) {
            console.error('Error picking document:', error);
            onError?.(error);
        }
    };

    return {
        upload,
        isPending: transactionId ? reuploadDocument.isPending : uploadDocument.isPending,
    };
}
