import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';

interface SuccessScreenProps {
    headerTitle: string;
    title: string;
    description: string;
    primaryButtonText?: string;
    onViewTransaction: () => void;
    onGoHome: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({
    headerTitle,
    title,
    description,
    primaryButtonText = "View Transaction",
    onViewTransaction,
    onGoHome,
}) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title={headerTitle} onBackPress={() => router.back()} />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Image source={require('../assets/icons/success.gif')} style={styles.icon} />
                </View>

                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>

                <View style={styles.footer}>
                    <PrimaryButton title={primaryButtonText} onPress={onViewTransaction} />
                    <TouchableOpacity style={styles.secondaryBtn} onPress={onGoHome}>
                        <Text style={styles.secondaryBtnText}>Go to Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '20@s',
    },
    iconContainer: {
        marginBottom: '24@vs',
    },
    title: {
        fontSize: '17@ms',
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: '12@vs',
    },
    description: {
        fontSize: '14@ms',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: '20@ms',
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

export default SuccessScreen;
