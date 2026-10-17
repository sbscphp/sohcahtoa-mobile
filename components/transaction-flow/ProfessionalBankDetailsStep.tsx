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

interface ProfessionalBankDetailsStepProps {
    control: any;
    watch: any;
    setValue: any;
    errors: any;
    isMedical?: boolean;
    isSchool?: boolean;
    invoiceFile?: any;
    onUploadInvoice?: () => void;
    isUploadingInvoice?: boolean;
}

export default function ProfessionalBankDetailsStep({
    control,
    watch,
    setValue,
    errors,
    isMedical,
    invoiceFile,
    onUploadInvoice,
    isUploadingInvoice,
}: ProfessionalBankDetailsStepProps) {
    const beneficiaryCountry = watch('beneficiaryCountry');
    const isUK = beneficiaryCountry?.toLowerCase().includes('united kingdom') || beneficiaryCountry?.toLowerCase() === 'uk';

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Where would you like to send the fund to?</Text>
            <Text style={styles.description}>
                Enter the professional body and bank details for this payment. Please upload an invoice that contains the beneficiary details so we can verify them more easily.{"\n\n"}
                You may also upload an invoice below to use as confirmation during internet banking.
            </Text>

            <CountrySelectionField
                control={control}
                setValue={setValue}
                beneficiaryCountry={beneficiaryCountry}
            />

            <Text style={styles.sectionTitle}>Beneficiary details</Text>
            <View style={styles.sectionContainer}>
                {!isMedical && (
                    <>
                        <ControlledInput
                            control={control}
                            name="memberName"
                            label="Member Name"
                            placeholder="Enter membership name"
                            required
                        />
                        <ControlledInput
                            control={control}
                            name="memberNumber"
                            label="Member Number"
                            placeholder="Enter membership number"
                            required
                        />
                    </>
                )}

                <ControlledInput
                    control={control}
                    name="organizationName"
                    label="Organization Name"
                    placeholder="Enter organization name"
                    required
                />

                <ControlledInput
                    control={control}
                    name="bankAccountName"
                    label="Beneficiary Name"
                    placeholder="As it appears on the account"
                    required
                />

                <ControlledInput
                    control={control}
                    name="beneficiaryEmail"
                    label="Beneficiary Email"
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <ControlledInput
                    control={control}
                    name="beneficiaryPhone"
                    label="Phone number"
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                />

                <ControlledInput
                    control={control}
                    name="beneficiaryAddress"
                    label="Beneficiary Address"
                    placeholder="Street, state, city, postal code, country"
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
            </View>

            <Text style={styles.sectionTitle}>Beneficiary Bank details</Text>
            <View style={styles.sectionContainer}>
                <ControlledInput
                    control={control}
                    name="bankName"
                    label="Bank Name"
                    placeholder="Enter beneficiary bank"
                    required
                />

                <ControlledInput
                    control={control}
                    name="bankAccountNumber"
                    label="Account Number"
                    placeholder="Enter account number"
                    required
                    keyboardType="numeric"
                    maxLength={34}
                    filterType="numeric"
                />

                <ControlledInput
                    control={control}
                    name="bankAccountAddress"
                    label="Bank Address"
                    placeholder={isUK ? "Enter branch or head office address" : "Enter bank address"}
                    required
                />

                <ControlledInput
                    control={control}
                    name="bankAccountSwiftCode"
                    label="SWIFT/BIC"
                    placeholder={isUK ? "e.g ABCDUS33XXX" : "e.g ABCDUS33XXXcode"}
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
                    name="paymentReference"
                    label="Payment Reference / ID"
                    placeholder="Enter payment reference / ID"
                    required
                />

                <BankStepInvoiceUpload
                    invoiceFile={invoiceFile}
                    onUploadInvoice={onUploadInvoice}
                    isUploadingInvoice={isUploadingInvoice}
                />
            </View>

            <CorrespondenceBankSection control={control} />
        </ScrollView>
    );
}
