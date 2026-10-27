import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Add, Bank, InfoCircle, MoneyRecive } from 'iconsax-react-nativejs';
import { z } from 'zod';

import CurrencyConverter from '@/components/CurrencyConverter';
import GenericSelectionSheet from '@/components/GenericSelectionSheet';
import InputField from '@/components/InputField';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import AddBankAccountModal from '@/components/more/AddBankAccountModal';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useAppTheme } from '@/context/ThemeContext';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useGetSavedAccountsQuery } from '@/hooks/queries/banks/useGetSavedAccountsQuery';
import { useAddBankAccount } from '@/hooks/useAddBankAccount';
import { useReceiveFxRate } from '@/hooks/useReceiveFxRate';
import { isNigerianAccount } from '@/utils/banks';
import { imtoSchema } from '@/utils/validations/imto';

type ImtoProviderId = 'moneygram' | 'western_union';

const IMTO_PROVIDERS: Array<{ id: ImtoProviderId; title: string; refLabel: string; refPlaceholder: string }> = [
    { id: 'moneygram', title: 'MoneyGram', refLabel: 'Reference Number', refPlaceholder: 'Enter Reference Number' },
    { id: 'western_union', title: 'Western Union', refLabel: 'MTCN', refPlaceholder: 'Enter MTCN' },
];

const formatAmount = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ImtoScreen() {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const { step: initialStepParam } = useLocalSearchParams<{ step?: string }>();
    const totalSteps = 4;

    const [currentStep, setCurrentStep] = useState(() => {
        const parsed = Number(initialStepParam);
        return !Number.isNaN(parsed) && parsed >= 0 && parsed < totalSteps ? parsed : 0;
    });

    const [selectedImto, setSelectedImto] = useState<ImtoProviderId | null>(null);
    const [referenceNumber, setReferenceNumber] = useState('');
    const [senderName, setSenderName] = useState('');
    const [showError, setShowError] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
    const [verificationStatus, setVerificationStatus] = useState<'verified' | 'not-verified'>('verified');

    const { rate, formattedLimitNaira } = useReceiveFxRate();
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
    const [currencyGet, setCurrencyGet] = useState({ code: 'USD', country: 'United States', currencyName: 'US Dollar', flagUrl: 'https://flagcdn.com/w320/us.png' });
    const [currencySend, setCurrencySend] = useState({ code: 'NGN', country: 'Nigeria', currencyName: 'Naira', flagUrl: 'https://flagcdn.com/w320/ng.png' });
    const [amountGet, setAmountGet] = useState('1');
    const [amountSend, setAmountSend] = useState(formatAmount(rate));

    useEffect(() => {
        const num = parseFloat(amountGet.replace(/,/g, '')) || 0;
        setAmountSend(formatAmount(num * rate));
    }, [rate, amountGet]);

    const [selectedMethod, setSelectedMethod] = useState<'bank' | 'pickup'>('bank');
    const [selectedBank, setSelectedBank] = useState<string | null>(null);

    const { data: savedAccountsResponse, isLoading: isLoadingAccounts } = useGetSavedAccountsQuery();
    const { data: banksResponse } = useGetBanksQuery();
    const savedAccounts = useMemo(
        () => (savedAccountsResponse?.data || []).filter((acc) => isNigerianAccount(acc, banksResponse?.data || [])),
        [savedAccountsResponse, banksResponse]
    );

    const {
        addModalVisible, setAddModalVisible, bankSheetVisible, setBankSheetVisible,
        selectedBank: modalBank, setSelectedBank: setModalBank, accountNumber, setAccountNumber,
        accountName, isResolving, banks, handleSave, isSaving,
    } = useAddBankAccount({ onSuccess: (newId) => { if (newId) setSelectedBank(newId); } });

    useEffect(() => {
        if (!selectedBank && savedAccounts.length > 0) {
            setSelectedBank((savedAccounts.find((a) => a.isDefault) || savedAccounts[0]).id);
        }
    }, [savedAccounts, selectedBank]);

    const handleValidateStep0 = () => {
        const result = imtoSchema.safeParse({ selectedImto: selectedImto ?? '', referenceNumber, senderName });
        if (!result.success) {
            const errors: Record<string, string | undefined> = {};
            result.error.issues.forEach((e: z.ZodIssue) => {
                const key = e.path[0] as string;
                if (!errors[key]) errors[key] = e.message;
            });
            setValidationErrors(errors);
            return;
        }
        setValidationErrors({});
        if (referenceNumber === '4585776465353') { setShowError(true); return; }
        setShowError(false);
        setVerificationStatus(referenceNumber === 'FAILURE' ? 'not-verified' : 'verified');
        setCurrentStep(1);
    };

    const isVerified = verificationStatus === 'verified';

    const handleNext = () => {
        if (currentStep === 0) handleValidateStep0();
        else if (currentStep === 1) setCurrentStep(isVerified ? 2 : 0);
        else if (currentStep === 2) setCurrentStep(3);
        else router.push('/(receive-fx)/success');
    };

    const handleBack = () => (currentStep > 0 ? setCurrentStep((prev) => prev - 1) : router.back());
    const nextLabel = ['Validate', isVerified ? 'Proceed to disbursement' : 'Retry', 'Next', 'Submit'][currentStep];
    const isNextDisabled =
        (currentStep === 0 && !(selectedImto && referenceNumber && senderName)) ||
        (currentStep === 3 && selectedMethod === 'bank' && !selectedBank);

    const detailRows = [
        { label: 'Reference', value: referenceNumber },
        { label: 'Senders Name', value: senderName },
        ...(isVerified ? [{ label: 'Amount', value: '$ 5,000.00' }, { label: "Receiver's Name", value: 'Adeola Aderinsola' }] : []),
    ];

    const renderLimitBanner = () => (
        <View style={[styles.infoBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <InfoCircle size={moderateScale(20)} color="#F97316" variant="Bold" />
            <Text style={[styles.infoText, { color: colors.textMuted }]}>
                Maximum cash pickup is <Text style={{ fontWeight: '700', color: colors.text }}>{formattedLimitNaira}</Text>
            </Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <LoadingBackdrop visible={isSaving} />

            <TransactionLayout
                title="Receive Funds: IMTO" currentStep={currentStep} totalSteps={totalSteps}
                onBack={handleBack} onNext={handleNext} nextLabel={nextLabel} isNextDisabled={isNextDisabled}
            >
                {currentStep === 0 && (
                    <View>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>How would you like to receive your funds?</Text>
                        {renderLimitBanner()}
                        <View style={styles.optionsContainer}>
                            {IMTO_PROVIDERS.map((provider) => {
                                const isSelected = selectedImto === provider.id;
                                return (
                                    <React.Fragment key={provider.id}>
                                        <TouchableOpacity
                                            style={[
                                                styles.optionCard,
                                                { backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.border },
                                                isSelected && (isDark ? { backgroundColor: 'rgba(255, 104, 19, 0.10)', borderWidth: 1.5 } : styles.optionCardSelected),
                                            ]}
                                            onPress={() => { setSelectedImto(provider.id); setValidationErrors((p) => ({ ...p, selectedImto: undefined })); }}
                                            activeOpacity={0.8}
                                        >
                                            {provider.id === 'moneygram' ? (
                                                <View style={styles.iconPlaceholderRed}><MoneyRecive size={moderateScale(18)} color="#FFFFFF" variant="Bold" /></View>
                                            ) : (
                                                <View style={styles.iconPlaceholderYellow}><Text style={styles.iconTextBlack}>W</Text></View>
                                            )}
                                            <Text style={[styles.optionText, { color: colors.text }]}>{provider.title}</Text>
                                        </TouchableOpacity>

                                        {isSelected && (
                                            <View style={[styles.formContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                                <InputField
                                                    label={provider.refLabel} placeholder={provider.refPlaceholder} value={referenceNumber}
                                                    onChangeText={(text) => { setReferenceNumber(text); setShowError(false); setValidationErrors((p) => ({ ...p, referenceNumber: undefined })); }}
                                                    required wrapperStyle={showError ? styles.inputError : {}} error={validationErrors.referenceNumber}
                                                />
                                                {showError && <Text style={styles.errorText}>The reference ID provided is incorrect. Please try again later</Text>}
                                                <View style={{ height: moderateScale(16) }} />
                                                <InputField
                                                    label="Sender's Name" placeholder="Enter Sender's Name" value={senderName}
                                                    onChangeText={(v) => { setSenderName(v); setValidationErrors((p) => ({ ...p, senderName: undefined })); }}
                                                    required error={validationErrors.senderName}
                                                />
                                            </View>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {validationErrors.selectedImto && <Text style={styles.errorText}>{validationErrors.selectedImto}</Text>}
                        </View>
                    </View>
                )}

                {currentStep === 1 && (
                    <View>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reference Details</Text>
                        {renderLimitBanner()}
                        <View style={[styles.detailsContainer, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: isDark ? 1 : 0, borderRadius: 12, padding: 16 }]}>
                            <Text style={[styles.detailsHeader, { color: colors.text }]}>Transaction Details</Text>
                            {detailRows.map((row) => (
                                <React.Fragment key={row.label}>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{row.label}</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>{row.value}</Text>
                                    </View>
                                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                                </React.Fragment>
                            ))}
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Status</Text>
                                <View style={[styles.statusBadge, isVerified ? styles.badgeVerified : styles.badgeNotVerified]}>
                                    <Text style={[styles.statusText, isVerified ? styles.textVerified : styles.textNotVerified]}>
                                        {isVerified ? 'Verified' : 'Not Verified'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {currentStep === 2 && (
                    <View>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>How would you like to receive your funds?</Text>
                        <CurrencyConverter
                            transactionType={transactionType} onTransactionTypeChange={setTransactionType}
                            currencyGet={currencyGet} onCurrencyGetChange={setCurrencyGet}
                            currencySend={currencySend} onCurrencySendChange={setCurrencySend}
                            amountGet={amountGet} amountSend={amountSend}
                            rate={`USD 1 - NGN ${rate.toLocaleString()}`}
                            onAmountGetChange={setAmountGet} onAmountSendChange={setAmountSend}
                        />
                        <View style={[styles.rateInfoBanner, { backgroundColor: isDark ? 'rgba(255, 104, 19, 0.12)' : '#FFF7ED' }]}>
                            <InfoCircle size={moderateScale(20)} color="#F97316" variant="Bold" />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.rateInfoTitle, { color: isDark ? colors.primaryLight : '#334155' }]}>Exchange Rate Details</Text>
                                <Text style={[styles.rateInfoText, { color: colors.textMuted }]}>
                                    {`Funds will be converted to Naira at the rate of USD 1 - NGN ${rate.toLocaleString()} and disbursed to your account.`}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {currentStep === 3 && (
                    <View>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>How would you like your funds disbursed?</Text>
                        <TouchableOpacity
                            style={[
                                styles.optionHeader,
                                { backgroundColor: colors.card, borderColor: colors.border },
                                selectedMethod === 'bank' && [styles.optionHeaderSelected, isDark && { backgroundColor: 'rgba(255, 104, 19, 0.12)' }],
                            ]}
                            onPress={() => setSelectedMethod('bank')} activeOpacity={0.8}
                        >
                            <Text style={[styles.optionText, { color: colors.text }]}>Bank Transfer</Text>
                        </TouchableOpacity>

                        {selectedMethod === 'bank' && (
                            <View style={[styles.optionContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Please select your preferred bank</Text>
                                {isLoadingAccounts ? (
                                    <ActivityIndicator size="small" color="#F97316" style={{ marginVertical: moderateScale(16) }} />
                                ) : savedAccounts.length > 0 ? (
                                    <View style={styles.bankList}>
                                        {savedAccounts.map((account) => (
                                            <TouchableOpacity
                                                key={account.id}
                                                style={[
                                                    styles.bankCard,
                                                    { backgroundColor: colors.card, borderColor: colors.border },
                                                    selectedBank === account.id && [styles.optionHeaderSelected, isDark && { backgroundColor: 'rgba(255, 104, 19, 0.12)' }],
                                                ]}
                                                onPress={() => setSelectedBank(account.id)} activeOpacity={0.8}
                                            >
                                                <View style={[styles.bankIconContainer, { backgroundColor: isDark ? 'rgba(255, 104, 19, 0.12)' : '#FFF7ED' }]}><Bank size={moderateScale(20)} color={isDark ? colors.primaryLight : '#D97706'} /></View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.bankName, { color: colors.text }]}>{account.bankName}</Text>
                                                    <Text style={[styles.accountDetails, { color: colors.textMuted }]} numberOfLines={1}>{account.accountNumber} - {account.accountName}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={[styles.emptyContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC' }]}>
                                        <Text style={[styles.infoText, { color: colors.textMuted }]}>No saved bank accounts found. Please add a new account.</Text>
                                    </View>
                                )}

                                <TouchableOpacity style={[styles.addAccountButton, { backgroundColor: isDark ? 'rgba(255, 104, 19, 0.12)' : '#FFFFFF' }]} onPress={() => setAddModalVisible(true)} activeOpacity={0.8}>
                                    <Add size={moderateScale(18)} color="#F97316" />
                                    <Text style={styles.addAccountText}>Add New Account</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </TransactionLayout>

            <AddBankAccountModal
                visible={addModalVisible} onClose={() => setAddModalVisible(false)}
                onOpenBankSheet={() => setBankSheetVisible(true)} selectedBank={modalBank}
                accountNumber={accountNumber} setAccountNumber={setAccountNumber}
                accountName={accountName} isResolving={isResolving} onSave={handleSave}
            />

            <GenericSelectionSheet
                visible={bankSheetVisible} onClose={() => setBankSheetVisible(false)}
                title="Select Bank" headerIcon={Bank} items={banks} selectedItem={modalBank?.value || ''}
                onSelect={(item) => { setModalBank(item); setBankSheetVisible(false); }}
                confirmButtonText="Select Bank" searchable searchPlaceholder="Search bank..."
            />
        </View>
    );
}

const styles = ScaledSheet.create({
    sectionTitle: { fontSize: '16@ms', fontWeight: '600', color: '#0F172A', marginTop: '14@vs', marginBottom: '16@vs' },
    infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#94A3B8', borderRadius: '8@ms', padding: '12@ms', gap: '12@s', marginBottom: '24@vs' },
    infoText: { fontSize: '13@ms', color: '#64748B', flex: 1 },
    optionsContainer: { gap: '16@vs' },
    optionCard: { flexDirection: 'row', alignItems: 'center', padding: '16@ms', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: '16@ms', backgroundColor: '#FFFFFF', gap: '12@s' },
    optionCardSelected: { borderColor: '#F97316', borderWidth: 1.5 },
    optionText: { fontSize: '14@ms', fontWeight: '500', color: '#334155' },
    iconPlaceholderRed: { width: '32@ms', height: '32@ms', borderRadius: '16@ms', backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center' },
    iconPlaceholderYellow: { width: '32@ms', height: '32@ms', borderRadius: '4@ms', backgroundColor: '#FACC15', justifyContent: 'center', alignItems: 'center' },
    iconTextBlack: { color: '#000000', fontWeight: '900', fontSize: '18@ms' },
    formContainer: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: '16@ms', padding: '16@ms' },
    inputError: { borderColor: '#EF4444' },
    errorText: { color: '#EF4444', fontSize: '12@ms', marginTop: '8@vs' },
    detailsContainer: { backgroundColor: '#F8FAFC' },
    detailsHeader: { fontSize: '14@ms', fontWeight: '600', color: '#0F172A', marginBottom: '16@vs' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: '8@vs' },
    detailLabel: { fontSize: '14@ms', color: '#64748B' },
    detailValue: { fontSize: '14@ms', color: '#334155', fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: '8@vs' },
    statusBadge: { paddingHorizontal: '12@s', paddingVertical: '4@vs', borderRadius: '12@ms' },
    badgeVerified: { backgroundColor: '#DCFCE7' },
    badgeNotVerified: { backgroundColor: '#FEE2E2' },
    statusText: { fontSize: '12@ms', fontWeight: '600' },
    textVerified: { color: '#166534' },
    textNotVerified: { color: '#991B1B' },
    rateInfoBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF7ED', borderRadius: '12@ms', padding: '16@ms', gap: '12@s', marginTop: '24@vs' },
    rateInfoTitle: { fontSize: '14@ms', fontWeight: '600', color: '#334155', marginBottom: '4@vs' },
    rateInfoText: { fontSize: '13@ms', color: '#64748B', lineHeight: '20@ms' },
    optionHeader: { padding: '16@ms', borderWidth: 1.5, borderColor: '#F1F5F9', borderRadius: '8@ms', backgroundColor: '#FCFCFC' },
    optionHeaderSelected: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
    optionContent: { marginTop: '16@vs', marginBottom: '4@vs', paddingLeft: '4@s', borderWidth: 1.5, borderColor: '#F1F5F9', borderRadius: '8@ms', backgroundColor: '#FFFFFF' },
    subLabel: { fontSize: '14@ms', color: '#475569', marginVertical: '12@vs', marginHorizontal: '12@s' },
    bankList: { gap: '12@vs', marginBottom: '8@vs' },
    bankCard: { flexDirection: 'row', alignItems: 'center', padding: '16@ms', marginHorizontal: '7@s', borderWidth: 1.5, borderColor: '#F1F5F9', borderRadius: '12@ms', backgroundColor: '#FCFCFC', gap: '12@s' },
    bankIconContainer: { width: '40@ms', height: '40@ms', borderRadius: '20@ms', backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' },
    bankName: { fontSize: '14@ms', fontWeight: '600', color: '#334155', marginBottom: '2@vs' },
    accountDetails: { fontSize: '12@ms', color: '#94A3B8' },
    emptyContainer: { padding: '16@ms', marginHorizontal: '7@s', marginBottom: '8@vs', backgroundColor: '#F8FAFC', borderRadius: '8@ms', alignItems: 'center' },
    addAccountButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: '14@ms', borderWidth: 1, borderColor: '#F97316', borderRadius: '30@ms', backgroundColor: '#FFFFFF', gap: '8@s', width: '55%', alignSelf: 'flex-start', marginHorizontal: '12@s', marginVertical: '9@vs' },
    addAccountText: { fontSize: '14@ms', fontWeight: '600', color: '#F97316' },
});
