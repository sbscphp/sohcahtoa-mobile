import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from 'react-native-size-matters';

export interface SavedAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode?: string;
}

export interface DomiciliaryAccount {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    swiftCode?: string;
    routingNumber?: string;
    bankAddress?: string;
}

interface RefundBankDetailsStepProps {
    savedAccounts: SavedAccount[];
    selectedSavedAccountId: string | null;
    setSelectedSavedAccountId: (id: string | null) => void;
    setValue: (name: any, value: any, options?: any) => void;
    setIsAddingNewAccount: (visible: boolean) => void;
    title?: string;
    description?: string;
    isDomiciliary?: boolean;
    domiciliaryAccount?: DomiciliaryAccount;
}

export default function RefundBankDetailsStep({
    savedAccounts,
    selectedSavedAccountId,
    setSelectedSavedAccountId,
    setValue,
    setIsAddingNewAccount,
    title = "Refund Bank Details",
    description = "Select your local Nigerian bank account for refunds if your transaction cannot be processed.",
    isDomiciliary = false,
    domiciliaryAccount,
}: RefundBankDetailsStepProps) {
    const hasDomiciliaryData = isDomiciliary && domiciliaryAccount?.bankName;

    if (isDomiciliary) {
        return (
            <View style={{ gap: moderateScale(14) }}>
                <Text style={{ fontSize: moderateScale(15), fontWeight: '700', color: '#0F172A', marginBottom: moderateScale(4) }}>
                    {title}
                </Text>
                <Text style={{ fontSize: moderateScale(13), color: '#64748B', fontWeight: '500', marginBottom: moderateScale(8) }}>
                    Enter your domiciliary account details for refunds if your transaction cannot be processed.
                </Text>

                {hasDomiciliaryData && (
                    <View style={{
                        borderWidth: 1.5,
                        borderColor: '#402f28ff',
                        backgroundColor: '#FFF7ED',
                        borderRadius: moderateScale(12),
                        paddingVertical: moderateScale(16),
                        paddingHorizontal: moderateScale(16),
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: moderateScale(14), fontWeight: '700', color: '#0F172A', marginBottom: moderateScale(4) }}>
                                    {domiciliaryAccount.bankName}
                                </Text>
                                <Text style={{ fontSize: moderateScale(13), color: '#64748B', fontWeight: '500' }}>
                                    {domiciliaryAccount.accountNumber} <Text style={{ color: '#E2E8F0' }}>|</Text> {domiciliaryAccount.accountName}
                                </Text>
                            </View>
                            <Ionicons name="checkmark-circle" size={moderateScale(20)} color="#FF6B2C" />
                        </View>
                    </View>
                )}

                {!hasDomiciliaryData && (
                    <View style={{
                        padding: moderateScale(16),
                        backgroundColor: '#F8F9FA',
                        borderRadius: moderateScale(12),
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        borderStyle: 'dashed',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Text style={{ fontSize: moderateScale(13), color: '#64748B', textAlign: 'center', fontWeight: '500' }}>
                            No domiciliary account added yet. Please add one to proceed.
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                        setValue('domiciliaryBankName', '');
                        setValue('domiciliaryAccountNumber', '');
                        setValue('domiciliaryAccountName', '');
                        setValue('domiciliarySwiftCode', '');
                        setValue('domiciliaryRoutingNumber', '');
                        setValue('domiciliaryBankAddress', '');
                        setIsAddingNewAccount(true);
                    }}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignSelf: 'flex-end',
                        paddingVertical: moderateScale(8)
                    }}
                >
                    <Ionicons name="add" size={moderateScale(18)} color="#FF6B2C" style={{ marginRight: moderateScale(4) }} />
                    <Text style={{ fontSize: moderateScale(14), fontWeight: '600', color: '#FF6B2C' }}>
                        New Account
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ gap: moderateScale(14) }}>
            <Text style={{ fontSize: moderateScale(13), fontWeight: '700', color: '#0F172A', marginBottom: moderateScale(4) }}>
                {title}
            </Text>
            <Text style={{ fontSize: moderateScale(13), color: '#64748B', fontWeight: '500', marginBottom: moderateScale(8) }}>
                {description}
            </Text>
            
            {/* Saved Accounts List */}
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
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: moderateScale(14), fontWeight: '700', color: '#0F172A', marginBottom: moderateScale(4) }}>
                                    {account.bankName}
                                </Text>
                                <Text style={{ fontSize: moderateScale(13), color: '#64748B', fontWeight: '500' }}>
                                    {account.accountNumber} <Text style={{ color: '#E2E8F0' }}>|</Text> {account.accountName}
                                </Text>
                            </View>
                            <Ionicons
                                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                                size={moderateScale(20)}
                                color={isSelected ? "#FF6B2C" : "#64748B"}
                            />
                        </View>
                    </TouchableOpacity>
                );
            })}

            {(!savedAccounts || savedAccounts.length === 0) && (
                <View style={{
                    padding: moderateScale(16),
                    backgroundColor: '#F8F9FA',
                    borderRadius: moderateScale(12),
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Text style={{ fontSize: moderateScale(13), color: '#64748B', textAlign: 'center', fontWeight: '500' }}>
                        No saved accounts found. Please add one to proceed.
                    </Text>
                </View>
            )}

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
                    paddingVertical: moderateScale(8)
                }}
            >
                <Ionicons name="add" size={moderateScale(18)} color="#FF6B2C" style={{ marginRight: moderateScale(4) }} />
                <Text style={{ fontSize: moderateScale(14), fontWeight: '600', color: '#FF6B2C' }}>
                    New Account
                </Text>
            </TouchableOpacity>
        </View>
    );
}
