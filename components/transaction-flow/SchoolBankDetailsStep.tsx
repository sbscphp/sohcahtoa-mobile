import ControlledInput from '@/components/ControlledInput';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
    bankStepStyles as styles,
    BankStepInvoiceUpload,
    CorrespondenceBankSection,
    CountrySelectionField,
    CountrySpecificBankFields,
} from './InternationalBankShared';

interface SchoolBankDetailsStepProps {
    control: any;
    watch: any;
    setValue: any;
    errors: any;
    invoiceFile?: any;
    verificationFile?: any;
    onUploadInvoice?: () => void;
    isUploadingInvoice?: boolean;
}

export default function SchoolBankDetailsStep({
    control,
    watch,
    setValue,
    errors,
    invoiceFile,
    verificationFile,
    onUploadInvoice,
    isUploadingInvoice,
}: SchoolBankDetailsStepProps) {
    const { colors } = useAppTheme();
    const beneficiaryCountry = watch('beneficiaryCountry');

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: colors.text }]}>Where would you like to send the fund to?</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>
                Enter the school and bank details for this payment.{"\n"}
                Please upload an invoice that contains the beneficiary details so we can verify them more easily.{"\n"}
                You may also upload an invoice below to use as confirmation during internet banking.
            </Text>

            <CountrySelectionField
                control={control}
                setValue={setValue}
                beneficiaryCountry={beneficiaryCountry}
            />

            <ControlledInput
                control={control}
                name="studentName"
                label="Student Name"
                placeholder="Enter student name"
                required
            />

            <ControlledInput
                control={control}
                name="studentPassportNumber"
                label="Student Passport Number"
                placeholder="Enter student passport number"
            />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>For the School (Beneficiary)</Text>
            <View style={styles.sectionContainer}>
                <ControlledInput
                    control={control}
                    name="schoolName"
                    label="School Name"
                    placeholder="Enter school name"
                    required
                />
                <ControlledInput
                    control={control}
                    name="beneficiaryEmail"
                    label="School Email Address"
                    placeholder="Enter school email address"
                    required
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <ControlledInput
                    control={control}
                    name="beneficiaryPhone"
                    label="School Phone Number"
                    placeholder="Enter school phone number"
                    required
                    keyboardType="phone-pad"
                />

                <ControlledInput
                    control={control}
                    name="beneficiaryAddress"
                    label="School Address"
                    placeholder="Enter school address"
                    required
                />

                <ControlledInput
                    control={control}
                    name="beneficiaryCity"
                    label="School City"
                    placeholder="Enter school city"
                    required
                />

                <ControlledInput
                    control={control}
                    name="beneficiaryState"
                    label="School State/Province"
                    placeholder="Enter school state/province"
                    required
                />
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Beneficiary Bank details</Text>
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
                    label="Account Name (For the School)"
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
