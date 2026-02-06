import { Eye, EyeSlash, Icon } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface InputFieldProps extends TextInputProps {
    label: string;
    icon?: Icon;
    rightIcon?: Icon;
    isPassword?: boolean;
    required?: boolean;
    disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    icon: IconComponent,
    rightIcon: RightIconComponent,
    isPassword,
    required,
    disabled,
    ...props
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <View style={disabled ? styles.inputDisabledWrapper : styles.inputWrapper}>
                {IconComponent && (
                    <IconComponent size={moderateScale(20)} color="rgba(77, 75, 75, 1)" style={styles.leftIcon} />
                )}
                <TextInput
                    style={styles.input}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    placeholderTextColor="#94A3B8"
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.rightIcon}
                    >
                        {isPasswordVisible ? (
                            <EyeSlash size={moderateScale(20)} color="rgba(77, 75, 75, 1)" />
                        ) : (
                            <Eye size={moderateScale(20)} color="rgba(77, 75, 75, 1)" />
                        )}
                    </TouchableOpacity>
                )}
                {RightIconComponent && !isPassword && (
                    <RightIconComponent size={moderateScale(20)} color="rgba(77, 75, 75, 1)" style={{ marginLeft: moderateScale(12) }} />
                )}
            </View>
        </View>
    );
};

const styles = ScaledSheet.create({
    container: {
        marginBottom: '16@vs',
    },
    label: {
        fontSize: '15@ms',
        fontWeight: '400',
        color: '#475569',
        marginBottom: '8@vs',
    },
    required: {
        color: '#EF4444',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'inherit',
        borderWidth: 1,
        borderColor: 'rgba(143, 139, 139, 1)',
        borderRadius: '28@ms',
        paddingHorizontal: '14@s',
        height: '45@vs',
    },
    inputDisabledWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'inherit',
        borderWidth: 1,
        borderColor: 'rgba(204, 202, 202, 1)',
        borderRadius: '28@ms',
        paddingHorizontal: '14@s',
        height: '45@vs',
    },
    leftIcon: {
        marginRight: '12@s',
    },
    input: {
        flex: 1,
        fontSize: '15@ms',
        color: '#0F172A',
        height: '100%',
    },
    rightIcon: {
        padding: '6@ms',
    },
});

export default InputField;
