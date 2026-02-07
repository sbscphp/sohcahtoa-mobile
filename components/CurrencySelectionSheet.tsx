import { CloseCircle, SearchNormal1 } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import Money from '../assets/icons/money-02.svg';
import InputField from './InputField';
import PrimaryButton from './PrimaryButton';
interface Currency {
    code: string;
    country: string;
    currencyName: string;
    flagUrl: string;
}

interface CurrencySelectionSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (currency: Currency) => void;
    selectedCurrency?: string;
}

const POPULAR_CURRENCIES: Currency[] = [
    { code: 'NGN', country: 'Nigeria', currencyName: 'Naira', flagUrl: 'https://flagcdn.com/w80/ng.png' },
    { code: 'GHS', country: 'Ghana', currencyName: 'Cedi', flagUrl: 'https://flagcdn.com/w80/gh.png' },
    { code: 'KES', country: 'Kenya', currencyName: 'Shilling', flagUrl: 'https://flagcdn.com/w80/ke.png' },
    { code: 'ZAR', country: 'South Africa', currencyName: 'Rand', flagUrl: 'https://flagcdn.com/w80/za.png' },
    { code: 'TZS', country: 'Tanzania', currencyName: 'Shilling', flagUrl: 'https://flagcdn.com/w80/tz.png' },
    { code: 'UGX', country: 'Uganda', currencyName: 'Shilling', flagUrl: 'https://flagcdn.com/w80/ug.png' },
    { code: 'USD', country: 'United States', currencyName: 'Dollar', flagUrl: 'https://flagcdn.com/w80/us.png' },
    { code: 'GBP', country: 'United Kingdom', currencyName: 'Pound', flagUrl: 'https://flagcdn.com/w80/gb.png' },
];

const CurrencySelectionSheet: React.FC<CurrencySelectionSheetProps> = ({
    visible,
    onClose,
    onSelect,
    selectedCurrency
}) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCurrencies = POPULAR_CURRENCIES.filter(curr =>
        curr.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        curr.currencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        curr.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: Currency }) => {
        const isSelected = selectedCurrency === item.code;
        return (
            <TouchableOpacity
                style={[styles.itemContainer, isSelected && styles.itemContainerSelected]}
                onPress={() => onSelect(item)}
            >
                <Image source={{ uri: item.flagUrl }} style={styles.flag} />
                <Text style={styles.itemText}>
                    {item.country} • {item.currencyName}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={[styles.sheetContent, { paddingBottom: insets.bottom + moderateScale(20) }]}
                >

                    <View style={styles.headerIconContainer}>
                        <SearchNormal1 size={24} color="#FF6B2C" variant="Bold" />
                    </View>

                    <View style={styles.headerRow}>
                        <View style={styles.iconCircle}>
                            <Money />
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <CloseCircle size={24} color="#94A3B8" variant="Bold" />
                        </TouchableOpacity>
                    </View>


                    <Text style={styles.title}>Select Currency</Text>
                    <Text style={styles.subtitle}>Select an option below</Text>


                    <InputField
                        label=''
                        placeholder="Enter key word"
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        icon={<SearchNormal1 size={moderateScale(20)} color="#94A3B8" />}
                    // wrapperStyle={{ borderWidth: 1, borderColor: '#94A3B8', borderRadius: '0@ms', }}
                    />


                    <FlatList
                        data={filteredCurrencies}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.code}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        style={{ maxHeight: moderateScale(400) }}
                    />

                    <View style={styles.footerActions}>
                        <PrimaryButton
                            title="Select Currency"
                            onPress={onClose}
                            disabled={!selectedCurrency}
                        />
                        <PrimaryButton
                            title="No, Close"
                            onPress={onClose}
                            style={styles.secondaryBtn}
                            textStyle={styles.secondaryBtnText}
                        />
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheetContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        paddingHorizontal: '20@s',
        paddingTop: '24@vs',
        maxHeight: '80%',
        marginBottom: '40@vs',
        marginHorizontal: '12@s',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16@vs'
    },
    iconCircle: {
        width: '48@ms',
        height: '48@ms',
        borderRadius: '24@ms',
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '4@vs',
    },
    subtitle: {
        fontSize: '14@ms',
        color: '#64748B',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: '12@ms',
        paddingHorizontal: '16@s',
        paddingVertical: '12@vs',
        marginBottom: '16@vs',
    },
    searchInput: {
        flex: 1,
        marginLeft: '10@s',
        fontSize: '14@ms',
        color: '#0F172A',
    },
    listContent: {
        paddingBottom: '20@vs',
        gap: '12@vs',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16@ms',
        borderRadius: '16@ms',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
        gap: '12@s',
    },
    itemContainerSelected: {
        borderColor: '#FF6B2C',
        backgroundColor: '#FFF7ED',
    },
    flag: {
        width: '24@ms',
        height: '24@ms',
        borderRadius: '12@ms',
        resizeMode: 'cover',
    },
    itemText: {
        fontSize: '14@ms',
        color: '#0F172A',
        fontWeight: '500',
    },
    footerActions: {
        gap: '12@vs',
        marginTop: '10@vs'
    },
    primaryBtn: {
        backgroundColor: '#FFD7C5',
        borderRadius: '30@ms',
        paddingVertical: '16@vs',
        alignItems: 'center',
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: '14@ms',
        fontWeight: '600',
    },
    secondaryBtn: {
        backgroundColor: '#F1F5F9',
        borderRadius: '30@ms',
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#0F172A',
        fontSize: '14@ms',
        fontWeight: '600',
    },
    headerIconContainer: {
        display: 'none'
    }
});

export default CurrencySelectionSheet;
