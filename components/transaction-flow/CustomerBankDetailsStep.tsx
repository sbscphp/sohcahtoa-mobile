import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { ArrowDown2, Bank } from 'iconsax-react-nativejs';

interface CustomerBankDetailsStepProps {
    control: any;
    setValue: any;
    banks: SelectionItem[];
    resolvedAccountName?: string;
    isResolving?: boolean;
}

export default function CustomerBankDetailsStep({ 
    control, 
    setValue, 
    banks,
    resolvedAccountName,
    isResolving 
}: CustomerBankDetailsStepProps) {
    const [bankSheetVisible, setBankSheetVisible] = useState(false);
    const [selectedBank, setSelectedBank] = useState<SelectionItem | null>(null);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Confirm Your Bank Details</Text>
            <Text style={styles.subtitle}>Enter the account details from which the funds will be debited.</Text>

            <TouchableOpacity onPress={() => setBankSheetVisible(true)} activeOpacity={0.8}>
                <View pointerEvents="none">
                    <ControlledInput
                        control={control}
                        name="customerBankName"
                        label="Bank Name"
                        placeholder="Select Bank"
                        required
                        rightIcon={ArrowDown2}
                        editable={false}
                    />
                </View>
            </TouchableOpacity>

            <ControlledInput
                control={control}
                name="customerAccountNumber"
                label="Account Number"
                placeholder="Enter account number"
                required
                keyboardType="numeric"
                maxLength={10}
            />

            {resolvedAccountName ? (
                <View style={styles.accountNameContainer}>
                    <Text style={styles.accountNameLabel}>Account Name</Text>
                    <Text style={styles.accountNameValue}>{resolvedAccountName}</Text>
                </View>
            ) : isResolving ? (
                <Text style={styles.resolvingText}>Resolving account name...</Text>
            ) : null}

            <GenericSelectionSheet
                visible={bankSheetVisible}
                onClose={() => setBankSheetVisible(false)}
                title="Select Bank"
                headerIcon={Bank}
                items={banks}
                selectedItem={selectedBank?.value || ''}
                onSelect={(item) => {
                    setSelectedBank(item);
                    setValue('customerBankName', item.label);
                    setValue('customerBankCode', item.value);
                }}
                searchable={true}
                searchPlaceholder="Search bank..."
            />
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        gap: '6@vs',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
        lineHeight: '26@ms',
    },
    subtitle: {
        fontSize: '14@ms',
        color: '#64748B',
        marginBottom: '12@vs',
        lineHeight: '20@ms',
    },
    accountNameContainer: {
        backgroundColor: '#F8FAFC',
        padding: '12@ms',
        borderRadius: '8@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginTop: '8@vs',
    },
    accountNameLabel: {
        fontSize: '12@ms',
        color: '#64748B',
        marginBottom: '4@vs',
    },
    accountNameValue: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    resolvingText: {
        fontSize: '12@ms',
        color: '#F97316',
        fontStyle: 'italic',
        marginTop: '4@vs',
    }
});
