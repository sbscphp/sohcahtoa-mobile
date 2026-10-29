import AnimatedBottomSheet from '@/components/ui/AnimatedBottomSheet';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { loginUser } from '@/services/auth';
import {
    authenticateWithBiometrics,
    getBiometricCapabilities,
    saveCredentials,
} from '@/utils/biometrics';
import { Fingerprint, ScanFaceIcon } from 'lucide-react-native';
import { Lock } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';

interface EnableBiometricsSheetProps {
    visible: boolean;
    onClose: () => void;
    biometricTitle: string;
    biometricType?: 'face' | 'fingerprint' | null;
    onSuccess?: () => void;
}

export const EnableBiometricsSheet: React.FC<EnableBiometricsSheetProps> = ({
    visible,
    onClose,
    biometricTitle,
    biometricType = 'face',
    onSuccess,
}) => {
    const { colors, isDark } = useAppTheme();
    const user = useAuthStore((state) => state.user);
    const setBiometricEnabled = useAuthStore((state) => state.setBiometricEnabled);
    const setBiometricType = useAuthStore((state) => state.setBiometricType);
    const checkCredentials = useAuthStore((state) => state.checkCredentials);
    const showToast = useToastStore((state) => state.showToast);

    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEnable = async () => {
        if (!password) {
            setError('Please enter your account password');
            return;
        }

        const email = user?.email;
        if (!email) {
            showToast('User email not found. Please log in again.', 'error');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Verify password against backend
            const verifyRes = await loginUser({ email, password });
            if (!verifyRes.success) {
                setError('Incorrect password. Please try again.');
                setLoading(false);
                return;
            }

            // Prompt native biometric verification
            const capabilities = await getBiometricCapabilities();
            const promptTitle = `Authenticate to enable ${biometricTitle}`;
            const bioSuccess = await authenticateWithBiometrics(promptTitle);

            if (!bioSuccess) {
                showToast('Biometric authentication canceled.', 'warning');
                setLoading(false);
                return;
            }

            // Save encrypted credentials in Keychain/Keystore
            const saved = await saveCredentials(email, password);
            if (saved) {
                setBiometricEnabled(true);
                if (capabilities.primaryType) {
                    setBiometricType(capabilities.primaryType);
                }
                if (typeof checkCredentials === 'function') {
                    await checkCredentials();
                }
                setPassword('');
                onSuccess?.();
                onClose();
                showToast(`${biometricTitle} enabled successfully!`, 'success');
            } else {
                showToast('Failed to securely store credentials.', 'error');
            }
        } catch (err: any) {
            const msg = err.response?.data?.error?.message || err.message || 'Verification failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        onClose();
    };

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={handleClose}
            sheetStyle={[
                styles.sheetContent,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 0,
                },
            ]}
        >
            <View style={styles.headerIconContainer}>
                <View
                    style={[
                        styles.iconBg,
                        {
                            backgroundColor: isDark
                                ? 'rgba(255, 104, 19, 0.15)'
                                : colors.primarySoft,
                        },
                    ]}
                >
                    {biometricType === 'fingerprint' ? (
                        <Fingerprint size={moderateScale(26)} color={colors.primary} />
                    ) : (
                        <ScanFaceIcon size={moderateScale(26)} color={colors.primary} />
                    )}
                </View>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
                Enable {biometricTitle}
            </Text>

            <Text style={[styles.description, { color: colors.textMuted }]}>
                Enter your account password to securely save your credentials for {biometricTitle} login.
            </Text>

            <View style={styles.form}>
                <InputField
                    label="Account Password"
                    placeholder="Enter your password"
                    icon={Lock}
                    value={password}
                    onChangeText={(val) => {
                        setPassword(val);
                        if (error) setError('');
                    }}
                    isPassword
                    error={error}
                    required
                />
            </View>

            <View style={styles.buttonContainer}>
                <PrimaryButton
                    title="Confirm & Enable"
                    onPress={handleEnable}
                    loading={loading}
                    disabled={loading || !password}
                />

                <TouchableOpacity
                    style={[
                        styles.cancelButton,
                        {
                            backgroundColor: isDark ? colors.surfaceHighlight : '#F1F5F9',
                        },
                    ]}
                    onPress={handleClose}
                    disabled={loading}
                >
                    <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </AnimatedBottomSheet>
    );
};

const styles = ScaledSheet.create({
    sheetContent: {
        width: '100%',
        borderRadius: '28@ms',
        paddingHorizontal: '20@s',
        paddingTop: '8@vs',
        paddingBottom: '24@vs',
    },
    headerIconContainer: {
        marginBottom: '12@vs',
        alignItems: 'flex-start',
    },
    iconBg: {
        width: '46@ms',
        height: '46@ms',
        borderRadius: '23@ms',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        marginBottom: '6@vs',
    },
    description: {
        fontSize: '13@ms',
        lineHeight: '19@ms',
        marginBottom: '18@vs',
    },
    form: {
        marginBottom: '18@vs',
    },
    buttonContainer: {
        gap: '10@vs',
    },
    cancelButton: {
        width: '100%',
        height: '46@vs',
        borderRadius: '28@ms',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: '14@ms',
        fontWeight: '500',
    },
});
