import { InfoCircle, Verify, Warning2 } from 'iconsax-react-nativejs';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import PrimaryButton from './PrimaryButton';

interface InitiateTransactionSheetProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const InitiateTransactionSheet: React.FC<InitiateTransactionSheetProps> = ({
    visible,
    onClose,
    onConfirm
}) => {
    const insets = useSafeAreaInsets();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={[styles.sheetContent, { paddingBottom: insets.bottom + moderateScale(20) }]}>

                    {/* Header Icon */}
                    <View style={styles.headerIconContainer}>
                        <View style={styles.iconCircle}>
                            <InfoCircle size={moderateScale(24)} color="#FF6B2C" variant="Bold" />
                        </View>
                    </View>

                    <Text style={styles.title}>Initiate PTA Transaction request?</Text>
                    <Text style={styles.subtitle}>Kindly note the following</Text>

                    {/* Info Box */}
                    <View style={styles.infoBox}>

                        <View style={styles.infoItem}>
                            <View style={styles.infoIconCircle}>
                                <Verify size={moderateScale(20)} color="#0F172A" variant="Outline" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoTitle}>Verification before approval</Text>
                                <Text style={styles.infoDescription}>
                                    You will be able to process your PTA once your documents is verified and approved.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={styles.infoIconCircle}>
                                <Text style={{ fontSize: moderateScale(16), fontWeight: '600', color: '#0F172A' }}>$</Text>
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoTitle}>Maximum of $4,000 per quarter</Text>
                                <Text style={styles.infoDescription}>
                                    The maximum you can transact is $4,000 per quarter.
                                </Text>
                            </View>
                        </View>

                    </View>

                    <View style={styles.footerActions}>
                        <PrimaryButton
                            title="Yes Intitate Request"
                            onPress={onConfirm}
                        />
                        <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
                            <Text style={styles.secondaryBtnText}>No, Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheetContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        paddingHorizontal: '20@s',
        paddingTop: '24@vs',
        marginBottom: '40@vs',
        marginHorizontal: '12@s',
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
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '8@vs',
    },
    subtitle: {
        fontSize: '14@ms',
        color: '#64748B',
        marginBottom: '24@vs',
    },
    infoBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: '16@ms',
        padding: '16@ms',
        gap: '20@vs',
        marginBottom: '30@vs',
    },
    infoItem: {
        flexDirection: 'row',
        gap: '12@s',
    },
    infoIconCircle: {
        width: '32@ms',
        height: '32@ms',
        borderRadius: '16@ms',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoTextContainer: {
        flex: 1,
        gap: '4@vs',
    },
    infoTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    infoDescription: {
        fontSize: '12@ms',
        color: '#64748B',
        lineHeight: '18@ms',
    },
    footerActions: {
        gap: '12@vs',
    },
    secondaryBtn: {
        backgroundColor: '#F1F5F9',
        borderRadius: '30@ms',
        paddingVertical: '16@vs',
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#0F172A',
        fontSize: '14@ms',
        fontWeight: '600',
    }
});

export default InitiateTransactionSheet;
