import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ACTION_BUTTONS } from './homeConfig';

interface HomeQuickActionsProps {
    onActionPress: (type: 'buy' | 'sell' | 'receive') => void;
}

export default function HomeQuickActions({ onActionPress }: HomeQuickActionsProps) {
    const { colors } = useAppTheme();

    return (
        <>
            <View style={styles.actionsGrid}>
                {ACTION_BUTTONS.map((action, index) => (
                    <Pressable
                        key={index}
                        style={({ pressed }) => [
                            styles.actionButton,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
                        ]}
                        onPress={() => onActionPress(action.type as 'buy' | 'sell' | 'receive')}
                        accessibilityRole="button"
                        accessibilityLabel={action.title}
                    >
                        <View style={styles.actionIcon}>
                            <action.icon size={moderateScale(24)} color={colors.icon} />
                        </View>
                        <Text style={[styles.actionText, { color: colors.text }]}>{action.title}</Text>
                    </Pressable>
                ))}
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        </>
    );
}

const styles = ScaledSheet.create({
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        gap: '16@s',
        marginHorizontal: '10@s',
    },
    divider: {
        width: '100%',
        height: '1@ms',
        backgroundColor: '#E2E8F0',
        marginVertical: '20@s',
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '20@ms',
        padding: '8@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    actionIcon: {
        marginBottom: '10@vs',
    },
    actionText: {
        fontSize: '12@ms',
        fontWeight: '500',
        color: '#475569',
        textAlign: 'center',
    },
});
