import React from 'react';
import { Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import InputField from '../InputField';
import DatePickerField from '../DatePickerField';
import { BVNFormData } from '@/lib/validations/auth';

interface BvnFormInputsProps {
    firstName: string;
    setFirstName: (text: string) => void;
    lastName: string;
    setLastName: (text: string) => void;
    email: string;
    setEmail: (text: string) => void;
    phoneNumber: string;
    setPhoneNumber: (text: string) => void;
    dateOfBirth: string;
    setDateOfBirth: (date: string) => void;
    bvn: string;
    setBvn: (text: string) => void;
    errors?: Partial<Record<keyof BVNFormData, string>>;
    validateField: (field: keyof BVNFormData, value: string) => void;
}

export default function BvnFormInputs({
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phoneNumber,
    setPhoneNumber,
    dateOfBirth,
    setDateOfBirth,
    bvn,
    setBvn,
    errors,
    validateField,
}: BvnFormInputsProps) {
    return (
        <View style={styles.content}>
            <Text style={styles.title}>Enter your Bank verification Number (BVN)</Text>

            <InputField
                label="First Name"
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={(text) => {
                    setFirstName(text);
                    if (errors?.firstName) validateField('firstName', text);
                }}
                onBlur={() => validateField('firstName', firstName)}
                required
                error={errors?.firstName}
            />

            <InputField
                label="Last Name"
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={(text) => {
                    setLastName(text);
                    if (errors?.lastName) validateField('lastName', text);
                }}
                onBlur={() => validateField('lastName', lastName)}
                required
                error={errors?.lastName}
            />

            <InputField
                label="Email Address"
                placeholder="Enter your email address"
                value={email}
                onChangeText={(text) => {
                    setEmail(text);
                    if (errors?.email) validateField('email', text);
                }}
                onBlur={() => validateField('email', email)}
                keyboardType="email-address"
                autoCapitalize="none"
                required
                error={errors?.email}
            />

            <InputField
                label="Phone Number"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChangeText={(text) => {
                    setPhoneNumber(text);
                    if (errors?.phoneNumber) validateField('phoneNumber', text);
                }}
                onBlur={() => validateField('phoneNumber', phoneNumber)}
                keyboardType="phone-pad"
                required
                error={errors?.phoneNumber}
            />

            <View style={styles.datePickerContainer}>
                <DatePickerField
                    label="Date of Birth"
                    value={dateOfBirth}
                    onDateChange={(date) => {
                        setDateOfBirth(date);
                        if (errors?.dateOfBirth) validateField('dateOfBirth', date);
                    }}
                    placeholder="DD/MM/YYYY"
                    required
                    maximumDate={new Date()}
                    error={errors?.dateOfBirth}
                />
            </View>

            <InputField
                label="BVN"
                placeholder="Enter your BVN"
                value={bvn}
                onChangeText={(text) => {
                    setBvn(text);
                    if (errors?.bvn) validateField('bvn', text);
                }}
                onBlur={() => validateField('bvn', bvn)}
                keyboardType="numeric"
                maxLength={11}
                required
                error={errors?.bvn}
            />

            <Text style={styles.bvnHint}>
                If you can't remember, please dial{' '}
                <Text style={styles.bvnHintHighlight}>*565*0#</Text> with your registered SIM to get started.
            </Text>
        </View>
    );
}

const styles = ScaledSheet.create({
    content: {
        marginTop: '12@vs',
    },
    title: {
        fontSize: '16@ms',
        fontWeight: '500',
        color: '#1E293B',
        marginBottom: '24@vs',
    },
    datePickerContainer: {
        marginBottom: 0,
    },
    bvnHint: {
        fontSize: '12@ms',
        color: '#64748B',
        lineHeight: '18@ms',
        marginTop: '-6@vs',
        marginBottom: '16@vs',
    },
    bvnHintHighlight: {
        fontWeight: '600',
        color: '#0F172A',
    },
});
