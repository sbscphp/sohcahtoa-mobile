import { SearchNormal1 } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { LocationItem } from '@/utils/locations';
import LocationIcon from '../assets/icons/location-08.svg';
import PrimaryButton from './PrimaryButton';
import { AnimatedBottomSheet } from './ui/AnimatedBottomSheet';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useResponsiveInputHeight } from '@/hooks/useDevicePose';

interface LocationSelectionSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (item: LocationItem) => void;
    title: string;
    placeholder?: string;
    data: LocationItem[];
    selectedId?: string;
    icon?: React.ReactNode;
    iconSize?: number;
    iconColor?: string;
    sheetStyle?: StyleProp<ViewStyle>;
}

const LocationSelectionSheet: React.FC<LocationSelectionSheetProps> = ({
    visible,
    onClose,
    onSelect,
    title,
    placeholder = "Enter key word",
    data,
    selectedId,
    icon,
    iconSize,
    iconColor,
    sheetStyle
}) => {
    const { colors, isDark } = useAppTheme();
    const insets = useSafeAreaInsets();
    const searchHeight = useResponsiveInputHeight(40, 50, 49);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = data.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderItem = ({ item }: { item: LocationItem }) => {
        const isSelected = selectedId === item.id;
        return (
            <TouchableOpacity
                style={[
                    styles.itemContainer,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isSelected && [
                        styles.itemContainerSelected,
                        {
                            borderColor: colors.primary,
                            backgroundColor: isDark ? 'rgba(255, 107, 44, 0.12)' : '#FFF7ED',
                        },
                    ],
                ]}
                onPress={() => onSelect(item)}
            >
                <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                    {item.subtitle && <Text style={[styles.itemSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>}
                </View>
            </TouchableOpacity>
        );
    };

    const headerContent = (
        <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255, 107, 44, 0.18)' : '#FFF7ED' }]}>
                {icon || <LocationIcon width={iconSize || moderateScale(24)} height={iconSize || moderateScale(24)} color={iconColor || '#FF6B2C'} />}
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Select an option below</Text>
        </View>
    );

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={onClose}
            headerComponent={headerContent}
            sheetStyle={[
                styles.sheetContent,
                { backgroundColor: colors.surface },
                sheetStyle,
                { paddingBottom: insets.bottom + moderateScale(20) },
            ]}
        >
            <View style={[styles.searchContainer, { borderColor: colors.border, backgroundColor: colors.inputBackground, height: searchHeight }]}>
                <SearchNormal1 size={moderateScale(20)} color={colors.icon} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.placeholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                style={styles.flatList}
            />

            <View style={styles.footerActions}>
                <PrimaryButton
                    title={title.includes('State') ? 'Select a State' : title.includes('City') ? 'Select a City' : 'Select a Pickup Location'}
                    onPress={onClose}
                    disabled={!selectedId}
                />
                <TouchableOpacity
                    style={[styles.secondaryBtn, { backgroundColor: isDark ? colors.surfaceHighlight : '#F1F5F9' }]}
                    onPress={onClose}
                >
                    <Text style={[styles.secondaryBtnText, { color: colors.text }]}>No, Close</Text>
                </TouchableOpacity>
            </View>
        </AnimatedBottomSheet>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
    },
    sheetContent: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        paddingHorizontal: '20@s',
        paddingTop: '14@vs',
        height: '82%',
        maxHeight: '90%',
    },
    flatList: {
        flex: 1,
    },
    header: {
        width: '100%',
        marginBottom: '6@vs',
    },
    iconCircle: {
        width: '48@ms',
        height: '48@ms',
        borderRadius: '24@ms',
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '12@vs',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '4@vs',
    },
    subtitle: {
        fontSize: '14@ms',
        color: '#64748B',
        marginBottom: '20@vs',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(143, 139, 139, 1)',
        borderRadius: '28@ms',
        paddingHorizontal: '14@s',
        marginBottom: '16@vs',
    },
    searchInput: {
        flex: 1,
        marginLeft: '10@s',
        fontSize: '14@ms',
        color: '#0F172A',
        height: '100%',
        paddingVertical: 0,
        textAlignVertical: 'center',
    },
    listContent: {
        paddingBottom: '20@vs',
        gap: '12@vs',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16@ms',
        borderRadius: '16@ms',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
    },
    itemContainerSelected: {
        borderColor: '#FF6B2C',
        backgroundColor: '#FFF7ED',
    },
    itemTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '2@vs'
    },
    itemSubtitle: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    footerActions: {
        gap: '12@vs',
        marginTop: '10@vs'
    },

    secondaryBtn: {
        backgroundColor: '#F1F5F9',
        borderRadius: '30@ms',
        paddingVertical: '16@vs',
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#0F172A',
        fontSize: '14@ms',
        fontWeight: '600',
    }
});

export default LocationSelectionSheet;
