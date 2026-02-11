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
}

interface TransactionDocsViewProps {
    status: TransactionStatus;
    documents: DocItem[];
}

export default function TransactionDocsView({ status, documents }: TransactionDocsViewProps) {

    const getDocStatus = (): 'approved' | 'error' => {
        if (status === 'approved') return 'approved';
        return 'error';
    };

    const StatusIndicator = () => {
        if (status === 'rejected') {
            return <CloseCircle size={moderateScale(16)} color="#EF4444" variant="Bold" />;
        }
        return <TickCircle size={moderateScale(16)} color="#16A34A" variant="Bold" />;
    };

    const getStatusText = () => {
        if (status === 'approved') return 'Approved';
        return 'Rejected';
    };

    return (
        <View style={styles.container}>
            {documents.map((doc, index) => (
                <View key={index} style={styles.docCardContainer}>
                    {doc.value ? (
                        <View style={styles.valueRow}>
                            <Text style={styles.detailLabel}>{doc.label}</Text>
                            <Text style={styles.detailValue}>{doc.value}</Text>
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
                                status={getDocStatus()}
                            />
                            <View style={[styles.docStatusRow, { marginTop: 0 }]}>
                                <StatusIndicator />
                                <Text style={
                                    status === 'approved'
                                        ? styles.docStatusTextApproved
                                        : styles.docStatusTextError
                                }>
                                    {getStatusText()}
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            ))}
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
        color: 'rgba(221, 79, 5, 1)',
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
