import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
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
    const renderItem = ({ item }: { item: CurrencyItem }) => {
        const isSelected = item.code === selectedCurrencyCode;
        return (
            <TouchableOpacity
                style={[
                    styles.itemContainer,
                    isSelected && styles.itemContainerSelected
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
                <Text style={styles.currencyCode}>{item.code}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.dropdown}>
            <FlatList
                data={CURRENCIES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false} 
            />
        </View>
    );
};

const styles = ScaledSheet.create({
    dropdown: {
        position: 'absolute',
        top: '110%',
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        padding: '10@ms',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 1000,
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
