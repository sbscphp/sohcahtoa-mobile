import CurrencySelectionSheet from '@/components/CurrencySelectionSheet';
import InputField from '@/components/InputField';
import { ArrowDown2 } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
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
    onDownloadPress?: () => void;
    onTemplateDownloadPress?: () => void;

    amountGet: string;
    amountSend: string;

    rate: string;
    allowedModes?: ('buy' | 'sell')[];
    onAmountGetChange?: (amount: string) => void;
    onAmountSendChange?: (amount: string) => void;
    showLimitWarning?: boolean;
    onLimitWarningPress?: () => void;
    error?: string;
    isLoading?: boolean;
    isSchool?: boolean;
    labelGet?: string;
    labelSend?: string;
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
    rate,
    allowedModes = ['buy', 'sell'],
    onAmountGetChange,
    onAmountSendChange,
    showLimitWarning = false,
    onLimitWarningPress,
    onDownloadPress,
    onTemplateDownloadPress,
    error,
    isLoading = false,
    isSchool = false,
    labelGet,
    labelSend
}: CurrencyConverterProps) {
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
    const [activeCurrencyField, setActiveCurrencyField] = useState<'get' | 'send' | null>(null);

    const isBuy = transactionType === 'buy';
    const defaultLabelGet = isBuy ? 'You get exactly' : 'You send';
    const defaultLabelSend = isBuy ? 'When you send' : 'What you get';

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
            default: return code;
        }
    };

    const foreignAmountStr = currencyGet.code !== 'NGN' ? amountGet : amountSend;
    const foreignAmount = parseFloat(foreignAmountStr.replace(/,/g, '')) || 0;

    return (
        <View style={styles.container}>
            <View style={styles.toggleWrapper}>
                <View style={styles.toggleContainer}>
                    {allowedModes.includes('buy') && (
                        <Pressable
                            style={({ pressed }) => [
                                styles.toggleBtn,
                                isBuy && styles.toggleBtnActive,
                                pressed && { opacity: 0.8 },
                            ]}
                            onPress={() => onTransactionTypeChange('buy')}
                        >
                            <Text style={isBuy ? styles.toggleTextActive : styles.toggleText}>Buy FX</Text>
                        </Pressable>
                    )}
                    {allowedModes.includes('sell') && (
                        <Pressable
                            style={({ pressed }) => [
                                styles.toggleBtn,
                                !isBuy && styles.toggleBtnActive,
                                pressed && { opacity: 0.8 },
                            ]}
                            onPress={() => onTransactionTypeChange('sell')}
                        >
                            <Text style={!isBuy ? styles.toggleTextActive : styles.toggleText}>Sell FX</Text>
                        </Pressable>
                    )}
                </View>

                <View style={styles.exchangeCard}>
                    <View style={styles.exchangeRow}>
                        <Text style={styles.exchangeLabel}>{labelGet || defaultLabelGet}</Text>
                        <Pressable
                            style={({ pressed }) => [
                                styles.currencyPill,
                                pressed && { opacity: 0.8 },
                            ]}
                            onPress={handleGetCurrencyPress}
                        >
                            <Image source={{ uri: currencyGet.flagUrl }} style={styles.flag} />
                            <Text style={styles.currencyPillText}>{currencyGet.code}</Text>
                            <ArrowDown2 size={moderateScale(16)} color="#292D32" />
                        </Pressable>
                    </View>
                    <View style={{ zIndex: 5 }}>
                        <InputField
                            wrapperStyle={{ backgroundColor: '#FFFFFF' }}
                            height={moderateScale(48)}
                            label=''
                            value={amountGet}
                            onChangeText={onAmountGetChange}
                            editable={!!onAmountGetChange}
                            keyboardType="numeric"
                            icon={
                                <Text style={{ fontSize: moderateScale(14), color: '#0F172A', fontWeight: '600' }}>
                                    {getCurrencySymbol(currencyGet.code)}
                                </Text>
                            }
                            error={error}
                        />
                    </View>
                    {(showLimitWarning && foreignAmount > 10000) && (
                        <>
                        <TouchableOpacity
                            style={{ backgroundColor: '#F1F1F1', padding: 1, borderRadius: 10, marginTop: moderateScale(2) }}
                            onPress={onLimitWarningPress}
                            disabled={isBuy}
                        >
                            <Text style={{ fontSize: moderateScale(12), color: 'rgba(217, 45, 32, 1)', fontWeight: '400' }}>
                                Amount is higher than $ 10,000.  
                            </Text>
                            {!isBuy && (
                                <Text style={{ fontSize: moderateScale(12), color: 'rgba(217, 45, 32, 1)', fontWeight: '400', textDecorationLine: 'underline' }}>Please Upload a proof of fund</Text>
                            )}
                        </TouchableOpacity>
                            {!isBuy && (
                                <>
                                    <TouchableOpacity onPress={onTemplateDownloadPress}>
                                        <Text style={{ fontSize: moderateScale(12), color: 'rgba(217, 45, 32, 1)', fontWeight: '400'}}>
                                            Need help? You can <Text style={{ fontSize: moderateScale(12), color: 'rgba(12, 12, 12, 1)', fontWeight: '400', textDecorationLine: 'underline' }}>Download our Proof of Funds Template </Text> to ensure your documentation meets the necessary requirements.
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={onDownloadPress}>
                                        <Text style={{ fontSize: moderateScale(12), color: 'rgba(12, 12, 12, 1)', fontWeight: '400', textDecorationLine: 'underline' }}>View declaration form to upload signature .</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </>
                    )}
                </View>
            </View>

            <View style={{ alignItems: 'center', marginVertical: -10, zIndex: 10 }} pointerEvents="box-none">
                <Pressable
                    style={({ pressed }) => [
                        styles.swapIconCircle,
                        pressed && { opacity: 0.8 },
                    ]}
                    onPress={handleSwap}
                >
                    <SwapIcons width={moderateScale(20)} height={moderateScale(20)} color="#FFFFFF" />
                </Pressable>
            </View>

            <View style={styles.exchangeCard}>
                <View style={styles.exchangeRow}>
                    <Text style={[styles.exchangeLabel, { paddingHorizontal: 10 }]}>{labelSend || defaultLabelSend}</Text>
                    <Pressable
                        style={({ pressed }) => [
                            styles.currencyPill,
                            pressed && { opacity: 0.8 },
                        ]}
                        onPress={handleSendCurrencyPress}
                    >
                        <Image source={{ uri: currencySend.flagUrl }} style={styles.flag} />
                        <Text style={styles.currencyPillText}>{currencySend.code}</Text>
                        <ArrowDown2 size={moderateScale(16)} color="#292D32" />
                    </Pressable>
                </View>
                <View style={{ paddingHorizontal: 10, zIndex: 5 }}>
                    <InputField
                        wrapperStyle={{ backgroundColor: '#FFFFFF' }}
                        height={moderateScale(48)}
                        label=''
                        value={amountSend}
                        onChangeText={onAmountSendChange}
                        editable={!!onAmountSendChange}
                        keyboardType="numeric"
                        icon={
                             isLoading ? <ActivityIndicator size="small" color="#0F172A" /> : (
                                <Text style={{ fontSize: moderateScale(14), color: '#0F172A', fontWeight: '600' }}>
                                    {getCurrencySymbol(currencySend.code)}
                                </Text>
                             )
                        }
                    />
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
        width: '35@ms',
        height: '35@ms',
        borderRadius: '17.5@ms',
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
