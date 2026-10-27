import AnimatedBottomSheet from '@/components/ui/AnimatedBottomSheet';
import { InfoCircle } from 'iconsax-react-nativejs';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';
import PrimaryButton from './PrimaryButton';

interface IgreeConsentSheetProps {
    isVisible: boolean;
    onClose: () => void;
    onCheckStatus: () => void;
    onReopenBrowser: () => void;
    checkingStatus: boolean;
}

const IgreeConsentSheet: React.FC<IgreeConsentSheetProps> = ({
    isVisible,
    onClose,
    onCheckStatus,
    onReopenBrowser,
    checkingStatus,
}) => {
    return (
        <AnimatedBottomSheet
            visible={isVisible}
            onClose={onClose}
            sheetStyle={styles.sheetContainer}
        >
            <View style={styles.headerIconContainer}>
                <View style={styles.iconCircle}>
                    <InfoCircle size={moderateScale(28)} color="#FF6B2C" variant="Bold" />
                </View>
            </View>

            <Text style={styles.title}>Consent Verification</Text>
            <Text style={styles.description}>
                Please confirm your authentication on the NIBSS iGree portal to complete your BVN verification.
            </Text>

            <View style={styles.buttonContainer}>
                <PrimaryButton
                    title="Check Verification Status"
                    onPress={onCheckStatus}
                    loading={checkingStatus}
                    disabled={checkingStatus}
                />

                <TouchableOpacity
                    style={styles.reopenButton}
                    onPress={onReopenBrowser}
                    disabled={checkingStatus}
                    activeOpacity={0.7}
                >
                    <Text style={styles.reopenButtonText}>Re-open Consent Portal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                    disabled={checkingStatus}
                    activeOpacity={0.7}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </AnimatedBottomSheet>
    );
};

const styles = ScaledSheet.create({
    sheetContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: '28@ms',
        paddingHorizontal: '24@s',
        paddingTop: '14@vs',
        paddingBottom: '32@vs',
        marginBottom: '28@vs',
        marginHorizontal: '12@s',
        alignItems: 'center',
    },
    headerIconContainer: {
        marginBottom: '16@vs',
    },
    iconCircle: {
        width: '56@ms',
        height: '56@ms',
        borderRadius: '28@ms',
        backgroundColor: '#FFF4EE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '8@vs',
        textAlign: 'center',
    },
    description: {
        fontSize: '13@ms',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: '20@ms',
        marginBottom: '24@vs',
        paddingHorizontal: '12@s',
    },
    buttonContainer: {
        width: '100%',
        gap: '12@vs',
    },
    reopenButton: {
        height: '42@vs',
        borderRadius: '28@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    reopenButtonText: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#334155',
    },
    cancelButton: {
        paddingVertical: '8@vs',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: '13@ms',
        color: '#94A3B8',
        fontWeight: '500',
    },
});

export default IgreeConsentSheet;
