import { CloseCircle, SearchNormal1 } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import Money from '../assets/icons/money-02.svg';
import InputField from './InputField';
import PrimaryButton from './PrimaryButton';
import AnimatedBottomSheet from './ui/AnimatedBottomSheet';
import { useAppTheme } from '@/hooks/useAppTheme';
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
    sheetStyle?: StyleProp<ViewStyle>;
}

const POPULAR_CURRENCIES: Currency[] = [
    { code: 'NGN', country: 'Nigeria', currencyName: 'Naira', flagUrl: 'https://flagcdn.com/w80/ng.png' },
    { code: 'USD', country: 'United States', currencyName: 'Dollar', flagUrl: 'https://flagcdn.com/w80/us.png' },
    { code: 'GBP', country: 'United Kingdom', currencyName: 'Pound', flagUrl: 'https://flagcdn.com/w80/gb.png' },
    { code: 'EUR', country: 'European Union', currencyName: 'Euro', flagUrl: 'https://flagcdn.com/w80/eu.png' },
];

const CurrencySelectionSheet: React.FC<CurrencySelectionSheetProps> = ({
    visible,
    onClose,
    onSelect,
    selectedCurrency,
    sheetStyle
}) => {
    const { colors, isDark } = useAppTheme();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCode, setSelectedCode] = useState<string | undefined>(selectedCurrency);

    React.useEffect(() => {
        if (visible) {
            setSelectedCode(selectedCurrency);
            setSearchQuery('');
        }
    }, [visible, selectedCurrency]);

    const filteredCurrencies = POPULAR_CURRENCIES.filter(curr =>
        curr.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        curr.currencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        curr.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleConfirm = () => {
        if (selectedCode) {
            const found = POPULAR_CURRENCIES.find(c => c.code === selectedCode);
            if (found) {
                onSelect(found);
            }
        }
        onClose();
    };

    const renderItem = ({ item }: { item: Currency }) => {
        const isSelected = selectedCode === item.code;
        return (
            <TouchableOpacity
                style={[
                    styles.itemContainer,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isSelected && [
                        styles.itemContainerSelected,
                        {
                            borderColor: colors.primary,
                            backgroundColor: isDark ? 'rgba(255, 107, 44, 0.15)' : '#FFF7ED',
                        },
                    ],
                ]}
                onPress={() => setSelectedCode(item.code)}
            >
                <Image source={{ uri: item.flagUrl }} style={styles.flag} />
                <Text style={[styles.itemText, { color: colors.text }]}>
                    {item.country} • {item.currencyName}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={onClose}
            sheetStyle={[
                styles.sheetContent,
                { backgroundColor: colors.surface },
                sheetStyle,
                { paddingBottom: insets.bottom + moderateScale(20) },
            ]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <View style={styles.headerIconContainer}>
                    <SearchNormal1 size={24} color="#FF6B2C" variant="Bold" />
                </View>

                <View style={styles.headerRow}>
                    <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255, 107, 44, 0.18)' : '#FFF7ED' }]}>
                        <Money />
                    </View>
                    <TouchableOpacity onPress={onClose}>
                        <CloseCircle size={24} color={colors.icon} variant="Bold" />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.title, { color: colors.text }]}>Select Currency</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>Select an option below</Text>

                <InputField
                    label=''
                    placeholder="Enter key word"
                    placeholderTextColor={colors.placeholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    icon={<SearchNormal1 size={moderateScale(20)} color={colors.icon} />}
                />

                <FlatList
                    data={filteredCurrencies}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.code}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    style={styles.flatList}
                />

                <View style={styles.footerActions}>
                    <PrimaryButton
                        title="Select Currency"
                        onPress={handleConfirm}
                        disabled={!selectedCode}
                    />
                    <PrimaryButton
                        title="No, Close"
                        onPress={onClose}
                        style={[styles.secondaryBtn, { backgroundColor: isDark ? colors.surfaceHighlight : '#F1F5F9' }]}
                        textStyle={[styles.secondaryBtnText, { color: colors.text }]}
                    />
                </View>
            </KeyboardAvoidingView>
        </AnimatedBottomSheet>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
    },
    sheetContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        paddingHorizontal: '20@s',
        paddingTop: '16@vs',
        height: '82%',
        maxHeight: '90%',
        marginBottom: '20@vs',
        marginHorizontal: '12@s',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    flatList: {
        flex: 1,
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
