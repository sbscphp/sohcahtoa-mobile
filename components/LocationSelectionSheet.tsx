import { CloseCircle, SearchNormal1 } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import LocationIcon from '../assets/icons/location-08.svg';
import PrimaryButton from './PrimaryButton';

export interface LocationItem {
    id: string;
    title: string;
    subtitle?: string;
}

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
    iconColor
}) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = data.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderItem = ({ item }: { item: LocationItem }) => {
        const isSelected = selectedId === item.id;
        return (
            <TouchableOpacity
                style={[styles.itemContainer, isSelected && styles.itemContainerSelected]}
                onPress={() => onSelect(item)}
            >
                <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.subtitle && <Text style={styles.itemSubtitle}>{item.subtitle}</Text>}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={[styles.sheetContent, { paddingBottom: insets.bottom + moderateScale(20) }]}>

                    <View style={styles.headerRow}>
                        <View style={styles.iconCircle}>
                            {icon || <LocationIcon width={iconSize || moderateScale(24)} height={iconSize || moderateScale(24)} color={iconColor || '#FF6B2C'} />}
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <CloseCircle size={24} color="#94A3B8" variant="Bold" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>Select an option below</Text>

                    <View style={styles.searchContainer}>
                        <SearchNormal1 size={moderateScale(20)} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={placeholder}
                            placeholderTextColor="#94A3B8"
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
                        style={{ maxHeight: moderateScale(400) }}
                    />

                    <View style={styles.footerActions}>
                        <PrimaryButton
                            title={title.includes('State') ? 'Select a State' : title.includes('City') ? 'Select a City' : 'Select a Pickup Location'}
                            onPress={onClose}
                            disabled={!selectedId}
                        />
                        <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
                            <Text style={styles.secondaryBtnText}>No, Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheetContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        paddingHorizontal: '20@s',
        paddingTop: '14@vs',
        maxHeight: '80%',
        marginBottom: '40@vs',
        marginHorizontal: '12@s',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16@vs'
    },
    iconCircle: {
        width: '48@ms',
        height: '48@ms',
        borderRadius: '24@ms',
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
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
        borderColor: '#E2E8F0',
        borderRadius: '12@ms',
        paddingHorizontal: '16@s',
        paddingVertical: '12@vs',
        marginBottom: '16@vs',
    },
    searchInput: {
        flex: 1,
        marginLeft: '10@s',
        fontSize: '14@ms',
        color: '#0F172A',
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
