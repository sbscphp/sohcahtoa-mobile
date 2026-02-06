import { useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../constants/theme';
import { ScanFaceIcon } from 'lucide-react-native';

export default function FaceCaptureScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleContinue = () => {
        router.push('/(tabs)');
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                {/* Frame Overlay */}
                <View style={styles.frameContainer}>
                    {/* Top Left Corner */}
                    <View style={[styles.corner, styles.topLeft]} />
                    {/* Top Right Corner */}
                    <View style={[styles.corner, styles.topRight]} />
                    {/* Bottom Left Corner */}
                    <View style={[styles.corner, styles.bottomLeft]} />
                    {/* Bottom Right Corner */}
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>

                <View style={styles.instructionContainer}>
                    <ScanFaceIcon size={moderateScale(32)} color="#FFFFFF" /> 

                    <Text style={styles.instructionText}>
                        Kindly position your face to your device camera for capturing.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <PrimaryButton
                        title="Continue"
                        onPress={handleContinue}
                        style={styles.continueButton}
                        textStyle={{ color: '#FFFFFF' }}
                    />

                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    cameraImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'space-between',
        paddingHorizontal: '24@s',
    },
    frameContainer: {
        flex: 1,
        aspectRatio: 0.8,
        alignSelf: 'center',
        marginTop: '40@vs',
        marginBottom: '40@vs',
        maxWidth: 400,
        maxHeight: 400,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    corner: {
        position: 'absolute',
        width: '80@ms',
        height: '80@ms',
        borderColor: Colors.light.primary,
        borderWidth: 9,
        borderTopLeftRadius: '20@ms',
        borderTopRightRadius: '20@ms',
        borderBottomLeftRadius: '20@ms',
        borderBottomRightRadius: '20@ms',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    scanHint: {
        // Optional inner content
    },
    instructionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '32@vs',
        paddingHorizontal: '20@s',
    },
    scanIcon: {
        marginBottom: '16@vs',
    },
    instructionText: {
        color: '#FFFFFF',
        fontSize: '14@ms',
        textAlign: 'center',
        lineHeight: '20@ms',
    },
    footer: {
        gap: '16@vs',
        marginBottom: '20@vs',
    },
    continueButton: {
        backgroundColor: Colors.light.primary,
    },
    cancelButton: {
        height: '40@vs',
        borderRadius: '28@ms',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    cancelText: {
        color: '#0F172A',
        fontSize: '14@ms',
        fontWeight: '500',
    },
});
