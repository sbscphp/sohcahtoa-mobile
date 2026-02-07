import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import ProgressBar from '@/components/ProgressBar';
import { useRouter } from 'expo-router';
import { Bank } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

// Simplified Bank Card Component
const BankCard = ({
    bankName,
    accountNumber,
    isSelected,
    onPress
}: {
    bankName: string,
    accountNumber: string,
    isSelected: boolean,
    onPress: () => void
}) => (
    <TouchableOpacity
        style={[
            styles.bankCard,
            isSelected && styles.bankCardSelected
        ]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View style={styles.bankIconContainer}>
            <Bank size={moderateScale(20)} color="#D97706" variant="Bold" />
        </View>
        <View>
            <Text style={styles.bankName}>{bankName}</Text>
            <Text style={styles.accountDetails}>{accountNumber}</Text>
        </View>
    </TouchableOpacity>
);

export default function SelectBankScreen() {
    const router = useRouter();
    const [selectedBank, setSelectedBank] = useState<string | null>(null);

    const handleSubmit = () => {
        router.push('/(receive-fx)/pickup-location');
    };

    const banks = [
        { id: 'sterling', name: 'Sterling Bank', account: '2224567890 - SOHCAHTOA LTD' },
        { id: 'wema', name: 'Wema Bank', account: '2224567890 - SOHCAHTOA LTD' },
        { id: 'providus', name: 'Providus Bank', account: '2224567890 - SOHCAHTOA LTD' },
    ];

    return (
        <View style={styles.container}>
            <Header title="Receive Funds: IMTO" />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ProgressBar step={4} totalSteps={6} />

                <Text style={styles.sectionTitle}>
                    Where would you like to receive the balance?
                </Text>

                <View style={styles.banksContainer}>
                    {banks.map((bank) => (
                        <BankCard
                            key={bank.id}
                            bankName={bank.name}
                            accountNumber={bank.account}
                            isSelected={selectedBank === bank.id}
                            onPress={() => setSelectedBank(bank.id)}
                        />
                    ))}
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Submit"
                    onPress={handleSubmit}
                    disabled={!selectedBank}
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
    banksContainer: {
        gap: '12@vs',
    },
    bankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16@ms',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: '12@ms',
        backgroundColor: '#FCFCFC', // Slightly off-white
        gap: '12@s',
    },
    bankCardSelected: {
        borderColor: '#F97316',
        backgroundColor: '#FFF7ED', // Very light orange tint for selection
    },
    bankIconContainer: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '20@ms', // Circle
        backgroundColor: '#FFF7ED', // Light orange background for icon
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
