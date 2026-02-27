import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import ControlledInput from '../../components/ControlledInput';
import FileUpload from '../../components/FileUpload';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import PrimaryButton from '../../components/PrimaryButton';
import Toast from '../../components/Toast';

import { useUploadPassportMutation } from '@/hooks/queries/auth/useUploadPassportMutation';
import { useVerifyExpatriatePassportMutation } from '@/hooks/queries/auth/useVerifyExpatriatePassportMutation';
import { useVerifyPassportMutation } from '@/hooks/queries/auth/useVerifyPassportMutation';
import { PassportFormData, passportSchema } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import { useForm } from 'react-hook-form';

export default function PassportVerificationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userType } = useLocalSearchParams<{ userType?: string }>();
    const [showToast, setShowToast] = useState(false);

    // International Passport State
    const [passportFile, setPassportFile] = useState<{ name: string, uri: string, type?: string } | null>(null);
    const [uploadedPassportUrl, setUploadedPassportUrl] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<PassportFormData>({
        resolver: zodResolver(passportSchema),
        defaultValues: {
            passportNumber: '',
        },
        mode: 'onChange'
    });

    const { mutate: uploadPassport, isPending: isUploading } = useUploadPassportMutation();
    const { mutate: verifyPassport, isPending: isVerifyingTourist } = useVerifyPassportMutation();
    const { mutate: verifyExpatriatePassport, isPending: isVerifyingExpatriate } = useVerifyExpatriatePassportMutation();

    const isVerifying = isVerifyingTourist || isVerifyingExpatriate;

    const handleFileUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            const asset = result.assets[0];

            const formData = new FormData();
            formData.append('passport', {
                uri: asset.uri,
                name: asset.name,
                type: asset.mimeType || 'image/jpeg',
            } as any);

            uploadPassport(formData, {
                onSuccess: (response) => {
                    if (response.success) {
                        setPassportFile({ name: asset.name, uri: asset.uri, type: asset.mimeType });
                        setUploadedPassportUrl(response.data.passportDocumentUrl);
                    }
                },
            });
        } catch (error) {
            console.log("Error picking document:", error);
        }
    };

    const onSubmit = (data: PassportFormData) => {
        if (!uploadedPassportUrl) {
            console.log('Passport not uploaded yet');
            return;
        }

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

        if (userType === 'expatriate') {
            verifyExpatriatePassport({
                passportDocumentUrl: uploadedPassportUrl,
                passportNumber: data.passportNumber
            }, { onSuccess });
        } else {
            verifyPassport({ passportDocumentUrl: uploadedPassportUrl }, { onSuccess });
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <AuthHeader title="Sign up" />

            <LoadingBackdrop visible={isUploading} />

            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>
                    Confirm your identity using your International Passport.
                </Text>

                {/* International Passport Section */}
                <View style={styles.formSection}>
                    <Text style={styles.label}>International Passport <Text style={styles.required}>*</Text></Text>
                    <FileUpload
                        onUpload={handleFileUpload}
                        fileName={passportFile?.name}
                        fileUri={passportFile?.uri}
                        fileType={passportFile?.type}
                    />
                    <View style={styles.inputSpacing}>
                        <ControlledInput
                            control={control}
                            name="passportNumber"
                            label="International Passport"
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
                    loading={isVerifying}
                    disabled={isVerifying || !passportFile || !isValid}
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
        marginBottom: '24@vs',
        lineHeight: '22@ms',
    },
    formSection: {
        marginBottom: '24@vs',
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
