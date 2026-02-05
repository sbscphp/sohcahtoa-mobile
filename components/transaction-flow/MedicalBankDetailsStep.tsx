import InputField from '@/components/InputField';
import React from 'react';
import { ScrollView, Text } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

interface MedicalBankDetailsStepProps {
    beneficiaryName: string;
    setBeneficiaryName: (text: string) => void;
    beneficiaryAddress: string;
    setBeneficiaryAddress: (text: string) => void;
    beneficiaryBank: string;
    setBeneficiaryBank: (text: string) => void;
    routingNumber: string;
    setRoutingNumber: (text: string) => void;
    accountNumber: string;
    setAccountNumber: (text: string) => void;
    bankAddress: string;
    setBankAddress: (text: string) => void;
    swiftCode: string;
    setSwiftCode: (text: string) => void;
}

export default function MedicalBankDetailsStep({
    beneficiaryName,
    setBeneficiaryName,
    beneficiaryAddress,
    setBeneficiaryAddress,
    beneficiaryBank,
    setBeneficiaryBank,
    routingNumber,
    setRoutingNumber,
    accountNumber,
    setAccountNumber,
    bankAddress,
    setBankAddress,
    swiftCode,
    setSwiftCode
}: MedicalBankDetailsStepProps) {
    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Where would you like to send the fund to?</Text>

            <InputField
                label="Beneficiary"
                placeholder="Enter beneficiary name"
                value={beneficiaryName}
                onChangeText={setBeneficiaryName}
                required
            />

            <InputField
                label="Beneficiary Address"
                placeholder="Enter beneficiary address"
                value={beneficiaryAddress}
                onChangeText={setBeneficiaryAddress}
                required
            />

            <InputField
                label="Beneficiary Bank"
                placeholder="Enter beneficiary bank"
                value={beneficiaryBank}
                onChangeText={setBeneficiaryBank}
                required
            />

            <InputField
                label="Routing Number"
                placeholder="Enter routing number"
                value={routingNumber}
                onChangeText={setRoutingNumber}
                required
                keyboardType="numeric"
            />

            <InputField
                label="Account Number"
                placeholder="Enter account number"
                value={accountNumber}
                onChangeText={setAccountNumber}
                required
                keyboardType="numeric"
            />

            <InputField
                label="Bank Address"
                placeholder="Enter bank address"
                value={bankAddress}
                onChangeText={setBankAddress}
                required
            />

            <InputField
                label="SWIFT CODE"
                placeholder="Enter swift code"
                value={swiftCode}
                onChangeText={setSwiftCode}
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
