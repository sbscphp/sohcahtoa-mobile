import DatePickerField from '@/components/DatePickerField';
import InputField from '@/components/InputField';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import FileUpload from '../../components/FileUpload';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import PrimaryButton from '../../components/PrimaryButton';
import Toast from '../../components/Toast';

import { useUploadPassportMutation } from '@/hooks/queries/auth/useUploadPassportMutation';
import { useVerifyPassportMutation } from '@/hooks/queries/auth/useVerifyPassportMutation';
import * as DocumentPicker from 'expo-document-picker';

export default function PassportVerificationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userType } = useLocalSearchParams<{ userType?: string }>();
    const [showToast, setShowToast] = useState(false);

    // International Passport
    const [passportFile, setPassportFile] = useState<string | null>(null);
    const [uploadedPassportUrl, setUploadedPassportUrl] = useState<string | null>(null);
    const [passportNumber, setPassportNumber] = useState('');
    const [passportIssueDate, setPassportIssueDate] = useState('');
    const [passportExpiryDate, setPassportExpiryDate] = useState('');

    // Work Permit
    const [workPermitFile, setWorkPermitFile] = useState<string | null>(null);
    const [workPermitNumber, setWorkPermitNumber] = useState('');

    // Tax Identification Number
    const [tinFile, setTinFile] = useState<string | null>(null);
    const [tinNumber, setTinNumber] = useState('');

    // Bank Verification Number
    const [bvnFile, setBvnFile] = useState<string | null>(null);
    const [bvnNumber, setBvnNumber] = useState('');

    const { mutate: uploadPassport, isPending: isUploading } = useUploadPassportMutation();
    const { mutate: verifyPassport, isPending: isVerifying } = useVerifyPassportMutation();

    const handleFileUpload = async (docType: 'passport' | 'workPermit' | 'tin' | 'bvn') => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            const asset = result.assets[0];

            if (docType === 'passport') {
                const formData = new FormData();
                formData.append('passport', {
                    uri: asset.uri,
                    name: asset.name,
                    type: asset.mimeType || 'image/jpeg',
                } as any);

                uploadPassport(formData, {
                    onSuccess: (response) => {
                        if (response.success) {
                            setPassportFile(asset.name);
                            setUploadedPassportUrl(response.data.passportDocumentUrl);
                        }
                    },
                });
            } else {
                switch (docType) {
                    case 'workPermit':
                        setWorkPermitFile(asset.name);
                        break;
                    case 'tin':
                        setTinFile(asset.name);
                        break;
                    case 'bvn':
                        setBvnFile(asset.name);
                        break;
                }
                setShowToast(true);
            }
        } catch (error) {
            console.log("Error picking document:", error);
        }
    };

    const handleVerifyPassport = () => {
        if (!uploadedPassportUrl) {
            console.log('Passport not uploaded yet');
            return;
        }

        verifyPassport({ passportDocumentUrl: uploadedPassportUrl }, {
            onSuccess: (response) => {
                console.log("Passport verified successfully", response);
                if (response.success) {
                    router.push({
                        pathname: '/(auth)/bvn-confirmation',
                        params: {
                            userType: userType || '',
                            verificationToken: response.data.verificationToken
                        }
                    });
                }
            }
        });
    };

    const isTourist = userType === 'tourist';

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <AuthHeader title="Sign up" />

            <LoadingBackdrop
                visible={isUploading}
                message={isUploading && "Uploading Passport..."}
            />

            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>
                    Confirm your identity using your International Passport.
                </Text>

                {/* International Passport Section */}
                <View style={styles.formSection}>
                    <Text style={styles.label}>International Passport <Text style={styles.required}>*</Text></Text>
                    <FileUpload
                        onUpload={() => handleFileUpload('passport')}
                        fileName={passportFile}
                    />
                    <View style={styles.inputSpacing}>
                        <InputField
                            label="International Passport"
                            placeholder="Enter your Passport Number"
                            value={passportNumber}
                            onChangeText={setPassportNumber}
                            required
                        />
                    </View>
                </View>


                {!isTourist && (
                    <>
                        <View style={styles.dateRow}>
                            <View style={styles.dateField}>
                                <DatePickerField
                                    label="Passport Issue Date"
                                    value={passportIssueDate}
                                    onDateChange={setPassportIssueDate}
                                    placeholder="dd/mm/yyyy"
                                    required
                                    maximumDate={new Date()}
                                />
                            </View>
                            <View style={styles.dateField}>
                                <DatePickerField
                                    label="Passport Expiry Date"
                                    value={passportExpiryDate}
                                    onDateChange={setPassportExpiryDate}
                                    placeholder="dd/mm/yyyy"
                                    required
                                    minimumDate={new Date()}
                                />
                            </View>
                        </View>

                        {/* Work Permit Section */}
                        <View style={styles.formSection}>
                            <Text style={styles.label}>Work Permit <Text style={styles.required}>*</Text></Text>
                            <FileUpload
                                onUpload={() => handleFileUpload('workPermit')}
                                fileName={workPermitFile}
                            />
                            <View style={styles.inputSpacing}>
                                <InputField
                                    label="Work Permit"
                                    placeholder="Enter work permit number"
                                    value={workPermitNumber}
                                    onChangeText={setWorkPermitNumber}
                                    required
                                />
                            </View>
                        </View>

                        {/* Tax Identification Number Section */}
                        <View style={styles.formSection}>
                            <Text style={styles.label}>Tax Identification Number <Text style={styles.required}>*</Text></Text>
                            <FileUpload
                                onUpload={() => handleFileUpload('tin')}
                                fileName={tinFile}
                            />
                            <View style={styles.inputSpacing}>
                                <InputField
                                    label="Tax Identification Number (TIN)"
                                    placeholder="Enter TIN"
                                    value={tinNumber}
                                    onChangeText={setTinNumber}
                                    required
                                />
                            </View>
                        </View>

                        {/* Bank Verification Number Section */}
                        <View style={styles.formSection}>
                            <Text style={styles.label}>Bank Verification Number (BVN) <Text style={styles.required}>*</Text></Text>
                            <FileUpload
                                onUpload={() => handleFileUpload('bvn')}
                                fileName={bvnFile}
                            />
                            <View style={styles.inputSpacing}>
                                <InputField
                                    label="Bank Verification Number (BVN)"
                                    placeholder="Enter BVN"
                                    value={bvnNumber}
                                    onChangeText={setBvnNumber}
                                    required
                                />
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Verify Passport"
                    onPress={handleVerifyPassport}
                    loading={isVerifying}
                    disabled={isVerifying || !passportFile || !passportNumber || (isTourist ? false : (!passportIssueDate || !passportExpiryDate))}
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
