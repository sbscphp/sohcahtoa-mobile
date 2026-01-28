import React from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { Colors } from '../constants/theme';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    accessible?: boolean;
    accessibilityLabel?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    disabled,
    style,
    textStyle,
    accessible = true,
    accessibilityLabel,
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={disabled}
            style={[styles.button, disabled && styles.disabledButton, style]}
            accessible={accessible}
            accessibilityLabel={accessibilityLabel || title}
            accessibilityRole="button"
        >
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = ScaledSheet.create({
    button: {
        backgroundColor: Colors.light.primary,
        height: '40@vs',
        borderRadius: '28@ms',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    disabledButton: {
        backgroundColor: '#FFCCB4',
    },
    text: {
        color: '#FFFFFF',
        fontSize: '14@ms',
        fontWeight: '500',
    },
});

export default PrimaryButton;
