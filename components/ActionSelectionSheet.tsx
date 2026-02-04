import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    const renderItem = ({ item }: { item: ActionItem }) => (
        <TouchableOpacity style={styles.actionItem} onPress={item.onPress} activeOpacity={0.7}>
            <View style={styles.itemIconContainer}>
                {item.icon}
            </View>
            <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Close on backdrop press */}
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={styles.sheetContent}>
                    <View style={styles.header}>
                        {headerIcon && (
                            <View style={styles.headerIconContainer}>
                                {headerIcon}
                            </View>
                        )}
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.description}>{description}</Text>
                    </View>

                    <View style={styles.listContainer}>
                        <FlatList
                            data={actions}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
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
        borderRadius: '30@ms',
        paddingHorizontal: '12@s',
        paddingTop: '12@vs',
        paddingBottom: '30@vs',
        maxHeight: '80%', 
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
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '8@vs',
    },
    description: {
        fontSize: '12@ms',
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
        width: '40@ms',
        height: '40@ms',
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
        fontSize: '13@ms',
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
        // backgroundColor: '#E2E8F0', // Optional separator line
        marginVertical: '4@vs',
    },
});

export default ActionSelectionSheet;
