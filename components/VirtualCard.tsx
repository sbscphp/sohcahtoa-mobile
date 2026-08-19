import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Eye, EyeSlash } from 'iconsax-react-nativejs';
import Chip from '../assets/images/chip.svg';

interface VirtualCardProps {
    name: string;
    balance?: string; 
    last4Digits: string;
    expiry: string;
    initialHidden?: boolean;
}

const VisaLogo = () => (
    <Text style={styles.visaText}>VISA</Text>
);

const CardBackground = () => (
    <Svg style={StyleSheet.absoluteFillObject}>
        <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#bd7145ff" stopOpacity="1" />
                <Stop offset="40%" stopColor="#d4743dff" stopOpacity="1" />
                <Stop offset="100%" stopColor="#DF9457" stopOpacity="1" />
            </LinearGradient>

            <LinearGradient id="sheen" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grad)" />

        <Path
            d="M0,100 L100,60 L200,140 L0,140 Z"
            fill="white"
            fillOpacity="0.05"
        />
        <Path
            d="M150,0 C200,50 250,140 350,100 L350,0 Z"
            fill="white"
            fillOpacity="0.05"
        />
    </Svg>
);

const VirtualCard: React.FC<VirtualCardProps> = ({
    name,
    balance = "$...",
    last4Digits,
    expiry,
    initialHidden = false
}) => {
    const [isHidden, setIsHidden] = useState(initialHidden);

    return (
        <View style={styles.cardContainer}>
            <CardBackground />
            <View style={styles.content}>

                <View style={styles.topRow}>
                    <Chip />
                    <Text style={styles.prepaidText}>Prepaid card</Text>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity
                        onPress={() => setIsHidden(prev => !prev)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={{ marginRight: moderateScale(12) }}
                        accessibilityLabel={isHidden ? "Show card details" : "Hide card details"}
                    >
                        {isHidden ? (
                            <EyeSlash size={moderateScale(20)} color="#FFFFFF" />
                        ) : (
                            <Eye size={moderateScale(20)} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                    <VisaLogo />
                </View>
                <View style={styles.bottomSection}>
                    <View style={styles.detailsRow}>
                        <View style={styles.numberContainer}>
                            <View style={styles.dots}>
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                            </View>
                            <View style={[styles.dots, { marginLeft: 4 }]}>
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                            </View>
                            <View style={[styles.dots, { marginLeft: 4 }]}>
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                            </View>
                            <Text style={styles.cardNumber}>{isHidden ? '••••' : last4Digits}</Text>
                        </View>

                        <Text style={styles.balanceText}>{isHidden ? '••••' : balance}</Text>
                    </View>

                    <View style={styles.footerRow}>
                        <View style={styles.expiryContainer}>
                            <View>
                                <Text style={styles.validThruLabel}>VALID</Text>
                                <Text style={styles.validThruLabel}>THRU</Text>
                            </View>
                            <Text style={styles.expiryDate}>{isHidden ? '••/••' : expiry}</Text>
                        </View>
                        <Text style={styles.cardHolder}>{name}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = ScaledSheet.create({
    cardContainer: {
        width: '100%',
        aspectRatio: 1.586,
        borderRadius: '16@ms',
        overflow: 'hidden',
        position: 'relative',
    },
    content: {
        flex: 1,
        padding: '12@ms',
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    prepaidText: {
        color: '#FFFFFF',
        fontSize: '14@ms',
        marginLeft: '12@ms',
        fontWeight: '500',
    },
    chip: {
        width: '40@ms',
        height: '30@ms',
        backgroundColor: '#FCD34D',
        borderRadius: '4@ms',
        borderWidth: 1,
        borderColor: '#B45309',
        overflow: 'hidden',
        position: 'relative',
    },
    chipLineLeft: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '30%',
        width: 1,
        backgroundColor: '#B45309',
        opacity: 0.5,
    },
    chipLineRight: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: '30%',
        width: 1,
        backgroundColor: '#B45309',
        opacity: 0.5,
    },
    chipLineCenter: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#B45309',
        opacity: 0.5,
    },
    chipLineCenterVertical: {
        position: 'absolute',
        top: '20%',
        bottom: '20%',
        left: '50%',
        width: '30%',
        marginLeft: '-15%',
        borderWidth: 1,
        borderColor: '#B45309',
        borderRadius: 4,
        opacity: 0.5,
    },
    visaText: {
        color: '#FFFFFF',
        fontSize: '24@ms',
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: 1,
    },
    bottomSection: {
        gap: '12@vs',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    numberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '4@s',
    },
    dots: {
        flexDirection: 'row',
        gap: '2@s',
    },
    dot: {
        width: '6@ms',
        height: '6@ms',
        borderRadius: '3@ms',
        backgroundColor: '#FFFFFF',
    },
    cardNumber: {
        color: '#FFFFFF',
        fontSize: '16@ms',
        fontWeight: '500',
        fontFamily: 'Courier',
        marginLeft: '8@ms',
    },
    balanceText: {
        color: '#FFFFFF',
        fontSize: '16@ms',
        fontWeight: '600',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '25@vs',
    },
    expiryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8@s',
    },
    validThruLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '6@ms',
        lineHeight: '8@ms',
    },
    expiryDate: {
        color: '#FFFFFF',
        fontSize: '13@ms',
        fontWeight: '500',
    },
    cardHolder: {
        color: '#FFFFFF',
        fontSize: '13@ms',
        fontWeight: '500',
        textTransform: 'uppercase',
    },
});

export default VirtualCard;
