import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import FileUpload from '../../components/FileUpload';
import PrimaryButton from '../../components/PrimaryButton';
import Toast from '../../components/Toast';

import * as DocumentPicker from 'expo-document-picker';

export default function TouristVerificationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [fileName, setFileName] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

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
            setFileName(asset.name);
            setShowToast(true);

        } catch (error) {
            console.log("Error picking document:", error);
        }
    };

    const handleVerifyParams = () => {
        console.log('Verifying passport...');
        router.push('/(auth)/bvn-confirmation');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <AuthHeader title="Sign up" />

            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>
                    Confirm your identity using your International Passport.
                </Text>

                <View style={styles.formSection}>
                    <Text style={styles.label}>Form A <Text style={styles.required}>*</Text></Text>

                    <FileUpload
                        onUpload={handleFileUpload}
                        fileName={fileName}
                    />

                </View>
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Verify Passport"
                    onPress={handleVerifyParams}
                // disabled={!fileName}
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
    },
    title: {
        fontSize: '15@ms',
        fontWeight: '500',
        color: '#0F172A',
        marginBottom: '30@vs',
        lineHeight: '28@ms',
    },
    formSection: {
        marginBottom: '20@vs',
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
    footer: {
        paddingHorizontal: '20@s',
        paddingBottom: '20@vs',
        paddingTop: '10@vs',
    },
});

