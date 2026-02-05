import { Download } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { ScaledSheet, moderateScale, verticalScale } from 'react-native-size-matters';

interface DetailItem {
    label: string;
    value: string;
    isRightAligned?: boolean;
}

interface DocumentItem {
    label: string;
    value?: string;
    fileName?: string;
    onDownload?: () => void;
}

interface TransactionDetailsViewProps {
    details: DetailItem[];
    documents?: DocumentItem[];
    documentSectionTitle?: string;
    beneficiaryDetails?: DetailItem[];
    paymentDetails?: DetailItem[];
}

export default function TransactionDetailsView({ details, documents = [], documentSectionTitle = "Required Document", beneficiaryDetails, paymentDetails }: TransactionDetailsViewProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionHeader}>Transaction Details</Text>
            {details.map((item, index) => (
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

            {documents.length > 0 && (
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
            )}


        </View>
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
        alignItems: 'center',
    },
    docRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: '14@ms',
        color: 'rgba(84, 83, 83, 1)',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: '14@ms',
        color: 'rgba(108, 105, 105, 1)',
        fontWeight: '400',
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
});
