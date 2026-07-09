import ControlledInput from '@/components/ControlledInput';
import React from 'react';
import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

interface AddDomiciliaryAccountStepProps {
    control: any;
    setValue: (name: any, value: any, options?: any) => void;
}

export default function AddDomiciliaryAccountStep({
    control,
}: AddDomiciliaryAccountStepProps) {
    return (
        <View style={{ gap: moderateScale(16) }}>
            <Text style={{ fontSize: moderateScale(18), fontWeight: '700', color: '#0F172A', marginBottom: moderateScale(8) }}>
                Add Domiciliary Account
            </Text>

            <ControlledInput
                control={control}
                name="domiciliaryAccountNumber"
                label="Domiciliary Account Number"
                placeholder="Enter domiciliary account number"
                required
                filterType="alphanumeric"
            />
            <ControlledInput
                control={control}
                name="domiciliaryBankName"
                label="Domiciliary Bank Name"
                placeholder="Enter domiciliary bank name"
                required
            />
            <ControlledInput
                control={control}
                name="domiciliaryAccountName"
                label="Account Name"
                placeholder="Enter account name"
                required
            />
            <ControlledInput
                control={control}
                name="domiciliarySwiftCode"
                label="SWIFT Code"
                placeholder="Enter SWIFT code"
                required
                maxLength={11}
                filterType="alphanumeric"
                autoCapitalize="characters"
            />
            <ControlledInput
                control={control}
                name="domiciliaryRoutingNumber"
                label="Routing Number"
                placeholder="Enter routing number"
                required
                keyboardType="numeric"
                maxLength={9}
                filterType="numeric"
            />
            <ControlledInput
                control={control}
                name="domiciliaryBankAddress"
                label="Bank Address"
                placeholder="Enter bank address"
                required
            />
        </View>
    );
}
