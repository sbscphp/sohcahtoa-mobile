import { TickCircle } from 'iconsax-react-nativejs';
import React from 'react';
import { Text, View } from 'react-native';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';

interface PasswordStrengthValidatorProps {
    password: string;
}

export const validatePassword = (pass: string) => ({
    hasMinLength: pass.length >= 8,
    hasUppercase: /[A-Z]/.test(pass),
    hasLowercase: /[a-z]/.test(pass),
    hasNumber: /[0-9]/.test(pass),
    hasSpecialChar: /[!@#$%^&*+\-?]/.test(pass),
});

const PasswordStrengthValidator: React.FC<PasswordStrengthValidatorProps> = ({ password }) => {
    const validations = validatePassword(password);

    const ValidationItem = ({ label, isValid }: { label: string; isValid: boolean }) => (
        <View style={styles.validationRow}>
            <TickCircle
                size={moderateScale(18)}
                color={isValid ? '#10B981' : 'rgba(77, 75, 75, 1)'}
                variant={isValid ? "Bold" : "Outline"}
                style={styles.validationIcon}
            />
            <Text style={[styles.validationText, isValid && styles.validationTextValid]}>
                {label}
            </Text>
        </View>
    );

    return (
        <View style={styles.validationBox}>
            <ValidationItem label="Minimum 8 of character long" isValid={validations.hasMinLength} />
            <ValidationItem label="One uppercase letter" isValid={validations.hasUppercase} />
            <ValidationItem label="One lowercase letter" isValid={validations.hasLowercase} />
            <ValidationItem label="One number 0-9" isValid={validations.hasNumber} />
            <ValidationItem label="One special charater (!@#$%^&*+-?)" isValid={validations.hasSpecialChar} />
        </View>
    );
};

const styles = ScaledSheet.create({
    validationBox: {
        backgroundColor: '#FFFFFF',
        padding: '10@ms',
        marginBottom: '20@vs',
        gap: '14@vs',
    },
    validationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    validationIcon: {
        marginRight: '12@s',
    },
    validationText: {
        fontSize: '13@ms',
        color: 'rgba(77, 75, 75, 1)',
        fontWeight: '400',
    },
    validationTextValid: {
        color: '#111827',
    },
});

export default PasswordStrengthValidator;
