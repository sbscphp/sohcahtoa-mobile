import { useRouter } from 'expo-router';
import { FingerScan, Lock, Sms, User } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../constants/theme';

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        console.log('Login attempt:', { email, password });
        // router.push('/home');
    };

    const handleSignUp = () => {
        router.push('/signup');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <AuthHeader title="Login" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.welcomeSection}>
                    <View style={styles.avatarPlaceholder}>
                        <User size={moderateScale(32)} color={Colors.light.primary} variant="Linear" />
                    </View>
                    <Text style={styles.welcomeTitle}>Welcome to SohCahToa BDC</Text>
                    <Text style={styles.welcomeSubtitle}>Login to Continue</Text>
                </View>

                <View style={styles.form}>
                    <InputField
                        label="Email Address"
                        placeholder="kibrahim@sbsc.com"
                        icon={Sms}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        required
                    />

                    <InputField
                        label="Password"
                        placeholder="thisisMYpassword2025"
                        icon={Lock}
                        value={password}
                        onChangeText={setPassword}
                        isPassword
                        required
                    />

                    <PrimaryButton
                        title="Login"
                        onPress={handleLogin}
                        style={styles.loginButton}
                        disabled={!email || !password}
                    />

                    <TouchableOpacity
                        onPress={() => console.log('Forgot password')}
                        style={styles.forgotPassword}
                    >
                        <Text style={styles.forgotPasswordText}>Forget Password ?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.biometricSection}>
                    <TouchableOpacity style={styles.biometricButton}>
                        <FingerScan size={moderateScale(48)} color="#94A3B8" variant="Linear" />
                    </TouchableOpacity>
                </View>

                <View style={styles.signUpFooter}>
                    <Text style={styles.notUserText}>Not Emmanuel Isreal ? </Text>
                    <TouchableOpacity onPress={handleSignUp}>
                        <Text style={styles.signUpText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: '24@s',
        paddingTop: '24@vs',
        paddingBottom: '32@vs',
    },
    welcomeSection: {
        marginBottom: '24@vs',
    },
    avatarPlaceholder: {
        width: '56@ms',
        height: '56@ms',
        borderRadius: '28@ms',
        backgroundColor: '#FFF7F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '12@vs',
    },
    welcomeTitle: {
        fontSize: '20@ms',
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: '6@vs',
    },
    welcomeSubtitle: {
        fontSize: '14@ms',
        color: '#64748B',
    },
    form: {
        width: '100%',
    },
    loginButton: {
        marginTop: '10@vs',
        marginBottom: '14@vs',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: '13@ms',
        fontWeight: '600',
        color: Colors.light.primary,
    },
    biometricSection: {
        alignItems: 'center',
        marginTop: '32@vs',
        marginBottom: '32@vs',
    },
    biometricButton: {
        padding: '10@ms',
    },
    signUpFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notUserText: {
        fontSize: '13@ms',
        color: '#64748B',
    },
    signUpText: {
        fontSize: '13@ms',
        fontWeight: '700',
        color: Colors.light.primary,
        textDecorationLine: 'underline',
    },
});
