import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Camera, ScanFaceIcon } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../constants/theme';

export default function FaceCaptureScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const handleCapture = async () => {
        if (!cameraRef.current) return;

        try {
            setIsCapturing(true);
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
            });

            if (photo) {
                setCapturedImage(photo.uri);
            }
        } catch (error) {
            console.error('Error capturing photo:', error);
        } finally {
            setIsCapturing(false);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
    };

    const handleContinue = () => {
        // In a real app, you would upload the image here
        console.log('Face captured:', capturedImage);
        router.push('/(tabs)');
    };

    const handleCancel = () => {
        router.back();
    };

    // Permission not determined yet
    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    // Permission denied
    if (!permission.granted) {
        return (
            <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <View style={styles.permissionContainer}>
                    <Camera size={moderateScale(64)} color={Colors.light.primary} />
                    <Text style={styles.permissionTitle}>Camera Permission Required</Text>
                    <Text style={styles.permissionText}>
                        We need access to your camera to capture your face for biometric authentication.
                    </Text>
                    <PrimaryButton
                        title="Grant Permission"
                        onPress={requestPermission}
                        style={styles.permissionButton}
                    />
                    <TouchableOpacity onPress={handleCancel}>
                        <Text style={styles.cancelLinkText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Show captured image preview
    if (capturedImage) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <Image source={{ uri: capturedImage }} style={styles.previewImage} />

                <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                    <View style={styles.previewHeader}>
                        <Text style={styles.previewTitle}>Face Captured Successfully!</Text>
                        <Text style={styles.previewSubtitle}>Review your photo below</Text>
                    </View>

                    <View style={styles.footer}>
                        <PrimaryButton
                            title="Continue"
                            onPress={handleContinue}
                            style={styles.continueButton}
                            textStyle={{ color: '#FFFFFF' }}
                        />

                        <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                            <Text style={styles.retakeText}>Retake Photo</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    // Show camera view
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="front"
            >
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
                            Position your face within the frame
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <PrimaryButton
                            title={isCapturing ? "Capturing..." : "Capture Face"}
                            onPress={handleCapture}
                            disabled={isCapturing}
                            style={styles.continueButton}
                            textStyle={{ color: '#FFFFFF' }}
                        />

                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    camera: {
        flex: 1,
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
    instructionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '32@vs',
        paddingHorizontal: '20@s',
        gap: '12@s',
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
        height: '45@vs',
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
    retakeButton: {
        height: '45@vs',
        borderRadius: '28@ms',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    retakeText: {
        color: '#FFFFFF',
        fontSize: '14@ms',
        fontWeight: '500',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: '32@s',
        gap: '16@vs',
    },
    permissionTitle: {
        fontSize: '20@ms',
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: '16@vs',
    },
    permissionText: {
        fontSize: '14@ms',
        color: '#CBD5E1',
        textAlign: 'center',
        lineHeight: '20@ms',
    },
    permissionButton: {
        marginTop: '16@vs',
        width: '100%',
    },
    cancelLinkText: {
        fontSize: '14@ms',
        color: Colors.light.primary,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    previewHeader: {
        alignItems: 'center',
        marginTop: '40@vs',
        gap: '8@vs',
    },
    previewTitle: {
        fontSize: '20@ms',
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    previewSubtitle: {
        fontSize: '14@ms',
        color: '#CBD5E1',
        textAlign: 'center',
    },
});
