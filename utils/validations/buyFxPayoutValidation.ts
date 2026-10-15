import { z } from 'zod';
import { useAuthStore } from '@/stores/useAuthStore';
import { isPickupDateTimeAtLeastOneHourAhead, PICKUP_TOO_SOON_MESSAGE } from '@/utils/pickupDateTime';
import { SelectionItem } from '@/components/GenericSelectionSheet';

export const PAYOUT_METHODS: SelectionItem[] = [
    { id: '1', label: 'Electronic Transfer (100%)', value: 'Electronic Transfer (100%)' },
    { id: '2', label: 'Card (100%)', value: 'Card (100%)' },
    { id: '3', label: 'Card (75%) + Cash (25%)', value: 'Card (75%) + Cash (25%)' },
    { id: '4', label: 'Cash (25%) + Electronic Transfer (75%)', value: 'Cash (25%) + Electronic Transfer (75%)' },
];

export const PAYOUT_METHODS_WITHOUT_CASH_SPLIT: SelectionItem[] = [
    { id: '1', label: 'Electronic Transfer (100%)', value: 'Electronic Transfer (100%)' },
    { id: '2', label: 'Card (100%)', value: 'Card (100%)' },
    { id: '3', label: 'Card (75%) + Cash (25%)', value: 'Card (75%) + Cash (25%)' },
];

export const defaultPayoutValues = {
    amount: 0,
    selectedState: undefined as any,
    selectedCity: undefined as any,
    selectedLocation: undefined as any,
    pickupDate: '',
    pickupTime: '',
    payoutMethod: '',
    customerBankName: '',
    customerBankCode: '',
    customerAccountNumber: '',
    customerAccountName: '',
    domiciliaryAccountNumber: '',
    domiciliaryBankName: '',
    domiciliaryAccountName: '',
    domiciliarySwiftCode: '',
    domiciliaryRoutingNumber: '',
    domiciliaryBankAddress: '',
};

export const isBuyFxPayoutStepValid = (watchedFields: any) => {
    if (!watchedFields.payoutMethod) return false;
    const isElectronic = watchedFields.payoutMethod.includes('Electronic');
    if (!isElectronic) return true;
    if (watchedFields.payoutMethod === 'Electronic Transfer (100%)' || watchedFields.payoutMethod === 'Cash (25%) + Electronic Transfer (75%)') {
        return !!(
            watchedFields.domiciliaryAccountNumber?.length === 10 &&
            watchedFields.domiciliaryBankName &&
            watchedFields.domiciliaryAccountName &&
            watchedFields.domiciliarySwiftCode &&
            watchedFields.domiciliaryRoutingNumber &&
            watchedFields.domiciliaryBankAddress
        );
    }
    return !!(
        watchedFields.customerBankName &&
        watchedFields.customerBankCode &&
        watchedFields.customerAccountNumber &&
        watchedFields.customerAccountName
    );
};

export const isBuyFxLocationStepValid = (watchedFields: any) => {
    return !!(
        watchedFields.selectedState &&
        watchedFields.selectedCity &&
        watchedFields.selectedLocation &&
        watchedFields.pickupDate &&
        watchedFields.pickupTime
    );
};

export const buyFxPayoutFieldsSchema = z.object({
    payoutMethod: z.string().min(1, 'Please select a payout method'),
    customerBankName: z.string().optional().or(z.literal('')),
    customerBankCode: z.string().optional().or(z.literal('')),
    customerAccountNumber: z.string().optional().or(z.literal('')),
    customerAccountName: z.string().optional().or(z.literal('')),
    domiciliaryAccountNumber: z.string().optional().or(z.literal('')),
    domiciliaryBankName: z.string().optional().or(z.literal('')),
    domiciliaryAccountName: z.string().optional().or(z.literal('')),
    domiciliarySwiftCode: z.string().optional().or(z.literal('')),
    domiciliaryRoutingNumber: z.string().optional().or(z.literal('')),
    domiciliaryBankAddress: z.string().optional().or(z.literal('')),
    selectedState: z.any().optional(),
    selectedCity: z.any().optional(),
    selectedLocation: z.any().optional(),
    pickupDate: z.string().optional().or(z.literal('')),
    pickupTime: z.string().optional().or(z.literal('')),
});

export const refineBuyFxPayoutAndLocation = (data: any, ctx: z.RefinementCtx, customUser?: any) => {
    const user = customUser || useAuthStore.getState().user;
    const profileBvn = user?.kyc?.bvn || '';
    const profileNin = (user?.kyc as any)?.nin || (user as any)?.nin || '';

    if ('bvn' in data && !profileBvn && !data.bvn) {
        ctx.addIssue({
            code: 'custom',
            message: 'BVN is required',
            path: ['bvn'],
        });
    }

    if ('nin' in data && !profileNin && !data.nin) {
        ctx.addIssue({
            code: 'custom',
            message: 'NIN is required',
            path: ['nin'],
        });
    }

    const isElectronicTransfer = data.payoutMethod?.includes('Electronic');
    const isDomiciliary = data.payoutMethod === 'Electronic Transfer (100%)' ||
                          data.payoutMethod === 'Cash (25%) + Electronic Transfer (75%)';
    const needsLocation = data.payoutMethod && data.payoutMethod !== 'Electronic Transfer (100%)';

    if (isDomiciliary) {
        if (!data.domiciliaryAccountNumber) {
            ctx.addIssue({
                code: 'custom',
                message: 'Please enter domiciliary account number',
                path: ['domiciliaryAccountNumber'],
            });
        } else if (data.domiciliaryAccountNumber.length !== 10 || !/^\d+$/.test(data.domiciliaryAccountNumber)) {
            ctx.addIssue({
                code: 'custom',
                message: 'Domiciliary account number must be 10 digits',
                path: ['domiciliaryAccountNumber'],
            });
        }

        if (!data.domiciliaryBankName) {
            ctx.addIssue({
                code: 'custom',
                message: 'Please enter bank name',
                path: ['domiciliaryBankName'],
            });
        } else if (data.domiciliaryBankName.trim().length < 2) {
            ctx.addIssue({
                code: 'custom',
                message: 'Bank name must be at least 2 characters',
                path: ['domiciliaryBankName'],
            });
        }

        if (!data.domiciliaryAccountName) {
            ctx.addIssue({
                code: 'custom',
                message: 'Please enter account name',
                path: ['domiciliaryAccountName'],
            });
        } else if (data.domiciliaryAccountName.trim().length < 3 || !/^[A-Za-z\s.\-]+$/.test(data.domiciliaryAccountName)) {
            ctx.addIssue({
                code: 'custom',
                message: 'Account name must be at least 3 characters and contain only letters',
                path: ['domiciliaryAccountName'],
            });
        } else {
            const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
            const enteredName = normalize(data.domiciliaryAccountName);
            const registeredFirst = normalize(user?.profile?.firstName || '');
            const registeredLast = normalize(user?.profile?.lastName || '');
            if (
                registeredFirst && registeredLast &&
                !enteredName.includes(registeredFirst) && !enteredName.includes(registeredLast)
            ) {
                ctx.addIssue({
                    code: 'custom',
                    message: "Account name doesn't match your registered name. Please check and try again.",
                    path: ['domiciliaryAccountName'],
                });
            }
        }

        if (!data.domiciliarySwiftCode) {
            ctx.addIssue({
                code: 'custom',
                message: 'Please enter SWIFT code',
                path: ['domiciliarySwiftCode'],
            });
        } else if (!/^[A-Za-z]{4}[A-Za-z]{2}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/.test(data.domiciliarySwiftCode)) {
            ctx.addIssue({
                code: 'custom',
                message: 'Invalid SWIFT code format. Expected: 4 letters + 2 letters + 2 characters (+ optional 3 characters), e.g. CITIUS33 or CITIUS33XXX',
                path: ['domiciliarySwiftCode'],
            });
        }

        if (!data.domiciliaryRoutingNumber) {
            ctx.addIssue({
                code: 'custom',
                message: 'Please enter routing number',
                path: ['domiciliaryRoutingNumber'],
            });
        } else if (data.domiciliaryRoutingNumber.length !== 9 || !/^\d+$/.test(data.domiciliaryRoutingNumber)) {
            ctx.addIssue({
                code: 'custom',
                message: 'Routing number must be exactly 9 digits',
                path: ['domiciliaryRoutingNumber'],
            });
        }

        if (!data.domiciliaryBankAddress) {
            ctx.addIssue({
                code: 'custom',
                message: 'Please enter bank address',
                path: ['domiciliaryBankAddress'],
            });
        } else if (data.domiciliaryBankAddress.trim().length < 5) {
            ctx.addIssue({
                code: 'custom',
                message: 'Bank address must be at least 5 characters',
                path: ['domiciliaryBankAddress'],
            });
        }
    } else if (isElectronicTransfer) {
        if (!data.customerBankName) {
            ctx.addIssue({
                code: 'custom',
                message: 'Please select your bank',
                path: ['customerBankName'],
            });
        }
        if (!data.customerBankCode) {
            ctx.addIssue({
                code: 'custom',
                message: 'Please select your bank',
                path: ['customerBankCode'],
            });
        }
        if (!data.customerAccountNumber || data.customerAccountNumber.length !== 10) {
            ctx.addIssue({
                code: 'custom',
                message: 'Account number must be 10 digits',
                path: ['customerAccountNumber'],
            });
        }
        if (!data.customerAccountName) {
            ctx.addIssue({
                code: 'custom',
                message: 'Account name must be resolved',
                path: ['customerAccountName'],
            });
        }
    }

    if (needsLocation) {
        if (!data.selectedState) {
            ctx.addIssue({
                code: 'custom',
                message: 'Please select a state',
                path: ['selectedState'],
            });
        }
        if (!data.selectedCity) {
            ctx.addIssue({
                code: 'custom',
                message: 'Please select a city',
                path: ['selectedCity'],
            });
        }
        if (!data.selectedLocation) {
            ctx.addIssue({
                code: 'custom',
                message: 'Please select a pickup location',
                path: ['selectedLocation'],
            });
        }
        if (!data.pickupDate) {
            ctx.addIssue({
                code: 'custom',
                message: 'Please select a pickup date',
                path: ['pickupDate'],
            });
        }
        if (!data.pickupTime) {
            ctx.addIssue({
                code: 'custom',
                message: 'Please select a pickup time',
                path: ['pickupTime'],
            });
        }
    }

    if (data.passportIssueDate && data.passportExpiryDate && data.passportIssueDate === data.passportExpiryDate) {
        ctx.addIssue({
            code: 'custom',
            message: 'Passport Expiry Date cannot be the same as Passport Issue Date',
            path: ['passportExpiryDate'],
        });
    }

    if (data.pickupDate && data.pickupTime && !isPickupDateTimeAtLeastOneHourAhead(data.pickupDate, data.pickupTime)) {
        ctx.addIssue({
            code: 'custom',
            message: PICKUP_TOO_SOON_MESSAGE,
            path: ['pickupTime'],
        });
    }
};
