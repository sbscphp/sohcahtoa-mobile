import BiometricBottomSheet from '@/components/BiometricBottomSheet';
import BiometricSelectionSheet from '@/components/BiometricSelectionSheet';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'expo-router';
import { Lock } from 'iconsax-react-nativejs';
import { Delete, ScanFace } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/theme';

export default function WelcomeBackScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = useAuthStore((state) => state.user);
    const [passcode, setPasscode] = useState<string[]>([]);
    const [error, setError] = useState(false);
    const [showBiometricBottomSheet, setShowBiometricBottomSheet] = useState(false);
    const [showBiometricSheet, setShowBiometricSheet] = useState(false);

    const userName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'User';
    console.log('userName', user);
    const PASSCODE_LENGTH = 6;
    const CORRECT_PASSCODE = '123456';

    useEffect(() => {
        if (passcode.length === PASSCODE_LENGTH) {
            const code = passcode.join('');
            if (code === CORRECT_PASSCODE) {
                // Success
                setTimeout(() => {
                    router.replace('/(auth)/login');
                }, 300);
            } else {
                // Error
                setError(true);
                setTimeout(() => {
                    setPasscode([]);
                    setError(false);
                }, 500);
            }
        }
    }, [passcode]);

    const handlePress = (num: string) => {
        if (passcode.length < PASSCODE_LENGTH) {
            setPasscode(prev => [...prev, num]);
            setError(false);
        }
    };

    const handleDelete = () => {
        setPasscode(prev => prev.slice(0, -1));
        setError(false);
    };

    const handleBiometric = () => {
        setShowBiometricBottomSheet(true);
    };

    const handleSignUp = () => {
        router.push('/signup');
    };

    const KeyButton = ({ number }: { number: string }) => (
        <TouchableOpacity
            style={styles.keyButton}
            onPress={() => handlePress(number)}
            activeOpacity={0.7}
        >
            <Text style={styles.keyText}>{number}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.content}>

                <View style={styles.userSection}>
                    <View style={styles.avatarContainer}>

                        <Image
                            source={require('../../assets/images/user-img-1.jpg')}
                            style={styles.avatar}
                        />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.welcomeText}>Welcome Back</Text>
                        <Text style={styles.userName}>{userName}</Text>
                    </View>
                </View>

                <View style={styles.passcodeSection}>
                    <View style={styles.passcodeLabelRow}>
                        <Lock size={moderateScale(16)} color="#64748B" variant="Bold" />
                        <Text style={styles.passcodeLabel}>Enter Passcode</Text>
                    </View>

                    <View style={styles.dotsContainer}>
                        {Array.from({ length: PASSCODE_LENGTH }).map((_, index) => {
                            const isFilled = index < passcode.length;
                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        isFilled && styles.dotFilled,
                                        error && styles.dotError
                                    ]}
                                />
                            );
                        })}
                    </View>
                </View>

                <View style={styles.keypadContainer}>
                    <View style={styles.keypadRow}>
                        <KeyButton number="1" />
                        <KeyButton number="2" />
                        <KeyButton number="3" />
                    </View>
                    <View style={styles.keypadRow}>
                        <KeyButton number="4" />
                        <KeyButton number="5" />
                        <KeyButton number="6" />
                    </View>
                    <View style={styles.keypadRow}>
                        <KeyButton number="7" />
                        <KeyButton number="8" />
                        <KeyButton number="9" />
                    </View>
                    <View style={styles.keypadRow}>
                        <View style={styles.keyButtonEmpty} />
                        <KeyButton number="0" />
                        <TouchableOpacity style={styles.backspaceButton} onPress={handleDelete}>
                            <View style={styles.backspaceIconBg}>
                                <Delete size={moderateScale(20)} color="#FFFFFF" strokeWidth={2.5} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.biometricButton} onPress={handleBiometric}>
                        <ScanFace size={moderateScale(32)} color={Colors.light.primary} />
                        <Text style={styles.biometricText}>Face Recognition</Text>
                    </TouchableOpacity>

                    <View style={styles.signupContainer}>
                        <Text style={styles.notUserText}>Not {userName}? </Text>
                        <TouchableOpacity onPress={handleSignUp}>
                            <Text style={styles.signupText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
            <BiometricBottomSheet
                visible={showBiometricBottomSheet}
                onClose={() => setShowBiometricBottomSheet(false)}
                onConfirm={() => {
                    setShowBiometricSheet(true);
                    setShowBiometricBottomSheet(false);
                }}
            />
            <BiometricSelectionSheet
                visible={showBiometricSheet}
                onClose={() => setShowBiometricSheet(false)}
                onSelectFace={() => {
                    setShowBiometricSheet(false);
                    router.push('/(auth)/biometrics-setup');
                }}
                onSelectFingerprint={() => {
                    setShowBiometricSheet(false);
                    router.push('/(auth)/fingerprint-setup');
                }}
            />
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: '24@s',
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: '20@vs',
        marginBottom: '40@vs',
        gap: '12@s',
    },
    avatarContainer: {
        width: '48@ms',
        height: '48@ms',
        borderRadius: '24@ms',
        backgroundColor: '#F1F5F9',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    userInfo: {
        justifyContent: 'center',
    },
    welcomeText: {
        fontSize: '12@ms',
        color: '#64748B',
        marginBottom: '2@vs',
    },
    userName: {
        fontSize: '16@ms',
        fontWeight: '700',
        color: '#0F172A',
    },
    passcodeSection: {
        alignItems: 'center',
        marginBottom: '32@vs',
        width: '100%',
    },
    passcodeLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8@ms',
        marginBottom: '20@vs',
    },
    passcodeLabel: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#0F172A',
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: '16@ms',
    },
    dot: {
        width: '12@ms',
        height: '12@ms',
        borderRadius: '6@ms',
        backgroundColor: '#E2E8F0', // Gray-200
    },
    dotFilled: {
        backgroundColor: '#10B981', // Green-500
    },
    dotError: {
        backgroundColor: '#EF4444', // Red-500
    },
    keypadContainer: {
        width: '100%',
        paddingHorizontal: '16@s',
        gap: '20@vs',
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    keyButton: {
        width: '72@ms',
        height: '72@ms',
        borderRadius: '36@ms',
        backgroundColor: '#F8F8F8', // Very light gray from UI
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyButtonEmpty: {
        width: '72@ms',
        height: '72@ms',
    },
    keyText: {
        fontSize: '24@ms',
        fontWeight: '500',
        color: '#0F172A',
    },
    backspaceButton: {
        width: '72@ms',
        height: '72@ms',
        borderRadius: '36@ms',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backspaceIconBg: {
        width: '32@ms',
        height: '24@ms', // Rectangular shape like the delete key
        borderRadius: '6@ms',
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: '70@vs',
        width: '100%',
    },
    biometricButton: {
        alignItems: 'center',
        marginBottom: '32@vs',
        gap: '8@vs',
    },
    biometricText: {
        fontSize: '13@ms',
        color: '#64748B',
    },
    signupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notUserText: {
        fontSize: '13@ms',
        color: '#64748B',
    },
    signupText: {
        fontSize: '13@ms',
        fontWeight: '700',
        color: Colors.light.primary,
        textDecorationLine: 'underline',
    },
});
