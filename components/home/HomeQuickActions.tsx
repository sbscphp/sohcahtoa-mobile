import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { ACTION_BUTTONS } from './homeConfig';

interface HomeQuickActionsProps {
    onActionPress: (type: 'buy' | 'sell' | 'receive') => void;
}

export default function HomeQuickActions({ onActionPress }: HomeQuickActionsProps) {
    return (
        <>
            <View style={styles.actionsGrid}>
                {ACTION_BUTTONS.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.actionButton}
                        onPress={() => onActionPress(action.type as 'buy' | 'sell' | 'receive')}
                    >
                        <View style={styles.actionIcon}>
                            <action.icon size={moderateScale(24)} color="#1E293B" />
                        </View>
                        <Text style={styles.actionText}>{action.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.divider} />
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
        color: '#0F172A',
        textAlign: 'center',
    },
});
