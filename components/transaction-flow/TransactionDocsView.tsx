import FileUpload from '@/components/FileUpload';
import { CloseCircle, TickCircle } from 'iconsax-react-nativejs';
import React from 'react';
import { Text, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { TransactionStatus } from './TransactionStatusView';

interface DocItem {
    label: string;
    value?: string;
    fileName?: string | null;
    onUpload?: () => void;
    required?: boolean;
    docStatus?: 'VERIFIED' | 'REQUIRES_MANUAL_REVIEW' | 'FAILED' | 'APPROVED' | 'REJECTED' | 'PENDING' | string;
}

interface TransactionDocsViewProps {
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

                return (
                    <View key={index} style={styles.docCardContainer}>
                        {isInitialsDoc && displayValue ? (
                            <View style={styles.valueRow}>
                                <Text style={styles.detailLabel}>{doc.label}</Text>
                                <Text style={styles.detailValue}>{displayValue}</Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.docHeaderRow}>
                                    <Text style={styles.docTitle}>{doc.label} {doc.required && <Text style={styles.required}>*</Text>}</Text>
                                </View>
                                <FileUpload
                                    onUpload={doc.onUpload || (() => { })}
                                    fileName={doc.fileName}
                                    title={`Upload ${doc.label}`}
                                    status={getDocStatus(doc.docStatus) as any}
                                />
                                {doc.fileName && (
                                    <View style={[styles.docStatusRow, { marginTop: 0 }]}>
                                        <StatusIndicator docStatus={doc.docStatus} />
                                        <Text style={getStatusTextStyle(doc.docStatus)}>
                                            {getStatusText(doc.docStatus)}
                                        </Text>
                                    </View>
                                )}
                            </>
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
