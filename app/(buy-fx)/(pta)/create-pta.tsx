import CurrencySelectionSheet from '@/components/CurrencySelectionSheet';
import FileUpload from '@/components/FileUpload';
import Header from '@/components/Header';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import InputField from '@/components/InputField';
import LocationSelectionSheet, { LocationItem } from '@/components/LocationSelectionSheet';
import PrimaryButton from '@/components/PrimaryButton';
import ProgressBar from '@/components/ProgressBar';
import { useRouter } from 'expo-router';
import { ArrowDown2, Calendar, Clock, Edit2 } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import SwapIcons from '../../../assets/icons/coins-swap.svg';
import LocationIcon from '../../../assets/icons/location-08.svg';


const STATES: LocationItem[] = [
    { id: '1', title: 'Lagos State' },
    { id: '2', title: 'Ogun State' },
    { id: '3', title: 'Rivers State' },
    { id: '4', title: 'Kaduna State' },
    { id: '5', title: 'Enugu State' },
    { id: '6', title: 'Kano State' },
];

const CITIES: LocationItem[] = [
    { id: '1', title: 'Ajeromi Local Government' },
    { id: '2', title: 'Agege Local Government' },
    { id: '3', title: 'Alimosho Local Government' },
    { id: '4', title: 'Amuwo Odofin Local Government' },
    { id: '5', title: 'Apapa Local Government' },
    { id: '6', title: 'Badagry Local Government' },
];

const LOCATIONS: LocationItem[] = [
    { id: '1', title: 'Ajeromi Local Government', subtitle: 'Femi Areola Street, Ikeja GRA.' },
    { id: '2', title: 'Agege Local Government', subtitle: 'Femi Areola Street, Ikeja GRA.' },
    { id: '3', title: 'Ikorodu Local Government', subtitle: '23 T.O.S Benson Avenue, Ikorodu.' },
    { id: '4', title: 'Festac Local Government', subtitle: '1st Avenue, Festac Town.' },
];

const getCurrencySymbol = (code: string) => {
    switch (code) {
        case 'USD': return '$';
        case 'NGN': return '₦';
        case 'GBP': return '£';
        case 'EUR': return '€';
        case 'GHS': return '₵';
        case 'KES': return 'KSh';
        case 'ZAR': return 'R';
        default: return code;
    }
};

export default function PersonalTravelAllowanceScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [currentStep, setCurrentStep] = useState(0);

    // Form States
    const [bvn, setBvn] = useState('');
    const [nin, setNin] = useState('');
    const [formAId, setFormAId] = useState('');
    const [passportNumber, setPassportNumber] = useState('');

    // Transaction State
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);

    const [currencyGet, setCurrencyGet] = useState({
        code: 'USD',
        country: 'United States',
        currencyName: 'Dollar',
        flagUrl: 'https://flagcdn.com/w80/us.png'
    });
    const [currencySend, setCurrencySend] = useState({
        code: 'NGN',
        country: 'Nigeria',
        currencyName: 'Naira',
        flagUrl: 'https://flagcdn.com/w80/ng.png'
    });
    const [activeCurrencyField, setActiveCurrencyField] = useState<'get' | 'send' | null>(null);

    // Location State
    const [selectedState, setSelectedState] = useState<LocationItem | null>(null);
    const [selectedCity, setSelectedCity] = useState<LocationItem | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);

    const [stateSheetVisible, setStateSheetVisible] = useState(false);
    const [citySheetVisible, setCitySheetVisible] = useState(false);
    const [locationSheetVisible, setLocationSheetVisible] = useState(false);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);

    const hasSelectedAll = selectedState && selectedCity;


    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            setInitiateSheetVisible(true);
        }
    };

    const handleConfirmInitiate = () => {
        console.log('Submit');
        setInitiateSheetVisible(false);
        router.push('/(buy-fx)/(pta)/request-initiated-success');
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.sectionTitle}>Enter all required credentials to proceed</Text>

                        <InputField
                            label="Bank Verification Number"
                            placeholder="Enter your BVN"
                            value={bvn}
                            onChangeText={setBvn}
                            required
                        />

                        <InputField
                            label="National Identification Number"
                            placeholder="Enter your NIN"
                            value={nin}
                            onChangeText={setNin}
                            required
                        />

                        <InputField
                            label="Form A ID"
                            placeholder="Enter form A ID"
                            value={formAId}
                            onChangeText={setFormAId}
                            required
                        />

                        <InputField
                            label="International Passport"
                            placeholder="Enter international passport"
                            value={passportNumber}
                            onChangeText={setPassportNumber}
                            required
                        />
                    </View>
                );
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.sectionTitle}>Upload Relevant Documents</Text>

                        {/* International Passport Upload */}
                        <Text style={styles.label}>International Passport <Text style={styles.required}>*</Text></Text>
                        <FileUpload onUpload={() => { }} />

                        {/* Int Passport Number */}
                        <View style={{ marginTop: moderateScale(0) }}>
                            <InputField
                                label="International Passport Number"
                                placeholder="Enter passport number"
                                required
                            />
                        </View>
                        <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
                            <View style={{ flex: 1 }}>
                                <InputField label='Passport Issue Date' required placeholder='dd/mm/yyyy' rightIcon={Calendar} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <InputField label='Passport Expiry Date' required placeholder='dd/mm/yyyy' rightIcon={Calendar} />
                            </View>
                        </View>

                        {/* Visa Section */}
                        <Text style={[styles.label, { marginTop: moderateScale(16) }]}>Valid Visa <Text style={styles.required}>*</Text></Text>
                        <FileUpload onUpload={() => { }} />

                        <View style={{ marginTop: moderateScale(0) }}>
                            <InputField
                                label="Valid Visa Number"
                                placeholder="Enter valid visa number"
                                required
                            />
                        </View>

                        {/* Return Ticket */}
                        <Text style={styles.label}>Return Ticket <Text style={styles.required}>*</Text></Text>
                        <FileUpload onUpload={() => { }} />

                        <View style={{ marginTop: moderateScale(0) }}>
                            <InputField
                                label="Return Ticket Number"
                                placeholder="Enter return ticket number"
                                required
                            />
                        </View>
                    </View>
                );
            case 2:

                const isBuy = transactionType === 'buy';

                const handleGetCurrencyPress = () => {
                    setActiveCurrencyField('get');
                    setCurrencySheetVisible(true);
                };
                const handleSendCurrencyPress = () => {
                    setActiveCurrencyField('send');
                    setCurrencySheetVisible(true);
                };

                const handleToggle = (type: 'buy' | 'sell') => {
                    if (type !== transactionType) {
                        setTransactionType(type);
                    }
                };

                const handleSwap = () => {
                    const temp = currencyGet;
                    setCurrencyGet(currencySend);
                    setCurrencySend(temp);
                };

                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.sectionTitle}>How much do you want exchange?</Text>
                        <View style={{ backgroundColor: 'rgba(241, 241, 241, 1)', padding: moderateScale(8), borderRadius: moderateScale(16) }}>
                            <View style={styles.toggleContainer}>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, isBuy && styles.toggleBtnActive]}
                                    onPress={() => handleToggle('buy')}
                                >
                                    <Text style={isBuy ? styles.toggleTextActive : styles.toggleText}>Buy FX</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, !isBuy && styles.toggleBtnActive]}
                                    onPress={() => handleToggle('sell')}
                                >
                                    <Text style={!isBuy ? styles.toggleTextActive : styles.toggleText}>Sell FX</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.exchangeCard}>
                                <View style={styles.exchangeRow}>
                                    <Text style={styles.exchangeLabel}>You Get Exactly</Text>
                                    <TouchableOpacity
                                        style={styles.currencyPill}
                                        onPress={handleGetCurrencyPress}
                                    >
                                        <Image source={{ uri: currencyGet.flagUrl }} style={styles.flag} />
                                        <Text style={styles.currencyPillText}>{currencyGet.code}</Text>
                                        <ArrowDown2 size={moderateScale(16)} color="#292D32" />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ marginVertical: -30 }}>
                                    <InputField label='' value={`${getCurrencySymbol(currencyGet.code)} 1`} />
                                </View>
                            </View>
                        </View>

                        <View style={{ alignItems: 'center', marginVertical: -12, zIndex: 10 }} pointerEvents="box-none">
                            <TouchableOpacity style={styles.swapIconCircle} onPress={handleSwap} activeOpacity={0.8}>
                                <SwapIcons width={moderateScale(24)} height={moderateScale(24)} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.exchangeCard}>
                            <View style={styles.exchangeRow}>
                                <Text style={styles.exchangeLabel}>What you send</Text>
                                <TouchableOpacity
                                    style={styles.currencyPill}
                                    onPress={handleSendCurrencyPress}
                                >
                                    <Image source={{ uri: currencySend.flagUrl }} style={styles.flag} />
                                    <Text style={styles.currencyPillText}>{currencySend.code}</Text>
                                    <ArrowDown2 size={moderateScale(16)} color="#292D32" />
                                </TouchableOpacity>
                            </View>
                            <View style={{ marginVertical: -30 }}>
                                <InputField label='' value={`${getCurrencySymbol(currencySend.code)} 1,500`} />
                            </View>

                            <View style={styles.rateInfo}>
                                <Text style={styles.rateLabel}>Exchange Rate</Text>
                                <Text style={styles.rateValue}>1 {currencyGet.code} = 1500 {currencySend.code}</Text>
                            </View>
                        </View>

                        <CurrencySelectionSheet
                            visible={currencySheetVisible}
                            onClose={() => setCurrencySheetVisible(false)}
                            onSelect={(curr) => {
                                if (activeCurrencyField === 'get') {
                                    setCurrencyGet(curr);
                                } else if (activeCurrencyField === 'send') {
                                    setCurrencySend(curr);
                                }
                            }}
                            selectedCurrency={activeCurrencyField === 'get' ? currencyGet.code : currencySend.code}
                        />

                    </View>
                );
            case 3:

                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.sectionTitle}>Where would you like to pick up your card and cash?</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>State <Text style={styles.required}>*</Text></Text>
                            <TouchableOpacity style={styles.dropdownInput} >
                                <Text style={[styles.dropdownPlaceholder, selectedState && styles.dropdownSelectedText]}>
                                    {selectedState ? selectedState.title : 'Select an Option'}
                                </Text>
                                <ArrowDown2 size={moderateScale(20)} color="#64748B" onPress={() => setStateSheetVisible(true)} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Select a City <Text style={styles.required}>*</Text></Text>
                            <TouchableOpacity style={styles.dropdownInput} disabled={!selectedState}>
                                <Text style={[styles.dropdownPlaceholder, selectedCity && styles.dropdownSelectedText]}>
                                    {selectedCity ? selectedCity.title : 'Select an Option'}
                                </Text>
                                <ArrowDown2 size={moderateScale(20)} color="#64748B" onPress={() => setCitySheetVisible(true)} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
                            <View style={{ flex: 1 }}>
                                <InputField label='Pick-up Date' required placeholder='dd/mm/yyyy' rightIcon={Calendar} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <InputField label='Pick-up Time' required placeholder='hh:mm:ss' rightIcon={Clock} />
                            </View>
                        </View>

                        {!selectedLocation ? (
                            hasSelectedAll ? (
                                <TouchableOpacity
                                    style={[styles.emptyStateBox, { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: moderateScale(16), alignItems: 'center' }]}
                                    onPress={() => setLocationSheetVisible(true)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) }}>
                                        <View style={styles.iconCircle}>
                                            <LocationIcon color="#64748B" width={moderateScale(24)} height={moderateScale(24)} />
                                        </View>
                                        <View>
                                            <Text style={styles.emptyStateTitle}>{LOCATIONS.length} Pickup Points Available</Text>
                                            <Text style={styles.emptyStateText}>Select an option</Text>
                                        </View>
                                    </View>
                                    <ArrowDown2 size={moderateScale(20)} color="#64748B" />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.emptyStateBox, { justifyContent: 'center' }]}
                                    activeOpacity={1}
                                >
                                    <View style={styles.iconCircle}>
                                        <LocationIcon color="#64748B" width={moderateScale(26)} height={moderateScale(26)} />
                                    </View>
                                    <Text style={styles.emptyStateTitle}>No Option Available</Text>
                                    <Text style={styles.emptyStateText}>Select a State & City to see available option(s)</Text>
                                </TouchableOpacity>
                            )
                        ) : (
                            <TouchableOpacity
                                style={[styles.emptyStateBox, { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: moderateScale(16), alignItems: 'center' }]}
                                onPress={() => setLocationSheetVisible(true)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) }}>
                                    <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED' }]}>
                                        <LocationIcon color="#FF6B2C" width={moderateScale(24)} height={moderateScale(24)} />
                                    </View>
                                    <View>
                                        <Text style={styles.emptyStateTitle}>{selectedLocation.title}</Text>
                                        <Text style={styles.emptyStateText}>Pickup & Card Pickup from</Text>
                                    </View>
                                </View>
                                <Edit2 size={moderateScale(20)} color="#64748B" />
                            </TouchableOpacity>
                        )}

                        <LocationSelectionSheet
                            visible={stateSheetVisible}
                            onClose={() => setStateSheetVisible(false)}
                            title="Select State"
                            data={STATES}
                            onSelect={(item) => {
                                setSelectedState(item);
                                setSelectedCity(null);
                                setSelectedLocation(null);
                            }}
                            selectedId={selectedState?.id}
                        />

                        <LocationSelectionSheet
                            visible={citySheetVisible}
                            onClose={() => setCitySheetVisible(false)}
                            title="Choose a City"
                            data={CITIES}
                            onSelect={(item) => {
                                setSelectedCity(item);
                                setSelectedLocation(null);
                            }}
                            selectedId={selectedCity?.id}
                        />

                        <LocationSelectionSheet
                            visible={locationSheetVisible}
                            onClose={() => setLocationSheetVisible(false)}
                            title="Choose Pickup Location"
                            data={LOCATIONS}
                            onSelect={(item) => {
                                setSelectedLocation(item)
                            }}
                            selectedId={selectedLocation?.id}
                        />

                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="Personal Travel Allowance" onBackPress={handleBack} />

            <View style={{ paddingHorizontal: moderateScale(20) }}>
                <ProgressBar progress={(currentStep + 1) / 4} totalSteps={4} />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    {renderStepContent()}
                </KeyboardAvoidingView>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + moderateScale(10) }]}>
                <PrimaryButton title={currentStep === 3 ? hasSelectedAll ? "Initiate Transaction Request" : "Continue" : "Continue"} onPress={handleNext} />
            </View>

            <InitiateTransactionSheet
                visible={initiateSheetVisible}
                onClose={() => setInitiateSheetVisible(false)}
                onConfirm={handleConfirmInitiate}
            />
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: '20@s',
        paddingBottom: '100@vs',
    },
    stepContainer: {
        gap: '4@vs',
    },
    sectionTitle: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '16@vs',
    },
    inputGroup: {
        marginBottom: '16@vs',
        gap: '6@vs',
    },
    label: {
        fontSize: '15@ms',
        color: '#475569',
        marginBottom: '6@vs',
    },
    required: {
        color: '#EF4444',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: '12@ms',
        paddingHorizontal: '16@s',
        paddingVertical: '12@vs',
        fontSize: '14@ms',
        color: '#0F172A',
        backgroundColor: '#FFFFFF',
    },
    inputIconWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: '12@ms',
        paddingHorizontal: '16@s',
        paddingVertical: '2@vs',
        backgroundColor: '#FFFFFF',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: '20@s',
        paddingTop: '10@vs',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    continueBtn: {
        backgroundColor: '#FFD7C5',
        paddingVertical: '16@vs',
        borderRadius: '30@ms',
        alignItems: 'center',
    },
    continueBtnText: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#FFFFFF',
    },

    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(143, 139, 139, 1)',
        borderRadius: '30@ms',
        padding: '4@ms',
        marginBottom: '6@vs',
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: '6@vs',
        alignItems: 'center',
        borderRadius: '24@ms',
    },
    toggleBtnActive: {
        backgroundColor: '#0F172A',
    },
    toggleText: {
        fontSize: '14@ms',
        color: '#64748B',
        fontWeight: '500',
    },
    toggleTextActive: {
        fontSize: '14@ms',
        color: '#FFFFFF',
        fontWeight: '600',
    },
    exchangeCard: {
        backgroundColor: 'rgba(241, 241, 241, 1)',
        padding: '10@ms',
        borderRadius: '16@ms',
        gap: '12@vs',
    },
    exchangeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exchangeLabel: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: 'rgba(50, 49, 49, 1)',
        marginBottom: '10@vs',
    },
    currencyPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: '8@s',
        paddingVertical: '10@vs',
        borderRadius: '30@ms',
        gap: '6@s',
    },
    flag: {
        width: '20@ms',
        height: '20@ms',
        borderRadius: '10@ms',
    },
    currencyPillText: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    exchangeInput: {
        fontSize: '20@ms',
        fontWeight: '600',
        color: '#0F172A',
        backgroundColor: '#FFFFFF',
        padding: '12@ms',
        borderRadius: '12@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    swapIconCircle: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '20@ms',
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    swapIcon: {
        width: 10,
        height: 10,
        backgroundColor: 'white',
    },
    rateInfo: {
        backgroundColor: '#0F172A',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '16@ms',
        borderRadius: '12@ms',
        marginTop: '10@vs',
    },
    rateLabel: {
        color: '#ffffffff',
        fontSize: '14@ms',
    },
    rateValue: {
        color: '#FFFFFF',
        fontSize: '14@ms',
        fontWeight: '600',
    },

    dropdownInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(143, 139, 139, 1)',
        borderRadius: '30@ms',
        paddingHorizontal: '16@s',
        paddingVertical: '12@vs',
        backgroundColor: '#FFFFFF',
    },
    dropdownPlaceholder: {
        fontSize: '14@ms',
        color: '#94A3B8',
    },
    dropdownSelectedText: {
        color: '#0F172A',
        fontWeight: '500',
    },
    emptyStateBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: '16@ms',
        padding: '22@ms',
        alignItems: 'center',
        gap: '8@vs',
        height: '100@vs',
        justifyContent: 'center',
    },
    emptyStateTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        // marginVertical: '2@vs',
    },
    emptyStateText: {
        fontSize: '13@ms',
        color: '#64748B',
        // textAlign: 'center',
    },
    iconCircle: {
        width: '48@ms',
        height: '48@ms',
        borderRadius: '24@ms',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
