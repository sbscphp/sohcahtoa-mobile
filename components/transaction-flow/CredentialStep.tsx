import InputField from '@/components/InputField';
import SelectField from '@/components/SelectField';
import React from 'react';
import { Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

interface CredentialField {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    required?: boolean;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
    secureTextEntry?: boolean;
    onPress?: () => void;
    rightIcon?: any;
    type?: 'text' | 'select';
}

interface CredentialStepProps {
    title?: string;
    fields: CredentialField[];
}

export default function CredentialStep({ title = "Enter all required credentials to proceed", fields }: CredentialStepProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{title}</Text>

            {fields.map((field, index) => {
                if (field.type === 'select') {
                    return (
                        <SelectField
                            key={index}
                            label={field.label}
                            placeholder={field.placeholder}
                            value={field.value}
                            onPress={field.onPress || (() => { })}
                            required={field.required}
                            rightIcon={field.rightIcon}
                        />
                    );
                }
                return (
                    <InputField
                        key={index}
                        label={field.label}
                        placeholder={field.placeholder}
                        value={field.value}
                        onChangeText={field.onChangeText}
                        required={field.required}
                        keyboardType={field.keyboardType}
                        secureTextEntry={field.secureTextEntry}
                        rightIcon={field.rightIcon}
                    />
                );
            })}
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        gap: '6@vs',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '10@vs',
    },
});
