import { Calendar } from 'iconsax-react-nativejs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    FlatList,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { moderateScale, ScaledSheet, verticalScale } from 'react-native-size-matters';
import PrimaryButton from './PrimaryButton';
import { useAppTheme } from '@/hooks/useAppTheme';

// ─── Constants ──────────────────────────────────────────────────────────────

const ITEM_HEIGHT = verticalScale(44);
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad(n: number | string): string {
    return String(n).padStart(2, '0');
}

function range(start: number, end: number): number[] {
    const r: number[] = [];
    for (let i = start; i <= end; i++) r.push(i);
    return r;
}

function daysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_LABELS_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function parseDate(s: string): { day: number; month: number; year: number } | null {
    if (!s) return null;
    const parts = s.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return { day, month, year };
}

// ─── Memoized Item ───────────────────────────────────────────────────────────

const DrumItem = React.memo(({ item, isSelected, textColor, selectedColor }: { item: string, isSelected: boolean, textColor: string, selectedColor: string }) => (
    <View style={[drumStyles.item, { height: ITEM_HEIGHT }]}>
        <Text
            style={[
                drumStyles.itemText,
                { color: textColor },
                isSelected && [drumStyles.itemTextSelected, { color: selectedColor }],
            ]}
        >
            {item}
        </Text>
    </View>
));
DrumItem.displayName = 'DrumItem';

// ─── Drum Column ─────────────────────────────────────────────────────────────

interface DrumColumnProps {
    items: string[];
    selectedIndex: number;
    onIndexChange: (index: number) => void;
    width: number | string;
    selectionBg: string;
    selectionBorder: string;
    textColor: string;
    selectedColor: string;
}

function DrumColumn({
    items,
    selectedIndex,
    onIndexChange,
    width,
    selectionBg,
    selectionBorder,
    textColor,
    selectedColor,
}: DrumColumnProps) {
    const listRef = useRef<FlatList>(null);
    const isScrolling = useRef(false);

    // Initial scroll and external sync
    useEffect(() => {
        if (!isScrolling.current) {
            listRef.current?.scrollToOffset({
                offset: selectedIndex * ITEM_HEIGHT,
                animated: false,
            });
        }
    }, [selectedIndex, items.length]);

    const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        isScrolling.current = false;
        const offsetY = e.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(index, items.length - 1));
        
        if (clamped !== selectedIndex) {
            onIndexChange(clamped);
        }
        
        // Ensure snap is perfect
        listRef.current?.scrollToOffset({
            offset: clamped * ITEM_HEIGHT,
            animated: true,
        });
    };

    const handleScrollBeginDrag = () => {
        isScrolling.current = true;
    };

    const headerFooter = useMemo(() => {
        const paddingCount = Math.floor(VISIBLE_ITEMS / 2);
        return <View style={{ height: ITEM_HEIGHT * paddingCount }} />;
    }, []);

    return (
        <View style={[drumStyles.column, { width: width as any }]}>
            <View
                pointerEvents="none"
                style={[
                    drumStyles.selectionHighlight,
                    {
                        top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                        backgroundColor: selectionBg,
                        borderColor: selectionBorder,
                    },
                ]}
            />
            <FlatList
                ref={listRef}
                data={items}
                renderItem={({ item, index }) => (
                    <DrumItem
                        item={item}
                        isSelected={index === selectedIndex}
                        textColor={textColor}
                        selectedColor={selectedColor}
                    />
                )}
                keyExtractor={(_, i) => i.toString()}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                snapToAlignment="start"
                decelerationRate="fast"
                onMomentumScrollEnd={handleMomentumScrollEnd}
                onScrollBeginDrag={handleScrollBeginDrag}
                getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                })}
                ListHeaderComponent={headerFooter}
                ListFooterComponent={headerFooter}
                initialNumToRender={VISIBLE_ITEMS + 2}
                maxToRenderPerBatch={VISIBLE_ITEMS}
                windowSize={3}
                // Important for preventing momentum re-entry
                disableIntervalMomentum={true}
                scrollEventThrottle={16}
            />
        </View>
    );
}

const drumStyles = StyleSheet.create({
    column: {
        height: PICKER_HEIGHT,
    },
    selectionHighlight: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: ITEM_HEIGHT,
        zIndex: 0,
        borderTopWidth: 1,
        borderBottomWidth: 1,
    },
    item: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    itemText: {
        fontSize: moderateScale(15),
        fontWeight: '400',
    },
    itemTextSelected: {
        fontWeight: '700',
        fontSize: moderateScale(17),
    },
});

// ─── Main Component ───────────────────────────────────────────────────────────

interface DatePickerFieldProps {
    label: string;
    value: string; // dd/mm/yyyy
    onDateChange: (date: string) => void;
    placeholder?: string;
    required?: boolean;
    minimumDate?: Date;
    maximumDate?: Date;
    error?: string;
}

const CURRENT_YEAR = new Date().getFullYear();

const DatePickerField: React.FC<DatePickerFieldProps> = ({
    label,
    value,
    onDateChange,
    placeholder = 'dd/mm/yyyy',
    required = false,
    minimumDate,
    maximumDate,
    error,
}) => {
    const { colors, isDark } = useAppTheme();
    const [showPicker, setShowPicker] = useState(false);

    const [tempDay, setTempDay] = useState(1);
    const [tempMonth, setTempMonth] = useState(1);
    const [tempYear, setTempYear] = useState(CURRENT_YEAR);

    const handleOpen = () => {
        const parsed = parseDate(value);
        const now = new Date();
        setTempDay(parsed?.day ?? now.getDate());
        setTempMonth(parsed?.month ?? now.getMonth() + 1);
        setTempYear(parsed?.year ?? now.getFullYear());
        setShowPicker(true);
    };

    const handleConfirm = () => {
        const formatted = `${pad(tempDay)}/${pad(tempMonth)}/${tempYear}`;
        onDateChange(formatted);
        setShowPicker(false);
    };

    const handleCancel = () => setShowPicker(false);

    const years = useMemo(() => {
        const minY = minimumDate ? minimumDate.getFullYear() : CURRENT_YEAR - 80;
        const maxY = maximumDate ? maximumDate.getFullYear() : CURRENT_YEAR + 30;
        return range(minY, maxY);
    }, [minimumDate, maximumDate]);

    const days = useMemo(() => {
        const max = daysInMonth(tempMonth, tempYear);
        return range(1, max);
    }, [tempMonth, tempYear]);

    useEffect(() => {
        const max = daysInMonth(tempMonth, tempYear);
        if (tempDay > max) setTempDay(max);
    }, [tempMonth, tempYear, tempDay]);

    const selectionBg = isDark ? 'rgba(255, 107, 44, 0.15)' : '#FFF7ED';
    const selectionBorder = isDark ? 'rgba(255, 107, 44, 0.4)' : '#FF6B2C33';

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.label }]} numberOfLines={1}>
                {label}{required && <Text style={styles.required}> *</Text>}
            </Text>

            <TouchableOpacity
                style={[
                    styles.inputWrapper,
                    { borderColor: colors.border, backgroundColor: colors.inputBackground },
                    error ? styles.inputError : undefined,
                ]}
                onPress={handleOpen}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.input,
                        { color: value ? colors.text : colors.placeholder },
                    ]}
                >
                    {value || placeholder}
                </Text>
                <Calendar size={moderateScale(20)} color={colors.icon} />
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{typeof error === 'string' ? error : (error as any).message || String(error)}</Text>}

            <Modal
                animationType="slide"
                transparent
                visible={showPicker}
                onRequestClose={handleCancel}
            >
                <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
                    <TouchableOpacity style={styles.backdrop} onPress={handleCancel} activeOpacity={1} />

                    <View style={[styles.sheetContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.sheetHeader}>
                            <View style={[styles.sheetHandle, { backgroundColor: colors.handleBar }]} />
                            <Text style={[styles.sheetTitle, { color: colors.text }]}>{label}</Text>
                        </View>

                        <View style={styles.drumRow}>
                            <DrumColumn
                                width="25%"
                                items={days.map(d => pad(d))}
                                selectedIndex={days.indexOf(tempDay)}
                                onIndexChange={idx => setTempDay(days[idx])}
                                selectionBg={selectionBg}
                                selectionBorder={selectionBorder}
                                textColor={colors.textMuted}
                                selectedColor={colors.text}
                            />
                            <DrumColumn
                                width="40%"
                                items={MONTH_LABELS_SHORT}
                                selectedIndex={tempMonth - 1}
                                onIndexChange={idx => setTempMonth(idx + 1)}
                                selectionBg={selectionBg}
                                selectionBorder={selectionBorder}
                                textColor={colors.textMuted}
                                selectedColor={colors.text}
                            />
                            <DrumColumn
                                width="30%"
                                items={years.map(String)}
                                selectedIndex={years.indexOf(tempYear)}
                                onIndexChange={idx => setTempYear(years[idx])}
                                selectionBg={selectionBg}
                                selectionBorder={selectionBorder}
                                textColor={colors.textMuted}
                                selectedColor={colors.text}
                            />
                        </View>

                        <View style={[styles.previewRow, { backgroundColor: colors.card }]}>
                            <Text style={[styles.previewText, { color: colors.text }]}>
                                {MONTHS[tempMonth - 1]} {tempDay}, {tempYear}
                            </Text>
                        </View>

                        <View style={styles.buttonContainer}>
                            <PrimaryButton title="Confirm" onPress={handleConfirm} />
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                <Text style={[styles.cancelButtonText, { color: colors.textMuted }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = ScaledSheet.create({
    container: {
        marginBottom: '4@vs',
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
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: Platform.OS === 'android' ? '49@vs' : '40@vs',
        borderWidth: 1,
        borderColor: 'rgba(143, 139, 139, 1)',
        borderRadius: '28@ms',
        paddingHorizontal: '14@s',
        backgroundColor: 'transparent',
    },
    input: {
        flex: 1,
        fontSize: '14@ms',
        color: '#0F172A',
    },
    placeholder: {
        color: '#94A3B8',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        fontSize: '11@ms',
        color: '#EF4444',
        marginTop: '4@vs',
        marginLeft: '4@s',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
    },
    sheetContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: '24@ms',
        borderTopRightRadius: '24@ms',
        paddingHorizontal: '20@s',
        paddingTop: '12@vs',
        paddingBottom: '40@vs',
    },
    sheetHandle: {
        width: '40@s',
        height: '4@vs',
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: '16@vs',
    },
    sheetHeader: {
        marginBottom: '20@vs',
    },
    sheetTitle: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
    },
    drumRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: '10@vs',
    },
    previewRow: {
        alignItems: 'center',
        marginVertical: '20@vs',
        padding: '12@ms',
        backgroundColor: '#F8FAFC',
        borderRadius: '12@ms',
    },
    previewText: {
        fontSize: '18@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    buttonContainer: {
        gap: '12@vs',
    },
    cancelButton: {
        paddingVertical: '16@vs',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#64748B',
        fontSize: '14@ms',
        fontWeight: '600',
    },
});

export default DatePickerField;
