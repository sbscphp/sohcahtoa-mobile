import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import { ArrowDown2 } from 'iconsax-react-nativejs';
import React from 'react';
import { Controller } from 'react-hook-form';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface SchoolBankDetailsStepProps {
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

export default function SchoolBankDetailsStep({
    control,
    watch,
    setValue,
    errors
}: SchoolBankDetailsStepProps) {
    const beneficiaryCountry = watch('beneficiaryCountry');
    const [countrySheetVisible, setCountrySheetVisible] = React.useState(false);

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

            <Text style={styles.sectionTitle}>For the School (Beneficiary)</Text>
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
                placeholder="Enter bank account IBAN (if applicable)"
                maxLength={34}
                filterType="alphanumeric"
                autoCapitalize="characters"
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

            <GenericSelectionSheet
                visible={countrySheetVisible}
                onClose={() => setCountrySheetVisible(false)}
                title="Country/Region"
                subtitle="Select beneficiary's country/region"
                items={COUNTRIES}
                selectedItem={beneficiaryCountry}
                onSelect={(item) => {
                    setValue('beneficiaryCountry', item.value);
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
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginTop: '16@vs',
        marginBottom: '8@vs',
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
});
