import PrimaryButton from '@/components/PrimaryButton';
import { AnimatedBottomSheet } from '@/components/ui/AnimatedBottomSheet';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useResponsiveInputHeight } from '@/hooks/useDevicePose';
import { Icon, SearchNormal1 } from 'iconsax-react-nativejs';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

export interface SelectionItem {
    id: string;
    label: string;
    value: string;
    icon?: Icon;
    description?: string;
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
    const { colors, isDark } = useAppTheme();
    const insets = useSafeAreaInsets();
    const searchHeight = useResponsiveInputHeight(40, 50, 49);
    const [tempSelected, setTempSelected] = useState(selectedItem);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (visible) {
            setTempSelected(selectedItem);
            setSearchQuery('');
        }
    }, [visible, selectedItem]);

    const handleConfirm = () => {
        const item = items.find(i => i.value === tempSelected || i.label === tempSelected || i.id === tempSelected);
        if (item) {
            onSelect(item);
        }
        onClose();
    };

    const filteredItems = items.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const headerContent = (
        <View style={styles.header}>
            {HeaderIcon && (
                <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255, 107, 44, 0.18)' : headerIconBg }]}>
                    <HeaderIcon size={moderateScale(24)} color={headerIconColor} variant="Linear" />
                </View>
            )}
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
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
                { paddingBottom: insets.bottom + moderateScale(20) },
            ]}
        >
            {searchable && (
                <View style={[styles.searchContainer, { borderColor: colors.border, backgroundColor: colors.inputBackground, height: searchHeight }]}>
                    <SearchNormal1 size={moderateScale(20)} color={colors.icon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder={searchPlaceholder}
                        placeholderTextColor={colors.placeholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
                {filteredItems.map((item) => {
                    const isSelected = tempSelected === item.value || tempSelected === item.label || tempSelected === item.id;
                    const ItemIcon = item.icon;

                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.item,
                                { backgroundColor: colors.surface, borderColor: colors.border },
                                isSelected && [
                                    styles.selectedItem,
                                    {
                                        borderColor: colors.primary,
                                        backgroundColor: isDark ? 'rgba(255, 107, 44, 0.12)' : '#FFF7ED',
                                    },
                                ],
                            ]}
                            onPress={() => setTempSelected(item.value)}
                        >
                            <View style={styles.itemContent}>
                                {ItemIcon && (
                                    <ItemIcon
                                        size={moderateScale(20)}
                                        color={isSelected ? colors.primary : colors.icon}
                                        variant={isSelected ? "Linear" : "Linear"}
                                        style={styles.itemIcon}
                                    />
                                )}
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.itemLabel, { color: colors.textMuted }, isSelected && [styles.selectedItemLabel, { color: colors.text }]]}>
                                        {item.label}
                                    </Text>
                                    {item.description && (
                                        <Text style={[styles.itemDescription, { color: colors.textMuted }]}>
                                            {item.description}
                                        </Text>
                                    )}
                                </View>
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
                <TouchableOpacity
                    style={[styles.secondaryBtn, { backgroundColor: isDark ? colors.surfaceHighlight : 'rgba(243, 243, 243, 1)' }]}
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
        paddingTop: '20@vs',
        maxHeight: '85%',
    },
    header: {
        width: '100%',
        marginBottom: '6@vs',
    },
    iconCircle: {
        width: '48@ms',
        height: '48@ms',
        borderRadius: '24@ms',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '12@vs',
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
    itemDescription: {
        fontSize: '12.5@ms',
        color: '#64748B',
        marginTop: '4@vs',
        fontWeight: '500',
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
