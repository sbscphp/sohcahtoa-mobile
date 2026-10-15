import ProgressBar from '@/components/ProgressBar';
import { useUploadPassportMutation } from '@/hooks/queries/auth/useUploadPassportMutation';
import { useVerifyExpatriatePassportMutation } from '@/hooks/queries/auth/useVerifyExpatriatePassportMutation';
import { useVerifyPassportMutation } from '@/hooks/queries/auth/useVerifyPassportMutation';
import { PassportFormData, passportSchema } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import ControlledInput from '../../components/ControlledInput';
import FileUpload from '../../components/FileUpload';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import PrimaryButton from '../../components/PrimaryButton';

export default function PassportVerificationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userType } = useLocalSearchParams<{ userType?: string }>();
    const isExpatriate = userType === 'expatriate';
    const showToast = useToastStore((state) => state.showToast);
    const [uploadedFile, setUploadedFile] = useState<{
        name: string;
        uri: string;
        fileUrl?: string;
        type: string;
        size?: number;
    } | null>(null);

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, isValid }
    } = useForm<PassportFormData>({
        resolver: zodResolver(passportSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            passportNumber: '',
            passportDocumentUrl: '',
        },
        mode: 'onChange'
    });

    const { mutate: verifyPassport, isPending: isVerifyingTourist } = useVerifyPassportMutation();
    const { mutate: verifyExpatriatePassport, isPending: isVerifyingExpatriate } = useVerifyExpatriatePassportMutation();
    const { mutate: uploadPassportDoc, isPending: isUploadingDoc } = useUploadPassportMutation();

    const isPending = isVerifyingTourist || isVerifyingExpatriate || isUploadingDoc;

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/heic', 'image/webp'],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const asset = result.assets[0];

            const MAX_SIZE = 10 * 1024 * 1024;
            if (asset.size && asset.size > MAX_SIZE) {
                showToast('File size exceeds the 10 MB limit', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('document', {
                uri: asset.uri,
                name: asset.name,
                type: asset.mimeType || 'application/octet-stream',
            } as any);
            formData.append('file', {
                uri: asset.uri,
                name: asset.name,
                type: asset.mimeType || 'application/octet-stream',
            } as any);
            formData.append('passport', {
                uri: asset.uri,
                name: asset.name,
                type: asset.mimeType || 'application/octet-stream',
            } as any);

            uploadPassportDoc(formData, {
                onSuccess: (res) => {
                    const passportUrl = res.data?.passportDocumentUrl;
                    if (passportUrl) {
                        setValue('passportDocumentUrl', passportUrl, {
                            shouldValidate: true,
                            shouldDirty: true,
                        });
                        setUploadedFile({
                            name: asset.name,
                            uri: asset.uri,
                            fileUrl: passportUrl,
                            type: asset.mimeType || 'application/octet-stream',
                            size: asset.size,
                        });
                    }
                },
            });
        } catch (err) {
            console.error('Error picking document:', err);
        }
    };

    const onTouristSubmit = (data: PassportFormData) => {
        const onSuccess = (response: any) => {
            if (response.success) {
                useAuthStore.getState().setTempUserInfo({
                    firstName: response.data?.firstName || data.firstName,
                    lastName: response.data?.lastName || data.lastName,
                    phoneNumber: response.data?.phoneNumber || '',
                    email: response.data?.email || '',
                    address: response.data?.address || response.data?.nationality || '',
                    dateOfBirth: response.data?.dateOfBirth || '',
                });
                router.push({
                    pathname: '/(auth)/bvn-confirmation',
                    params: {
                        userType: 'tourist',
                        verificationToken: response.data?.verificationToken,
                        firstName: response.data?.firstName || data.firstName,
                        lastName: response.data?.lastName || data.lastName,
                        phoneNumber: response.data?.phoneNumber || '',
                        email: response.data?.email || '',
                        address: response.data?.address || response.data?.nationality || '',
                        flowContext: 'passport'
                    }
                });
            }
        };

        verifyPassport(
            {
                passportNumber: data.passportNumber,
                passportDocumentNumber: data.passportNumber,
                firstName: data.firstName,
                lastName: data.lastName,
                passportDocumentUrl: data.passportDocumentUrl,
            },
            { onSuccess }
        );
    };

    const onExpatriateSubmit = (data: PassportFormData) => {
        const onSuccess = (response: any) => {
            if (response.success) {
                useAuthStore.getState().setTempUserInfo({
                    firstName: response.data?.firstName || data.firstName,
                    lastName: response.data?.lastName || data.lastName,
                    phoneNumber: data.phoneNumber || '',
                    email: data.email || '',
                    dateOfBirth: response.data?.dateOfBirth || '',
                    address: response.data?.nationality || '',
                });
                router.push({
                    pathname: '/(auth)/bvn-confirmation',
                    params: {
                        userType: 'expatriate',
                        verificationToken: response.data?.verificationToken,
                        firstName: response.data?.firstName || data.firstName,
                        lastName: response.data?.lastName || data.lastName,
                        phoneNumber: data.phoneNumber || '',
                        email: data.email || '',
                        dateOfBirth: response.data?.dateOfBirth || '',
                        address: response.data?.nationality || '',
                        flowContext: 'passport'
                    }
                });
            }
        };

        verifyExpatriatePassport(
            {
                passportNumber: data.passportNumber,
                firstName: data.firstName,
                lastName: data.lastName,
                passportDocumentUrl: data.passportDocumentUrl,
                email: data.email,
                phoneNumber: data.phoneNumber,
            },
            { onSuccess }
        );
    };

    const onSubmit = (data: PassportFormData) => {
        if (isExpatriate) {
            onExpatriateSubmit(data);
        } else {
            onTouristSubmit(data);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LoadingBackdrop visible={isUploadingDoc} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <AuthHeader title="Upload Passport." />
                <ScrollView contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
                    <ProgressBar step={1} totalSteps={3} />

                    <View style={styles.headerSection}>
                        <Text style={styles.title}>Verify Your Identity</Text>
                        <Text style={styles.subtitle}>
                            {isExpatriate
                                ? 'We require your international passport to confirm your identity as an expatriate'
                                : 'We require your international passport to confirm your identity as a tourist'}
                        </Text>
                    </View>

                    <View style={styles.formSection}>
                        <ControlledInput
                            control={control}
                            name="firstName"
                            label="First Name"
                            placeholder="Enter first name"
                            required
                        />
                        <View style={styles.inputSpacing}>
                            <ControlledInput
                                control={control}
                                name="lastName"
                                label="Last Name"
                                placeholder="Enter last name"
                                required
                            />
                        </View>
                        <View style={styles.inputSpacing}>
                            <ControlledInput
                                control={control}
                                name="passportNumber"
                                label="Passport Number"
                                placeholder="Enter passport number"
                                autoCapitalize="characters"
                                required
                            />
                        </View>
                        <View style={styles.uploadSection}>
                            <Text style={styles.label}>
                                Upload International Passport <Text style={styles.required}>*</Text>
                            </Text>
                            <FileUpload
                                onUpload={handlePickDocument}
                                fileName={uploadedFile?.name || null}
                                fileUri={uploadedFile?.uri || null}
                                fileUrl={uploadedFile?.fileUrl || null}
                                fileType={uploadedFile?.type || null}
                                error={errors.passportDocumentUrl?.message}
                            />
                            {errors.passportDocumentUrl?.message ? (
                                <Text style={styles.errorText}>{errors.passportDocumentUrl.message}</Text>
                            ) : null}
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    <PrimaryButton
                        title="Verify Passport"
                        onPress={handleSubmit(onSubmit)}
                        loading={isPending}
                        disabled={isPending || !isValid}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
    },
    headerSection: {
        marginTop: '16@vs',
        marginBottom: '20@vs',
    },
    title: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '6@vs',
        lineHeight: '22@ms',
    },
    subtitle: {
        fontSize: '13@ms',
        fontWeight: '400',
        color: '#64748B',
        lineHeight: '20@ms',
    },
    formSection: {
        marginBottom: '14@vs',
    },
    inputSpacing: {
        marginTop: '12@vs',
    },
    uploadSection: {
        marginTop: '16@vs',
        marginBottom: '8@vs',
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
    errorText: {
        color: '#EF4444',
        fontSize: '12@ms',
        marginTop: '4@vs',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: '20@s',
        paddingTop: '10@vs',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
});
