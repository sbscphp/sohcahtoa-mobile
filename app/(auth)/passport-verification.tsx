import ProgressBar from '@/components/ProgressBar';
import { useVerifyPassportMutation } from '@/hooks/queries/auth/useVerifyPassportMutation';
import { PassportFormData, passportValidation } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { z } from 'zod';
import AuthHeader from '../../components/AuthHeader';
import ControlledInput from '../../components/ControlledInput';
import PrimaryButton from '../../components/PrimaryButton';
import Toast from '../../components/Toast';

export default function PassportVerificationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userType } = useLocalSearchParams<{ userType?: string }>();
    const [showToast, setShowToast] = useState(false);

    const schema = z.object({
        passportDocumentNumber: passportValidation
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<PassportFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            passportDocumentNumber: '',
        },
        mode: 'onChange'
    });
    const { mutate: verifyPassport, isPending } = useVerifyPassportMutation();

    const onSubmit = (data: PassportFormData) => {
        const onSuccess = (response: any) => {
            if (response.success) {
                useAuthStore.getState().setTempUserInfo({
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    phoneNumber: response.data.phoneNumber || '',
                    email: response.data.email || '',
                    address: response.data.address || response.data.nationality || '',
                });
                router.push({
                    pathname: '/(auth)/bvn-confirmation',
                    params: {
                        userType: userType || 'tourist',
                        verificationToken: response.data.verificationToken,
                        firstName: response.data.firstName || '',
                        lastName: response.data.lastName || '',
                        phoneNumber: response.data.phoneNumber || '',
                        email: response.data.email || '',
                        address: response.data.address || response.data.nationality || '',
                        flowContext: 'passport'
                    }
                });
            }
        };

        verifyPassport({ passportDocumentNumber: data.passportDocumentNumber }, { onSuccess });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <AuthHeader title="Sign up" />
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <ProgressBar step={1} totalSteps={3} />
                <Text style={styles.title}>
                    Enter your International Passport Number.
                </Text>
                <View style={styles.formSection}>
                    <View style={styles.inputSpacing}>
                        <ControlledInput
                            control={control}
                            name="passportDocumentNumber"
                            label="International Passport Number"
                            placeholder="Enter your Passport Number"
                            required
                            maxLength={9}
                            filterType="alphanumeric"
                            autoCapitalize="characters"
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Verify Passport"
                    onPress={handleSubmit(onSubmit)}
                    loading={isPending}
                    disabled={isPending || !isValid}
                />
            </View>

            <Toast
                visible={showToast}
                message="File uploaded successfully"
                type="success"
                onDismiss={() => setShowToast(false)}
            />
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        paddingHorizontal: '20@s',
        paddingTop: '20@vs',
        paddingBottom: '100@vs',
    },
    title: {
        fontSize: '15@ms',
        fontWeight: '500',
        color: '#0F172A',
        marginBottom: '14@vs',
        lineHeight: '22@ms',
    },
    formSection: {
        marginBottom: '14@vs',
    },
    inputSpacing: {
        marginTop: '12@vs',
    },
    label: {
        fontSize: '13@ms',
        fontWeight: '500',
        color: '#334155',
        marginBottom: '8@vs',
    },
    required: {
        color: '#EF4444',
    },
    dateRow: {
        flexDirection: 'row',
        gap: '12@s',
        marginBottom: '24@vs',
    },
    dateField: {
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: '20@s',
        paddingBottom: '20@vs',
        paddingTop: '10@vs',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
});
