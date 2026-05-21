import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { Add, Bank, Trash, TickCircle, Warning2, ArrowDown2, CloseCircle } from 'iconsax-react-nativejs';

import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import InputField from '@/components/InputField';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';

import { useGetSavedAccountsQuery } from '@/hooks/queries/banks/useGetSavedAccountsQuery';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useLookupAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { useSaveAccountMutation } from '@/hooks/queries/banks/useSaveAccountMutation';
import { useSetDefaultBankAccountMutation } from '@/hooks/queries/banks/useSetDefaultBankAccountMutation';
import { useDeleteBankAccountMutation } from '@/hooks/queries/banks/useDeleteBankAccountMutation';
import { useToastStore } from '@/stores/useToastStore';

export default function BankAccountsScreen() {
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((state) => state.showToast);

  // Queries and mutations
  const { data: savedAccountsResponse, isLoading: isLoadingAccounts } = useGetSavedAccountsQuery();
  const { data: banksResponse } = useGetBanksQuery();
  const resolveAccount = useLookupAccountMutation();
  const saveAccountMutation = useSaveAccountMutation();
  const setDefaultMutation = useSetDefaultBankAccountMutation();
  const deleteMutation = useDeleteBankAccountMutation();

  // Modals visibility
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [bankSheetVisible, setBankSheetVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  
  // Selection states
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // New account form state
  const [selectedBank, setSelectedBank] = useState<SelectionItem | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const banks = useMemo(() =>
    (banksResponse?.data || []).map((b) => ({ id: b.code, label: b.name, value: b.code })),
    [banksResponse]
  );

  const savedAccounts = savedAccountsResponse?.data || [];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!addModalVisible) {
      setSelectedBank(null);
      setAccountNumber('');
      setAccountName('');
      setIsResolving(false);
    }
  }, [addModalVisible]);

  // Account resolution logic
  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      setIsResolving(true);
      resolveAccount.mutate(
        {
          accountNumber,
          bankName: selectedBank.label,
        },
        {
          onSuccess: (res) => {
            setIsResolving(false);
            if (res.success) {
              setAccountName(res.data.accountName);
            }
          },
          onError: () => {
            setIsResolving(false);
            setAccountName('');
            showToast('Could not resolve account name', 'error');
          },
        }
      );
    } else {
      setAccountName('');
    }
  }, [accountNumber, selectedBank]);

  // Actions
  const handleSave = () => {
    if (!selectedBank || accountNumber.length !== 10 || !accountName) {
      showToast('Please fill out all bank account details.', 'error');
      return;
    }

    saveAccountMutation.mutate(
      {
        bankName: selectedBank.label,
        accountNumber,
        accountName,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            setAddModalVisible(false);
          }
        },
      }
    );
  };

  const handleMakeDefault = (id: string) => {
    setDefaultMutation.mutate(id);
  };

  const handleDeletePress = (id: string) => {
    setSelectedAccountId(id);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = () => {
    if (selectedAccountId) {
      deleteMutation.mutate(selectedAccountId, {
        onSuccess: () => {
          setDeleteConfirmVisible(false);
          setSelectedAccountId(null);
        },
        onError: () => {
          setDeleteConfirmVisible(false);
          setSelectedAccountId(null);
        }
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Bank Accounts"
        rightIcon={
          <View style={styles.addBtnHeader}>
            <Add size={moderateScale(20)} color="#FF6813" variant="Linear" />
          </View>
        }
        onRightPress={() => setAddModalVisible(true)}
      />

      {isLoadingAccounts ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF6813" />
        </View>
      ) : savedAccounts.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Bank size={moderateScale(48)} color="#94A3B8" variant="Linear" />
          </View>
          <Text style={styles.emptyTitle}>No Bank Accounts Saved</Text>
          <Text style={styles.emptySubtitle}>
            Save your bank account details for faster electronic transfers.
          </Text>
          <PrimaryButton
            title="Add Bank Account"
            onPress={() => setAddModalVisible(true)}
            style={styles.emptyAddBtn}
          />
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {savedAccounts.map((account) => (
            <View key={account.id} style={[styles.accountCard, account.isDefault && styles.defaultCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.bankNameWrapper}>
                  <View style={styles.bankIconContainer}>
                    <Bank size={moderateScale(20)} color="#FF6813" variant="Bold" />
                  </View>
                  <Text style={styles.bankName} numberOfLines={1}>{account.bankName}</Text>
                </View>
                {account.isDefault ? (
                  <View style={styles.defaultBadge}>
                    <TickCircle size={moderateScale(12)} color="#10B981" variant="Bold" />
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.makeDefaultBtn}
                    onPress={() => handleMakeDefault(account.id)}
                  >
                    <Text style={styles.makeDefaultText}>Set Default</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Account Number</Text>
                  <Text style={styles.detailValue}>{account.accountNumber}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Account Name</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{account.accountName}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeletePress(account.id)}
                >
                  <Trash size={moderateScale(16)} color="#EF4444" variant="Linear" />
                  <Text style={styles.deleteBtnText}>Remove Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Loading overlay */}
      <LoadingBackdrop
        visible={
          setDefaultMutation.isPending ||
          deleteMutation.isPending ||
          saveAccountMutation.isPending
        }
      />

      {/* Confirmation modal for delete */}
      <Modal
        transparent
        visible={deleteConfirmVisible}
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.warningIconContainer}>
              <Warning2 size={moderateScale(24)} color="#EF4444" variant="Bold" />
            </View>
            <Text style={styles.modalTitle}>Delete Bank Account</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to remove this bank account? This action cannot be undone.
            </Text>
            <PrimaryButton
              title="Yes, Delete"
              onPress={confirmDelete}
              style={{ backgroundColor: '#EF4444', marginBottom: moderateScale(12) }}
            />
            <PrimaryButton
              title="No, Cancel"
              onPress={() => setDeleteConfirmVisible(false)}
              style={{ backgroundColor: '#F1F5F9' }}
              textStyle={{ color: '#0F172A' }}
            />
          </View>
        </View>
      </Modal>

      {/* Add Bank Account Modal Sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Add Bank Account</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <CloseCircle size={moderateScale(24)} color="#94A3B8" variant="Bold" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.sheetContent}>
              <TouchableOpacity onPress={() => setBankSheetVisible(true)} activeOpacity={0.8}>
                <View pointerEvents="none">
                  <InputField
                    label="Bank Name"
                    placeholder="Select Bank"
                    required
                    value={selectedBank?.label || ''}
                    rightIcon={ArrowDown2}
                    editable={false}
                  />
                </View>
              </TouchableOpacity>

              <InputField
                label="Account Number"
                placeholder="Enter 10-digit number"
                required
                keyboardType="numeric"
                maxLength={10}
                value={accountNumber}
                onChangeText={setAccountNumber}
              />

              {accountName ? (
                <View style={styles.resolvedNameContainer}>
                  <Text style={styles.resolvedLabel}>Account Name</Text>
                  <Text style={styles.resolvedValue}>{accountName}</Text>
                </View>
              ) : isResolving ? (
                <Text style={styles.resolvingText}>Resolving account name...</Text>
              ) : null}

              <View style={styles.sheetFooter}>
                <PrimaryButton
                  title="Save Bank Details"
                  onPress={handleSave}
                  disabled={!selectedBank || accountNumber.length !== 10 || !accountName}
                />
                <TouchableOpacity
                  style={styles.sheetCloseBtn}
                  onPress={() => setAddModalVisible(false)}
                >
                  <Text style={styles.sheetCloseText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Nested Selection Sheet for Banks list */}
      <GenericSelectionSheet
        visible={bankSheetVisible}
        onClose={() => setBankSheetVisible(false)}
        title="Select Bank"
        headerIcon={Bank}
        items={banks}
        selectedItem={selectedBank?.value || ''}
        onSelect={(item) => {
          setSelectedBank(item);
          setBankSheetVisible(false);
        }}
        confirmButtonText="Select Bank"
        searchable={true}
        searchPlaceholder="Search bank..."
      />
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnHeader: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '16@ms',
    backgroundColor: '#FFF5F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: '20@ms',
    gap: '16@vs',
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16@ms',
    padding: '16@ms',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  defaultCard: {
    borderColor: '#FF6813',
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: '12@vs',
    marginBottom: '12@vs',
  },
  bankNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms',
    flex: 1,
  },
  bankIconContainer: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '16@ms',
    backgroundColor: '#FFF5F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankName: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4@ms',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    borderRadius: '12@ms',
  },
  defaultText: {
    fontSize: '11@ms',
    fontWeight: '600',
    color: '#10B981',
  },
  makeDefaultBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: '10@s',
    paddingVertical: '6@vs',
    borderRadius: '20@ms',
  },
  makeDefaultText: {
    fontSize: '11@ms',
    fontWeight: '600',
    color: '#475569',
  },
  cardDetails: {
    gap: '10@vs',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: '12@ms',
    color: '#64748B',
  },
  detailValue: {
    fontSize: '13@ms',
    fontWeight: '500',
    color: '#1E293B',
    maxWidth: '65%',
  },
  cardFooter: {
    marginTop: '16@vs',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: '12@vs',
    alignItems: 'flex-start',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms',
  },
  deleteBtnText: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: '#EF4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '32@ms',
    backgroundColor: '#F8F9FA',
  },
  emptyIconContainer: {
    width: '80@ms',
    height: '80@ms',
    borderRadius: '40@ms',
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20@vs',
  },
  emptyTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: '8@vs',
  },
  emptySubtitle: {
    fontSize: '14@ms',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: '32@vs',
    lineHeight: '20@ms',
  },
  emptyAddBtn: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20@ms',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24@ms',
    padding: '24@ms',
    width: '100%',
    alignItems: 'center',
  },
  warningIconContainer: {
    width: '48@ms',
    height: '48@ms',
    borderRadius: '24@ms',
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16@vs',
    alignSelf: 'flex-start',
  },
  modalTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '8@vs',
    alignSelf: 'flex-start',
  },
  modalMessage: {
    fontSize: '14@ms',
    color: '#64748B',
    marginBottom: '32@vs',
    lineHeight: '20@ms',
    alignSelf: 'flex-start',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24@ms',
    padding: '20@ms',
    width: '100%',
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: '16@vs',
    marginBottom: '16@vs',
  },
  sheetTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#0F172A',
  },
  sheetContent: {
    paddingBottom: '20@vs',
  },
  resolvedNameContainer: {
    backgroundColor: '#F8FAFC',
    padding: '12@ms',
    borderRadius: '8@ms',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: '4@vs',
    marginBottom: '16@vs',
  },
  resolvedLabel: {
    fontSize: '11@ms',
    color: '#64748B',
    marginBottom: '4@vs',
  },
  resolvedValue: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#0F172A',
  },
  resolvingText: {
    fontSize: '11@ms',
    color: '#F97316',
    fontStyle: 'italic',
    marginTop: '4@vs',
    marginBottom: '16@vs',
    marginLeft: '4@s',
  },
  sheetFooter: {
    gap: '12@vs',
    marginTop: '20@vs',
  },
  sheetCloseBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: '30@ms',
    paddingVertical: '16@vs',
    alignItems: 'center',
  },
  sheetCloseText: {
    color: '#475569',
    fontSize: '14@ms',
    fontWeight: '600',
  },
});
