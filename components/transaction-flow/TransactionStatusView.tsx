import { Calendar, Clock, SearchStatus } from 'iconsax-react-nativejs';
import React from 'react';
import { Text, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import EmptyState from '../../assets/icons/no-search-found.svg';

export type TransactionStatus = 'pending' | 'approved' | 'more_info' | 'rejected' | 'awaiting_disbursement' | 'settled';

interface TransactionStatusViewProps {
    status: TransactionStatus;
    id: string;
    date: string;
    time: string;
    message: string;
}

export default function TransactionStatusView({ status, id, date, time, message }: TransactionStatusViewProps) {
    if (status === 'pending') {
        return (
            <View style={styles.pendingContainer}>
                <View style={styles.pendingIconContainer}>
                    <EmptyState  width={moderateScale(100)} height={moderateScale(120)} />
                </View>
                <Text style={styles.pendingTitle}>Application is Under Review</Text>
                <Text style={styles.pendingDesc}>
                    Your application is currently undergoing approval. You will be notified once it is approved.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.tabContent}>
            {/* Status Card */}
            <View style={[
                styles.statusCard,
                status === 'more_info' && styles.statusCardMoreInfo,
                status === 'rejected' && styles.statusCardRejected
            ]}>
                <View style={styles.statusHeader}>
                    <Text style={[styles.statusTitle, status === 'rejected' && styles.statusTitleRejected]}>
                        {status === 'approved' || status === 'awaiting_disbursement' || status === 'settled' ? 'Request Approved' :
                            status === 'rejected' ? 'Request Rejected' : 'More Information Requested'}
                    </Text>

                </View>
                <Text style={[
                    styles.statusId,
                    status === 'more_info' && styles.statusIdMoreInfo,
                    status === 'rejected' && styles.statusIdRejected
                ]}>ID: {id}</Text>
                <View style={styles.statusMetaRow}>

                    <View style={styles.metaItem}>
                        <Calendar size={moderateScale(14)}
                            color={status === 'approved' || status === 'awaiting_disbursement' || status === 'settled' ? "#16A34A" : status === 'rejected' ? "#EF4444" : "#7C3AED"}

                        />
                        <Text style={[
                            styles.metaText,
                            status === 'more_info' && styles.metaTextMoreInfo,
                            status === 'rejected' && styles.metaTextRejected
                        ]}>
                            {date}
                        </Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Clock size={moderateScale(14)}
                            color={status === 'approved' || status === 'awaiting_disbursement' || status === 'settled' ? "#16A34A" : status === 'rejected' ? "#EF4444" : "#7C3AED"}

                        />
                        <Text style={[
                            styles.metaText,
                            status === 'more_info' && styles.metaTextMoreInfo,
                            status === 'rejected' && styles.metaTextRejected
                        ]}>
                            {time}
                        </Text>
                    </View>
                </View>

                <View style={styles.messageBox}>
                    <Text style={styles.messageText}>
                        {message}
                    </Text>
                </View>
            </View>

            <View style={styles.txStatusContainer}>
                <Text style={styles.txStatusLabel}>Transaction Status</Text>
                <View style={[
                    styles.txStatusBadge,
                    status === 'more_info' && styles.txStatusBadgeMoreInfo,
                    status === 'awaiting_disbursement' && styles.txStatusBadgeAwaiting,
                    status === 'rejected' && styles.txStatusBadgeRejected
                ]}>
                    <Text style={[
                        styles.txStatusText,
                        status === 'more_info' && styles.txStatusTextMoreInfo,
                        status === 'awaiting_disbursement' && styles.txStatusTextAwaiting,
                        status === 'rejected' && styles.txStatusTextRejected
                    ]}>
                        {status === 'approved' ? 'Approved' :
                            status === 'awaiting_disbursement' ? 'Awaiting Disbursement' :
                                status === 'rejected' ? 'Rejected' :
                                    status === 'settled' ? 'Settled' :
                                        'Information Pending'}
                    </Text>
                </View>
            </View>
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

    pendingContainer: {
        alignItems: 'center',
        paddingVertical: '10@vs',
        paddingHorizontal: '20@s',
    },
    pendingIconContainer: {
        marginBottom: '14@vs',
    },
    pendingTitle: {
        fontSize: '18@ms',
        fontWeight: '600',
        color: '#334155',
        marginBottom: '12@vs',
        textAlign: 'center',
    },
    pendingDesc: {
        fontSize: '14@ms',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: '22@ms',
    },
});
