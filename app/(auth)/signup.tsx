import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import PrimaryButton from '../../components/PrimaryButton';
import SelectionCard from '../../components/SelectionCard';

type UserType = 'citizen' | 'tourist' | 'expatriate' | null;

export default function SignupScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [selectedType, setSelectedType] = useState<UserType>(null);

    const handleContinue = () => {
        if (selectedType) {
            router.push('/(auth)/bvn-verification');
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <AuthHeader title="Sign up" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeTitle}>Welcome to SohCahToa</Text>
                    <Text style={styles.welcomeSubtitle}>Sign Up as?</Text>
                </View>

                <View style={styles.selectionList}>
                    <SelectionCard
                        title="Citizen"
                        description="A Nigerian resident applying for FX"
                        iconSource={require('../../assets/images/map.png')}
                        selected={selectedType === 'citizen'}
                        onPress={() => setSelectedType('citizen')}
                    />

                    <SelectionCard
                        title="Tourist"
                        description="I'm visiting Nigeria and need FX during my stay"
                        iconSource={require('../../assets/images/tourist.png')}
                        selected={selectedType === 'tourist'}
                        onPress={() => setSelectedType('tourist')}
                    />

                    <SelectionCard
                        title="Expatriate"
                        description="A foreign national living or working in Nigeria"
                        iconSource={require('../../assets/images/map.png')}
                        selected={selectedType === 'expatriate'}
                        onPress={() => setSelectedType('expatriate')}
                    />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Continue"
                    onPress={handleContinue}
                    disabled={!selectedType}
                />
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: '20@s',
        paddingTop: '16@vs',
        paddingBottom: '32@vs',
    },
    welcomeSection: {
        marginBottom: '24@vs',
    },
    welcomeTitle: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '6@vs',
    },
    welcomeSubtitle: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    selectionList: {
        gap: '4@vs',
    },
    footer: {
        paddingHorizontal: '24@s',
        paddingBottom: '20@vs',
        paddingTop: '10@vs',
        backgroundColor: '#FFFFFF',
    },
});
