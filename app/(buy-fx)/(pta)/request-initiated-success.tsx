import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';

export default function SuccessScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleViewTransaction = () => {
        router.push('/(buy-fx)/(pta)/view-pta');
    };

    const handleGoHome = () => {
        router.push('/(tabs)');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="Request Initiated Successful" onBackPress={() => router.back()} />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Image source={require('../../../assets/icons/success.gif')} style={styles.icon} />
                </View>

                <Text style={styles.title}>Request Initiated Successfully</Text>
                <Text style={styles.description}>
                    You have successfully initiated a new transaction request. Your documents have been received and currently awaiting approval.
                </Text>

                <View style={styles.footer}>
                    <PrimaryButton title="View Transaction" onPress={handleViewTransaction} />
                    <TouchableOpacity style={styles.secondaryBtn} onPress={handleGoHome}>
                        <Text style={styles.secondaryBtnText}>Go to Home</Text>
                    </TouchableOpacity>
                </View>
            </View>


        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        // flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '20@s',
    },
    iconContainer: {
        marginBottom: '24@vs',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: '12@vs',
    },
    description: {
        fontSize: '14@ms',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: '22@ms',
        maxWidth: '90%',
    },
    icon: {
        width: '150@ms',
        height: '150@ms',
        resizeMode: 'contain',
    },
    footer: {
        width: '100%',
        gap: '12@vs',
        marginTop: '32@vs',
    },
    secondaryBtn: {
        backgroundColor: 'rgba(243, 243, 243, 1)',
        borderRadius: '30@ms',
        paddingVertical: '16@vs',
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#0F172A',
        fontSize: '14@ms',
        fontWeight: '400',
    }
});
