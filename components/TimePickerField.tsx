import { Clock } from 'iconsax-react-nativejs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    FlatList,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { moderateScale, ScaledSheet, verticalScale } from 'react-native-size-matters';
import PrimaryButton from './PrimaryButton';

const ITEM_HEIGHT = verticalScale(44);
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function pad(n: number | string): string {
    return String(n).padStart(2, '0');
}

function range(start: number, end: number): number[] {
    const r: number[] = [];
    for (let i = start; i <= end; i++) r.push(i);
    return r;
}

const HOURS_12 = range(1, 12);
const MINUTES = range(0, 59);
const PERIODS = ['AM', 'PM'] as const;

function parseTime24(s: string): { hour: number; minute: number } {
    const now = new Date();
    if (!s) return { hour: now.getHours(), minute: now.getMinutes() };
    const parts = s.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    return {
        hour: isNaN(h) ? now.getHours() : h,
        minute: isNaN(m) ? now.getMinutes() : m,
    };
}

function convert24To12(h24: number): { hour12: number; period: typeof PERIODS[number] } {
    const period = h24 >= 12 ? 'PM' : 'AM';
    let hour12 = h24 % 12;
    if (hour12 === 0) hour12 = 12;
    return { hour12, period };
}

function convert12To24(h12: number, period: typeof PERIODS[number]): number {
    let h24 = h12 % 12;
    if (period === 'PM') h24 += 12;
    return h24;
}

const DrumItem = React.memo(({ item, isSelected }: { item: string, isSelected: boolean }) => (
    <View style={[drumStyles.item, { height: ITEM_HEIGHT }]}>
        <Text style={[drumStyles.itemText, isSelected && drumStyles.itemTextSelected]}>
            {item}
        </Text>
    </View>
));

interface DrumColumnProps {
    items: string[];
    selectedIndex: number;
    onIndexChange: (index: number) => void;
    width: number | string;
}

function DrumColumn({ items, selectedIndex, onIndexChange, width }: DrumColumnProps) {
    const listRef = useRef<FlatList>(null);
    const isScrolling = useRef(false);

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
                    { top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) },
                ]}
            />
            <FlatList
                ref={listRef}
                data={items}
                renderItem={({ item, index }) => (
                    <DrumItem item={item} isSelected={index === selectedIndex} />
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
        backgroundColor: '#FFF7ED',
        zIndex: 0,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#FF6B2C33',
    },
    item: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    itemText: {
        fontSize: moderateScale(15),
        color: '#94A3B8',
        fontWeight: '400',
    },
    itemTextSelected: {
        color: '#0F172A',
        fontWeight: '700',
        fontSize: moderateScale(17),
    },
});

// ─── Main Component ───────────────────────────────────────────────────────────

interface TimePickerFieldProps {
    label: string;
    value: string; // "HH:mm" 24-hour
    onTimeChange: (time: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
}

const TimePickerField: React.FC<TimePickerFieldProps> = ({
    label,
    value,
    onTimeChange,
    placeholder = 'hh:mm',
    required = false,
    error,
}) => {
    const [showPicker, setShowPicker] = useState(false);

    const [tempHour12, setTempHour12] = useState(12);
    const [tempMinute, setTempMinute] = useState(0);
    const [tempPeriod, setTempPeriod] = useState<typeof PERIODS[number]>('AM');

    const handleOpen = () => {
        const { hour, minute } = parseTime24(value);
        const { hour12, period } = convert24To12(hour);
        setTempHour12(hour12);
        setTempMinute(minute);
        setTempPeriod(period);
        setShowPicker(true);
    };

    const handleConfirm = () => {
        const h24 = convert12To24(tempHour12, tempPeriod);
        onTimeChange(`${pad(h24)}:${pad(tempMinute)}`);
        setShowPicker(false);
    };

    const handleCancel = () => setShowPicker(false);

    const displayString = useMemo(() => {
        if (!value) return '';
        const { hour, minute } = parseTime24(value);
        const { hour12, period } = convert24To12(hour);
        return `${pad(hour12)}:${pad(minute)} ${period}`;
    }, [value]);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}{required && <Text style={styles.required}> *</Text>}
            </Text>

            <TouchableOpacity
                style={[styles.inputWrapper, error ? styles.inputError : undefined]}
                onPress={handleOpen}
                activeOpacity={0.7}
            >
                <Text style={[styles.input, !value && styles.placeholder, !!value && { color: '#0F172A' }]}>
                    {displayString || placeholder}
                </Text>
                <Clock size={moderateScale(20)} color="#64748B" />
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{typeof error === 'string' ? error : (error as any).message || String(error)}</Text>}

            <Modal
                animationType="slide"
                transparent
                visible={showPicker}
                onRequestClose={handleCancel}
            >
                <View style={styles.overlay}>
                    <TouchableOpacity style={styles.backdrop} onPress={handleCancel} activeOpacity={1} />

                    <View style={styles.sheetContent}>
                        <View style={styles.sheetHeader}>
                            <View style={styles.sheetHandle} />
                            <Text style={styles.sheetTitle}>{label}</Text>
                        </View>

                        <View style={styles.drumRow}>
                            <DrumColumn
                                width="30%"
                                items={HOURS_12.map(pad)}
                                selectedIndex={HOURS_12.indexOf(tempHour12)}
                                onIndexChange={idx => setTempHour12(HOURS_12[idx])}
                            />
                            <Text style={styles.colon}>:</Text>
                            <DrumColumn
                                width="30%"
                                items={MINUTES.map(pad)}
                                selectedIndex={MINUTES.indexOf(tempMinute)}
                                onIndexChange={idx => setTempMinute(MINUTES[idx])}
                            />
                            <DrumColumn
                                width="25%"
                                items={[...PERIODS]}
                                selectedIndex={PERIODS.indexOf(tempPeriod)}
                                onIndexChange={idx => setTempPeriod(PERIODS[idx])}
                            />
                        </View>

                        <View style={styles.previewRow}>
                            <Text style={styles.previewText}>
                                {pad(tempHour12)}:{pad(tempMinute)}{' '}
                                <Text style={styles.previewAmPm}>{tempPeriod}</Text>
                            </Text>
                        </View>

                        <View style={styles.buttonContainer}>
                            <PrimaryButton title="Confirm" onPress={handleConfirm} />
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
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
        fontSize: '13@ms',
        fontWeight: '500',
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
        height: '48@vs',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: '30@ms',
        paddingHorizontal: '16@s',
        backgroundColor: '#FFFFFF',
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
        ...StyleSheet.absoluteFillObject,
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
    colon: {
        fontSize: moderateScale(20),
        fontWeight: '700',
        color: '#0F172A',
    },
    previewRow: {
        alignItems: 'center',
        marginVertical: '20@vs',
        padding: '12@ms',
        backgroundColor: '#F8FAFC',
        borderRadius: '12@ms',
    },
    previewText: {
        fontSize: '28@ms',
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: 1,
    },
    previewAmPm: {
        fontSize: '16@ms',
        fontWeight: '500',
        color: '#FF6B2C',
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

export default TimePickerField;
