import ControlledInput from '@/components/ControlledInput';
import React from 'react';
import { Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

interface BankDetailsStepProps {
    control: any;
}

export default function BankDetailsStep({ control }: BankDetailsStepProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Where would you like to send the fund to?</Text>

            <ControlledInput
                control={control}
                name="bankName"
                label="Bank Name"
                placeholder="Enter bank name"
                required
            />

            <ControlledInput
                control={control}
                name="accountNumber"
                label="Account Number"
                placeholder="Enter account number"
                required
                keyboardType="numeric"
            />

            <ControlledInput
                control={control}
                name="accountName"
                label="Account Name"
                placeholder="Enter account name"
                required
            />

            <ControlledInput
                control={control}
                name="beneficiaryName"
                label="Beneficiary Name"
                placeholder="Enter beneficiary name"
                required
            />

            <ControlledInput
                control={control}
                name="beneficiaryAddress"
                label="Beneficiary Address"
                placeholder="Enter beneficiary address"
                required
            />

            <ControlledInput
                control={control}
                name="paymentReferenceId"
                label="Payment Reference/ID"
                placeholder="Enter payment reference"
                required
            />

            <ControlledInput
                control={control}
                name="swiftCode"
                label="Swift Code"
                placeholder="Enter swift code"
                required
            />
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        gap: '6@vs',
    },
    title: {
        fontSize: '16@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '8@vs',
        lineHeight: '24@ms',
    },
});
