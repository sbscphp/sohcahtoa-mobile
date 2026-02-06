import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import ProgressBar from '@/components/ProgressBar';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface TransactionLayoutProps {
    title: string;
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
    onNext: () => void;
    nextLabel?: string;
    children: React.ReactNode;
    isNextDisabled?: boolean;
}

export default function TransactionLayout({
    title,
    currentStep,
    totalSteps,
    onBack,
    onNext,
    nextLabel = "Continue",
    children,
    isNextDisabled = false
}: TransactionLayoutProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title={title} onBackPress={onBack} />

            <View style={{ paddingHorizontal: moderateScale(20) }}>
                <ProgressBar progress={(currentStep + 1) / totalSteps} totalSteps={totalSteps} />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    {children}
                </KeyboardAvoidingView>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + moderateScale(10) }]}>
                <PrimaryButton
                    title={nextLabel}
                    onPress={onNext}
                    disabled={isNextDisabled}
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
        paddingBottom: '100@vs',
        paddingTop: '10@vs',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: '20@s',
        paddingTop: '10@vs',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
});
