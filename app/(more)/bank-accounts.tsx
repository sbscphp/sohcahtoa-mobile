import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { Add, Bank } from 'iconsax-react-nativejs';

import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import BankAccountCard from '@/components/more/BankAccountCard';
import AddBankAccountModal from '@/components/more/AddBankAccountModal';
import DeleteAccountModal from '@/components/more/DeleteAccountModal';
import { useAppTheme } from '@/context/ThemeContext';

import { useGetSavedAccountsQuery } from '@/hooks/queries/banks/useGetSavedAccountsQuery';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useLookupAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { useSaveAccountMutation } from '@/hooks/queries/banks/useSaveAccountMutation';
import { useSetDefaultBankAccountMutation } from '@/hooks/queries/banks/useSetDefaultBankAccountMutation';
import { useDeleteBankAccountMutation } from '@/hooks/queries/banks/useDeleteBankAccountMutation';
import { useToastStore } from '@/stores/useToastStore';

export default function BankAccountsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const showToast = useToastStore((state) => state.showToast);

  const { data: savedAccountsResponse, isLoading: isLoadingAccounts } = useGetSavedAccountsQuery();
  const { data: banksResponse } = useGetBanksQuery();
  const resolveAccount = useLookupAccountMutation();
  const saveAccountMutation = useSaveAccountMutation();
  const setDefaultMutation = useSetDefaultBankAccountMutation();
  const deleteMutation = useDeleteBankAccountMutation();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [bankSheetVisible, setBankSheetVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const [selectedBank, setSelectedBank] = useState<SelectionItem | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const banks = useMemo(() =>
    (banksResponse?.data || []).map((b) => ({ id: b.code, label: b.name, value: b.code })),
    [banksResponse]
  );

  const savedAccounts = savedAccountsResponse?.data || [];

  useEffect(() => {
    if (!addModalVisible) {
      setSelectedBank(null);
      setAccountNumber('');
      setAccountName('');
      setIsResolving(false);
    }
  }, [addModalVisible]);

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
        },
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <Header
        title="Bank Accounts"
        rightIcon={
          <View style={[styles.addBtnHeader, { backgroundColor: isDark ? 'rgba(255, 104, 19, 0.12)' : '#FFF5F1' }]}>
            <Add size={moderateScale(20)} color={isDark ? colors.primaryLight : '#FF6813'} variant="Linear" />
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
          <View style={[styles.emptyIconContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC' }]}>
            <Bank size={moderateScale(48)} color={colors.iconMuted} variant="Linear" />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bank Accounts Saved</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Save your bank account details for faster electronic transfers.
          </Text>
          <PrimaryButton
            title="Add Bank Account"
            onPress={() => setAddModalVisible(true)}
            style={styles.emptyAddBtn}
          />
        </ScrollView>
      ) : (
        <ScrollView style={[styles.content, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
          {savedAccounts.map((account) => (
            <BankAccountCard
              key={account.id}
              account={account}
              onMakeDefault={handleMakeDefault}
              onDelete={handleDeletePress}
            />
          ))}
        </ScrollView>
      )}

      <LoadingBackdrop
        visible={
          setDefaultMutation.isPending ||
          deleteMutation.isPending ||
          saveAccountMutation.isPending
        }
      />

      <DeleteAccountModal
        visible={deleteConfirmVisible}
        onClose={() => setDeleteConfirmVisible(false)}
        onConfirm={confirmDelete}
      />

      <AddBankAccountModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onOpenBankSheet={() => setBankSheetVisible(true)}
        selectedBank={selectedBank}
        accountNumber={accountNumber}
        setAccountNumber={setAccountNumber}
        accountName={accountName}
        isResolving={isResolving}
        onSave={handleSave}
      />

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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '32@ms',
  },
  emptyIconContainer: {
    width: '80@ms',
    height: '80@ms',
    borderRadius: '40@ms',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16@vs',
  },
  emptyTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '8@vs',
  },
  emptySubtitle: {
    fontSize: '14@ms',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: '20@ms',
    marginBottom: '24@vs',
  },
  emptyAddBtn: {
    width: '100%',
  },
});
