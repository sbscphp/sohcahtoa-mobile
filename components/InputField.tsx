import { Eye, EyeSlash, Icon } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface InputFieldProps extends TextInputProps {
    label: string;
    icon?: Icon;
    isPassword?: boolean;
    required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    icon: IconComponent,
    isPassword,
    required,
    ...props
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <View style={styles.inputWrapper}>
                {IconComponent && (
                    <IconComponent size={moderateScale(20)} color="#94A3B8" style={styles.leftIcon} />
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
                            <EyeSlash size={moderateScale(20)} color="#94A3B8" />
                        ) : (
                            <Eye size={moderateScale(20)} color="#94A3B8" />
                        )}
                    </TouchableOpacity>
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
        fontSize: '14@ms',
        fontWeight: '400',
        color: '#475569',
        marginBottom: '6@vs',
    },
    required: {
        color: '#EF4444',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: '28@ms',
        paddingHorizontal: '12@s',
        height: '40@vs',
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
        padding: '4@ms',
    },
});

export default InputField;
