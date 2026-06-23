import { InfoCircle, Verify } from 'iconsax-react-nativejs';
import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from './PrimaryButton';
import { useGetWalletLedgerQuery } from '@/hooks/queries/wallet/useGetWalletLedgerQuery';

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
    loading?: boolean;
}

const InitiateTransactionSheet: React.FC<InitiateTransactionSheetProps> = ({
    visible,
    onClose,
    onConfirm,
    title = "Initiate Transaction Request?",
    subtitle = "Kindly note the following",
    confirmText = "Yes Initiate Request",
    loading,
    items = [
        {
            title: "",
            description: "Please note that the maximum you can transact is $4,000 per quarter.",
            iconType: 'limit'
        }
    ]
}) => {
    const insets = useSafeAreaInsets();
    const { data: ledgerData } = useGetWalletLedgerQuery({ page: 1, limit: 1 });
    const firstPage = ledgerData?.pages?.[0];
    const balance = firstPage?.data?.balance;
    const currency = firstPage?.data?.currency || 'NGN';

    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        if (visible) {
            setIsChecked(false);
        }
    }, [visible]);

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

                
                    <View style={styles.headerIconContainer}>
                        <View style={styles.iconCircle}>
                            <InfoCircle size={moderateScale(24)} color="#FF6B2C" variant="Bold" />
                        </View>
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                  
                    <View style={styles.infoBox}>
                        {items.map((item, index) => (
                            <View key={index} style={styles.infoItem}>
                                {renderIcon(item)}
                                <View style={styles.infoTextContainer}>
                                    {item.title ? <Text style={styles.infoTitle}>{item.title}</Text> : null}
                                    <Text style={styles.infoDescription}>{item.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        activeOpacity={0.8}
                        onPress={() => setIsChecked(!isChecked)}
                    >
                        <View style={styles.checkbox}>
                            {isChecked ? (
                                <Ionicons name="checkbox" size={moderateScale(20)} color="#FF6B2C" />
                            ) : (
                                <Ionicons name="square-outline" size={moderateScale(20)} color="#64748B" />
                            )}
                        </View>
                        <Text style={styles.checkboxLabel}>
                            I confirm that the information I have provided is correct.
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footerActions}>
                        <PrimaryButton
                            title={confirmText}
                            onPress={onConfirm}
                            loading={loading}
                            disabled={!isChecked}
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
    },
    balanceContainer: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: '12@ms',
        paddingHorizontal: '16@s',
        paddingVertical: '12@vs',
        marginBottom: '16@vs',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    balanceLabelText: {
        fontSize: '13@ms',
        color: '#64748B',
        fontWeight: '500',
    },
    balanceValueText: {
        fontSize: '14@ms',
        fontWeight: '700',
        color: '#0F172A',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: '20@vs',
        gap: '8@s',
        paddingHorizontal: '4@s',
    },
    checkbox: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxLabel: {
        fontSize: '13@ms',
        color: '#475569',
        flex: 1,
        lineHeight: '18@ms',
    },
});

export default InitiateTransactionSheet;
