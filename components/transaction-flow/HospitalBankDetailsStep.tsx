import ControlledInput from '@/components/ControlledInput';
import FileUpload from '@/components/FileUpload';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import { ArrowDown2 } from 'iconsax-react-nativejs';
import React from 'react';
import { Controller } from 'react-hook-form';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface HospitalBankDetailsStepProps {
    control: any;
    watch: any;
    setValue: any;
    errors: any;
    verificationFile?: any;
    onUploadInvoice?: () => void;
    isUploadingInvoice?: boolean;
}

const COUNTRIES: SelectionItem[] = [
    { id: '1', label: '🇬🇧 United Kingdom', value: 'United Kingdom' },
    { id: '2', label: '🇺🇸 United States of America', value: 'United States of America' },
    { id: '3', label: '🇨🇦 Canada', value: 'Canada' },
    { id: '4', label: '🇮🇳 India', value: 'India' },
    { id: '5', label: '🇦🇺 Australia', value: 'Australia' },
    { id: '6', label: 'Others', value: 'Others' },
];

export default function HospitalBankDetailsStep({
    control,
    watch,
    setValue,
    errors,
    verificationFile,
    onUploadInvoice,
    isUploadingInvoice
}: HospitalBankDetailsStepProps) {
    const beneficiaryCountry = watch('beneficiaryCountry');
    const [countrySheetVisible, setCountrySheetVisible] = React.useState(false);

    const isUK = beneficiaryCountry?.toLowerCase().includes('united kingdom') || beneficiaryCountry?.toLowerCase() === 'uk';
    const isUSA = beneficiaryCountry?.toLowerCase().includes('united states') || beneficiaryCountry?.toLowerCase() === 'usa';
    const isCanada = beneficiaryCountry?.toLowerCase() === 'canada';
    const isIndia = beneficiaryCountry?.toLowerCase() === 'india';
    const isAustralia = beneficiaryCountry?.toLowerCase() === 'australia';
    const isOthers = beneficiaryCountry?.toLowerCase() === 'others';

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Where would you like to send the fund to?</Text>
            <Text style={styles.description}>Enter the medical provider and bank details for this payment.</Text>

            <Controller
                control={control}
                name="beneficiaryCountry"
                render={({ field: { value }, fieldState: { error } }) => (
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.dropdownLabel}>
                            Country/Region <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={[styles.dropdownInput, error ? styles.dropdownError : undefined]}
                            onPress={() => setCountrySheetVisible(true)}
                        >
                            <Text style={[styles.dropdownPlaceholder, value ? styles.dropdownSelectedText : undefined]}>
                                {value ? (COUNTRIES.find(c => c.value === value)?.label || value) : 'Select an Option'}
                            </Text>
                            <ArrowDown2 size={moderateScale(20)} color="#64748B" />
                        </TouchableOpacity>
                        {error && <Text style={styles.errorText}>{error.message}</Text>}
                    </View>
                )}
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
                    label="Bank Account Address"
                    placeholder="Enter bank account address"
                    required
                />

                <ControlledInput
                    control={control}
                    name="bankAccountSwiftCode"
                    label="Bank Account Swift Code"
                    placeholder="e.g ABCDUS33XXX"
                    required
                    maxLength={11}
                    filterType="alphanumeric"
                    autoCapitalize="characters"
                />

                {(isUK || isOthers) && (
                    <ControlledInput
                        control={control}
                        name="bankAccountIban"
                        label="IBAN"
                        placeholder="e.g GB29 NWBK 6016 13331 9268 19"
                        required
                        filterType="alphanumeric"
                        autoCapitalize="characters"
                    />
                )}

                {(isUSA || isCanada) && (
                    <ControlledInput
                        control={control}
                        name="routingNumber"
                        label="Routing Number"
                        placeholder="e.g 026009593"
                        required
                        keyboardType="numeric"
                        maxLength={9}
                        filterType="numeric"
                    />
                )}

                {isIndia && (
                    <>
                        <ControlledInput
                            control={control}
                            name="ifscCode"
                            label="IFSC Number"
                            placeholder="e.g SBIN0000001"
                            required
                            maxLength={11}
                            filterType="alphanumeric"
                            autoCapitalize="characters"
                        />
                        <ControlledInput
                            control={control}
                            name="purposeCode"
                            label="Purpose Code"
                            placeholder="e.g GFT/P1301"
                            required
                        />
                    </>
                )}

                {isAustralia && (
                    <ControlledInput
                        control={control}
                        name="bsbCode"
                        label="BSB Code"
                        placeholder="e.g 123 - 456"
                        required
                        maxLength={8}
                    />
                )}

                {isOthers && (
                    <ControlledInput
                        control={control}
                        name="otherBankDetails"
                        label="Other bank details"
                        placeholder="Any extra identifiers or instructions for this country (clearing codes, intermediary bank, etc.)"
                        multiline={true}
                        numberOfLines={4}
                        style={{ height: moderateScale(80), textAlignVertical: 'top' }}
                        wrapperStyle={{ height: moderateScale(90), borderRadius: moderateScale(12), alignItems: 'flex-start', paddingTop: moderateScale(8) }}
                    />
                )}

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

                <ControlledInput
                    control={control}
                    name="correspondenceBankName"
                    label="Correspondence Bank Name"
                    placeholder="Optional"
                />

                <ControlledInput
                    control={control}
                    name="correspondenceBankAddress"
                    label="Correspondence Bank Address"
                    placeholder="Optional"
                />

                <ControlledInput
                    control={control}
                    name="correspondenceBankSwiftCode"
                    label="Correspondence Bank Swift Code"
                    placeholder="Optional"
                    maxLength={11}
                    filterType="alphanumeric"
                    autoCapitalize="characters"
                />
            </View>

            <GenericSelectionSheet
                visible={countrySheetVisible}
                onClose={() => setCountrySheetVisible(false)}
                title="Country/Region"
                subtitle="Select beneficiary's country/region"
                items={COUNTRIES}
                selectedItem={beneficiaryCountry}
                onSelect={(item) => {
                    setValue('beneficiaryCountry', item.value);
                    setValue('bankAccountIban', '');
                    setValue('routingNumber', '');
                    setValue('ifscCode', '');
                    setValue('purposeCode', '');
                    setValue('bsbCode', '');
                    setValue('otherBankDetails', '');
                }}
                confirmButtonText="Select Country/Region"
            />

            <View style={{ marginTop: moderateScale(16), gap: moderateScale(6) }}>
                <Text style={{ fontSize: moderateScale(12.5), color: '#475569' }}>
                    Upload invoice (optional – with beneficiary details for verification)
                </Text>
                <FileUpload
                    onUpload={onUploadInvoice || (() => {})}
                    fileName={verificationFile?.name}
                    fileUri={verificationFile?.uri}
                    fileUrl={verificationFile?.fileUrl || verificationFile?.url}
                    status={isUploadingInvoice ? 'pending' : 'default'}
                />
            </View>
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
    description: {
        fontSize: '13@ms',
        fontWeight: '500',
        color: '#64748B',
        marginBottom: '12@vs',
        lineHeight: '20@ms',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginTop: '16@vs',
        marginBottom: '8@vs',
        lineHeight: '20@ms',
    },
    sectionContainer: {
        borderRadius: '12@ms',
        padding: '16@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: '16@vs',
        gap: '12@vs',
    },
    dropdownContainer: {
        marginBottom: '16@vs',
    },
    dropdownLabel: {
        fontSize: '12.5@ms',
        fontWeight: '400',
        color: '#475569',
        marginBottom: '8@vs',
    },
    required: {
        color: '#EF4444',
    },
    dropdownInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(143, 139, 139, 1)',
        borderRadius: '28@ms',
        paddingHorizontal: '14@s',
        height: Platform.OS === 'android' ? '49@vs' : '40@vs',
        backgroundColor: 'transparent',
    },
    dropdownPlaceholder: {
        fontSize: '14@ms',
        color: '#94A3B8',
    },
    dropdownSelectedText: {
        color: '#0F172A',
        fontWeight: '400',
    },
    errorText: {
        fontSize: '11@ms',
        color: '#EF4444',
        marginTop: '4@vs',
        marginLeft: '14@s',
    },
    dropdownError: {
        borderColor: '#EF4444',
    },
});