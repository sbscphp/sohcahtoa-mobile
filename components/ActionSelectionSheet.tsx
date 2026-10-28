import { AnimatedBottomSheet } from '@/components/ui/AnimatedBottomSheet';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDevicePose } from '@/hooks/useDevicePose';
import { ArrowRight2 } from 'iconsax-react-nativejs';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

export interface ActionItem {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onPress: () => void;
}

interface ActionSelectionSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    headerIcon?: React.ReactNode;
    actions: ActionItem[];
}

const ActionSelectionSheet: React.FC<ActionSelectionSheetProps> = ({
    visible,
    onClose,
    title,
    description = "Select an option below",
    headerIcon,
    actions,
}) => {
    const { colors, isDark } = useAppTheme();
    const insets = useSafeAreaInsets();
    const { isIPhoneDuo, isFoldedDisplay, isLandscape } = useDevicePose();

    const listMaxHeight = isLandscape
        ? moderateScale(220)
        : (isFoldedDisplay ? moderateScale(340) : moderateScale(380));

    const renderItem = ({ item }: { item: ActionItem }) => (
        <Pressable
            style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.7 }
            ]}
            onPress={item.onPress}
            accessibilityRole="button"
            accessibilityLabel={item.title}
        >
            <View style={[styles.itemIconContainer, { backgroundColor: colors.surface }]}>
                {item.icon}
            </View>
            <View style={styles.itemTextContainer}>
                <Text
                    style={[styles.itemTitle, { color: colors.text }]}
                    numberOfLines={1}
                >
                    {item.title}
                </Text>
                <Text
                    style={[styles.itemSubtitle, { color: colors.textMuted }]}
                    numberOfLines={2}
                >
                    {item.subtitle}
                </Text>
            </View>
            <View style={styles.chevronContainer}>
                <ArrowRight2 size={moderateScale(16)} color={colors.textMuted} />
            </View>
        </Pressable>
    );

    const headerContent = (
        <View style={styles.header}>
            {headerIcon && (
                <View style={[
                    styles.headerIconContainer,
                    { backgroundColor: isDark ? 'rgba(255, 107, 44, 0.18)' : '#FFF7ED' }
                ]}>
                    {headerIcon}
                </View>
            )}
            <View style={styles.headerText}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                {description ? (
                    <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
                ) : null}
            </View>
        </View>
    );

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={onClose}
            headerComponent={headerContent}
            sheetStyle={[
                styles.sheetContent,
                {
                    backgroundColor: colors.surface,
                    paddingBottom: Math.max(insets.bottom, moderateScale(16)) + moderateScale(8),
                    marginBottom: isIPhoneDuo ? moderateScale(10) : moderateScale(16),
                },
            ]}
        >
            <View style={[
                styles.listContainer,
                {
                    backgroundColor: isDark ? colors.card : 'rgba(241, 241, 241, 0.75)',
                    borderColor: isDark ? colors.border : 'transparent',
                    borderWidth: isDark ? 1 : 0,
                    maxHeight: listMaxHeight,
                }
            ]}>
                <FlatList
                    data={actions}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.divider }]} />}
                />
            </View>
        </AnimatedBottomSheet>
    );
};

const styles = ScaledSheet.create({
    sheetContent: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '28@ms',
        paddingHorizontal: '16@s',
        paddingTop: '6@vs',
        maxHeight: '90%',
    },
    header: {
        width: '100%',
        marginBottom: '10@vs',
    },
    headerIconContainer: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '20@ms',
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '10@vs',
    },
    headerText: {
        width: '100%',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '4@vs',
    },
    description: {
        fontSize: '13@ms',
        color: '#64748B',
    },
    listContainer: {
        width: '100%',
        backgroundColor: 'rgba(241, 241, 241, 1)',
        borderRadius: '16@ms',
        padding: '10@ms',
        flexShrink: 1,
    },
    listContent: {
        paddingVertical: '2@vs',
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: '8@vs',
        paddingHorizontal: '6@s',
        width: '100%',
    },
    itemIconContainer: {
        width: '38@ms',
        height: '38@ms',
        borderRadius: '19@ms',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '12@s',
    },
    itemTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    chevronContainer: {
        marginLeft: '8@s',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: '13.5@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '2@vs',
    },
    itemSubtitle: {
        fontSize: '11.5@ms',
        color: 'rgba(102, 102, 102, 1)',
        lineHeight: '16@ms',
    },
    separator: {
        height: 1,
        marginVertical: '2@vs',
    },
});

export default ActionSelectionSheet;
