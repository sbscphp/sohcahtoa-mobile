import { Download, FileText } from 'lucide-react-native';
import React from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
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
    fileUrl?: string;
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
    domiciliaryDetails?: DetailItem[];
    beneficiarySectionTitle?: string;
    paymentDetails?: DetailItem[];
    refundBankDetails?: DetailItem[];
    disbursementDetails?: DisbursementDetails;
    settlementDetails?: DetailItem[];
    bankAccountsDetails?: DetailItem[];
    currentStep?: string;
}

const getStatusColors = (status: string) => {
    const normalized = (status || '').toUpperCase().replace(/_/g, ' ');
    if (
        normalized.includes('SUCCESS') ||
        normalized.includes('COMPLETED') ||
        normalized.includes('VERIFIED') ||
        normalized.includes('APPROVED') ||
        normalized.includes('SETTLED') ||
        normalized.includes('DISBURSED')
    ) {
        return { bg: '#ECFDF5', text: '#059669' };
    }
    if (
        normalized.includes('FAILED') ||
        normalized.includes('REJECTED') ||
        normalized.includes('DECLINED') ||
        normalized.includes('CANCELLED')
    ) {
        return { bg: '#FEF2F2', text: '#DC2626' };
    }
    return { bg: '#FFFBEB', text: '#D97706' };
};

export default function TransactionDetailsView({
    details,
    documents = [],
    documentSectionTitle = "Required Document",
    beneficiaryDetails,
    domiciliaryDetails,
    beneficiarySectionTitle,
    paymentDetails,
    refundBankDetails,
    disbursementDetails,
    settlementDetails,
    bankAccountsDetails,
    currentStep
}: TransactionDetailsViewProps) {
    const mainDetails = details.filter(item => 
        !item.label.toLowerCase().includes('pickup') && 
        !item.label.toLowerCase().includes('scheduled')
    );

    const pickupDetails = details.filter(item => 
        item.label.toLowerCase().includes('pickup') || 
        item.label.toLowerCase().includes('scheduled')
    );

    const renderDetailRow = (item: DetailItem, index: number, totalLength: number) => {
        const isStatusOrStep = item.label.toLowerCase().includes('status') || item.label.toLowerCase().includes('step');
        const colors = isStatusOrStep ? getStatusColors(item.value) : null;

        return (
            <View key={index}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        {isStatusOrStep && colors ? (
                            <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                                <Text style={[styles.statusText, { color: colors.text }]}>
                                    {item.value}
                                </Text>
                            </View>
                        ) : (
                            <Text
                                style={[
                                    styles.detailValue,
                                    { textAlign: 'right' }
                                ]}
                            >
                                {item.value}
                            </Text>
                        )}
                        {item.secondaryValue && (
                            <Text style={styles.secondaryValue}>
                                {item.secondaryValue}
                            </Text>
                        )}
                    </View>
                </View>
                {index < totalLength - 1 && <View style={[styles.separator, { marginTop: verticalScale(12) }]} />}
            </View>
        );
    };

    const resolvedBeneficiaryTitle = beneficiarySectionTitle || "Beneficiary Details";

    return (
        <View style={styles.container}>
            <Text style={styles.sectionHeader}>Transaction Details</Text>
            {mainDetails.map((item, index) => renderDetailRow(item, index, mainDetails.length))}

            {pickupDetails.length > 0 && (
                <>
                    <Text style={[styles.sectionHeader, { marginTop: moderateScale(62) }]}>Cash Pickup Details</Text>
                    {pickupDetails.map((item, index) => renderDetailRow(item, index, pickupDetails.length))}
                </>
            )}

            {beneficiaryDetails && beneficiaryDetails.length > 0 && (
                <>
                    <Text style={[styles.sectionHeader, { marginTop: moderateScale(62) }]}>{resolvedBeneficiaryTitle}</Text>
                    {beneficiaryDetails.map((item, index) => renderDetailRow(item, index, beneficiaryDetails.length))}
                </>
            )}

            {domiciliaryDetails && domiciliaryDetails.length > 0 && (
                <>
                    <Text style={[styles.sectionHeader, { marginTop: moderateScale(62) }]}>Domiciliary Bank Details</Text>
                    {domiciliaryDetails.map((item, index) => renderDetailRow(item, index, domiciliaryDetails.length))}
                </>
            )}

            {refundBankDetails && refundBankDetails.length > 0 && !(bankAccountsDetails && bankAccountsDetails.length > 0) && (
                <>
                    <Text style={[styles.sectionHeader, { marginTop: moderateScale(62) }]}>Refund Bank Details</Text>
                    {refundBankDetails.map((item, index) => renderDetailRow(item, index, refundBankDetails.length))}
                </>
            )}

            {paymentDetails && paymentDetails.length > 0 && (
                <>
                    <Text style={[styles.sectionHeader, { marginTop: moderateScale(62) }]}>Payment Details</Text>
                    {paymentDetails.map((item, index) => renderDetailRow(item, index, paymentDetails.length))}
                </>
            )}

            {bankAccountsDetails && bankAccountsDetails.length > 0 && (
                <>
                    <Text style={[styles.sectionHeader, { marginTop: moderateScale(62) }]}>Refund Bank Details</Text>
                    {bankAccountsDetails.map((item, index) => renderDetailRow(item, index, bankAccountsDetails.length))}
                </>
            )}

            {disbursementDetails && (
                <>
                    <Text style={[styles.sectionHeader, { marginTop: moderateScale(62) }]}>Disbursement Details</Text>

                    {disbursementDetails.paymentInfo.map((item, index) => renderDetailRow(item, index, disbursementDetails.paymentInfo.length))}


                    {disbursementDetails.paymentInfo.length > 0 && <View style={[styles.separator, { marginTop: verticalScale(12) }]} />}
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Disbursement Status</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColors(disbursementDetails.status).bg }]}>
                            <Text style={[styles.statusText, { color: getStatusColors(disbursementDetails.status).text }]}>{disbursementDetails.status}</Text>
                        </View>
                    </View>
                </>
            )}

            {
                documents.length > 0 && (
                    <>
                        <View style={styles.separator} />
                        <Text style={[styles.sectionHeader, { marginTop: moderateScale(62) }]}>{documentSectionTitle}</Text>

                        {(() => {
                            const truncateFileName = (name: string | undefined, maxLength = 18) => {
                                if (!name) return '';
                                if (name.length <= maxLength) return name;
                                const ext = name.split('.').pop();
                                const base = name.substring(0, name.lastIndexOf('.'));
                                const keep = maxLength - (ext?.length || 0) - 8;
                                return base.substring(0, Math.max(0, keep)) + '...' + ext;
                            };

                            return documents.map((doc, index) => {
                                const isInitialsDoc = Boolean(
                                    doc.value ||
                                    (!doc.fileUrl && doc.fileName && (!doc.fileName.includes('.') || doc.fileName.length <= 5))
                                );
                                const displayValue = doc.value || doc.fileName;

                                return (
                                    <View key={index}>
                                        {isInitialsDoc ? (
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>{doc.label}</Text>
                                                <Text style={styles.detailValue}>{displayValue}</Text>
                                            </View>
                                        ) : (
                                            <View style={styles.docRow}>
                                                <Text style={styles.detailLabel}>{doc.label}</Text>
                                                <TouchableOpacity
                                                    style={styles.downloadContainer}
                                                    onPress={() => {
                                                        if (doc.fileUrl) {
                                                            Linking.openURL(doc.fileUrl).catch(err => console.error("Couldn't open URL", err));
                                                        }
                                                    }}
                                                    disabled={!doc.fileUrl}
                                                >
                                                    <Text style={styles.docName} numberOfLines={1}>{truncateFileName(doc.fileName)}</Text>
                                                    <FileText size={moderateScale(16)} color={doc.fileUrl ? "#FF6813" : "rgba(152, 162, 179, 1)"} />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        {index < documents.length - 1 && <View style={[styles.separator, { marginTop: verticalScale(12) }]} />}
                                    </View>
                                );
                            });
                        })()}
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
        paddingBottom: verticalScale(20)
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
        fontSize: '13@ms',
        color: 'rgba(84, 83, 83, 1)',
        fontWeight: '500',
        flexShrink: 0,
        maxWidth: '60%',
    },
    detailValue: {
        fontSize: '13@ms',
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
        flexShrink: 1,
    },
    secondaryValue: {
        fontSize: '14@ms',
        color: 'rgba(255, 104, 19, 1)',
        fontWeight: '400',
        textAlign: 'right',
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
