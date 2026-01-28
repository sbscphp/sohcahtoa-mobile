import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DocumentUpload, Folder } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
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

                    {!fileName ? (
                        <TouchableOpacity style={styles.uploadContainer} onPress={handleFileUpload}>

                            <View style={styles.uploadTextContainer}>
                                <View style={styles.uploadTitleRow}>
                                    <View style={styles.uploadIconContainer}>
                                        <DocumentUpload size={moderateScale(20)} color="#64748B" />
                                    </View>
                                    <View >
                                        <Text style={styles.uploadTitle}>
                                            Upload or change here.
                                        </Text>
                                        <Text style={styles.uploadSubtitle}>
                                            PDF, PNG, IMG, JPG Supported. Max. size: 20 MB
                                        </Text>
                                    </View>
                                </View>

                            </View>
                            <View style={styles.browseButton}>
                                <Folder size={moderateScale(16)} color="#0F172A" style={{ marginRight: 4 }}/>
                                <Text style={styles.browseText}>Browse</Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.previewContainer}>
                            <View style={styles.previewImagePlaceholder}>
                                <Ionicons name="document-text-outline" size={moderateScale(48)} color="#166534" />
                                <Text style={{ marginTop: 8, color: '#166534' }}>{fileName}</Text>
                            </View>

                            <TouchableOpacity style={styles.changeButton} onPress={handleFileUpload}>
                                <Text style={styles.changeButtonText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    )}

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
    uploadContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: '12@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        padding: '16@ms',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '12@vs',
    },
    previewContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: '12@ms',
        borderWidth: 2,
        borderColor: '#166534',
        borderStyle: 'dashed',
        height: '120@vs',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    previewImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0FDF4'
    },
    changeButton: {
        position: 'absolute',
        bottom: '16@vs',
        right: '16@s',
        backgroundColor: '#FFFFFF',
        paddingVertical: '8@vs',
        paddingHorizontal: '20@s',
        borderRadius: '20@ms',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    changeButtonText: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    uploadIconContainer: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '24@ms',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '12@s',
    },
    uploadTextContainer: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    uploadTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: '4@vs',
    },
    uploadTitle: {
        fontSize: '13@ms',
        fontWeight: '500',
        color: '#0F172A',
        marginBottom: '4@vs',
    },
    uploadSubtitle: {
        fontSize: '12@ms',
        color: '#64748B',
        lineHeight: '18@ms',
        width: '90%',
    },
    browseButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: '8@vs',
        paddingHorizontal: '16@s',
        borderRadius: '20@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignSelf: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
    },
    browseText: {
        fontSize: '13@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    footer: {
        paddingHorizontal: '20@s',
        paddingBottom: '20@vs',
        paddingTop: '10@vs',
    },
});
