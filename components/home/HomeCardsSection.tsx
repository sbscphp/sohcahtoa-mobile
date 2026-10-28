import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Add } from 'iconsax-react-nativejs';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import VirtualCard from '@/components/VirtualCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDevicePose } from '@/hooks/useDevicePose';

interface HomeCardsSectionProps {
    userName: string;
    onManageCards?: () => void;
    onAddCard?: () => void;
}

export default function HomeCardsSection({ userName, onManageCards, onAddCard }: HomeCardsSectionProps) {
    const { colors } = useAppTheme();
    const { isFoldedDisplay, isIPhoneDuo } = useDevicePose();
    const isFoldedMode = isFoldedDisplay && isIPhoneDuo;

    return (
        <View style={styles.cardsSection}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Cards</Text>
                <TouchableOpacity onPress={onManageCards}>
                    <Text style={[styles.seeAllBtn, { color: colors.text, borderColor: colors.border }]}>Manage Cards</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
                <View style={styles.card}>
                    <VirtualCard
                        name={userName}
                        last4Digits="7093"
                        expiry="08/27"
                    />
                </View>

                <TouchableOpacity
                    style={[
                        styles.addCardButton,
                        { backgroundColor: colors.card, borderColor: colors.border },
                        isFoldedMode && styles.addCardButtonFolded,
                    ]}
                    onPress={onAddCard}
                >
                    <Add size={moderateScale(26)} color={colors.icon} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = ScaledSheet.create({
    cardsSection: {
        marginBottom: '20@vs',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '14@s',
        marginBottom: '10@vs',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '400',
        color: '#0F172A',
    },
    seeAllBtn: {
        paddingHorizontal: '12@s',
        paddingVertical: '4@vs',
        borderRadius: '14@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        fontSize: '12@ms',
        fontWeight: '500',
        color: '#0F172A',
    },
    cardsScroll: {
        paddingHorizontal: '14@s',
        gap: '12@s',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: '260@s',
        aspectRatio: 1.586,
        borderRadius: '20@ms',
        overflow: 'hidden',
    },
    addCardButton: {
        width: '50@s',
        height: '160@vs',
        borderRadius: '16@ms',
        borderWidth: 1,
        borderColor: '#0F172A',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#F8FAFC',
    },
    addCardButtonFolded: {
        height: '164@vs',
        width: '54@s',
    },
});
