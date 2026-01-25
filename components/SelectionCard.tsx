import React from 'react';
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { Colors } from '../constants/theme';

interface SelectionCardProps {
    title: string;
    description: string;
    iconSource: ImageSourcePropType;
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
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[styles.card, selected && styles.selectedCard]}
            accessible={true}
            accessibilityLabel={`${title}: ${description}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
        >
            <View style={styles.iconContainer}>
                <Image source={iconSource} style={styles.icon} resizeMode="contain" />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
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
        borderColor: Colors.light.primary,
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
