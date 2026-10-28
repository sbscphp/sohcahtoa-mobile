import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ScaledSheet } from 'react-native-size-matters';
import { ArrowDown2 } from 'iconsax-react-nativejs';
import PrimaryButton from '@/components/PrimaryButton';
import InputField from '@/components/InputField';
import { SelectionItem } from '@/components/GenericSelectionSheet';
import { AnimatedBottomSheet } from '@/components/ui/AnimatedBottomSheet';
import { useAppTheme } from '@/hooks/useAppTheme';

interface AddBankAccountModalProps {
    visible: boolean;
    onClose: () => void;
    onOpenBankSheet: () => void;
    selectedBank: SelectionItem | null;
    accountNumber: string;
    setAccountNumber: (val: string) => void;
    accountName: string;
    isResolving: boolean;
    onSave: () => void;
}

export default function AddBankAccountModal({
    visible,
    onClose,
    onOpenBankSheet,
    selectedBank,
    accountNumber,
    setAccountNumber,
    accountName,
    isResolving,
    onSave,
}: AddBankAccountModalProps) {
    const { colors, isDark } = useAppTheme();

    const headerContent = (
        <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Add Bank Account</Text>
        </View>
    );

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={onClose}
            headerComponent={headerContent}
            sheetStyle={[styles.bottomSheet, { backgroundColor: colors.card }]}
        >
            <ScrollView contentContainerStyle={styles.sheetContent}>
                <TouchableOpacity onPress={onOpenBankSheet} activeOpacity={0.8}>
                    <View pointerEvents="none">
                        <InputField
                            label="Bank Name"
                            placeholder="Select Bank"
                            required
                            value={selectedBank?.label || ''}
                            rightIcon={ArrowDown2}
                            editable={false}
                        />
                    </View>
                </TouchableOpacity>

                <InputField
                    label="Account Number"
                    placeholder="Enter 10-digit number"
                    required
                    keyboardType="numeric"
                    maxLength={10}
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                />

                {accountName ? (
                    <View style={[styles.resolvedNameContainer, { backgroundColor: isDark ? colors.surface : '#F8FAFC', borderColor: colors.border }]}>
                        <Text style={[styles.resolvedLabel, { color: colors.textMuted }]}>Account Name</Text>
                        <Text style={[styles.resolvedValue, { color: colors.text }]}>{accountName}</Text>
                    </View>
                ) : isResolving ? (
                    <Text style={styles.resolvingText}>Resolving account name...</Text>
                ) : null}

                <View style={styles.sheetFooter}>
                    <PrimaryButton
                        title="Save Bank Details"
                        onPress={onSave}
                        disabled={!selectedBank || accountNumber.length !== 10 || !accountName}
                    />
                    <TouchableOpacity
                        style={[styles.sheetCloseBtn, { backgroundColor: isDark ? colors.surfaceHighlight : '#F1F5F9' }]}
                        onPress={onClose}
                    >
                        <Text style={[styles.sheetCloseText, { color: colors.text }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </AnimatedBottomSheet>
    );
}

const styles = ScaledSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: '24@ms',
        borderTopRightRadius: '24@ms',
        maxHeight: '85%',
        paddingBottom: '24@vs',
    },
    sheetHeader: {
        width: '100%',
        paddingHorizontal: '20@ms',
        paddingVertical: '12@vs',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    sheetTitle: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
    },
    sheetContent: {
        padding: '20@ms',
        gap: '16@vs',
    },
    resolvedNameContainer: {
        backgroundColor: '#F8FAFC',
        padding: '12@ms',
        borderRadius: '12@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    resolvedLabel: {
        fontSize: '11@ms',
        color: '#64748B',
        marginBottom: '2@vs',
    },
    resolvedValue: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    resolvingText: {
        fontSize: '12@ms',
        color: '#FF6813',
        fontStyle: 'italic',
        marginTop: '-8@vs',
    },
    sheetFooter: {
        marginTop: '16@vs',
        gap: '12@vs',
    },
    sheetCloseBtn: {
        alignItems: 'center',
        paddingVertical: '12@vs',
    },
    sheetCloseText: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#64748B',
    },
});
