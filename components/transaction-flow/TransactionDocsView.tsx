import FileUpload from '@/components/FileUpload';
import { CloseCircle, TickCircle } from 'iconsax-react-nativejs';
import React from 'react';
import { Text, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { TransactionStatus } from './TransactionStatusView';

export interface DocUploadItem {
    id?: string;
    fileName?: string | null;
    fileUrl?: string | null;
    status?: string;
    docStatus?: 'VERIFIED' | 'REQUIRES_MANUAL_REVIEW' | 'FAILED' | 'APPROVED' | 'REJECTED' | 'PENDING' | string;
    rejectionNotes?: string | null;
    onUpload?: () => void;
}

export interface DocItem {
    label: string;
    value?: string;
    fileName?: string | null;
    onUpload?: () => void;
    required?: boolean;
    docStatus?: 'VERIFIED' | 'REQUIRES_MANUAL_REVIEW' | 'FAILED' | 'APPROVED' | 'REJECTED' | 'PENDING' | string;
    uploads?: DocUploadItem[];
}

export interface TransactionDocsViewProps {
    status: TransactionStatus;
    documents: DocItem[];
}

export default function TransactionDocsView({ status, documents }: TransactionDocsViewProps) {

    const getDocStatus = (docStatus?: string): 'approved' | 'rejected' | 'review' | 'pending' => {
        if (docStatus === 'VERIFIED' || docStatus === 'APPROVED') return 'approved';
        if (docStatus === 'FAILED' || docStatus === 'REJECTED') return 'rejected';
        if (docStatus === 'REQUIRES_MANUAL_REVIEW') return 'review';
        return 'pending';
    };

    const StatusIndicator = ({ docStatus }: { docStatus?: string }) => {
        const s = getDocStatus(docStatus);
        if (s === 'approved') {
            return <TickCircle size={moderateScale(16)} color="#16A34A" variant="Bold" />;
        }
        if (s === 'rejected') {
            return <CloseCircle size={moderateScale(16)} color="#EF4444" variant="Bold" />;
        }
        if (s === 'review') {
            return <TickCircle size={moderateScale(16)} color="#F97316" variant="Bold" />;
        }
        // pending
        return <TickCircle size={moderateScale(16)} color="#FDBA74" variant="Bold" />;
    };

    const getStatusText = (docStatus?: string) => {
        const s = getDocStatus(docStatus);
        if (s === 'approved') return 'Verified';
        if (s === 'rejected') return 'Failed';
        if (s === 'review') return 'Requires Manual Review';
        return 'Pending';
    };

    const getStatusTextStyle = (docStatus?: string) => {
        const s = getDocStatus(docStatus);
        if (s === 'approved') return styles.docStatusTextApproved;
        if (s === 'rejected') return styles.docStatusTextError;
        if (s === 'review') return styles.docStatusTextReview;
        return styles.docStatusTextPending;
    };

    return (
        <View style={styles.container}>
            {documents.map((doc, index) => {
                const isInitialsDoc = Boolean(
                    doc.value ||
                    (!doc.fileName?.includes('.') && doc.fileName && doc.fileName.length <= 5)
                );
                const displayValue = doc.value || doc.fileName;
                const hasMultipleUploads = Boolean(doc.uploads && doc.uploads.length > 1);

                if (isInitialsDoc && displayValue) {
                    return (
                        <View key={index} style={styles.docCardContainer}>
                            <View style={styles.valueRow}>
                                <Text style={styles.detailLabel}>{doc.label}</Text>
                                <Text style={styles.detailValue}>{displayValue}</Text>
                            </View>
                        </View>
                    );
                }

                if (hasMultipleUploads && doc.uploads) {
                    return (
                        <View key={index} style={styles.docCardContainer}>
                            <View style={styles.docHeaderRow}>
                                <Text style={styles.docTitle}>
                                    {doc.label} {doc.required && <Text style={styles.required}>*</Text>}
                                </Text>
                            </View>
                            <View style={{ gap: moderateScale(12) }}>
                                {doc.uploads.map((upload, uIdx) => {
                                    const currentStatus = upload.docStatus || upload.status || doc.docStatus;
                                    return (
                                        <View key={upload.id || uIdx}>
                                            <FileUpload
                                                onUpload={upload.onUpload || doc.onUpload || (() => { })}
                                                fileName={upload.fileName}
                                                title={`${doc.label} ${uIdx + 1}`}
                                                status={getDocStatus(currentStatus) as any}
                                            />
                                            {upload.fileName && (
                                                <View style={[styles.docStatusRow, { marginTop: 0 }]}>
                                                    <StatusIndicator docStatus={currentStatus} />
                                                    <Text style={getStatusTextStyle(currentStatus)}>
                                                        {getStatusText(currentStatus)}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    );
                }

                const singleUpload = doc.uploads && doc.uploads.length === 1 ? doc.uploads[0] : null;
                const fileName = singleUpload?.fileName ?? doc.fileName;
                const currentStatus = singleUpload?.docStatus ?? singleUpload?.status ?? doc.docStatus;
                const onUpload = singleUpload?.onUpload ?? doc.onUpload;

                return (
                    <View key={index} style={styles.docCardContainer}>
                        <View style={styles.docHeaderRow}>
                            <Text style={styles.docTitle}>{doc.label} {doc.required && <Text style={styles.required}>*</Text>}</Text>
                        </View>
                        <FileUpload
                            onUpload={onUpload || (() => { })}
                            fileName={fileName}
                            title={`Upload ${doc.label}`}
                            status={getDocStatus(currentStatus) as any}
                        />
                        {fileName && (
                            <View style={[styles.docStatusRow, { marginTop: 0 }]}>
                                <StatusIndicator docStatus={currentStatus} />
                                <Text style={getStatusTextStyle(currentStatus)}>
                                    {getStatusText(currentStatus)}
                                </Text>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        gap: '8@vs',
    },
    docCardContainer: {
        marginTop: '6@vs',
    },
    docHeaderRow: {
        flexDirection: 'row',
        marginBottom: '8@vs',
    },
    docTitle: {
        fontSize: '14@ms',
        color: '#475569',
    },
    required: {
        color: '#EF4444',
    },
    docStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '6@s',
        marginTop: '8@vs',
    },
    docStatusTextApproved: {
        fontSize: '12@ms',
        color: '#16A34A',
        fontWeight: '500',
    },
    docStatusTextPending: {
        fontSize: '12@ms',
        color: '#FDBA74',
        fontWeight: '500',
    },
    docStatusTextReview: {
        fontSize: '12@ms',
        color: '#F97316',
        fontWeight: '500',
    },
    docStatusTextError: {
        fontSize: '12@ms',
        color: '#EF4444',
        fontWeight: '500',
    },

    valueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: '8@vs',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    detailLabel: {
        fontSize: '13@ms',
        color: '#64748B',
    },
    detailValue: {
        fontSize: '13@ms',
        color: '#0F172A',
        fontWeight: '500',
    },
});
