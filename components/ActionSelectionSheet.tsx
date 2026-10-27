import AnimatedBottomSheet from '@/components/ui/AnimatedBottomSheet';
import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { ScaledSheet } from 'react-native-size-matters';

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

    const renderItem = ({ item }: { item: ActionItem }) => (
        <Pressable
            style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.7 }
            ]}
            onPress={item.onPress}
            accessibilityRole="button"
        >
            <View style={[styles.itemIconContainer, { backgroundColor: colors.surface }]}>
                {item.icon}
            </View>
            <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.itemSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
            </View>
        </Pressable>
    );

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={onClose}
            sheetStyle={[styles.sheetContent, { backgroundColor: colors.surface }]}
        >
            <View style={styles.header}>
                {headerIcon && (
                    <View style={[styles.headerIconContainer, { backgroundColor: isDark ? 'rgba(255, 107, 44, 0.18)' : '#FFF7ED' }]}>
                        {headerIcon}
                    </View>
                )}
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
            </View>

            <View style={[styles.listContainer, { backgroundColor: colors.card }]}>
                <FlatList
                    data={actions}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.divider }]} />}
                />
            </View>
        </AnimatedBottomSheet>
    );
};

const styles = ScaledSheet.create({
    sheetContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: '30@ms',
        paddingHorizontal: '12@s',
        paddingTop: '12@vs',
        paddingBottom: '30@vs',
        maxHeight: '100%', 
        marginBottom: '40@vs',
        marginHorizontal: '12@s',
    },
    header: {
        marginBottom: '12@vs',
    },
    headerIconContainer: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '30@ms',
        backgroundColor: '#FFF7ED', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '16@vs',
    },
    title: {
        fontSize: '17@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '8@vs',
    },
    description: {
        fontSize: '13@ms',
        color: '#64748B',
    },
    listContainer: {
        backgroundColor: 'rgba(241, 241, 241, 1)',
        borderRadius: '16@ms',
        padding: '14@ms',
    },
    listContent: {
        paddingBottom: '6@vs',
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: '4@vs',
    },
    itemIconContainer: {
        width: '42@ms',
        height: '42@ms',
        borderRadius: '20@ms',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '16@s',
    },
    itemTextContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '4@vs',
    },
    itemSubtitle: {
        fontSize: '12@ms',
        color: 'rgba(102, 102, 102, 1)',
        lineHeight: '18@ms',
    },
    separator: {
        height: 1,
        marginVertical: '4@vs',
    },
});

export default ActionSelectionSheet;
