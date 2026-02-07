import { Icon } from 'iconsax-react-nativejs';
import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface SelectFieldProps {
    label: string;
    placeholder: string;
    value?: string;
    icon?: Icon | ReactNode;
    rightIcon?: Icon | ReactNode;
    required?: boolean;
    disabled?: boolean;
    onPress: () => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
    label,
    placeholder,
    value,
    icon,
    rightIcon,
    required,
    disabled,
    onPress
}) => {
    const renderIcon = (iconProp: Icon | ReactNode, style?: any) => {
        if (!iconProp) return null;

        if (React.isValidElement(iconProp)) {
            return <View style={style}>{iconProp}</View>;
        }

        if (typeof iconProp === 'function') {
            const IconComponent = iconProp as Icon;
            return <IconComponent size={moderateScale(20)} color="rgba(77, 75, 75, 1)" style={style} />;
        }

        return null;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                style={disabled ? styles.inputDisabledWrapper : styles.inputWrapper}
            >
                {renderIcon(icon, styles.leftIcon)}

                <Text style={[styles.input, !value && styles.placeholder]}>
                    {value || placeholder}
                </Text>

                {renderIcon(rightIcon, { marginLeft: moderateScale(12) })}
            </TouchableOpacity>
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
        marginBottom: '10@vs',
    },
    required: {
        color: '#EF4444',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(143, 139, 139, 1)',
        borderRadius: '28@ms',
        paddingHorizontal: '14@s',
        height: '45@vs',
    },
    inputDisabledWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
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
    },
    placeholder: {
        color: '#94A3B8',
    },
});

export default SelectField;
