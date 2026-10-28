import { InfoCircle } from 'iconsax-react-nativejs';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import FileUpload from './FileUpload';
import PrimaryButton from './PrimaryButton';
import InputField from './InputField';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import AnimatedBottomSheet from '@/components/ui/AnimatedBottomSheet';
import { getInitials } from '@/utils/helpers';
import { useAppTheme } from '@/hooks/useAppTheme';

interface InfoRowProps {
    label: string;
    value: string;
    labelColor?: string;
    valueColor?: string;
    dividerColor?: string;
}

const InfoRow = ({ label, value, labelColor, valueColor, dividerColor }: InfoRowProps) => (
    <View style={[styles.infoRow, dividerColor ? { borderBottomColor: dividerColor } : undefined]}>
        <Text style={[styles.infoLabel, labelColor ? { color: labelColor } : undefined]}>{label}</Text>
        <Text style={[styles.infoValue, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
    </View>
);

interface SourceOfFundsSheetProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (method: 'initials' | 'signature') => void;
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
    const { colors, isDark } = useAppTheme();
    const [declarationMethod, setDeclarationMethod] = React.useState<'initials' | 'signature'>('initials');

    React.useEffect(() => {
        if (visible) {
            if (signatureFile) {
                setDeclarationMethod('signature');
            } else if (initials && initials.trim()) {
                setDeclarationMethod('initials');
            } else if (customerInfo?.fullName && onChangeInitials) {
                const autoInitials = getInitials(customerInfo.fullName);
                if (autoInitials) {
                    onChangeInitials(autoInitials);
                }
                setDeclarationMethod('initials');
            }
        }
    }, [visible, customerInfo?.fullName, initials, onChangeInitials, signatureFile]);

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={onClose}
            sheetStyle={[styles.sheetContainer, { backgroundColor: colors.surface }]}
        >
            <LoadingBackdrop visible={!!isUploadingSignature} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <View style={styles.headerIconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255, 107, 44, 0.18)' : '#FFF7ED' }]}>
                            <InfoCircle size={moderateScale(24)} color="#FF6B2C" variant="Bold" />
                        </View>
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>Source of Funds Exchange Declaration  Form</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>Kindly note the following</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer information</Text>
                    <InfoRow label="Full Name" value={customerInfo.fullName} labelColor={colors.text} valueColor={colors.textMuted} dividerColor={colors.divider} />
                    <InfoRow label="Phone Number" value={customerInfo.phoneNumber} labelColor={colors.text} valueColor={colors.textMuted} dividerColor={colors.divider} />
                    <InfoRow label="Email Address" value={customerInfo.email} labelColor={colors.text} valueColor={colors.textMuted} dividerColor={colors.divider} />
                    <InfoRow label="BVN" value={customerInfo.bvn} labelColor={colors.text} valueColor={colors.textMuted} dividerColor={colors.divider} />
                    <InfoRow label="Resident Address" value={customerInfo.address} labelColor={colors.text} valueColor={colors.textMuted} dividerColor={colors.divider} />
                    <InfoRow label="Passport Number" value={customerInfo.passportDocumentNumber} labelColor={colors.text} valueColor={colors.textMuted} dividerColor={colors.divider} />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction Details</Text>
                    <InfoRow label="Transaction Type" value={transactionDetails.type} labelColor={colors.text} valueColor={colors.textMuted} dividerColor={colors.divider} />
                    <InfoRow label="Currency" value={transactionDetails.currency} labelColor={colors.text} valueColor={colors.textMuted} dividerColor={colors.divider} />
                    <InfoRow label="Amount" value={transactionDetails.amount} labelColor={colors.text} valueColor={colors.textMuted} dividerColor={colors.divider} />
                    <InfoRow label="Purpose of Transaction" value={transactionDetails.purpose} labelColor={colors.text} valueColor={colors.textMuted} dividerColor={colors.divider} />
                </View>

                <View style={styles.selectorContainer}>
                    <Text style={[styles.selectorLabel, { color: colors.label }]}>Choose Declaration Method <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <View style={[styles.methodSelector, { backgroundColor: isDark ? colors.card : '#F1F5F9' }]}>
                        <TouchableOpacity 
                            style={[
                                styles.methodTab,
                                declarationMethod === 'initials' && [styles.methodTabActive, { backgroundColor: colors.surface }],
                            ]} 
                            onPress={() => setDeclarationMethod('initials')}
                        >
                            <Text style={[styles.methodTabText, { color: colors.textMuted }, declarationMethod === 'initials' && styles.methodTabTextActive]}>
                                Use Initials
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[
                                styles.methodTab,
                                declarationMethod === 'signature' && [styles.methodTabActive, { backgroundColor: colors.surface }],
                            ]} 
                            onPress={() => setDeclarationMethod('signature')}
                        >
                            <Text style={[styles.methodTabText, { color: colors.textMuted }, declarationMethod === 'signature' && styles.methodTabTextActive]}>
                                Upload Signature
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {declarationMethod === 'initials' ? (
                    <InputField
                        label="Initials"
                        placeholder="Enter your initials"
                        value={initials}
                        onChangeText={onChangeInitials}
                        disabled
                        required
                    />
                ) : (
                    <View style={styles.uploadSection}>
                        <FileUpload
                            title="Upload Signature"
                            fileName={signatureFile}
                            onUpload={onUploadSignature}
                            status={isUploadingSignature ? 'pending' : 'default'}
                        />
                    </View>
                )}

                <View style={styles.buttonContainer}>
                    <PrimaryButton
                        title="Submit"
                        onPress={() => onSubmit(declarationMethod)}
                        disabled={declarationMethod === 'initials' ? !initials?.trim() : !signatureFile}
                    />
                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: isDark ? colors.surfaceHighlight : '#F1F5F9' }]}
                        onPress={onClose}
                    >
                        <Text style={[styles.closeButtonText, { color: colors.text }]}>No, Close</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </AnimatedBottomSheet>
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
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        maxHeight: '85%',
        paddingTop: '12@vs',
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
    selectorContainer: {
        marginBottom: '16@vs',
    },
    selectorLabel: {
        fontSize: '12.5@ms',
        fontWeight: '400',
        color: '#475569',
        marginBottom: '8@vs',
    },
    methodSelector: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: '30@ms',
        padding: '4@ms',
        height: '46@vs',
        alignItems: 'center',
    },
    methodTab: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '26@ms',
    },
    methodTabActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    methodTabText: {
        fontSize: '13@ms',
        color: '#64748B',
        fontWeight: '500',
    },
    methodTabTextActive: {
        color: '#FF6B2C',
        fontWeight: '600',
    },
});
