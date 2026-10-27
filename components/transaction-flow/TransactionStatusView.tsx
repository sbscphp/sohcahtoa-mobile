import { TransactionComment } from '@/types/api/transactions';
import { Calendar, Clock, SearchStatus } from 'iconsax-react-nativejs';
import { Download } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { useToastStore } from '@/stores/useToastStore';
import { useGetTransactionReceiptMutation } from '@/hooks/queries/transactions/useGetTransactionReceiptMutation';
import { downloadAndSaveFile } from '@/utils/fileDownload';
import EmptyState from '../../assets/icons/no-search-found.svg';
import { useAppTheme } from '@/hooks/useAppTheme';

export const extractReceiptUrl = (res: any): string | undefined => {
    if (!res) return undefined;
    if (typeof res === 'string') {
        const trimmed = res.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('file://')) {
            return trimmed;
        }
        if (trimmed.startsWith('JVBERi')) {
            return `data:application/pdf;base64,${trimmed}`;
        }
        return undefined;
    }
    if (typeof res === 'object') {
        const candidateKeys = [
            'receiptUrl', 'receipt_url',
            'downloadUrl', 'download_url',
            'fileUrl', 'file_url',
            'documentUrl', 'document_url',
            'url', 'link', 'receipt', 'file',
            'pdfUrl', 'pdf_url', 'pdf', 'path', 'filePath', 'file_path',
            'invoiceUrl', 'invoice_url'
        ];
        for (const key of candidateKeys) {
            if (res[key]) {
                const found = extractReceiptUrl(res[key]);
                if (found) return found;
            }
        }
        if (res.data) {
            const found = extractReceiptUrl(res.data);
            if (found) return found;
        }
        for (const [key, val] of Object.entries(res)) {
            if (key !== 'data' && typeof val === 'string') {
                const trimmed = val.trim();
                if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('file://')) {
                    return trimmed;
                }
            }
        }
    }
    return undefined;
};

export type TransactionStatus = 'pending' | 'approved' | 'more_info' | 'rejected' | 'awaiting_disbursement' | 'settled' | 'refunded';

interface TransactionStatusViewProps {
    status: TransactionStatus;
    apiStatus?: string;
    id: string;
    transactionId?: string;
    date: string;
    time: string;
    message: string;
    comments?: TransactionComment[];
    onDownloadReceipt?: () => void;
}

const formatApiStatus = (rawStatus?: string) => rawStatus
    ? rawStatus.replace(/_/g, ' ')
    : 'Unknown';

const getApiStatusColors = (rawStatus: string) => {
    const status = rawStatus.toUpperCase();
    if (['APPROVED', 'COMPLETED', 'SETTLED'].includes(status)) {
        return { background: '#DCFCE7', text: '#166534' };
    }
    if (['REJECTED', 'CANCELLED', 'REFUNDED'].includes(status)) {
        return { background: '#FECACA', text: '#991B1B' };
    }
    if (['AWAITING_DEPOSIT', 'DEPOSIT_PENDING', 'DEPOSIT_CONFIRMED', 'DISBURSEMENT_IN_PROGRESS', 'AWAITING_DISBURSEMENT', 'AWAITING_REFUND_VERIFICATION'].includes(status)) {
        return { background: '#DBEAFE', text: '#1E3A8A' };
    }
    if (['PENDING', 'AWAITING_VERIFICATION', 'VERIFICATION_IN_PROGRESS', 'COMPLIANCE_REVIEW', 'ADMIN_APPROVAL_PENDING'].includes(status)) {
        return { background: '#FEF3C7', text: '#92400E' };
    }
    return { background: '#E2E8F0', text: '#475569' };
};

export default function TransactionStatusView({
    status,
    apiStatus,
    id,
    transactionId,
    date,
    time,
    message,
    comments,
    onDownloadReceipt,
}: TransactionStatusViewProps) {
    const { colors, isDark } = useAppTheme();
    const receiptMutation = useGetTransactionReceiptMutation();
    const [isDownloadingLocal, setIsDownloadingLocal] = useState(false);
    const isDownloading = receiptMutation.isPending || isDownloadingLocal;
    const showToast = useToastStore((s) => s.showToast);

    const isCompleted =
        apiStatus?.toUpperCase() === 'COMPLETED' ||
        apiStatus?.toUpperCase() === 'SETTLED' ||
        status === 'settled';

    const canDownloadReceipt =
        isCompleted ||
        status === 'approved' ||
        ['APPROVED', 'COMPLETED', 'SETTLED', 'SUCCESS', 'DISBURSED'].includes(apiStatus?.toUpperCase() || '') ||
        !!onDownloadReceipt;

    const handleDownloadReceipt = async () => {
        if (onDownloadReceipt) {
            onDownloadReceipt();
            return;
        }

        const effectiveId = transactionId || id;
        if (!effectiveId) return;

        try {
            setIsDownloadingLocal(true);
            const res = await receiptMutation.mutateAsync(effectiveId);
            const receiptUrl = extractReceiptUrl(res);

            if (receiptUrl) {
                const safeId = effectiveId.replace(/[^a-zA-Z0-9_-]/g, '_');
                const fileName = `receipt_${safeId}.pdf`;

                await downloadAndSaveFile({
                    url: receiptUrl,
                    fileName,
                    dialogTitle: 'Transaction Receipt',
                });
            }

            if (res?.message) {
                showToast(res.message, 'success');
            }
        } catch (error: any) {
            // Error toast is handled by useGetTransactionReceiptMutation.onError
        } finally {
            setIsDownloadingLocal(false);
        }
    };

    const isRefunded = status === 'refunded' || apiStatus?.toUpperCase() === 'REFUNDED';
    const apiStatusLabel = apiStatus ? formatApiStatus(apiStatus) : undefined;
    const apiStatusColors = apiStatus ? getApiStatusColors(apiStatus) : undefined;
    const statusLabel = apiStatusLabel || (status === 'approved' ? 'Approved' :
        status === 'awaiting_disbursement' ? 'Awaiting Disbursement' :
            status === 'rejected' ? 'Rejected' :
                status === 'settled' ? 'Settled' :
                    status === 'refunded' ? 'Refunded' :
                        'Information Pending');

    const renderComments = () => {
        if (!comments || comments.length === 0) return null;

        return (
            <View style={styles.commentsSection}>
                <View style={styles.commentsHeaderRow}>
                    <Text style={styles.commentsTitle}>Activity History</Text>
                    <View style={styles.commentCountBadge}>
                        <Text style={styles.commentCountText}>{comments.length}</Text>
                    </View>
                </View>

                <View style={styles.timelineContainer}>
                    {comments.map((comment, index) => {
                        const isLast = index === comments.length - 1;
                        const actionLabel = comment.action?.replace(/_/g, ' ').toLowerCase() || 'comment added';
                        const isRejected = comment.action?.includes('REJECTED');
                        const isInfo = comment.action?.includes('MORE_INFO');

                        return (
                            <View key={comment.id || index} style={styles.timelineItem}>
                                {!isLast && <View style={styles.timelineLine} />}
                                <View style={[
                                    styles.timelineDot,
                                    isRejected && styles.timelineDotRejected,
                                    isInfo && styles.timelineDotInfo
                                ]} />
                                
                                <View style={styles.timelineContent}>
                                    {/* <View style={styles.commentHeader}>
                                        <View style={styles.commentAuthorRow}>
                                            <Text style={styles.commentUser}>{comment.addedBy}</Text>
                                            <View style={[
                                                styles.actionBadge,
                                                isRejected && styles.actionBadgeRejected,
                                                isInfo && styles.actionBadgeInfo
                                            ]}>
                                                <Text style={[
                                                    styles.actionBadgeText,
                                                    isRejected && styles.actionBadgeTextRejected,
                                                    isInfo && styles.actionBadgeTextInfo
                                                ]}>{actionLabel}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.commentDate}>
                                            {new Date(comment.createdAt).toLocaleDateString()} • {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View> */}
                                    <View style={[styles.commentBubble, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
                                        <Text style={[styles.commentMessage, { color: colors.text }]}>{comment.message}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    if (status === 'pending' && !isRefunded && !isCompleted && !canDownloadReceipt) {
        return (
            <View style={styles.tabContent}>
                <View style={styles.pendingContainer}>
                    <View style={styles.pendingIconContainer}>
                        <EmptyState width={moderateScale(100)} height={moderateScale(120)} />
                    </View>
                    <Text style={[styles.pendingTitle, { color: colors.text }]}>Application is Under Review</Text>
                    <Text style={[styles.pendingDesc, { color: colors.textMuted }]}>
                        Your application is currently undergoing approval. You will be notified once it is approved.
                    </Text>
                </View>

                {renderComments()}
            </View>
        );
    }

    return (
        <View style={styles.tabContent}>
            
            <View style={[
                styles.statusCard,
                status === 'more_info' && styles.statusCardMoreInfo,
                status === 'rejected' && styles.statusCardRejected,
                isRefunded && styles.statusCardRefunded,
                isDark && {
                    backgroundColor: (status === 'rejected' || isRefunded)
                        ? 'rgba(239, 68, 68, 0.15)'
                        : status === 'more_info'
                            ? 'rgba(124, 58, 237, 0.15)'
                            : 'rgba(34, 197, 94, 0.15)',
                    borderWidth: 1,
                    borderColor: (status === 'rejected' || isRefunded)
                        ? 'rgba(239, 68, 68, 0.3)'
                        : status === 'more_info'
                            ? 'rgba(124, 58, 237, 0.3)'
                            : 'rgba(34, 197, 94, 0.3)',
                }
            ]}>
                <View style={styles.statusHeader}>
                    <Text style={[
                        styles.statusTitle,
                        { color: colors.text },
                        status === 'rejected' && styles.statusTitleRejected,
                        isRefunded && styles.statusTitleRefunded,
                    ]}>
                        {isCompleted ? 'Transaction Completed' :
                            status === 'approved' || status === 'awaiting_disbursement' ? 'Request Approved' :
                                status === 'rejected' ? 'Request Rejected' :
                                    isRefunded ? 'Transaction Refunded' :
                                        'More Information Requested'}
                    </Text>

                </View>
                <Text style={[
                    styles.statusId,
                    { color: colors.textMuted },
                    status === 'more_info' && styles.statusIdMoreInfo,
                    status === 'rejected' && styles.statusIdRejected,
                    isRefunded && styles.statusIdRefunded,
                ]}>ID: {id}</Text>
                <View style={styles.statusMetaRow}>

                    <View style={styles.metaItem}>
                        <Calendar size={moderateScale(14)}
                            color={status === 'approved' || status === 'awaiting_disbursement' || status === 'settled' ? "#16A34A" : status === 'rejected' || isRefunded ? "#EF4444" : "#7C3AED"}

                        />
                        <Text style={[
                            styles.metaText,
                            status === 'more_info' && styles.metaTextMoreInfo,
                            status === 'rejected' && styles.metaTextRejected,
                            isRefunded && styles.metaTextRefunded,
                        ]}>
                            {date}
                        </Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Clock size={moderateScale(14)}
                            color={status === 'approved' || status === 'awaiting_disbursement' || status === 'settled' ? "#16A34A" : status === 'rejected' || isRefunded ? "#EF4444" : "#7C3AED"}

                        />
                        <Text style={[
                            styles.metaText,
                            status === 'more_info' && styles.metaTextMoreInfo,
                            status === 'rejected' && styles.metaTextRejected,
                            isRefunded && styles.metaTextRefunded,
                        ]}>
                            {time}
                        </Text>
                    </View>
                </View>

                <View style={[styles.messageBox, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
                    <Text style={[styles.messageText, { color: colors.text }]}>
                        {message}
                    </Text>
                </View>
            </View>

            <View style={[styles.txStatusContainer, { backgroundColor: isDark ? colors.surface : 'rgba(241, 241, 241, 1)', borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
                <Text style={[styles.txStatusLabel, { color: colors.text }]}>Transaction Status</Text>
                <View style={[
                    styles.txStatusBadge,
                    !apiStatus && status === 'more_info' && styles.txStatusBadgeMoreInfo,
                    !apiStatus && status === 'awaiting_disbursement' && styles.txStatusBadgeAwaiting,
                    !apiStatus && status === 'rejected' && styles.txStatusBadgeRejected,
                    !apiStatus && isRefunded && styles.txStatusBadgeRefunded,
                    apiStatus && apiStatusColors && { backgroundColor: apiStatusColors.background }
                ]}>
                    <Text style={[
                        styles.txStatusText,
                        !apiStatus && status === 'more_info' && styles.txStatusTextMoreInfo,
                        !apiStatus && status === 'awaiting_disbursement' && styles.txStatusTextAwaiting,
                        !apiStatus && status === 'rejected' && styles.txStatusTextRejected,
                        !apiStatus && isRefunded && styles.txStatusTextRefunded,
                        apiStatus && apiStatusColors && { color: apiStatusColors.text }
                    ]}>
                        {statusLabel}
                    </Text>
                </View>
            </View>

            {/* {canDownloadReceipt && (
                <TouchableOpacity
                    style={styles.downloadReceiptButton}
                    onPress={handleDownloadReceipt}
                    disabled={isDownloading}
                    activeOpacity={0.8}
                    testID="download-receipt-button"
                >
                    {isDownloading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <View style={styles.downloadReceiptRow}>
                            <Download size={moderateScale(18)} color="#FFFFFF" />
                            <Text style={styles.downloadReceiptText}>Download Receipt</Text>
                        </View>
                    )}
                </TouchableOpacity>
            )} */}

            {/* {status === 'approved' ? null : renderComments()} */}
        </View>
    );
}

const styles = ScaledSheet.create({
    tabContent: {
        gap: '8@vs',
    },
    // Overview Styles
    statusCard: {
        backgroundColor: '#DCFCE7',
        borderRadius: '10@ms',
        padding: '14@ms',
        gap: '12@vs',
    },
    statusCardMoreInfo: {
        backgroundColor: '#E9E8FC',
    },
    statusCardRejected: {
        backgroundColor: 'rgba(255, 228, 232, 1)',
    },
    statusCardRefunded: {
        backgroundColor: 'rgba(255, 228, 232, 1)',
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusTitle: {
        fontSize: '15@ms',
        fontWeight: '400',
        color: '#0F172A',
    },
    statusTitleRejected: {
        color: '#991B1B',
    },
    statusTitleRefunded: {
        color: '#991B1B',
    },
    statusId: {
        fontSize: '12@ms',
        color: '#8a8f8cff',
    },
    statusIdMoreInfo: {
        color: '#8a8f8cff',
    },
    statusIdRejected: {
        color: '#8a8f8cff',
    },
    statusIdRefunded: {
        color: '#8a8f8cff',
    },
    statusMetaRow: {
        flexDirection: 'row',
        gap: '16@s',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '4@s',
    },
    metaText: {
        fontSize: '12@ms',
        color: '#15803D',
    },
    metaTextMoreInfo: {
        color: '#4C1D95',
    },
    metaTextRejected: {
        color: '#991B1B',
    },
    metaTextRefunded: {
        color: '#991B1B',
    },
    messageBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: '8@ms',
        padding: '12@ms',
    },
    messageText: {
        fontSize: '12@ms',
        color: '#334155',
        lineHeight: '14@ms',
    },
    txStatusContainer: {
        backgroundColor: 'rgba(241, 241, 241, 1)',
        borderRadius: '14@ms',
        padding: '16@ms',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '40@vs',
    },
    txStatusLabel: {
        fontSize: '13@ms',
        fontWeight: '500',
        color: '#0F172A',
    },
    txStatusBadge: {
        backgroundColor: '#86EFAC',
        paddingHorizontal: '8@s',
        paddingVertical: '4@vs',
        borderRadius: '20@ms',
    },
    txStatusText: {
        fontSize: '12@ms',
        color: '#14532D',
        fontWeight: '500',
    },
    txStatusBadgeMoreInfo: {
        backgroundColor: '#DDD6FE',
    },
    txStatusTextMoreInfo: {
        color: '#5B21B6',
    },
    txStatusBadgeAwaiting: {
        backgroundColor: '#E2E8F0',
    },
    txStatusTextAwaiting: {
        color: '#475569',
    },
    txStatusBadgeRejected: {
        backgroundColor: '#FECACA',
    },
    txStatusTextRejected: {
        color: '#991B1B',
    },
    txStatusBadgeRefunded: {
        backgroundColor: '#FECACA',
    },
    txStatusTextRefunded: {
        color: '#991B1B',
    },

    pendingContainer: {
        alignItems: 'center',
        paddingVertical: '10@vs',
        paddingHorizontal: '20@s',
    },
    pendingIconContainer: {
        marginBottom: '14@vs',
    },
    pendingTitle: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#334155',
        marginBottom: '12@vs',
        textAlign: 'center',
    },
    pendingDesc: {
        fontSize: '12@ms',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: '22@ms',
    },
    commentsSection: {
        marginTop: '32@vs',
        paddingHorizontal: '4@s',
    },
    commentsHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8@s',
        marginBottom: '20@vs',
    },
    commentsTitle: {
        fontSize: '16@ms',
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: '-0.3@ms',
    },
    commentCountBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: '8@s',
        paddingVertical: '2@vs',
        borderRadius: '12@ms',
    },
    commentCountText: {
        fontSize: '11@ms',
        fontWeight: '600',
        color: '#64748B',
    },
    timelineContainer: {
        paddingLeft: '4@s',
    },
    timelineItem: {
        flexDirection: 'row',
        paddingBottom: '24@vs',
        gap: '16@s',
    },
    timelineLine: {
        position: 'absolute',
        left: '5.5@s',
        top: '20@vs',
        bottom: 0,
        width: '1@s',
        backgroundColor: '#E2E8F0',
    },
    timelineDot: {
        width: '12@ms',
        height: '12@ms',
        borderRadius: '6@ms',
        backgroundColor: '#7C3AED',
        borderWidth: '2@ms',
        borderColor: '#fff',
        marginTop: '6@vs',
        zIndex: 1,
        shadowColor: "#7C3AED",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    timelineDotRejected: {
        backgroundColor: '#EF4444',
        shadowColor: "#EF4444",
    },
    timelineDotInfo: {
        backgroundColor: '#F59E0B',
        shadowColor: "#F59E0B",
    },
    timelineContent: {
        flex: 1,
        gap: '8@vs',
    },
    commentHeader: {
        gap: '2@vs',
    },
    commentAuthorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    commentUser: {
        fontSize: '13@ms',
        fontWeight: '600',
        color: '#1E293B',
    },
    actionBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: '6@s',
        paddingVertical: '2@vs',
        borderRadius: '6@ms',
    },
    actionBadgeRejected: {
        backgroundColor: '#FEF2F2',
    },
    actionBadgeInfo: {
        backgroundColor: '#FFFBEB',
    },
    actionBadgeText: {
        fontSize: '9@ms',
        fontWeight: '600',
        color: '#64748B',
        textTransform: 'uppercase',
    },
    actionBadgeTextRejected: {
        color: '#B91C1C',
    },
    actionBadgeTextInfo: {
        color: '#B45309',
    },
    commentDate: {
        fontSize: '11@ms',
        color: '#94A3B8',
        fontWeight: '400',
    },
    commentBubble: {
        backgroundColor: '#F8FAFC',
        borderRadius: '12@ms',
        padding: '14@ms',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    commentMessage: {
        fontSize: '13@ms',
        color: '#334155',
        lineHeight: '20@ms',
        fontWeight: '400',
    },
    downloadReceiptButton: {
        backgroundColor: '#FF6813',
        height: '46@vs',
        borderRadius: '28@ms',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20@vs',
        shadowColor: '#FF6813',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    downloadReceiptRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8@s',
    },
    downloadReceiptText: {
        color: '#FFFFFF',
        fontSize: '14@ms',
        fontWeight: '600',
    },
});
