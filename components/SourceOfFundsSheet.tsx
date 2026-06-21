import { InfoCircle } from 'iconsax-react-nativejs';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import FileUpload from './FileUpload';
import PrimaryButton from './PrimaryButton';
import InputField from './InputField';

interface InfoRowProps {
    label: string;
    value: string;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

interface SourceOfFundsSheetProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => void;
    customerInfo: {
        fullName: string;
        phoneNumber: string;
        email: string;
        bvn: string;
        address: string;
        passportDocumentNumber: string;
    };
    transactionDetails: {
        type: string;
        currency: string;
        amount: string;
        purpose: string;
    };
    signatureFile?: string | null;
    onUploadSignature: () => void;
    isUploadingSignature?: boolean;
    initials?: string;
    onChangeInitials?: (text: string) => void;
}

export default function SourceOfFundsSheet({
    visible,
    onClose,
    customerInfo,
    transactionDetails,
    onSubmit,
    signatureFile,
    onUploadSignature,
    isUploadingSignature,
    initials,
    onChangeInitials,
}: SourceOfFundsSheetProps) {

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={styles.sheetContainer}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <View style={styles.header}>
                            <View style={styles.headerIconContainer}>
                                <View style={styles.iconCircle}>
                                    <InfoCircle size={moderateScale(24)} color="#FF6B2C" variant="Bold" />
                                </View>
                            </View>
                            <Text style={styles.title}>Source of Funds Exchange Declaration  Form</Text>
                            <Text style={styles.subtitle}>Kindly note the following</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Customer information</Text>
                            <InfoRow label="Full Name" value={customerInfo.fullName} />
                            <InfoRow label="Phone Number" value={customerInfo.phoneNumber} />
                            <InfoRow label="Email Address" value={customerInfo.email} />
                            <InfoRow label="BVN" value={customerInfo.bvn} />
                            <InfoRow label="Resident Address" value={customerInfo.address} />
                            <InfoRow label="Passport Number" value={customerInfo.passportDocumentNumber} />
                        </View>



                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Transaction Details</Text>
                            <InfoRow label="Transaction Type" value={transactionDetails.type} />
                            <InfoRow label="Currency" value={transactionDetails.currency} />
                            <InfoRow label="Amount" value={transactionDetails.amount} />
                            <InfoRow label="Purpose of Transaction" value={transactionDetails.purpose} />
                        </View>

                        <InputField
                            label="Initials"
                            placeholder="Enter your initials"
                            value={initials}
                            onChangeText={onChangeInitials}
                            required
                        />

                        <View style={styles.uploadSection}>
                            <FileUpload
                                title="Upload Signature"
                                fileName={signatureFile}
                                onUpload={onUploadSignature}
                                status={isUploadingSignature ? 'pending' : 'default'}
                            />
                        </View>

                        <View style={styles.buttonContainer}>
                            <PrimaryButton
                                title="Submit"
                                onPress={onSubmit}
                            />
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Text style={styles.closeButtonText}>No, Close</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    sheetContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        maxHeight: '80%',
        paddingTop: '12@vs',
        marginBottom: '40@vs',
        marginHorizontal: '12@s',
    },
    scrollContent: {
        paddingHorizontal: '16@ms',
        paddingBottom: '40@vs',
    },
    header: {
        alignItems: 'flex-start',
        marginBottom: '24@vs',
    },
    headerIconContainer: {
        marginBottom: '16@vs',
    },
    iconCircle: {
        width: '48@ms',
        height: '48@ms',
        borderRadius: '24@ms',
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningIconContainer: {
        width: '48@ms',
        height: '48@ms',
        borderRadius: '24@ms',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '16@vs',
    },
    title: {
        fontSize: '17@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '8@vs',
        width: '80%',
        lineHeight: '20@vs',
    },
    subtitle: {
        fontSize: '13@ms',
        color: '#64748B',
    },
    section: {
        marginBottom: '24@vs',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '16@vs',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: '12@vs',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: '12@vs',
    },
    infoLabel: {
        fontSize: '13@ms',
        color: '#111111ff',
        flex: 1,
    },
    infoValue: {
        fontSize: '13@ms',
        color: '#64748B',
        textAlign: 'right',
        flex: 1,
    },
    declarationText: {
        fontSize: '13@ms',
        color: '#64748B',
        lineHeight: '20@ms',
    },
    uploadSection: {
        marginBottom: '32@vs',
    },
    buttonContainer: {
        gap: '12@vs',
    },
    closeButton: {
        backgroundColor: '#F1F5F9',
        borderRadius: '30@ms',
        paddingVertical: '16@vs',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#0F172A',
        fontSize: '14@ms',
        fontWeight: '600',
    },
});
