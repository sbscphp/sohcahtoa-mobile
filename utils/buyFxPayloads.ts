import { buildPickupLocationPayload } from '@/utils/helpers';

export interface BuildBuyFxPayloadParams {
    type: string;
    purpose: string;
    currency: string;
    country?: string;
    amount: number;
    bvn?: string;
    nin?: string;
    tinNumber?: string;
    formAId?: string;
    passportDocumentNumber?: string;
    passportIssueDate?: string;
    passportExpiryDate?: string;
    documents: any[];
    payoutMethod?: string;
    needsLocationStep?: boolean;
    data: any;
}

export function buildBuyFxPayload(params: BuildBuyFxPayloadParams) {
    const {
        type,
        purpose,
        currency,
        country,
        amount,
        bvn,
        nin,
        tinNumber,
        formAId,
        passportDocumentNumber,
        passportIssueDate,
        passportExpiryDate,
        documents,
        payoutMethod,
        needsLocationStep,
        data,
    } = params;

    return {
        type,
        mode: 'BUY',
        currency,
        amount,
        purpose,
        destinationCountry: country,
        bvn,
        nin,
        ...(tinNumber ? { tinNumber } : {}),
        formAId,
        passportDocumentNumber,
        passportIssueDate,
        passportExpiryDate,
        documents,
        pickupLocation: (needsLocationStep && data.selectedLocation) ? buildPickupLocationPayload({
            selectedLocation: data.selectedLocation,
            selectedState: data.selectedState,
            selectedCity: data.selectedCity,
            pickupDate: data.pickupDate || '',
            pickupTime: data.pickupTime || '',
            amount: (data.payoutMethod === 'Card (75%) + Cash (25%)' || data.payoutMethod === 'Cash (25%) + Electronic Transfer (75%)')
                ? (Number(data.amount) * 0.25)
                : (Number(data.amount) || 0),
            currency,
        }) : undefined,
        payoutMethod,
        beneficiaryDetails: (data.payoutMethod?.includes('Electronic')) ? {
            bankName: data.domiciliaryBankName,
            accountNumber: data.domiciliaryAccountNumber,
            accountName: data.domiciliaryAccountName,
            ...(data.domiciliarySwiftCode?.trim() ? { swiftCode: data.domiciliarySwiftCode.trim() } : {}),
            ...(data.domiciliaryRoutingNumber?.trim() ? { routingNumber: data.domiciliaryRoutingNumber.trim() } : {}),
            ...(data.domiciliaryBankAddress?.trim() ? { bankAddress: data.domiciliaryBankAddress.trim() } : {}),
        } : undefined,
        refundBankDetails: {
            bankName: data.customerBankName,
            bankCode: data.customerBankCode,
            accountNumber: data.customerAccountNumber,
            accountName: data.customerAccountName,
        },
    };
}
