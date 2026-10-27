import { useAppTheme } from '@/context/ThemeContext';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';

interface SelectionCardProps {
    title: string;
    description: string;
    iconSource: any;
    selected: boolean;
    onPress: () => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({
    title,
    description,
    iconSource,
    selected,
    onPress,
}) => {
    const { colors, isDark } = useAppTheme();

    const renderIcon = () => {
        if (!iconSource) return null;

        if (typeof iconSource === 'function' || (typeof iconSource === 'object' && (iconSource as any).$$typeof)) {
            const IconComponent = iconSource as React.ComponentType<any>;
            return (
                <IconComponent
                    width={moderateScale(45)}
                    height={moderateScale(45)}
                    style={styles.icon}
                />
            );
        }

        return <Image source={iconSource} style={styles.icon} contentFit="contain" />;
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[
                styles.card,
                {
                    backgroundColor: selected ? colors.primarySoft : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                },
                selected && styles.selectedCard
            ]}
            accessible={true}
            accessibilityLabel={`${title}: ${description}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
        >
            <View style={styles.iconContainer}>
                {renderIcon()}
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = ScaledSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '74@vs',
        padding: '4@ms',
        backgroundColor: '#FFFFFF',
        borderRadius: '10@ms',
        marginBottom: '12@vs',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
    },
    selectedCard: {
        borderColor: 'rgba(255, 104, 19, 1)',
        backgroundColor: '#FFF7F4',
    },
    iconContainer: {
        marginRight: '8@s',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: '13@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '4@vs',
    },
    description: {
        fontSize: '12@ms',
        color: '#64748B',
        lineHeight: '18@ms',
    },
    icon: {
        width: '45@ms',
        height: '45@ms',
        marginLeft: '8@s',
    },
    checkIcon: {
        marginLeft: '8@s',
    },
});

export default SelectionCard;
