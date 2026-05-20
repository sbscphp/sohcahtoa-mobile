import ControlledInput from '@/components/ControlledInput';
import { Ionicons } from '@expo/vector-icons';
import { ArrowDown2 } from 'iconsax-react-nativejs';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useWatch } from 'react-hook-form';

export interface SavedAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode?: string;
}

interface PayoutMethodStepProps {
    control: any;
    setValue: (name: any, value: any, options?: any) => void;
    setPayoutSheetVisible: (visible: boolean) => void;
    savedAccounts: SavedAccount[];
    selectedSavedAccountId: string | null;
    setSelectedSavedAccountId: (id: string | null) => void;
    setIsAddingNewAccount: (visible: boolean) => void;
}

export default function PayoutMethodStep({
    control,
    setValue,
    setPayoutSheetVisible,
    savedAccounts,
    selectedSavedAccountId,
    setSelectedSavedAccountId,
    setIsAddingNewAccount,
}: PayoutMethodStepProps) {
    const payoutMethod = useWatch({
        control,
        name: 'payoutMethod',
        defaultValue: ''
    });

    const isElectronic = payoutMethod === 'Electronic Transfer (100%)' || payoutMethod === 'Electronic_Transfer';

    return (
        <View style={{ gap: moderateScale(14) }}>
            <Text style={{ fontSize: moderateScale(16), fontWeight: '700', color: '#0F172A', marginBottom: moderateScale(4) }}>
                Choose your payout method
            </Text>
            <TouchableOpacity onPress={() => setPayoutSheetVisible(true)} activeOpacity={0.8}>
                <View pointerEvents="none">
                    <ControlledInput
                        control={control}
                        name="payoutMethod"
                        label="Payout Method"
                        placeholder="Select an Option"
                        required
                        rightIcon={ArrowDown2}
                        editable={false}
                    />
                </View>
            </TouchableOpacity>

            {/* Saved Accounts List */}
            {isElectronic && (
                <View style={{ marginTop: moderateScale(8), gap: moderateScale(12) }}>
                    {savedAccounts.map((account) => {
                        const isSelected = selectedSavedAccountId === account.id;
                        return (
                            <TouchableOpacity
                                key={account.id}
                                activeOpacity={0.9}
                                onPress={() => {
                                    setSelectedSavedAccountId(account.id);
                                    setValue('customerBankName', account.bankName);
                                    setValue('customerBankCode', account.bankCode);
                                    setValue('customerAccountNumber', account.accountNumber);
                                    setValue('customerAccountName', account.accountName);
                                }}
                                style={{
                                    borderWidth: isSelected ? 1.5 : 1,
                                    borderColor: isSelected ? '#FF6B2C' : '#E2E8F0',
                                    backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                                    borderRadius: moderateScale(12),
                                    paddingVertical: moderateScale(16),
                                    paddingHorizontal: moderateScale(16),
                                    shadowColor: isSelected ? '#FF6B2C' : 'transparent',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: isSelected ? 0.1 : 0,
                                    shadowRadius: 2,
                                }}
                            >
                                <Text style={{
                                    fontSize: moderateScale(14),
                                    fontWeight: '700',
                                    color: '#0F172A',
                                    marginBottom: moderateScale(4)
                                }}>
                                    {account.bankName}
                                </Text>
                                <Text style={{
                                    fontSize: moderateScale(13),
                                    color: '#64748B',
                                    fontWeight: '500'
                                }}>
                                    {account.accountNumber} <Text style={{ color: '#E2E8F0' }}>|</Text> {account.accountName}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* + New Account Button */}
            {isElectronic && (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                        setSelectedSavedAccountId(null);
                        setValue('customerBankName', '');
                        setValue('customerBankCode', '');
                        setValue('customerAccountNumber', '');
                        setValue('customerAccountName', '');
                        setIsAddingNewAccount(true);
                    }}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignSelf: 'flex-end',
                        marginTop: moderateScale(4),
                        paddingHorizontal: moderateScale(4),
                        paddingVertical: moderateScale(8)
                    }}
                >
                    <Ionicons name="add" size={moderateScale(18)} color="#FF6B2C" style={{ marginRight: moderateScale(4) }} />
                    <Text style={{
                        fontSize: moderateScale(14),
                        fontWeight: '600',
                        color: '#FF6B2C'
                    }}>
                        New Account
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
