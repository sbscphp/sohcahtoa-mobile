import ControlledInput from '@/components/ControlledInput';
import FileUpload from '@/components/FileUpload';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import { ArrowDown2 } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

export const BENEFICIARY_COUNTRIES: SelectionItem[] = [
    { id: '1', label: '🇬🇧 United Kingdom', value: 'United Kingdom' },
    { id: '2', label: '🇺🇸 United States of America', value: 'United States of America' },
    { id: '3', label: '🇨🇦 Canada', value: 'Canada' },
    { id: '4', label: '🇮🇳 India', value: 'India' },
    { id: '5', label: '🇦🇺 Australia', value: 'Australia' },
    { id: '6', label: 'Others', value: 'Others' },
];

export function CountrySelectionField({
    control,
    setValue,
    beneficiaryCountry,
}: {
    control: any;
    setValue: any;
    beneficiaryCountry?: string;
}) {
    const [countrySheetVisible, setCountrySheetVisible] = useState(false);

    return (
        <>
            <Controller
                control={control}
                name="beneficiaryCountry"
                render={({ field: { value }, fieldState: { error } }) => (
                    <View style={bankStepStyles.dropdownContainer}>
                        <Text style={bankStepStyles.dropdownLabel}>
                            Country/Region <Text style={bankStepStyles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={[bankStepStyles.dropdownInput, error ? bankStepStyles.dropdownError : undefined]}
                            onPress={() => setCountrySheetVisible(true)}
                        >
                            <Text style={[bankStepStyles.dropdownPlaceholder, value ? bankStepStyles.dropdownSelectedText : undefined]}>
                                {value ? (BENEFICIARY_COUNTRIES.find(c => c.value === value)?.label || value) : 'Select an Option'}
                            </Text>
                            <ArrowDown2 size={moderateScale(20)} color="#64748B" />
                        </TouchableOpacity>
                        {error && <Text style={bankStepStyles.errorText}>{error.message}</Text>}
                    </View>
                )}
            />

            <GenericSelectionSheet
                visible={countrySheetVisible}
                onClose={() => setCountrySheetVisible(false)}
                title="Country/Region"
                subtitle="Select beneficiary's country/region"
                items={BENEFICIARY_COUNTRIES}
                selectedItem={beneficiaryCountry || ''}
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
        </>
    );
}

export function CountrySpecificBankFields({
    control,
    beneficiaryCountry,
}: {
    control: any;
    beneficiaryCountry?: string;
}) {
    const isUK = beneficiaryCountry?.toLowerCase().includes('united kingdom') || beneficiaryCountry?.toLowerCase() === 'uk';
    const isUSA = beneficiaryCountry?.toLowerCase().includes('united states') || beneficiaryCountry?.toLowerCase() === 'usa';
    const isCanada = beneficiaryCountry?.toLowerCase() === 'canada';
    const isIndia = beneficiaryCountry?.toLowerCase() === 'india';
    const isAustralia = beneficiaryCountry?.toLowerCase() === 'australia';
    const isOthers = beneficiaryCountry?.toLowerCase() === 'others';

    return (
        <>
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
        </>
    );
}

export function CorrespondenceBankSection({
    control,
}: {
    control: any;
}) {
    return (
        <>
            <Text style={bankStepStyles.sectionTitle}>Correspondence Bank details</Text>
            <View style={bankStepStyles.sectionContainer}>
                <ControlledInput
                    control={control}
                    name="correspondenceBankName"
                    label="Correspondence bank name"
                    placeholder="Enter bank name"
                />
                <ControlledInput
                    control={control}
                    name="correspondenceBankAddress"
                    label="Correspondence bank address"
                    placeholder="Enter address"
                />
                <ControlledInput
                    control={control}
                    name="correspondenceBankSwiftCode"
                    label="Correspondence bank SWIFT"
                    placeholder="Enter bank swift"
                    maxLength={11}
                    filterType="alphanumeric"
                    autoCapitalize="characters"
                />
            </View>
        </>
    );
}

export function BankStepInvoiceUpload({
    invoiceFile,
    verificationFile,
    onUploadInvoice,
    isUploadingInvoice,
}: {
    invoiceFile?: any;
    verificationFile?: any;
    onUploadInvoice?: () => void;
    isUploadingInvoice?: boolean;
}) {
    const file = invoiceFile || verificationFile;
    return (
        <View style={{ marginTop: moderateScale(14), gap: moderateScale(6) }}>
            <Text style={{ fontSize: moderateScale(12.5), color: '#475569' }}>
                Upload invoice (optional – with beneficiary details for verification)
            </Text>
            <FileUpload
                onUpload={onUploadInvoice || (() => {})}
                fileName={file?.name}
                fileUri={file?.uri}
                fileUrl={file?.fileUrl || file?.url}
                fileType={file?.type}
                status={isUploadingInvoice ? 'pending' : 'default'}
            />
        </View>
    );
}

export const bankStepStyles = ScaledSheet.create({
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
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#64748B',
        marginVertical: '8@vs',
    },
    sectionContainer: {
        borderRadius: '12@ms',
        padding: '16@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: '16@vs',
        gap: '12@vs',
    },
});
