import { z } from 'zod';
import { isPickupDateTimeAtLeastOneHourAhead, PICKUP_TOO_SOON_MESSAGE } from '@/utils/pickupDateTime';
import { SelectionItem } from '@/components/GenericSelectionSheet';

export const PAYOUT_METHODS: SelectionItem[] = [
    { id: '1', label: 'Electronic Transfer (to a naira acct)', value: 'Electronic Transfer' },
    { id: '2', label: 'Prepaid NGN Card', value: 'Prepaid NGN Card' },
];

export const sellFxPayoutFields = {
    payoutMethod: z.string().min(1, 'Please select a payout method'),
    customerBankName: z.string().optional().or(z.literal('')),
    customerBankCode: z.string().optional().or(z.literal('')),
    customerAccountNumber: z.string().optional().or(z.literal('')),
    customerAccountName: z.string().optional().or(z.literal('')),
    domiciliaryBankName: z.string().optional().or(z.literal('')),
    domiciliaryAccountNumber: z.string().optional().or(z.literal('')),
    domiciliaryAccountName: z.string().optional().or(z.literal('')),
    domiciliarySwiftCode: z.string().optional().or(z.literal('')),
    domiciliaryRoutingNumber: z.string().optional().or(z.literal('')),
    domiciliaryBankAddress: z.string().optional().or(z.literal('')),
    selectedState: z.any().optional(),
    selectedCity: z.any().optional(),
    selectedLocation: z.any().optional(),
    pickupDate: z.string().optional().or(z.literal('')),
    pickupTime: z.string().optional().or(z.literal('')),
};

export const defaultSellFxPayoutValues = {
    payoutMethod: '',
    customerBankName: '',
    customerBankCode: '',
    customerAccountNumber: '',
    customerAccountName: '',
    domiciliaryBankName: '',
    domiciliaryAccountNumber: '',
    domiciliaryAccountName: '',
    domiciliarySwiftCode: '',
    domiciliaryRoutingNumber: '',
    domiciliaryBankAddress: '',
    selectedState: undefined,
    selectedCity: undefined,
    selectedLocation: undefined,
    pickupDate: '',
    pickupTime: '',
};

export function refineSellFxPayout(
    data: any,
    ctx: z.RefinementCtx,
    options?: { requireBvnOrTin?: boolean }
) {
    if (options?.requireBvnOrTin) {
        if (!data.bvn && !data.tinNumber) {
            ctx.addIssue({
                code: 'custom',
                message: 'Either BVN or TIN is required',
                path: ['tinNumber'],
            });
        }
    }

    const isElectronicTransfer = data.payoutMethod?.includes('Electronic') || data.payoutMethod === 'Electronic Transfer';

    if (isElectronicTransfer) {
        if (!data.customerBankName) {
            ctx.addIssue({ code: 'custom', message: 'Please select your bank', path: ['customerBankName'] });
        }
        if (!data.customerBankCode) {
            ctx.addIssue({ code: 'custom', message: 'Please select your bank', path: ['customerBankCode'] });
        }
        if (!data.customerAccountNumber || data.customerAccountNumber.length !== 10) {
            ctx.addIssue({ code: 'custom', message: 'Account number must be 10 digits', path: ['customerAccountNumber'] });
        }
        if (!data.customerAccountName) {
            ctx.addIssue({ code: 'custom', message: 'Account name must be resolved', path: ['customerAccountName'] });
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
        ctx.addIssue({ code: 'custom', message: PICKUP_TOO_SOON_MESSAGE, path: ['pickupTime'] });
    }
}
