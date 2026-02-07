import { Download } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { ScaledSheet, moderateScale, verticalScale } from 'react-native-size-matters';

interface DetailItem {
    label: string;
    value: string;
    secondaryValue?: string;
    isRightAligned?: boolean;
}

interface DocumentItem {
    label: string;
    value?: string;
    fileName?: string;
    onDownload?: () => void;
}

interface DisbursementDetails {
    paymentInfo: DetailItem[];
    status: string;
    statusColor?: string;
}

interface TransactionDetailsViewProps {
    details: DetailItem[];
    documents?: DocumentItem[];
    documentSectionTitle?: string;
    beneficiaryDetails?: DetailItem[];
    paymentDetails?: DetailItem[];
    disbursementDetails?: DisbursementDetails;
}

export default function TransactionDetailsView({ details, documents = [], documentSectionTitle = "Required Document", beneficiaryDetails, paymentDetails, disbursementDetails }: TransactionDetailsViewProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionHeader}>Transaction Details</Text>
            {details.map((item, index) => (
                <View key={index}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{item.label}</Text>
                        <View style={item.isRightAligned ? { flex: 1, alignItems: 'flex-end' } : {}}>
                            <Text
                                style={[
                                    styles.detailValue,
                                    item.isRightAligned && { textAlign: 'right' }
                                ]}

                            >
                                {item.value}
                            </Text>
                            {item.secondaryValue && (
                                <Text style={styles.secondaryValue}>
                                    {item.secondaryValue}
                                </Text>
                            )}
                        </View>
                    </View>
                    {index < details.length - 1 && <View style={[styles.separator, { marginTop: verticalScale(12) }]} />}
                </View>
            ))}

            {beneficiaryDetails && beneficiaryDetails.length > 0 && (
                <>
                    <Text style={[styles.sectionHeader, { marginTop: moderateScale(62) }]}>Beneficiary Details</Text>
                    {beneficiaryDetails.map((item, index) => (
                        <View key={index}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{item.label}</Text>
                                <Text
                                    style={[
                                        styles.detailValue,
                                        item.isRightAligned && { flex: 1, textAlign: 'right' }
                                    ]}
                                    numberOfLines={2}
                                >
                                    {item.value}
                                </Text>
                            </View>
                            {index < beneficiaryDetails.length - 1 && <View style={[styles.separator, { marginTop: verticalScale(12) }]} />}
                        </View>
                    ))}

                </>
            )}

            {paymentDetails && paymentDetails.length > 0 && (
                <>
                    <Text style={[styles.sectionHeader, { marginTop: moderateScale(62) }]}>Payment Details</Text>
                    {paymentDetails.map((item, index) => (
                        <View key={index}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{item.label}</Text>
                                <Text
                                    style={[
                                        styles.detailValue,
                                        item.isRightAligned && { flex: 1, textAlign: 'right' }
                                    ]}
                                    numberOfLines={2}
                                >
                                    {item.value}
                                </Text>
                            </View>
                            {index < paymentDetails.length - 1 && <View style={[styles.separator, { marginTop: verticalScale(12) }]} />}
                        </View>
                    ))}

                </>
            )}

            {disbursementDetails && (
                <>
                    <Text style={[styles.sectionHeader, { marginTop: moderateScale(62) }]}>Disbursement Details</Text>

                    {/* Payment Info Section */}
                    {disbursementDetails.paymentInfo.map((item, index) => (
                        <View key={index}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{item.label}</Text>
                                <Text style={styles.detailValue}>{item.value}</Text>
                            </View>
                            {index < disbursementDetails.paymentInfo.length - 1 && <View style={[styles.separator, { marginTop: verticalScale(12) }]} />}
                        </View>
                    ))}

                    {/* Disbursement Status */}
                    {disbursementDetails.paymentInfo.length > 0 && <View style={[styles.separator, { marginTop: verticalScale(12) }]} />}
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Disbursement Status</Text>
                        <View style={[styles.statusBadge, { backgroundColor: disbursementDetails.statusColor || '#FEF3C7' }]}>
                            <Text style={styles.statusText}>{disbursementDetails.status}</Text>
                        </View>
                    </View>
                </>
            )
            }

            {
                documents.length > 0 && (
                    <>
                        <View style={styles.separator} />
                        <Text style={[styles.sectionHeader, { marginTop: moderateScale(62) }]}>{documentSectionTitle}</Text>

                        {documents.map((doc, index) => (
                            <View key={index}>
                                {doc.value ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>{doc.label}</Text>
                                        <Text style={styles.detailValue} numberOfLines={2}>{doc.value}</Text>
                                    </View>
                                ) : (
                                    <View style={styles.docRow}>
                                        <Text style={styles.detailLabel}>{doc.label}</Text>
                                        <View style={styles.downloadContainer}>
                                            <Text style={styles.docName}>{doc.fileName}</Text>
                                            <Download size={moderateScale(14)} color="rgba(152, 162, 179, 1)" />
                                        </View>
                                    </View>
                                )}
                                {index < documents.length - 1 && <View style={[styles.separator, { marginTop: verticalScale(12) }]} />}
                            </View>
                        ))}
                        <View style={styles.separator} />
                    </>
                )
            }


        </View >
    );
}

const styles = ScaledSheet.create({
    container: {
        gap: '10@vs',
    },
    sectionHeader: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: verticalScale(14),
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12@s',
    },
    docRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: '13.5@ms',
        color: 'rgba(84, 83, 83, 1)',
        fontWeight: '500',
        flexShrink: 0,
        maxWidth: '60%',
    },
    detailValue: {
        fontSize: '14@ms',
        color: 'rgba(108, 105, 105, 1)',
        fontWeight: '400',
        textAlign: 'right',
        flex: 1,
    },
    separator: {
        height: 0.5,
        backgroundColor: 'rgba(204, 202, 202, 1)',
    },
    downloadContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8@s',
    },
    docName: {
        fontSize: '15@ms',
        color: '#64748B',
    },
    secondaryValue: {
        fontSize: '14@ms',
        color: 'rgba(255, 104, 19, 1)',
        fontWeight: '400',
        marginTop: '2@vs',
    },
    bankDetailsContainer: {
        borderRadius: '8@ms',
        padding: '16@ms',
        marginTop: '16@vs',
    },
    bankDetailLabel: {
        fontSize: '14@ms',
        color: 'rgba(84, 83, 83, 1)',
        fontWeight: '500',
    },
    bankDetailValue: {
        fontSize: '14@ms',
        color: 'rgba(108, 105, 105, 1)',
        fontWeight: '400',
    },
    statusBadge: {
        paddingHorizontal: '12@s',
        paddingVertical: '4@vs',
        borderRadius: '16@ms',
    },
    statusText: {
        fontSize: '13@ms',
        color: 'rgba(180, 83, 9, 1)',
        fontWeight: '500',
    },
});
