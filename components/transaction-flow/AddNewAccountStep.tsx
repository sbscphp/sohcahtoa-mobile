import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import { ArrowDown2, Bank } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

interface AddNewAccountStepProps {
    control: any;
    setValue: (name: any, value: any, options?: any) => void;
    banks: SelectionItem[];
    isResolving?: boolean;
    selectedBankCode?: string;
}

export default function AddNewAccountStep({
    control,
    setValue,
    banks,
    isResolving,
    selectedBankCode,
}: AddNewAccountStepProps) {
    const [bankSheetVisible, setBankSheetVisible] = useState(false);

    return (
        <View style={{ gap: moderateScale(16) }}>
            <Text style={{ fontSize: moderateScale(18), fontWeight: '700', color: '#0F172A', marginBottom: moderateScale(8) }}>
                Add New Bank Account
            </Text>

            <TouchableOpacity onPress={() => setBankSheetVisible(true)} activeOpacity={0.8}>
                <View pointerEvents="none">
                    <ControlledInput
                        control={control}
                        name="customerBankName"
                        label="Bank Name"
                        placeholder="Select Bank Name"
                        required
                        rightIcon={ArrowDown2}
                        editable={false}
                    />
                </View>
            </TouchableOpacity>

            <ControlledInput
                control={control}
                name="customerAccountName"
                label="Account Name"
                placeholder="Enter account name"
                required
            />

            <ControlledInput
                control={control}
                name="customerAccountNumber"
                label="Account Number"
                placeholder="Enter account number"
                required
                keyboardType="numeric"
                maxLength={10}
            />

            {isResolving && (
                <Text style={{ fontSize: moderateScale(12), color: '#F97316', fontStyle: 'italic', marginTop: moderateScale(-8) }}>
                    Resolving account name...
                </Text>
            )}

            <GenericSelectionSheet
                visible={bankSheetVisible}
                onClose={() => setBankSheetVisible(false)}
                title="Select Bank"
                headerIcon={Bank}
                items={banks}
                selectedItem={selectedBankCode || ''}
                onSelect={(item) => {
                    setValue('customerBankName', item.label);
                    setValue('customerBankCode', item.value);
                    setBankSheetVisible(false);
                }}
                confirmButtonText="Select Bank"
            />
        </View>
    );
}
