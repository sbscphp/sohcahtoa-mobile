import { useAppTheme } from '@/context/ThemeContext';
import { Eye, EyeSlash, Icon } from 'iconsax-react-nativejs';
import React, { ReactNode, useState } from 'react';
import { Platform, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';

interface InputFieldProps extends TextInputProps {
    label: string;
    icon?: Icon | ReactNode;
    rightIcon?: Icon;
    isPassword?: boolean;
    required?: boolean;
    disabled?: boolean;
    wrapperStyle?: any;
    height?: number | string;
    error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    icon,
    rightIcon: RightIconComponent,
    isPassword,
    required,
    disabled,
    wrapperStyle,
    height,
    error,
    ...props
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const { colors, isDark } = useAppTheme();

    const iconColor = isDark ? colors.iconMuted : 'rgba(77, 75, 75, 1)';
    const placeholderColor = props.placeholderTextColor || colors.placeholder;

    return (
        <View style={styles.container}>
            {Boolean(label) && (
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {label} {required && <Text style={styles.required}>*</Text>}
                </Text>
            )}
            <View style={[
                disabled ? styles.inputDisabledWrapper : styles.inputWrapper,
                {
                    backgroundColor: disabled ? colors.inputDisabledBackground : colors.inputBackground,
                    borderColor: disabled ? colors.inputDisabledBorder : colors.inputBorder,
                },
                wrapperStyle,
                height ? { height } : undefined,
                error ? styles.inputError : undefined
            ]}>
                {icon && (
                    React.isValidElement(icon) ? (
                        <View style={styles.leftIcon}>{icon}</View>
                    ) : (
                        (() => {
                            const IconComponent = icon as Icon;
                            return <IconComponent size={moderateScale(20)} color={iconColor} style={styles.leftIcon} />;
                        })()
                    )
                )}
                <TextInput
                    style={[styles.input, { color: colors.text }, props.style]}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    placeholderTextColor={placeholderColor}
                    testID="input-field"
                    editable={!disabled && (props.editable !== undefined ? props.editable : true)}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.rightIcon}
                        testID="password-toggle"
                    >
                        {isPasswordVisible ? (
                            <EyeSlash size={moderateScale(20)} color={iconColor} />
                        ) : (
                            <Eye size={moderateScale(20)} color={iconColor} />
                        )}
                    </TouchableOpacity>
                )}
                {RightIconComponent && !isPassword && (
                    <RightIconComponent size={moderateScale(20)} color={iconColor} style={{ marginLeft: moderateScale(12) }} />
                )}
            </View>
            {error && <Text style={styles.errorText}>{typeof error === 'string' ? error : (error as any).message || String(error)}</Text>}
        </View>
    );
};

const styles = ScaledSheet.create({
    container: {
        marginBottom: '16@vs',
    },
    label: {
        fontSize: '12.5@ms',
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
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(143, 139, 139, 1)',
        borderRadius: '28@ms',
        paddingHorizontal: '14@s',
        height: Platform.OS === 'android' ? '49@vs' : '40@vs',
    },
    inputDisabledWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(204, 202, 202, 1)',
        borderRadius: '28@ms',
        paddingHorizontal: '14@s',
        height: Platform.OS === 'android' ? '49@vs' : '40@vs',
    },
    leftIcon: {
        marginRight: '12@s',
    },
    input: {
        flex: 1,
        fontSize: '14@ms',
        color: '#0F172A',
        height: '100%',
        paddingVertical: 0,
        textAlignVertical: 'center',
    },
    rightIcon: {
        padding: '6@ms',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        fontSize: '11@ms',
        color: '#EF4444',
        marginTop: '4@vs',
        marginLeft: '14@s',
    },
});

export default InputField;
