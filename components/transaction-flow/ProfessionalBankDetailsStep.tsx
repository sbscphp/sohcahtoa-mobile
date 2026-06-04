import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import { ArrowDown2 } from 'iconsax-react-nativejs';
import React from 'react';
import { Controller } from 'react-hook-form';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface ProfessionalBankDetailsStepProps {
    control: any;
    watch: any;
    setValue: any;
    errors: any;
}

const COUNTRIES: SelectionItem[] = [
    { id: '1', label: '🇬🇧 United Kingdom', value: 'United Kingdom' },
    { id: '2', label: '🇺🇸 United States of America', value: 'United States of America' },
    { id: '3', label: '🇨🇦 Canada', value: 'Canada' },
    { id: '4', label: '🇮🇳 India', value: 'India' },
    { id: '5', label: '🇦🇺 Australia', value: 'Australia' },
];

export default function ProfessionalBankDetailsStep({
    control,
    watch,
    setValue,
    errors
}: ProfessionalBankDetailsStepProps) {
    const beneficiaryCountry = watch('beneficiaryCountry');
    const [countrySheetVisible, setCountrySheetVisible] = React.useState(false);

    const isUK = beneficiaryCountry?.toLowerCase().includes('united kingdom') || beneficiaryCountry?.toLowerCase() === 'uk';
    const isUSA = beneficiaryCountry?.toLowerCase().includes('united states') || beneficiaryCountry?.toLowerCase() === 'usa';
    const isCanada = beneficiaryCountry?.toLowerCase() === 'canada';
    const isIndia = beneficiaryCountry?.toLowerCase() === 'india';
    const isAustralia = beneficiaryCountry?.toLowerCase() === 'australia';

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Bank details</Text>

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

            <ControlledInput
                control={control}
                name="bankAccountName"
                label="Beneficiary Name"
                placeholder="As it appears on the account"
                required
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
                label="SWIFT CODE"
                placeholder={isUK ? "e.g ABCDUS33XXX" : "e.g ABCDUS33XXXcode"}
                required
                maxLength={11}
                filterType="alphanumeric"
                autoCapitalize="characters"
            />

            <ControlledInput
                control={control}
                name="paymentReference"
                label="Payment Reference ID"
                placeholder="Enter payment reference id"
                required
            />

            {isUK && (
                <ControlledInput
                    control={control}
                    name="bankAccountIban"
                    label="IBAN"
                    placeholder="e.g GB29 NWBK 6016 13331 9268 19"
                    required
                    maxLength={34}
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
                }}
                confirmButtonText="Select Country/Region"
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
