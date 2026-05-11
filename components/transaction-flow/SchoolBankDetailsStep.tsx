import ControlledInput from '@/components/ControlledInput';
import React from 'react';
import { Text, ScrollView } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

interface SchoolBankDetailsStepProps {
    control: any;
}

export default function SchoolBankDetailsStep({ control }: SchoolBankDetailsStepProps) {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Where would you like to send the fund to?</Text>
            
            <Text style={styles.sectionTitle}>Student Details</Text>
            <ControlledInput control={control} name="studentName" label="Student Name" placeholder="Enter student name" required />
            <ControlledInput control={control} name="studentPassportNumber" label="Student Passport Number" placeholder="Enter student passport number" required />
            
            <Text style={styles.sectionTitle}>For the School (Beneficiary)</Text>
            <ControlledInput control={control} name="bankAccountName" label="Bank Account Name" placeholder="Enter bank account name" required />
            <ControlledInput control={control} name="bankAccountAddress" label="Bank Account Address" placeholder="Enter bank account address" required />
            <ControlledInput control={control} name="bankAccountIban" label="Bank Account IBAN" placeholder="Enter IBAN" required />
            <ControlledInput control={control} name="bankAccountSwiftCode" label="Bank Account Swift Code" placeholder="Enter swift code" required />
            <ControlledInput control={control} name="bankAccountNumber" label="Bank Account Number" placeholder="Enter account number" required keyboardType="numeric" />
            
            <Text style={styles.sectionTitle}>Correspondence Bank Details</Text>
            <ControlledInput control={control} name="correspondenceBankName" label="Correspondence Bank Name" placeholder="Enter correspondence bank name" required />
            <ControlledInput control={control} name="correspondenceBankAddress" label="Correspondence Bank Address" placeholder="Enter correspondence bank address" required />
            <ControlledInput control={control} name="correspondenceBankSwiftCode" label="Correspondence Bank Swift Code" placeholder="Enter correspondence swift code" required />
        </ScrollView>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        gap: '12@vs',
        paddingBottom: '24@vs',
    },
    title: {
        fontSize: '16@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '4@vs',
        lineHeight: '24@ms',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#334155',
        marginTop: '8@vs',
        marginBottom: '4@vs',
    }
});
