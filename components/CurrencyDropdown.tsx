import { LiquidGlassView } from '@/components/ui/LiquidGlassView';
import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { ScaledSheet } from 'react-native-size-matters';

export interface CurrencyItem {
    id: string;
    code: string;
    flag: string; // Emoji
}

interface CurrencyDropdownProps {
    onSelect: (currency: CurrencyItem) => void;
    selectedCurrencyCode: string;
    onClose: () => void; 
}

const CURRENCIES: CurrencyItem[] = [
    { id: '1', code: 'NGN', flag: '🇳🇬' },
    { id: '4', code: 'USD', flag: '🇺🇸' },
    { id: '5', code: 'GBP', flag: '🇬🇧' },
    { id: '7', code: 'EUR', flag: '🇪🇺' },
];

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
    onSelect,
    selectedCurrencyCode,
    onClose
}) => {
    const { colors, isDark } = useAppTheme();

    const renderItem = ({ item }: { item: CurrencyItem }) => {
        const isSelected = item.code === selectedCurrencyCode;
        return (
            <TouchableOpacity
                style={[
                    styles.itemContainer,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isSelected && [
                        styles.itemContainerSelected,
                        {
                            borderColor: colors.primary,
                            backgroundColor: isDark ? 'rgba(255, 107, 44, 0.15)' : '#F8FAFC',
                        },
                    ],
                ]}
                onPress={() => {
                    onSelect(item);
                    onClose();
                }}
                activeOpacity={0.7}
            >
                <View style={styles.flagContainer}>
                    <Text style={styles.flag}>{item.flag}</Text>
                </View>
                <Text style={[styles.currencyCode, { color: colors.text }]}>{item.code}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Animated.View
            entering={FadeInUp.springify().damping(18).stiffness(220)}
            exiting={FadeOutUp.duration(140)}
            style={styles.dropdownPosition}
        >
            <LiquidGlassView
                variant="regular"
                colorScheme={isDark ? 'dark' : 'light'}
                tintColor={isDark ? 'rgba(30, 41, 59, 0.88)' : 'rgba(255, 255, 255, 0.88)'}
                style={[styles.dropdown, { backgroundColor: colors.surface }]}
            >
                <FlatList
                    data={CURRENCIES}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    scrollEnabled={false} 
                />
            </LiquidGlassView>
        </Animated.View>
    );
};

const styles = ScaledSheet.create({
    dropdownPosition: {
        position: 'absolute',
        top: '110%',
        right: 0,
        zIndex: 1000,
    },
    dropdown: {
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        padding: '10@ms',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        minWidth: '140@s',
    },
    listContent: {
        gap: '8@vs',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: '12@vs',
        paddingHorizontal: '12@s',
        borderRadius: '16@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    itemContainerSelected: {
        borderColor: '#0F172A',
        backgroundColor: '#F8FAFC',
    },
    flagContainer: {
        width: '32@ms',
        height: '32@ms',
        borderRadius: '60@ms',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '12@s',
    },
    flag: {
        fontSize: '24@ms',
    },
    currencyCode: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#334155',
    },
});

export default CurrencyDropdown;
