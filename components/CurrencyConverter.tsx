import CurrencySelectionSheet from '@/components/CurrencySelectionSheet';
import InputField from '@/components/InputField';
import { ArrowDown2 } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import SwapIcons from '../assets/icons/coins-swap.svg';

interface Currency {
    code: string;
    country: string;
    currencyName: string;
    flagUrl: string;
}

export interface CurrencyConverterProps {
    transactionType: 'buy' | 'sell';
    onTransactionTypeChange: (type: 'buy' | 'sell') => void;

    currencyGet: Currency;
    onCurrencyGetChange: (currency: Currency) => void;

    currencySend: Currency;
    onCurrencySendChange: (currency: Currency) => void;

    amountGet: string;
    amountSend: string;

    rate: string; // e.g., "1 USD = 1500 NGN"
}

export default function CurrencyConverter({
    transactionType,
    onTransactionTypeChange,
    currencyGet,
    onCurrencyGetChange,
    currencySend,
    onCurrencySendChange,
    amountGet,
    amountSend,
    rate
}: CurrencyConverterProps) {
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
    const [activeCurrencyField, setActiveCurrencyField] = useState<'get' | 'send' | null>(null);

    const isBuy = transactionType === 'buy';

    const handleGetCurrencyPress = () => {
        setActiveCurrencyField('get');
        setCurrencySheetVisible(true);
    };

    const handleSendCurrencyPress = () => {
        setActiveCurrencyField('send');
        setCurrencySheetVisible(true);
    };

    const handleSwap = () => {
        const temp = currencyGet;
        onCurrencyGetChange(currencySend);
        onCurrencySendChange(temp);
    };

    const getCurrencySymbol = (code: string) => {
        switch (code) {
            case 'USD': return '$';
            case 'NGN': return '₦';
            case 'GBP': return '£';
            case 'EUR': return '€';
            case 'GHS': return '₵';
            case 'KES': return 'KSh';
            case 'ZAR': return 'R';
            default: return code;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.toggleWrapper}>
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, isBuy && styles.toggleBtnActive]}
                        onPress={() => onTransactionTypeChange('buy')}
                    >
                        <Text style={isBuy ? styles.toggleTextActive : styles.toggleText}>Buy FX</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, !isBuy && styles.toggleBtnActive]}
                        onPress={() => onTransactionTypeChange('sell')}
                    >
                        <Text style={!isBuy ? styles.toggleTextActive : styles.toggleText}>Sell FX</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.exchangeCard}>
                    <View style={styles.exchangeRow}>
                        <Text style={styles.exchangeLabel}>You Get Exactly</Text>
                        <TouchableOpacity
                            style={styles.currencyPill}
                            onPress={handleGetCurrencyPress}
                        >
                            <Image source={{ uri: currencyGet.flagUrl }} style={styles.flag} />
                            <Text style={styles.currencyPillText}>{currencyGet.code}</Text>
                            <ArrowDown2 size={moderateScale(16)} color="#292D32" />
                        </TouchableOpacity>
                    </View>
                    <View style={{ marginVertical: -30 }}>
                        <InputField style={{ backgroundColor: 'rgba(241, 241, 241, 1)' }} label='' value={`${getCurrencySymbol(currencyGet.code)} ${amountGet}`} editable={false} />
                    </View>
                </View>
            </View>

            <View style={{ alignItems: 'center', marginVertical: -12, zIndex: 10 }} pointerEvents="box-none">
                <TouchableOpacity style={styles.swapIconCircle} onPress={handleSwap} activeOpacity={0.8}>
                    <SwapIcons width={moderateScale(24)} height={moderateScale(24)} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.exchangeCard}>
                <View style={styles.exchangeRow}>
                    <Text style={styles.exchangeLabel}>What you send</Text>
                    <TouchableOpacity
                        style={styles.currencyPill}
                        onPress={handleSendCurrencyPress}
                    >
                        <Image source={{ uri: currencySend.flagUrl }} style={styles.flag} />
                        <Text style={styles.currencyPillText}>{currencySend.code}</Text>
                        <ArrowDown2 size={moderateScale(16)} color="#292D32" />
                    </TouchableOpacity>
                </View>
                <View style={{ marginVertical: -30 }}>
                    <InputField style={{ backgroundColor: 'rgba(241, 241, 241, 1)' }} label='' value={`${getCurrencySymbol(currencySend.code)} ${amountSend}`} editable={false} />
                </View>

                <View style={styles.rateInfo}>
                    <Text style={styles.rateLabel}>Exchange Rate</Text>
                    <Text style={styles.rateValue}>{rate}</Text>
                </View>
            </View>

            <CurrencySelectionSheet
                visible={currencySheetVisible}
                onClose={() => setCurrencySheetVisible(false)}
                onSelect={(curr) => {
                    if (activeCurrencyField === 'get') {
                        onCurrencyGetChange(curr);
                    } else if (activeCurrencyField === 'send') {
                        onCurrencySendChange(curr);
                    }
                }}
                selectedCurrency={activeCurrencyField === 'get' ? currencyGet.code : currencySend.code}
            />
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        gap: '1@vs',
    },
    toggleWrapper: {
        backgroundColor: 'rgba(241, 241, 241, 1)',
        padding: '12@ms',
        borderRadius: '16@ms',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(143, 139, 139, 1)',
        borderRadius: '30@ms',
        padding: '4@ms',
        marginBottom: '6@vs',
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: '6@vs',
        alignItems: 'center',
        borderRadius: '24@ms',
    },
    toggleBtnActive: {
        backgroundColor: '#0F172A',
    },
    toggleText: {
        fontSize: '14@ms',
        color: '#64748B',
        fontWeight: '500',
    },
    toggleTextActive: {
        fontSize: '14@ms',
        color: '#FFFFFF',
        fontWeight: '600',
    },
    exchangeCard: {
        backgroundColor: 'rgba(241, 241, 241, 1)',
        padding: '10@ms',
        borderRadius: '16@ms',
        gap: '12@vs',
    },
    exchangeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exchangeLabel: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: 'rgba(50, 49, 49, 1)',
        marginBottom: '10@vs',
    },
    currencyPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: '8@s',
        paddingVertical: '10@vs',
        borderRadius: '30@ms',
        gap: '6@s',
    },
    flag: {
        width: '20@ms',
        height: '20@ms',
        borderRadius: '10@ms',
    },
    currencyPillText: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    swapIconCircle: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '20@ms',
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rateInfo: {
        backgroundColor: '#0F172A',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '16@ms',
        borderRadius: '12@ms',
        marginTop: '10@vs',
    },
    rateLabel: {
        color: '#ffffffff',
        fontSize: '14@ms',
    },
    rateValue: {
        color: '#FFFFFF',
        fontSize: '14@ms',
        fontWeight: '600',
    },
});
