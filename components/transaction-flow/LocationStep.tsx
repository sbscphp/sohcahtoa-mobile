import DatePickerField from '@/components/DatePickerField';
import LocationSelectionSheet from '@/components/LocationSelectionSheet';
import { LocationItem } from '@/utils/locations';
import TimePickerField from '@/components/TimePickerField';
import { ArrowDown2, Edit2 } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import LocationIcon from '../../assets/icons/location-08.svg';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useResponsiveInputHeight } from '@/hooks/useDevicePose';

interface LocationStepProps {
    states: LocationItem[];
    cities: LocationItem[];
    locations: LocationItem[];

    selectedState: LocationItem | null;
    onSelectState: (state: LocationItem) => void;

    selectedCity: LocationItem | null;
    onSelectCity: (city: LocationItem) => void;

    selectedLocation: LocationItem | null;
    onSelectLocation: (location: LocationItem) => void;

    pickupDate?: string;
    onPickupDateChange?: (date: string) => void;

    pickupTime?: string;
    onPickupTimeChange?: (time: string) => void;

    errors?: {
        state?: string;
        city?: string;
        location?: string;
        pickupDate?: string;
        pickupTime?: string;
    };
    title?: string;
}

export default function LocationStep({
    states,
    cities,
    locations,
    selectedState,
    onSelectState,
    selectedCity,
    onSelectCity,
    selectedLocation,
    onSelectLocation,
    pickupDate = '',
    onPickupDateChange = () => { },
    pickupTime = '',
    onPickupTimeChange = () => { },
    errors,
    title = "Where would you like to pick up your card and cash?"
}: LocationStepProps) {
    const { colors, isDark } = useAppTheme();
    const inputHeight = useResponsiveInputHeight(40, 50, 49);
    const [stateSheetVisible, setStateSheetVisible] = useState(false);
    const [citySheetVisible, setCitySheetVisible] = useState(false);
    const [locationSheetVisible, setLocationSheetVisible] = useState(false);

    const hasSelectedStateAndCity = selectedState && selectedCity;
  

    // console.log("LOCATIONS =>", locations)
    // console.log("STATES =>", states)
    // console.log("CITIES =>", cities)
    // console.log("SELECTEDSTATE =>", selectedState)
    // console.log("SELECTEDCITY =>", selectedCity)
    // console.log("SELECTEDLOCATION =>", selectedLocation)
    // console.log("ERRORS =>", errors)
    // console.log("TITLE =>", title)


    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>State <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity style={[styles.dropdownInput, { height: inputHeight, borderColor: isDark ? colors.border : 'rgba(143, 139, 139, 1)' }, errors?.state ? styles.dropdownError : undefined]} onPress={() => setStateSheetVisible(true)}>
                    <Text style={[styles.dropdownPlaceholder, { color: colors.textMuted }, selectedState && [styles.dropdownSelectedText, { color: colors.text }]]}>
                        {selectedState ? selectedState.title : 'Select an Option'}
                    </Text>
                    <ArrowDown2 size={moderateScale(20)} color={colors.icon} />
                </TouchableOpacity>
                {errors?.state && <Text style={styles.errorText}>{errors.state}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Select a City <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                    style={[styles.dropdownInput, { height: inputHeight, borderColor: isDark ? colors.border : 'rgba(143, 139, 139, 1)' }, !selectedState && { backgroundColor: isDark ? colors.surfaceHighlight : '#F1F5F9' }, errors?.city ? styles.dropdownError : undefined]}
                    disabled={!selectedState}
                    onPress={() => setCitySheetVisible(true)}
                >
                    <Text style={[styles.dropdownPlaceholder, { color: colors.textMuted }, selectedCity && [styles.dropdownSelectedText, { color: colors.text }]]}>
                        {selectedCity ? selectedCity.title : 'Select an Option'}
                    </Text>
                    <ArrowDown2 size={moderateScale(20)} color={colors.icon} />
                </TouchableOpacity>
                {errors?.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>

            <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
                <View style={{ flex: 1 }}>
                    <DatePickerField
                        label='Pickup Date'
                        value={pickupDate}
                        onDateChange={onPickupDateChange}
                        required
                        minimumDate={new Date()}
                        error={errors?.pickupDate}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <TimePickerField
                        label='Pickup Time'
                        value={pickupTime}
                        onTimeChange={onPickupTimeChange}
                        required
                        error={errors?.pickupTime}
                        pickupDate={pickupDate}
                    />
                </View>
            </View>

            {!selectedLocation ? (
                hasSelectedStateAndCity ? (
                    <TouchableOpacity
                        style={[
                            styles.emptyStateBox,
                            {
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingHorizontal: moderateScale(16),
                                alignItems: 'center',
                                backgroundColor: isDark ? colors.surface : '#F8FAFC',
                                borderColor: colors.border,
                                borderWidth: isDark ? 1 : 0,
                            },
                            errors?.location ? styles.dropdownError : undefined
                        ]}
                        onPress={() => setLocationSheetVisible(true)}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) }}>
                            <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
                                <LocationIcon color={colors.textMuted} width={moderateScale(24)} height={moderateScale(24)} />
                            </View>
                            <View>
                                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>{locations.length} Pickup Points Available</Text>
                                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Select an option</Text>
                            </View>
                        </View>
                        <ArrowDown2 size={moderateScale(20)} color={colors.icon} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.emptyStateBox,
                            {
                                justifyContent: 'center',
                                backgroundColor: isDark ? colors.surface : '#F8FAFC',
                                borderColor: colors.border,
                                borderWidth: isDark ? 1 : 0,
                            }
                        ]}
                        activeOpacity={1}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
                            <LocationIcon color={colors.textMuted} width={moderateScale(26)} height={moderateScale(26)} />
                        </View>
                        <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Option Available</Text>
                        <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Select a State & City to see available option(s)</Text>
                    </TouchableOpacity>
                )
            ) : (
                <TouchableOpacity
                    style={[
                        styles.emptyStateBox,
                        {
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingHorizontal: moderateScale(16),
                            alignItems: 'center',
                            backgroundColor: isDark ? colors.surface : '#F8FAFC',
                            borderColor: colors.border,
                            borderWidth: isDark ? 1 : 0,
                        }
                    ]}
                    onPress={() => setLocationSheetVisible(true)}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) }}>
                        <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255, 107, 44, 0.15)' : '#FFF7ED' }]}>
                            <LocationIcon color="#FF6B2C" width={moderateScale(24)} height={moderateScale(24)} />
                        </View>
                        <View>
                            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>{selectedLocation.title}</Text>
                            <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Pickup & Card Pickup from</Text>
                        </View>
                    </View>
                    <Edit2 size={moderateScale(20)} color={colors.icon} />
                </TouchableOpacity>
            )}
            {errors?.location && <Text style={styles.errorText}>{errors.location}</Text>}

            <LocationSelectionSheet
                visible={stateSheetVisible}
                onClose={() => setStateSheetVisible(false)}
                title="Select State"
                data={states}
                onSelect={(item) => {
                    onSelectState(item);
                    setStateSheetVisible(false);
                }}
                selectedId={selectedState?.id}
            />

            <LocationSelectionSheet
                visible={citySheetVisible}
                onClose={() => setCitySheetVisible(false)}
                title="Choose a City"
                data={cities}
                onSelect={(item) => {
                    onSelectCity(item);
                    setCitySheetVisible(false);
                }}
                selectedId={selectedCity?.id}
            />

            <LocationSelectionSheet
                visible={locationSheetVisible}
                onClose={() => setLocationSheetVisible(false)}
                title="Choose Pickup Location"
                data={locations}
                onSelect={(item) => {
                    onSelectLocation(item);
                    setLocationSheetVisible(false);
                }}
                selectedId={selectedLocation?.id}
            />
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        gap: '4@vs',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '16@vs',
    },
    inputGroup: {
        marginBottom: '16@vs',
    },
    label: {
        fontSize: '12.5@ms',
        fontWeight: '400',
        color: '#475569',
        marginBottom: '8@vs',
    },
    required: {
        color: '#EF4444',
    },
    dropdownInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(143, 139, 139, 1)',
        borderRadius: '28@ms',
        paddingHorizontal: '14@s',
        backgroundColor: 'transparent',
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
        minHeight: '100@vs',
        justifyContent: 'center',
        marginTop: '12@vs',
    },
    emptyStateTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    emptyStateText: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    iconCircle: {
        width: '48@ms',
        height: '48@ms',
        borderRadius: '24@ms',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: '11@ms',
        color: '#EF4444',
        marginTop: '4@vs',
        marginLeft: '4@s',
    },
    dropdownError: {
        borderColor: '#EF4444',
    },
});
