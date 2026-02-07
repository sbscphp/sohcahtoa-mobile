import Header from '@/components/Header';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import ProgressBar from '@/components/ProgressBar';
import { useRouter } from 'expo-router';
import { InfoCircle } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

export default function ReceivingOptionsScreen() {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState<'convert' | 'pickup' | null>(null);
    const [usdAmount, setUsdAmount] = useState('');

    const handleContinue = () => {
        if (selectedOption === 'pickup') {
            router.push('/(receive-fx)/pickup-location');
        } else {
            router.push('/(receive-fx)/select-bank');
        }
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
                    <ProgressBar step={3} totalSteps={6} />

                    <Text style={styles.sectionTitle}>
                        How would you like to receive your funds?
                    </Text>

                    <View style={styles.infoBanner}>
                        <InfoCircle size={moderateScale(20)} color="#F97316" variant="Bold" />
                        <Text style={styles.infoText}>
                            Maximum USD cash pickup is <Text style={{ fontWeight: '700' }}>$500</Text>
                        </Text>
                    </View>

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                selectedOption === 'convert' && styles.optionCardSelected
                            ]}
                            onPress={() => setSelectedOption('convert')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.optionTitle}>Convert full amount to naira</Text>
                            <Text style={styles.optionDescription}>
                                The full amount will be converted to naira equivalent and you can select how you want it.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                selectedOption === 'pickup' && styles.optionCardSelected
                            ]}
                            onPress={() => setSelectedOption('pickup')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.optionTitle}>Request USD cash pick up</Text>
                            <Text style={styles.optionDescription}>
                                A portion of the amount will be able for cash pickup in USD, and the rest will be sent as a bank transfer.
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {selectedOption === 'pickup' && (
                        <View style={styles.amountContainer}>
                            <InputField
                                label="Enter Amount"
                                placeholder="Enter Amount"
                                value={usdAmount}
                                onChangeText={setUsdAmount}
                                icon={() => <Text style={styles.currencySymbol}>$</Text>}
                                keyboardType="numeric"
                                required
                            />
                            <View style={styles.amountFooter}>
                                <Text style={styles.amountLeftLabel}>Amount left (NGN)</Text>
                                <Text style={styles.amountLeftValue}>NGN 600,000.00</Text>
                            </View>
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Continue"
                    onPress={handleContinue}
                    disabled={!selectedOption || (selectedOption === 'pickup' && !usdAmount)}
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
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#94A3B8',
        borderRadius: '8@ms',
        padding: '12@ms',
        gap: '12@s',
        marginBottom: '24@vs',
    },
    infoText: {
        fontSize: '13@ms',
        color: '#64748B',
        flex: 1,
    },
    optionsContainer: {
        gap: '16@vs',
    },
    optionCard: {
        padding: '16@ms',
        borderWidth: 1,
        borderColor: '#F1F5F9', // Default border
        borderRadius: '8@ms',
        backgroundColor: '#FCFCFC',
        gap: '4@vs',
    },
    optionCardSelected: {
        borderColor: '#F97316', // Orange border
        borderWidth: 1.5,
        backgroundColor: '#FFFFFF',
    },
    optionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#334155',
        marginBottom: '4@vs',
    },
    optionDescription: {
        fontSize: '12@ms',
        color: '#94A3B8',
        lineHeight: '18@ms',
    },
    amountContainer: {
        marginTop: '24@vs',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: '16@ms',
        padding: '16@ms',
    },
    currencySymbol: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#334155',
        marginRight: '8@s',
    },
    amountFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12@vs',
    },
    amountLeftLabel: {
        fontSize: '13@ms',
        color: '#94A3B8',
    },
    amountLeftValue: {
        fontSize: '13@ms',
        color: '#F97316',
        fontWeight: '600',
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
