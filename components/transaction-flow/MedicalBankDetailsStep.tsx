import ControlledInput from '@/components/ControlledInput';
import React from 'react';
import { ScrollView, Text } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

interface MedicalBankDetailsStepProps {
    control: any;
}

export default function MedicalBankDetailsStep({ control }: MedicalBankDetailsStepProps) {
    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Where would you like to send the fund to?</Text>

            <ControlledInput
                control={control}
                name="beneficiaryName"
                label="Beneficiary"
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
                name="beneficiaryBank"
                label="Beneficiary Bank"
                placeholder="Enter beneficiary bank"
                required
            />

            <ControlledInput
                control={control}
                name="routingNumber"
                label="Routing Number"
                placeholder="Enter routing number"
                required
                keyboardType="numeric"
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
                name="bankAddress"
                label="Bank Address"
                placeholder="Enter bank address"
                required
            />

            <ControlledInput
                control={control}
                name="swiftCode"
                label="SWIFT CODE"
                placeholder="Enter swift code"
                required
            />
        </ScrollView>
    );
}

const styles = ScaledSheet.create({
    container: {
        gap: '6@vs',
        paddingBottom: '40@vs',
    },
    title: {
        fontSize: '16@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '8@vs',
        lineHeight: '24@ms',
    },
});
