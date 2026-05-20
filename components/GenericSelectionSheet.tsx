import PrimaryButton from '@/components/PrimaryButton';
import { CloseCircle, Icon, SearchNormal1 } from 'iconsax-react-nativejs';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

export interface SelectionItem {
    id: string;
    label: string;
    value: string;
    icon?: Icon;
}

interface GenericSelectionSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    headerIcon?: Icon;
    headerIconColor?: string;
    headerIconBg?: string;
    items: SelectionItem[];
    selectedItem: string;
    onSelect: (item: SelectionItem) => void;
    confirmButtonText?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
}

const GenericSelectionSheet: React.FC<GenericSelectionSheetProps> = ({
    visible,
    onClose,
    title,
    subtitle = "Select an option below",
    headerIcon: HeaderIcon,
    headerIconColor = "rgba(221, 79, 5, 1)",
    headerIconBg = "#FFF7ED",
    items,
    selectedItem,
    onSelect,
    confirmButtonText = "Select Option",
    searchable = false,
    searchPlaceholder = "Search..."
}) => {
    const insets = useSafeAreaInsets();
    const [tempSelected, setTempSelected] = useState(selectedItem);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (visible) {
            setTempSelected(selectedItem);
            setSearchQuery('');
        }
    }, [visible, selectedItem]);

    const handleConfirm = () => {
        const item = items.find(i => i.value === tempSelected);
        if (item) {
            onSelect(item);
        }
        onClose();
    };

    const filteredItems = items.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

                    {/* Header Row */}
                    <View style={styles.headerRow}>
                        {HeaderIcon ? (
                            <View style={[styles.iconCircle, { backgroundColor: headerIconBg }]}>
                                <HeaderIcon size={moderateScale(24)} color={headerIconColor} variant="Linear" />
                            </View>
                        ) : (
                            <View style={{ width: moderateScale(48), height: moderateScale(48) }} />
                        )}

                        <TouchableOpacity onPress={onClose}>
                            <CloseCircle size={moderateScale(24)} color="rgba(178, 175, 175, 1)" variant="Bold" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    {searchable && (
                        <View style={styles.searchContainer}>
                            <SearchNormal1 size={moderateScale(20)} color="#94A3B8" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={searchPlaceholder}
                                placeholderTextColor="#94A3B8"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    )}

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
                        {filteredItems.map((item) => {
                            const isSelected = tempSelected === item.value;
                            const ItemIcon = item.icon;

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.item, isSelected && styles.selectedItem]}
                                    onPress={() => setTempSelected(item.value)}
                                >
                                    <View style={styles.itemContent}>
                                        {ItemIcon && (
                                            <ItemIcon
                                                size={moderateScale(20)}
                                                color={isSelected ? "rgba(221, 79, 5, 1)" : "#64748B"}
                                                variant={isSelected ? "Linear" : "Linear"}
                                                style={styles.itemIcon}
                                            />
                                        )}
                                        <Text style={[styles.itemLabel]}>
                                            {item.label}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <View style={styles.footer}>
                        <PrimaryButton
                            title={confirmButtonText}
                            onPress={handleConfirm}
                            disabled={!tempSelected}
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
        paddingTop: '20@vs',
        maxHeight: '80%',
        marginBottom: '40@vs',
        marginHorizontal: '12@s',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16@vs',
    },
    iconCircle: {
        width: '48@ms',
        height: '48@ms',
        borderRadius: '24@ms',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '8@vs',
    },
    subtitle: {
        fontSize: '14@ms',
        color: '#64748B',
        marginBottom: '24@vs',
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
    listContainer: {
        gap: '12@vs',
        paddingBottom: '20@vs',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16@ms',
        borderWidth: 1,
        borderColor: '#f1f7fcff',
        borderRadius: '16@ms',
        backgroundColor: '#FFFFFF',
    },
    selectedItem: {
        borderColor: 'rgba(221, 79, 5, 1)',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12@s',
    },
    itemIcon: {
        // Icon styles
    },
    itemLabel: {
        fontSize: '15@ms',
        color: '#64748B',
        fontWeight: '500',
    },
    selectedItemLabel: {
        color: '#0F172A',
        fontWeight: '600',
    },
    footer: {
        gap: '12@vs',
        marginTop: '10@vs',
    },
    secondaryBtn: {
        backgroundColor: 'rgba(243, 243, 243, 1)',
        borderRadius: '30@ms',
        paddingVertical: '16@vs',
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#64748B',
        fontSize: '14@ms',
        fontWeight: '600',
    }
});

export default GenericSelectionSheet;
