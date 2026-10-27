import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import ProgressBar from '@/components/ProgressBar';
import { useAppTheme } from '@/hooks/useAppTheme';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
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
    const { colors } = useAppTheme();
    const insets = useSafeAreaInsets();
    const reducedMotion = useReducedMotion();
    const scrollViewRef = useRef<ScrollView>(null);
    const prevStepRef = useRef(currentStep);

    const stepOpacity = useSharedValue(1);
    const stepTranslateX = useSharedValue(0);

    useEffect(() => {
        if (prevStepRef.current === currentStep) return;

        const direction = currentStep >= prevStepRef.current ? 1 : -1;
        prevStepRef.current = currentStep;

        scrollViewRef.current?.scrollTo({ y: 0, animated: false });

        if (Platform.OS !== 'web') {
            Haptics.selectionAsync().catch(() => {});
        }

        if (reducedMotion) {
            stepOpacity.value = 1;
            stepTranslateX.value = 0;
            return;
        }

        stepOpacity.value = 0;
        stepTranslateX.value = direction * 24;

        stepOpacity.value = withTiming(1, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
        });
        stepTranslateX.value = withSpring(0, {
            damping: 24,
            stiffness: 260,
        });
    }, [currentStep, reducedMotion, stepOpacity, stepTranslateX]);

    const animatedStepStyle = useAnimatedStyle(() => ({
        opacity: stepOpacity.value,
        transform: [{ translateX: stepTranslateX.value }],
    }));

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            <Header title={title} onBackPress={onBack} />

            <View style={{ paddingHorizontal: moderateScale(20) }}>
                <ProgressBar progress={(currentStep + 1) / totalSteps} step={currentStep + 1} totalSteps={totalSteps} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={animatedStepStyle}>
                        {children}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[
                styles.footer,
                {
                    paddingBottom: insets.bottom + moderateScale(10),
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },
            ]}>
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
        paddingHorizontal: '16@s',
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
