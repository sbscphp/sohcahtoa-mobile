import ControlledInput from '@/components/ControlledInput';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

interface ProfessionalBankDetailsStepProps {
    control: any;
}

export default function ProfessionalBankDetailsStep({ control }: ProfessionalBankDetailsStepProps) {
    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Bank details</Text>

            <ControlledInput
                control={control}
                name="memberName"
                label="Member Name"
                placeholder="Enter member name"
                required
            />
            <ControlledInput
                control={control}
                name="memberNumber"
                label="Member Number"
                placeholder="Enter member number"
                required
            />

            <Text style={styles.sectionTitle}>Beneficiary details</Text>
            <ControlledInput
                control={control}
                name="organizationName"
                label="Name of organization"
                placeholder="Enter name of organization"
                required
            />
            <ControlledInput
                control={control}
                name="beneficiaryPhone"
                label="Phone number"
                placeholder="Enter phone number"
                required
                keyboardType="phone-pad"
            />
            <ControlledInput
                control={control}
                name="beneficiaryEmail"
                label="Email"
                placeholder="Enter email address"
                required
                keyboardType="email-address"
            />
            <ControlledInput
                control={control}
                name="beneficiaryAddress"
                label="Address"
                placeholder="Enter address"
                required
            />
            <ControlledInput
                control={control}
                name="beneficiaryCity"
                label="City"
                placeholder="Enter city"
                required
            />
            <ControlledInput
                control={control}
                name="beneficiaryState"
                label="State"
                placeholder="Enter state"
                required
            />
            <ControlledInput
                control={control}
                name="beneficiaryCountry"
                label="Country"
                placeholder="Enter country"
                required
            />

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Beneficiary Bank details</Text>
            <ControlledInput
                control={control}
                name="bankAccountName"
                label="Bank Account Name"
                placeholder="Enter bank account name"
                required
            />
            <ControlledInput
                control={control}
                name="bankAccountAddress"
                label="Bank Account Address"
                placeholder="Enter bank account address"
                required
            />
            <ControlledInput
                control={control}
                name="bankAccountIban"
                label="Bank Account IBAN"
                placeholder="Enter IBAN"
                required
            />
            <ControlledInput
                control={control}
                name="bankAccountSwiftCode"
                label="Bank Account Swift Code"
                placeholder="Enter SWIFT code"
                required
            />
            <ControlledInput
                control={control}
                name="bankAccountNumber"
                label="Bank Account Number"
                placeholder="Enter account number"
                required
                keyboardType="numeric"
            />

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Correspondence Bank details (Optional)</Text>
            <ControlledInput
                control={control}
                name="correspondenceBankName"
                label="Correspondence Bank Name"
                placeholder="Enter correspondence bank name"
            />
            <ControlledInput
                control={control}
                name="correspondenceBankAddress"
                label="Correspondence Bank Address"
                placeholder="Enter correspondence bank address"
            />
            <ControlledInput
                control={control}
                name="correspondenceBankSwiftCode"
                label="Correspondence Bank Swift Code"
                placeholder="Enter correspondence bank SWIFT code"
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
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#64748B',
        marginVertical: '8@vs',
    },
});
