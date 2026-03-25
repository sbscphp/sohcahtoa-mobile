import ProgressBar from '@/components/ProgressBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import ControlledInput from '../../components/ControlledInput';
import PrimaryButton from '../../components/PrimaryButton';
import Toast from '../../components/Toast';

import { useVerifyBvnMutation } from '@/hooks/queries/auth/useVerifyBvnMutation';
import { useVerifyExpatriatePassportMutation } from '@/hooks/queries/auth/useVerifyExpatriatePassportMutation';
import { useVerifyPassportMutation } from '@/hooks/queries/auth/useVerifyPassportMutation';
import { bvnValidation, PassportFormData, passportValidation } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export default function PassportVerificationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userType } = useLocalSearchParams<{ userType?: string }>();
    const [showToast, setShowToast] = useState(false);

    const isTourist = userType === 'tourist';
    const isExpatriate = userType === 'expatriate';
    const isCitizen = userType === 'citizen';

    const label = isTourist ? 'International Passport Number' : 'BVN Number';
    const placeholder = isTourist ? 'Enter your Passport Number' : 'Enter your BVN Number';
    const maxLength = isTourist ? 9 : 11;
    const filterType = isTourist ? 'alphanumeric' : 'numeric';

    const schema = z.object({
        passportNumber: isCitizen || isExpatriate ? bvnValidation : passportValidation
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<PassportFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            passportNumber: '',
        },
        mode: 'onChange'
    });
    const { mutate: verifyPassport, isPending: isVerifyingTourist } = useVerifyPassportMutation();
    const { mutate: verifyExpatriatePassport, isPending: isVerifyingExpatriate } = useVerifyExpatriatePassportMutation();
    const { mutate: verifyBvn, isPending: isVerifyingCitizen } = useVerifyBvnMutation();

    const isVerifying = isVerifyingTourist || isVerifyingExpatriate || isVerifyingCitizen;

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
                        userType: userType || 'expatriate',
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

        if (isCitizen) {
            verifyBvn({ bvn: data.passportNumber }, { onSuccess });
        } else if (isExpatriate) {
            verifyExpatriatePassport({
                bvnNumber: data.passportNumber
            }, { onSuccess });
        } else {
            verifyPassport({ passportNumber: data.passportNumber }, { onSuccess });
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <AuthHeader title="Sign up" />
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <ProgressBar step={1} totalSteps={3} />
                {isCitizen ||isExpatriate ? <Text style={styles.title}>
                    Enter your Bank verification Number (BVN).
                </Text> : <Text style={styles.title}>
                    Enter your International Passport Number.
                </Text>}
                <View style={styles.formSection}>
                    <View style={styles.inputSpacing}>
                        <ControlledInput
                            control={control}
                            name="passportNumber"
                            label={label}
                            placeholder={placeholder}
                            required
                            maxLength={maxLength}
                            filterType={filterType}
                            autoCapitalize="characters"
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title={`Verify ${isTourist ? 'Passport' : 'BVN'}`}
                    onPress={handleSubmit(onSubmit)}
                    loading={isVerifying}
                    disabled={isVerifying || !isValid}
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
