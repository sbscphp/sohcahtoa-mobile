import Header from '@/components/Header';
import { useGetSupportTicketQuery } from '@/hooks/queries/support/useGetSupportTicketQuery';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

const DetailRow = ({ label, value, isStatus = false, isDescription = false }: { label: string; value: string; isStatus?: boolean; isDescription?: boolean }) => {
    const isApproved = value.toLowerCase() === 'approved' || value.toLowerCase() === 'resolved';

    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            {isStatus ? (
                <View style={[styles.badge, isApproved ? styles.approvedBadge : styles.otherBadge]}>
                    <Text style={[styles.badgeText, isApproved ? styles.approvedText : styles.otherText]}>
                        {value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}
                    </Text>
                </View>
            ) : (
                <Text style={[styles.detailValue, isDescription && styles.descriptionText]}>{value}</Text>
            )}
        </View>
    );
};

export default function SupportDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data, isLoading } = useGetSupportTicketQuery(id as string);

    const ticket = data?.data;

    // console.log(JSON.stringify(ticket, null, 2), "TICKET");

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Header title="View request" />
                <View style={[styles.content, styles.centerContainer]}>
                    <ActivityIndicator color="#F97316" size="large" />
                </View>
            </View>
        );
    }

    if (!ticket) {
        return (
            <View style={styles.container}>
                <Header title="View request" />
                <View style={[styles.content, styles.centerContainer]}>
                    <Text style={styles.errorText}>Ticket details not found</Text>
                </View>
            </View>
        );
    }

    const date = new Date(ticket.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const formatCommentDate = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const commentFormattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const commentFormattedTime = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${commentFormattedDate} • ${commentFormattedTime}`;
    };

    return (
        <View style={styles.container}>
            <Header title="View request" />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Basic Details</Text>

                <View style={styles.detailsCard}>
                    <DetailRow label="Category" value={ticket.category} />
                    <DetailRow label="Request Type" value={ticket.category} />
                    <DetailRow label="Description" value={ticket.description} isDescription />
                    <DetailRow label="Status" value={ticket.status} isStatus />
                    <DetailRow label="Date & Time" value={`${formattedDate} • ${formattedTime}`} />
                    <DetailRow label="Customer ID" value={ticket.reference || 'N/A'} />
                </View>

                {ticket.comments && ticket.comments.length > 0 && (
                    <View style={styles.commentsSection}>
                        <View style={styles.commentsHeaderRow}>
                            <Text style={styles.sectionTitle}>Comments</Text>
                            <View style={styles.commentCountBadge}>
                                <Text style={styles.commentCountText}>{ticket.comments.length}</Text>
                            </View>
                        </View>

                        <View style={styles.commentsList}>
                            {ticket.comments.map((comment, index) => (
                                <View key={comment.id || index} style={styles.commentCard}>
                                    <Text style={styles.commentMessage}>{comment.message}</Text>
                                    <Text style={styles.commentDate}>{formatCommentDate(comment.createdAt)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: '40@vs',
    },
    content: {
        flex: 1,
        paddingHorizontal: '20@ms',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginTop: '24@vs',
        marginBottom: '20@vs',
    },
    detailsCard: {
        backgroundColor: '#FFFFFF',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: '16@vs',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontSize: '13@ms',
        color: '#64748B',
        width: '100@s',
    },
    detailValue: {
        fontSize: '13@ms',
        color: '#0F172A',
        flex: 1,
        textAlign: 'right',
        fontWeight: '500',
    },
    descriptionText: {
        textAlign: 'right',
        lineHeight: '22@ms',
        fontWeight: '400',
        color: '#64748B',
    },
    badge: {
        paddingHorizontal: '12@ms',
        paddingVertical: '4@vs',
        borderRadius: '8@ms',
    },
    approvedBadge: {
        backgroundColor: '#DCFCE7',
    },
    otherBadge: {
        backgroundColor: '#FEF3C7',
    },
    badgeText: {
        fontSize: '12@ms',
        fontWeight: '500',
    },
    approvedText: {
        color: '#15803D',
    },
    otherText: {
        color: '#B45309',
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: '14@ms',
        color: '#EF4444',
    },
    commentsSection: {
        marginTop: '12@vs',
        marginBottom: '40@vs',
    },
    commentsHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8@s',
    },
    commentCountBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: '8@s',
        paddingVertical: '2@vs',
        borderRadius: '12@ms',
        marginTop: '4@vs',
    },
    commentCountText: {
        fontSize: '11@ms',
        fontWeight: '600',
        color: '#64748B',
    },
    commentsList: {
        gap: '12@vs',
    },
    commentCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: '12@ms',
        padding: '14@ms',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        gap: '6@vs',
    },
    commentMessage: {
        fontSize: '13@ms',
        color: '#1E293B',
        lineHeight: '20@ms',
        fontWeight: '400',
    },
    commentDate: {
        fontSize: '11@ms',
        color: '#94A3B8',
        fontWeight: '400',
    },
});
