import Header from '@/components/Header';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import ProgressBar from '@/components/ProgressBar';
import { useRouter } from 'expo-router';
import { InfoCircle, MoneyRecive } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

// Placeholder icons since we don't have the exact SVGs
const MoneyGramIcon = () => (
    <View style={styles.iconPlaceholderRed}>
        <MoneyRecive size={moderateScale(18)} color="#FFFFFF" variant="Bold" />
    </View>
);

const WesternUnionIcon = () => (
    <View style={styles.iconPlaceholderYellow}>
        <Text style={styles.iconTextBlack}>W</Text>
    </View>
);

export default function ImtoScreen() {
    const [selectedImto, setSelectedImto] = useState<'moneygram' | 'western_union' | null>(null);
    const [referenceNumber, setReferenceNumber] = useState('');
    const [senderName, setSenderName] = useState('');

    // Mock error state for demonstration as per design (Image 3)
    const [showError, setShowError] = useState(false);

    const router = useRouter();

    const handleValidate = () => {
        if (referenceNumber === '4585776465353') {
            setShowError(true);
        } else if (referenceNumber === 'FAILURE') {
            router.push({
                pathname: '/(receive-fx)/verification-result',
                params: {
                    status: 'not-verified',
                    reference: referenceNumber,
                    senderName: senderName
                }
            });
        } else {
            setShowError(false);
            router.push({
                pathname: '/(receive-fx)/verification-result',
                params: {
                    status: 'verified',
                    reference: referenceNumber,
                    senderName: senderName
                }
            });
        }
    };

    const isFormValid = selectedImto && referenceNumber.length > 0 && senderName.length > 0;

    return (
        <View style={styles.container}>
            <Header title="Receive Funds: IMTO" />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ProgressBar step={1} totalSteps={6} />

                <Text style={styles.sectionTitle}>
                    How would you like to receive your funds?
                </Text>

                <View style={styles.infoBanner}>
                    <InfoCircle size={moderateScale(20)} color="#F97316" variant="Bold" />
                    <Text style={styles.infoText}>
                        Maximum USD cash pickup is <Text style={{ fontWeight: '700' }}>$500</Text>
                    </Text>
                </View>

                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.optionCard,
                            selectedImto === 'moneygram' && styles.optionCardSelected
                        ]}
                        onPress={() => setSelectedImto('moneygram')}
                        activeOpacity={0.8}
                    >
                        <MoneyGramIcon />
                        <Text style={styles.optionText}>MoneyGram</Text>
                    </TouchableOpacity>

                    {selectedImto === 'moneygram' && (
                        <View style={styles.formContainer}>
                            <InputField
                                label="Reference Number"
                                placeholder="Enter Reference Number"
                                value={referenceNumber}
                                onChangeText={(text) => {
                                    setReferenceNumber(text);
                                    setShowError(false);
                                }}
                                required
                                wrapperStyle={showError ? styles.inputError : {}}
                            />
                            {showError && (
                                <Text style={styles.errorText}>
                                    The reference ID provided is incorrect. Please try again later
                                </Text>
                            )}

                            <View style={{ height: moderateScale(16) }} />

                            <InputField
                                label="Sender’s Name"
                                placeholder="Enter Sender’s Name"
                                value={senderName}
                                onChangeText={setSenderName}
                                required
                            />
                        </View>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.optionCard,
                            selectedImto === 'western_union' && styles.optionCardSelected
                        ]}
                        onPress={() => setSelectedImto('western_union')}
                        activeOpacity={0.8}
                    >
                        <WesternUnionIcon />
                        <Text style={styles.optionText}>Western Union</Text>
                    </TouchableOpacity>

                    {selectedImto === 'western_union' && (
                        <View style={styles.formContainer}>
                            <InputField
                                label="MTCN"
                                placeholder="Enter MTCN"
                                value={referenceNumber}
                                onChangeText={setReferenceNumber}
                                required
                            />
                            <View style={{ height: moderateScale(16) }} />
                            <InputField
                                label="Sender’s Name"
                                placeholder="Enter Sender’s Name"
                                value={senderName}
                                onChangeText={setSenderName}
                                required
                            />
                        </View>
                    )}

                </View>


            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Validate"
                    onPress={handleValidate}
                    disabled={!isFormValid}
                />
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: '40@vs',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: '20@ms',
        paddingTop: '16@vs',
        paddingBottom: '100@vs',
    },
    sectionTitle: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginTop: '24@vs',
        marginBottom: '16@vs',
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#94A3B8',
        borderRadius: '8@ms',
        padding: '12@ms',
        gap: '12@s',
        marginBottom: '24@vs',
    },
    infoText: {
        fontSize: '13@ms',
        color: '#64748B',
        flex: 1,
    },
    optionsContainer: {
        gap: '16@vs',
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16@ms',
        borderWidth: 1,
        borderColor: '#F1F5F9', // Default border
        borderRadius: '16@ms',
        backgroundColor: '#FFFFFF',
        gap: '12@s',
        shadowColor: 'rgba(0, 0, 0, 0.02)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
    },
    optionCardSelected: {
        borderColor: '#F97316', // Orange border
        borderWidth: 1.5,
    },
    optionText: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#334155',
    },
    iconPlaceholderRed: {
        width: '32@ms',
        height: '32@ms',
        borderRadius: '16@ms',
        backgroundColor: '#DC2626',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconPlaceholderYellow: {
        width: '32@ms',
        height: '32@ms',
        borderRadius: '4@ms', // Square-ish
        backgroundColor: '#FACC15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconTextBlack: {
        color: '#000000',
        fontWeight: '900',
        fontSize: '18@ms',
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: '16@ms',
        padding: '16@ms',
        // marginTop: '-8@vs', // Slight overlap look or just closer
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20@ms',
        paddingBottom: '30@vs',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        color: '#EF4444',
        fontSize: '12@ms',
        marginTop: '8@vs',
    }
});
