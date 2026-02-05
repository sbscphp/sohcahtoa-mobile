import { InfoCircle, Verify } from 'iconsax-react-nativejs';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import PrimaryButton from './PrimaryButton';

interface InfoItemProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    iconType?: 'verify' | 'limit' | 'info';
}

interface InitiateTransactionSheetProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    subtitle?: string;
    confirmText?: string;
    items?: InfoItemProps[];
}

const InitiateTransactionSheet: React.FC<InitiateTransactionSheetProps> = ({
    visible,
    onClose,
    onConfirm,
    title = "Initiate Transaction Request?",
    subtitle = "Kindly note the following",
    confirmText = "Yes Initiate Request",
    items = [
        {
            title: "Verification before approval",
            description: "You will be able to process your transaction once your documents are verified and approved.",
            iconType: 'verify'
        }
    ]
}) => {
    const insets = useSafeAreaInsets();

    const renderIcon = (item: InfoItemProps) => {
        if (item.icon) return item.icon;

        if (item.iconType === 'verify') {
            return (
                <View style={styles.infoIconCircle}>
                    <Verify size={moderateScale(20)} color="#0F172A"  />
                </View>
            );
        }

        if (item.iconType === 'limit') {
            return (
                <View style={styles.infoIconCircle}>
                    <Text style={{ fontSize: moderateScale(16), fontWeight: '600', color: '#0F172A' }}>$</Text>
                </View>
            );
        }

        return (
            <View style={styles.infoIconCircle}>
                <InfoCircle size={moderateScale(20)} color="#0F172A" variant="Outline" />
            </View>
        );
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={[styles.sheetContent, { paddingBottom: insets.bottom + moderateScale(4) }]}>

                    {/* Header Icon */}
                    <View style={styles.headerIconContainer}>
                        <View style={styles.iconCircle}>
                            <InfoCircle size={moderateScale(24)} color="#FF6B2C" variant="Bold" />
                        </View>
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        {items.map((item, index) => (
                            <View key={index} style={styles.infoItem}>
                                {renderIcon(item)}
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoTitle}>{item.title}</Text>
                                    <Text style={styles.infoDescription}>{item.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.footerActions}>
                        <PrimaryButton
                            title={confirmText}
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
        paddingHorizontal: '16@s',
        paddingTop: '22@vs',
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
        fontSize: '16@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '8@vs',
        // width: '80%',   
    },
    subtitle: {
        fontSize: '13@ms',
        color: '#64748B',
        marginBottom: '22@vs',
    },
    infoBox: {
        backgroundColor: 'rgba(241, 241, 241, 1)',
        borderRadius: '16@ms',
        padding: '16@ms',
        gap: '20@vs',
        marginBottom: '45@vs',
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
        fontSize: '13@ms',
        fontWeight: '500',
        color: '#0F172A',
    },
    infoDescription: {
        fontSize: '12@ms',
        color: '#64748B',
        lineHeight: '15@ms',
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
