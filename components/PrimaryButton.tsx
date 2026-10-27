import { useAppTheme } from '@/context/ThemeContext';
import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleProp, Text, TextStyle, ViewStyle } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    accessible?: boolean;
    accessibilityLabel?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    disabled,
    loading,
    style,
    textStyle,
    accessible = true,
    accessibilityLabel,
}) => {
    const { colors } = useAppTheme();

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.primary },
                (disabled || loading) && [styles.disabledButton, { backgroundColor: colors.buttonDisabledBackground }],
                pressed && { opacity: 0.8 },
                style
            ]}
            accessible={accessible}
            accessibilityLabel={accessibilityLabel || title}
            accessibilityRole="button"
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" />
            ) : (
                <Text style={[styles.text, textStyle]}>{title}</Text>
            )}
        </Pressable>
    );
};

const styles = ScaledSheet.create({
    button: {
        height: Platform.OS === 'android' ? '50@vs' : '42@vs',
        borderRadius: '28@ms',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        shadowColor: 'rgba(35, 35, 35, 0.05)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: '#FFCCB4',
    },
    text: {
        color: '#FFFFFF',
        fontSize: '15@ms',
        fontWeight: '500',
    },
});

export default PrimaryButton;
