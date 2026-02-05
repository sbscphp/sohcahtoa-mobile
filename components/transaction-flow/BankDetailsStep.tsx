import InputField from '@/components/InputField';
import React from 'react';
import { Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

interface BankDetailsStepProps {
    bankName: string;
    setBankName: (text: string) => void;
    accountNumber: string;
    setAccountNumber: (text: string) => void;
    accountName: string;
    setAccountName: (text: string) => void;
    iban: string;
    setIban: (text: string) => void;
}

export default function BankDetailsStep({
    bankName,
    setBankName,
    accountNumber,
    setAccountNumber,
    accountName,
    setAccountName,
    iban,
    setIban
}: BankDetailsStepProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Where would you like to send the fund to?</Text>

            <InputField
                label="Bank Name"
                placeholder="Enter bank name"
                value={bankName}
                onChangeText={setBankName}
                required
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
                label="Account Name"
                placeholder="Enter account name"
                value={accountName}
                onChangeText={setAccountName}
                required
            />

            <InputField
                label="Iban"
                placeholder="Enter iban number"
                value={iban}
                onChangeText={setIban}
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
