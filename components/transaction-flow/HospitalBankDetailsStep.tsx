import ControlledInput from '@/components/ControlledInput';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import {
    bankStepStyles as styles,
    BankStepInvoiceUpload,
    CorrespondenceBankSection,
    CountrySelectionField,
    CountrySpecificBankFields,
} from './InternationalBankShared';

interface HospitalBankDetailsStepProps {
    control: any;
    watch: any;
    setValue: any;
    errors: any;
    invoiceFile?: any;
    verificationFile?: any;
    onUploadInvoice?: () => void;
    isUploadingInvoice?: boolean;
}

export default function HospitalBankDetailsStep({
    control,
    watch,
    setValue,
    errors,
    invoiceFile,
    verificationFile,
    onUploadInvoice,
    isUploadingInvoice,
}: HospitalBankDetailsStepProps) {
    const beneficiaryCountry = watch('beneficiaryCountry');

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Where would you like to send the fund to?</Text>
            <Text style={styles.description}>Enter the medical provider and bank details for this payment.</Text>

            <CountrySelectionField
                control={control}
                setValue={setValue}
                beneficiaryCountry={beneficiaryCountry}
            />

            <Text style={styles.sectionTitle}>Hospital details</Text>
            <View style={styles.sectionContainer}>
                <ControlledInput
                    control={control}
                    name="organizationName"
                    label="Hospital Name"
                    placeholder="Enter hospital name"
                    required
                />
                <ControlledInput
                    control={control}
                    name="beneficiaryEmail"
                    label="Hospital Email Address"
                    placeholder="Enter hospital email address"
                    required
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <ControlledInput
                    control={control}
                    name="beneficiaryPhone"
                    label="Hospital Phone Number"
                    placeholder="Enter hospital phone number"
                    required
                    keyboardType="phone-pad"
                />

                <ControlledInput
                    control={control}
                    name="beneficiaryAddress"
                    label="Hospital Address"
                    placeholder="Enter hospital address"
                    required
                />

                <ControlledInput
                    control={control}
                    name="beneficiaryCity"
                    label="Hospital City"
                    placeholder="Enter hospital city"
                    required
                />

                <ControlledInput
                    control={control}
                    name="beneficiaryState"
                    label="Hospital State/Province"
                    placeholder="Enter hospital state/province"
                    required
                />
            </View>

            <Text style={styles.sectionTitle}>Beneficiary Bank details</Text>
            <View style={styles.sectionContainer}>
                <ControlledInput
                    control={control}
                    name="bankName"
                    label="Bank Name"
                    placeholder="Enter bank name"
                    required
                />
                <ControlledInput
                    control={control}
                    name="bankAccountName"
                    label="Account Name (For the Hospital)"
                    placeholder="Enter account name"
                    required
                />

                <ControlledInput
                    control={control}
                    name="bankAccountAddress"
                    label="Bank Address"
                    placeholder="Enter bank address"
                    required
                />

                <ControlledInput
                    control={control}
                    name="bankAccountSwiftCode"
                    label="SWIFT/BIC"
                    placeholder="e.g ABCDUS33XXX"
                    required
                    maxLength={11}
                    filterType="alphanumeric"
                    autoCapitalize="characters"
                />

                <CountrySpecificBankFields
                    control={control}
                    beneficiaryCountry={beneficiaryCountry}
                />

                <ControlledInput
                    control={control}
                    name="bankAccountNumber"
                    label="Bank Account Number"
                    placeholder="Enter bank account number"
                    required
                    keyboardType="numeric"
                    maxLength={34}
                    filterType="numeric"
                />

                <ControlledInput
                    control={control}
                    name="paymentReference"
                    label="Payment Reference / ID"
                    placeholder="Enter payment reference / ID"
                    required
                />

                <BankStepInvoiceUpload
                    invoiceFile={invoiceFile}
                    verificationFile={verificationFile}
                    onUploadInvoice={onUploadInvoice}
                    isUploadingInvoice={isUploadingInvoice}
                />
            </View>

            <CorrespondenceBankSection control={control} />
        </ScrollView>
    );
}