import ControlledInput from '@/components/ControlledInput';
import { Ionicons } from '@expo/vector-icons';
import { ArrowDown2 } from 'iconsax-react-nativejs';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useWatch } from 'react-hook-form';
import { useAttachBankAccountsMutation } from '@/hooks/queries/transactions/useAttachBankAccountsMutation';

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
    transactionId?: string;
    isMultiSelect?: boolean;
    selectedSavedAccountIds?: string[];
    setSelectedSavedAccountIds?: (ids: string[]) => void;
}

export default function PayoutMethodStep({
    control,
    setValue,
    setPayoutSheetVisible,
    savedAccounts,
    selectedSavedAccountId,
    setSelectedSavedAccountId,
    setIsAddingNewAccount,
    transactionId,
    isMultiSelect = false,
    selectedSavedAccountIds,
    setSelectedSavedAccountIds,
}: PayoutMethodStepProps) {
    const attachBankAccountsMutation = useAttachBankAccountsMutation();

    const [localSelectedIds, setLocalSelectedIds] = React.useState<string[]>([]);
    const activeSelectedIds = selectedSavedAccountIds !== undefined ? selectedSavedAccountIds : localSelectedIds;
    const setActiveSelectedIds = setSelectedSavedAccountIds !== undefined ? setSelectedSavedAccountIds : setLocalSelectedIds;

    const payoutMethod = useWatch({
        control,
        name: 'payoutMethod',
        defaultValue: ''
    });

    const isElectronic = payoutMethod?.includes('Electronic') || payoutMethod === 'Electronic_Transfer';

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
                        const isSelected = isMultiSelect
                            ? activeSelectedIds.includes(account.id)
                            : selectedSavedAccountId === account.id;

                        return (
                            <TouchableOpacity
                                key={account.id}
                                activeOpacity={0.9}
                                disabled={attachBankAccountsMutation.isPending}
                                onPress={() => {
                                    if (isMultiSelect) {
                                        const nextIds = isSelected
                                            ? activeSelectedIds.filter(id => id !== account.id)
                                            : [...activeSelectedIds, account.id];
                                        
                                        setActiveSelectedIds(nextIds);

                                        if (nextIds.length > 0) {
                                            const lastAccount = savedAccounts.find(a => a.id === nextIds[nextIds.length - 1]);
                                            if (lastAccount) {
                                                setValue('customerBankName', lastAccount.bankName);
                                                setValue('customerBankCode', lastAccount.bankCode);
                                                setValue('customerAccountNumber', lastAccount.accountNumber);
                                                setValue('customerAccountName', lastAccount.accountName);
                                            }
                                        } else {
                                            setValue('customerBankName', '');
                                            setValue('customerBankCode', '');
                                            setValue('customerAccountNumber', '');
                                            setValue('customerAccountName', '');
                                        }

                                        if (transactionId) {
                                            attachBankAccountsMutation.mutate({
                                                transactionId,
                                                bankAccountIds: nextIds,
                                            });
                                        }
                                    } else {
                                        setSelectedSavedAccountId(account.id);
                                        setValue('customerBankName', account.bankName);
                                        setValue('customerBankCode', account.bankCode);
                                        setValue('customerAccountNumber', account.accountNumber);
                                        setValue('customerAccountName', account.accountName);

                                        if (transactionId) {
                                            attachBankAccountsMutation.mutate({
                                                transactionId,
                                                bankAccountIds: [account.id],
                                            });
                                        }
                                    }
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
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ flex: 1 }}>
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
                                    </View>
                                    <Ionicons
                                        name={isSelected 
                                            ? (isMultiSelect ? "checkbox" : "checkmark-circle") 
                                            : (isMultiSelect ? "square-outline" : "ellipse-outline")
                                        }
                                        size={moderateScale(20)}
                                        color={isSelected ? "#FF6B2C" : "#64748B"}
                                        style={{ marginLeft: moderateScale(12) }}
                                    />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}


            {isElectronic && (!savedAccounts || savedAccounts.length === 0) && (
                <View style={{
                    padding: moderateScale(16),
                    backgroundColor: '#F8F9FA',
                    borderRadius: moderateScale(12),
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: moderateScale(8)
                }}>
                    <Text style={{
                        fontSize: moderateScale(13),
                        color: '#64748B',
                        textAlign: 'center',
                        fontWeight: '500'
                    }}>
                        No saved accounts found. Please add one to proceed with the Electronic Transfer.
                    </Text>
                </View>
            )}

           
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
