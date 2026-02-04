import { useRouter } from 'expo-router';
import { ScanFaceIcon } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../constants/theme';

export default function BiometricsSetupScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleStart = () => {
        router.push('/(auth)/face-capture');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <AuthHeader title="Biometrics Setup" />

            <View style={styles.content}>
                <View style={styles.textSection}>
                    <Text style={styles.title}>Face Recognition</Text>
                    <Text style={styles.description}>
                        Add a face recognition to make your account more secure.
                    </Text>
                </View>

                <View style={styles.graphicContainer}>
                    <View style={styles.circleOuter} />
                    <View style={styles.circleMiddle} />
                    <View style={styles.circleInner}>
                        <ScanFaceIcon size={moderateScale(64)} color="#FFFFFF" />
                    </View>
                </View>

                <View style={styles.footer}>
                    <PrimaryButton
                        title="Start"
                        onPress={handleStart}
                    />
                </View>
            </View>
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
        paddingHorizontal: '24@s',
        paddingTop: '32@vs',
    },
    textSection: {
        marginBottom: '48@vs',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '8@vs',
    },
    description: {
        fontSize: '14@ms',
        color: '#64748B',
        lineHeight: '22@ms',
    },
    graphicContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginBottom: '40@vs',
    },
    circleOuter: {
        position: 'absolute',
        width: '280@ms',
        height: '280@ms',
        borderRadius: '140@ms',
        backgroundColor: Colors.light.primary,
        opacity: 0.1,
    },
    circleMiddle: {
        position: 'absolute',
        width: '200@ms',
        height: '200@ms',
        borderRadius: '100@ms',
        backgroundColor: Colors.light.primary,
        opacity: 0.3, // Slightly darker
    },
    circleInner: {
        width: '120@ms',
        height: '120@ms',
        borderRadius: '60@ms',
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        marginBottom: '20@vs',
    },
});
