import CurrencyConverter from '@/components/CurrencyConverter';
import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import ProgressBar from '@/components/ProgressBar';
import { useRouter } from 'expo-router';
import { InfoCircle } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

export default function SplitPaymentScreen() {
    const router = useRouter();
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');

    // Mock currencies for display
    const [currencyGet, setCurrencyGet] = useState({
        code: 'USD',
        country: 'United States',
        currencyName: 'US Dollar',
        flagUrl: 'https://flagcdn.com/w320/us.png'
    });

    const [currencySend, setCurrencySend] = useState({
        code: 'USD',
        country: 'United States',
        currencyName: 'US Dollar',
        flagUrl: 'https://flagcdn.com/w320/ng.png'
    });

    const [amountGet, setAmountGet] = useState('1');
    const [amountSend, setAmountSend] = useState('1,500');

    const handleContinue = () => {
        router.push('/(receive-fx)/disbursement-options');
    };

    return (
        <View style={styles.container}>
            <Header title="Receive Funds: IMTO" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ProgressBar step={5} totalSteps={6} />

                    <Text style={styles.sectionTitle}>
                        How would you like to receive your funds?
                    </Text>

                    <CurrencyConverter
                        transactionType={transactionType}
                        onTransactionTypeChange={setTransactionType}
                        currencyGet={currencyGet}
                        onCurrencyGetChange={setCurrencyGet}
                        currencySend={currencySend}
                        onCurrencySendChange={setCurrencySend}
                        amountGet={amountGet}
                        amountSend={amountSend}
                        rate="USD1 - NGN1500"
                    />

                    <View style={styles.infoBanner}>
                        <InfoCircle size={moderateScale(20)} color="#F97316" variant="Bold" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoTitle}>Request USD cash pick up</Text>
                            <Text style={styles.infoText}>
                                A portion of the amount will be able for cash pickup in USD, and the rest will be sent as a bank transfer. <Text style={{ fontWeight: '700' }}>Maximum USD cash pick up is $500</Text>
                            </Text>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Next"
                    onPress={handleContinue}
                />
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: '40@vs',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: '20@ms',
        paddingTop: '16@vs',
        paddingBottom: '100@vs',
    },
    sectionTitle: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginTop: '24@vs',
        marginBottom: '16@vs',
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFF7ED', // Light orange background
        borderRadius: '12@ms',
        padding: '16@ms',
        gap: '12@s',
        marginTop: '24@vs',
    },
    infoTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#334155',
        marginBottom: '4@vs',
    },
    infoText: {
        fontSize: '13@ms',
        color: '#64748B',
        lineHeight: '20@ms',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20@ms',
        paddingBottom: '30@vs',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
});
