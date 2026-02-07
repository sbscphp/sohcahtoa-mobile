import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import ProgressBar from '@/components/ProgressBar';
import { useRouter } from 'expo-router';
import { Bank, Calendar } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

// Mock Data
const BANKS = [
    { id: 'sterling', name: 'Sterling Bank', account: '2224567890 - SOHCAHTOA LTD' },
    { id: 'wema', name: 'Wema Bank', account: '2224567890 - SOHCAHTOA LTD' },
];

export default function DisbursementOptionsScreen() {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<'bank' | 'pickup'>('bank');
    const [selectedBank, setSelectedBank] = useState<string | null>(null);

    const handleSubmit = () => {
        router.push('/(receive-fx)/success');
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
                    <ProgressBar step={6} totalSteps={6} />

                    <Text style={styles.sectionTitle}>
                        How would you like your funds disbursed?
                    </Text>

                    <View style={styles.optionsContainer}>

                        <View>
                            <TouchableOpacity
                                style={[
                                    styles.optionHeader,
                                    selectedMethod === 'bank' && styles.optionHeaderSelected
                                ]}
                                onPress={() => setSelectedMethod('bank')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.optionTitle}>Bank Transfer</Text>
                            </TouchableOpacity>

                            {selectedMethod === 'bank' && (
                                <View style={styles.optionContent}>
                                    <Text style={styles.subLabel}>Please select your preferred bank</Text>

                                    <View style={styles.bankList}>
                                        {BANKS.map((bank) => (
                                            <TouchableOpacity
                                                key={bank.id}
                                                style={[
                                                    styles.bankCard,
                                                    selectedBank === bank.id && styles.bankCardSelected
                                                ]}
                                                onPress={() => setSelectedBank(bank.id)}
                                                activeOpacity={0.8}
                                            >
                                                <View style={styles.bankIconContainer}>
                                                    <Bank size={moderateScale(20)} color="#D97706" />
                                                </View>
                                                <View>
                                                    <Text style={styles.bankName}>{bank.name}</Text>
                                                    <Text style={styles.accountDetails}>{bank.account}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <TouchableOpacity style={styles.addAccountButton}>
                                        <Calendar size={moderateScale(18)} color="#F97316" />
                                        <Text style={styles.addAccountText}>Add New Account</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.optionHeader,
                                selectedMethod === 'pickup' && styles.optionHeaderSelected
                            ]}
                            onPress={() => setSelectedMethod('pickup')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.optionTitle}>Branch Pickup</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Submit"
                    onPress={handleSubmit}
                    disabled={selectedMethod === 'bank' && !selectedBank}
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
        marginBottom: '24@vs',
    },
    optionsContainer: {
        gap: '16@vs',
    },
    optionHeader: {
        padding: '16@ms',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        borderRadius: '8@ms',
        backgroundColor: '#FCFCFC',
    },
    optionHeaderSelected: {
        borderColor: '#F97316',
        backgroundColor: '#FFF7ED',
    },
    optionTitle: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#334155',
    },
    optionContent: {
        marginTop: '16@vs',
        marginBottom: '4@vs',
        paddingLeft: '4@s',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        borderRadius: '8@ms',
        backgroundColor: '#ffffffff',
    },
    subLabel: {
        fontSize: '14@ms',
        color: '#475569',
        marginVertical: '12@vs',
        marginHorizontal: '12@s',
    },
    bankList: {
        gap: '12@vs',
        marginBottom: '8@vs',
    },
    bankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16@ms',
        marginHorizontal: '7@s',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        borderRadius: '12@ms',
        backgroundColor: '#FCFCFC',
        gap: '12@s',
    },
    bankCardSelected: {
        borderColor: '#F97316',
        backgroundColor: '#FFF7ED',
    },
    bankIconContainer: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '20@ms',
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bankName: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#334155',
        marginBottom: '2@vs',
    },
    accountDetails: {
        fontSize: '12@ms',
        color: '#94A3B8',
    },
    addAccountButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14@ms',
        borderWidth: 1,
        borderColor: '#F97316',
        borderRadius: '30@ms',
        backgroundColor: '#FFFFFF',
        gap: '8@s',
        width: '55%',
        alignSelf: 'flex-start',
        marginHorizontal: '12@s',
        marginVertical: '9@vs',
    },
    addAccountText: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#F97316',
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
