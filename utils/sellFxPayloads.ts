import { buildPickupLocationPayload } from '@/utils/helpers';
import { useDeclarationStore } from '@/stores/useDeclarationStore';

interface BuildSellFxPayloadParams {
    type: 'RESIDENT_FX' | 'TOURIST_FX' | 'EXPATRIATE_FX';
    purpose: string;
    currencyGet: { code: string; country?: string };
    data: any;
    documents: any[];
    initials?: string;
}

export function buildSellFxPayload({
    type,
    purpose,
    currencyGet,
    data,
    documents,
    initials,
}: BuildSellFxPayloadParams) {
    const isElectronicTransfer =
        data.payoutMethod?.includes('Electronic') || data.payoutMethod === 'Electronic Transfer';

    const declarationState = useDeclarationStore.getState();
    const effectiveInitials = (initials || declarationState.initials || '').trim();

    const payload: any = {
        type,
        mode: 'SELL',
        currency: currencyGet.code,
        amount: Number(data.amount),
        purpose,
        destinationCountry: currencyGet.country,
        bvn: data.bvn,
        nin: data.nin,
        passportDocumentNumber: data.passportDocumentNumber,
        passportIssueDate: data.passportIssueDate,
        passportExpiryDate: data.passportExpiryDate,
        documents,
        payoutMethod: data.payoutMethod,
        ...(data.tinNumber ? { tinNumber: data.tinNumber } : {}),
        ...(isElectronicTransfer
            ? {
                  beneficiaryDetails: {
                      bankName: data.customerBankName,
                      bankCode: data.customerBankCode,
                      accountNumber: data.customerAccountNumber,
                      accountName: data.customerAccountName,
                  },
              }
            : {}),
        refundBankDetails: {
            bankName: data.domiciliaryBankName,
            accountNumber: data.domiciliaryAccountNumber,
            accountName: data.domiciliaryAccountName,
            swiftCode: data.domiciliarySwiftCode,
            routingNumber: data.domiciliaryRoutingNumber,
            bankAddress: data.domiciliaryBankAddress,
        },
        ...(declarationState.declarationMethod === 'initials' && effectiveInitials
            ? { digitalSignature: effectiveInitials }
            : {}),
    };

    if (!isElectronicTransfer && data.selectedLocation) {
        payload.pickupLocation = buildPickupLocationPayload({
            selectedLocation: data.selectedLocation,
            selectedState: data.selectedState,
            selectedCity: data.selectedCity,
            pickupDate: data.pickupDate,
            pickupTime: data.pickupTime,
        });
    }

    return payload;
}
