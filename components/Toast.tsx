import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface ToastProps {
    visible: boolean;
    message: string;
    onDismiss?: () => void;
    type?: 'success' | 'error' | 'warning';
    persistent?: boolean;
}

const Toast: React.FC<ToastProps> = ({ visible, message, onDismiss, type = 'success', persistent = false }) => {
    const [show, setShow] = React.useState(visible);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        if (visible) {
            setShow(true);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 5,
                    useNativeDriver: true,
                }),
            ]).start();

            if (onDismiss && !persistent) {
                const timer = setTimeout(() => {
                    onDismiss();
                }, 3000);
                return () => clearTimeout(timer);
            }
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: -20,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setShow(false);
            });
        }
    }, [visible, onDismiss]);

    if (!show) return null;

    const config = {
        success: {
            backgroundColor: '#10B981', // Emerald 500
            stripColor: '#047857',      // Emerald 700
            icon: 'checkmark-sharp' as keyof typeof Ionicons.glyphMap,
        },
        error: {
            backgroundColor: '#EF4444', // Red 500
            stripColor: '#B91C1C',      // Red 700
            icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
        },
        warning: {
            backgroundColor: '#F59E0B', // Amber 500
            stripColor: '#B45309',      // Amber 700
            icon: 'warning' as keyof typeof Ionicons.glyphMap,
        },
    };

    const activeConfig = config[type] || config.success;

    return (
        <Animated.View
            style={[
                styles.container,
                { opacity: fadeAnim, transform: [{ translateY }], backgroundColor: activeConfig.backgroundColor },
            ]}
        >
            {/* Dark Left Strip */}
            <View style={[styles.leftStrip, { backgroundColor: activeConfig.stripColor }]} />

            <View style={styles.contentContainer}>
                {/* Icon Container */}
                <View style={styles.iconContainer}>
                    <Ionicons name={activeConfig.icon} size={moderateScale(16)} color="#FFFFFF" />
                </View>

                {/* Message */}
                <Text style={styles.messageText}>{message}</Text>

                {/* Close Button */}
                {(persistent || onDismiss) && (
                    <TouchableOpacity 
                        onPress={onDismiss} 
                        style={styles.closeButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={moderateScale(20)} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
};

const styles = ScaledSheet.create({
    container: {
        position: 'absolute',
        top: '60@vs', // Adjust based on safe area or header height
        left: '20@s',
        right: '20@s',
        backgroundColor: '#10B981', // Emerald 500
        borderRadius: '8@ms',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        overflow: 'hidden', // Ensures strip stays within rounded corners
        zIndex: 9999,
        minHeight: '56@vs',
    },
    leftStrip: {
        width: '6@s',
        backgroundColor: '#047857', // Emerald 700
        height: '100%',
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '12@s',
        paddingVertical: '12@vs',
    },
    iconContainer: {
        width: '28@ms',
        height: '28@ms',
        borderRadius: '8@ms',
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '12@s',
    },
    messageText: {
        flex: 1,
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#FFFFFF',
        marginRight: '8@s',
    },
    closeButton: {
        padding: '4@ms',
        marginLeft: '4@s',
        borderRadius: '12@ms',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
});

export default Toast;
