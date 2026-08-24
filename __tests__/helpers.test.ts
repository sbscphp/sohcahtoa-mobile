import { isPaymentRequired, mapApiStatusToViewStatus, getTransactionMessage } from '../utils/helpers';

describe('helpers - isPaymentRequired', () => {
    it('returns true for APPROVED and AWAITING_DEPOSIT statuses regardless of casing', () => {
        expect(isPaymentRequired('APPROVED')).toBe(true);
        expect(isPaymentRequired('approved')).toBe(true);
        expect(isPaymentRequired('AWAITING_DEPOSIT')).toBe(true);
        expect(isPaymentRequired('awaiting_deposit')).toBe(true);
    });

    it('returns false for post-payment and other statuses', () => {
        expect(isPaymentRequired('DEPOSIT_CONFIRMED')).toBe(false);
        expect(isPaymentRequired('deposit_confirmed')).toBe(false);
        expect(isPaymentRequired('DEPOSIT_PENDING')).toBe(false);
        expect(isPaymentRequired('DISBURSEMENT_IN_PROGRESS')).toBe(false);
        expect(isPaymentRequired('COMPLETED')).toBe(false);
        expect(isPaymentRequired('SETTLED')).toBe(false);
        expect(isPaymentRequired('REJECTED')).toBe(false);
        expect(isPaymentRequired('CANCELLED')).toBe(false);
        expect(isPaymentRequired('DRAFT')).toBe(false);
        expect(isPaymentRequired(undefined)).toBe(false);
    });
});

describe('helpers - getTransactionMessage', () => {
    it('returns payment prompt for APPROVED or AWAITING_DEPOSIT', () => {
        const msg = getTransactionMessage({ status: 'APPROVED' }, 'application');
        expect(msg).toContain('Please proceed to payment');

        const msg2 = getTransactionMessage({ status: 'AWAITING_DEPOSIT' }, 'school fees payment request');
        expect(msg2).toContain('Please proceed to payment');
    });

    it('returns deposit confirmed message for DEPOSIT_CONFIRMED or DEPOSIT_PENDING', () => {
        const msg = getTransactionMessage({ status: 'DEPOSIT_CONFIRMED' });
        expect(msg).toContain('Your deposit has been received and confirmed');
        expect(msg).not.toContain('proceed to payment');
    });

    it('returns disbursement in progress message for DISBURSEMENT_IN_PROGRESS or AWAITING_DISBURSEMENT', () => {
        const msg = getTransactionMessage({ status: 'DISBURSEMENT_IN_PROGRESS' });
        expect(msg).toContain('Disbursement is currently in progress');
        expect(msg).not.toContain('proceed to payment');

        const msg2 = getTransactionMessage({ status: 'AWAITING_DISBURSEMENT' });
        expect(msg2).toContain('Disbursement is currently in progress');
        expect(msg2).not.toContain('proceed to payment');
    });

    it('returns completed message for COMPLETED or SETTLED', () => {
        const msg = getTransactionMessage({ status: 'COMPLETED' });
        expect(msg).toContain('completed successfully');
    });
});

describe('helpers - mapApiStatusToViewStatus', () => {
    it('maps statuses correctly and handles case insensitivity', () => {
        expect(mapApiStatusToViewStatus('APPROVED')).toBe('approved');
        expect(mapApiStatusToViewStatus('approved')).toBe('approved');
        expect(mapApiStatusToViewStatus('DEPOSIT_CONFIRMED')).toBe('awaiting_disbursement');
        expect(mapApiStatusToViewStatus('deposit_confirmed')).toBe('awaiting_disbursement');
        expect(mapApiStatusToViewStatus('COMPLETED')).toBe('settled');
        expect(mapApiStatusToViewStatus('REJECTED')).toBe('rejected');
        expect(mapApiStatusToViewStatus('REFUNDED')).toBe('refunded');
        expect(mapApiStatusToViewStatus(undefined)).toBe('pending');
    });
});

describe('helpers - digital signature handling with sample response data', () => {
    const sampleTx = {
        type: 'EXPATRIATE_FX',
        requiredDocuments: [
            {
                type: 'DIGITAL_SIGNATURE',
                required: true,
                uploaded: {
                    id: 'c4bb46ca-4a1a-4496-ae1f-02a46e6c5a1d',
                    fileName: 'Digital Signature',
                    fileUrl: null,
                    status: 'PENDING',
                    rejectionNotes: null,
                    uploadedAt: '2026-08-24T10:33:29.046Z',
                    verifiedAt: null,
                    signed: true,
                    signatureText: 'AO',
                    note: 'Customer has already signed digitally — no document upload required'
                }
            }
        ]
    };

    it('extracts signatureText "AO" as value in getTransactionDocuments', () => {
        const { getTransactionDocuments } = require('../utils/helpers');
        const docs = getTransactionDocuments(sampleTx);
        expect(docs).toContainEqual({
            label: 'Declaration Document (Signature)',
            value: 'AO'
        });
    });

    it('does not treat digital signature with null fileUrl as an uploaded file in getTransactionUploadedDocs', () => {
        const { getTransactionUploadedDocs } = require('../utils/helpers');
        const uploadedDocs = getTransactionUploadedDocs(sampleTx);
        expect(uploadedDocs).toEqual([]);
    });

    it('builds doc item with value "AO" and does not require file upload in buildTransactionDocsItems', () => {
        const { buildTransactionDocsItems } = require('../utils/helpers');
        const items = buildTransactionDocsItems(sampleTx);
        expect(items).toHaveLength(1);
        expect(items[0].value).toBe('AO');
        expect(items[0].fileName).toBeNull();
    });
});

describe('helpers - buildPickupLocationPayload', () => {
    const { buildPickupLocationPayload } = require('../utils/helpers');

    it('returns undefined if selectedLocation is null or undefined', () => {
        expect(buildPickupLocationPayload({ selectedLocation: null })).toBeUndefined();
        expect(buildPickupLocationPayload({ selectedLocation: undefined })).toBeUndefined();
    });

    it('correctly maps all location metadata including address, phoneNumber, email, state, and city', () => {
        const selectedLocation = {
            id: '7dd7ba2d-9381-4d8f-b176-6c5617bac253',
            title: 'London',
            subtitle: '3 Musa Street',
            metadata: {
                id: '7dd7ba2d-9381-4d8f-b176-6c5617bac253',
                name: 'London',
                address: '3 Musa Street',
                city: 'Ethiope East',
                location: 'Delta',
                email: 'verifytestuser@yopmail.com',
                phoneNumber: '09098277222'
            }
        };

        const result = buildPickupLocationPayload({
            selectedLocation,
            selectedState: { id: 's1', title: 'Fallback State' },
            selectedCity: { id: 'c1', title: 'Fallback City' },
            pickupDate: '25/08/2026',
            pickupTime: '10:30 AM',
            amount: 250,
            currency: 'USD'
        });

        expect(result).toEqual({
            id: '7dd7ba2d-9381-4d8f-b176-6c5617bac253',
            locationId: '7dd7ba2d-9381-4d8f-b176-6c5617bac253',
            name: 'London',
            address: '3 Musa Street',
            state: 'Delta',
            city: 'Ethiope East',
            phoneNumber: '09098277222',
            recipientPhone: '09098277222',
            email: 'verifytestuser@yopmail.com',
            recipientEmail: 'verifytestuser@yopmail.com',
            scheduledPickupDate: '2026-08-25',
            scheduledPickupTime: '10:30 AM',
            date: '25/08/2026',
            time: '10:30 AM',
            amount: 250,
            currency: 'USD'
        });
    });

    it('falls back to title, subtitle, and selected state/city when metadata is not present', () => {
        const selectedLocation = {
            id: 'loc-1',
            title: 'Victoria Island Office',
            subtitle: '123 Ahmadu Bello Way'
        };

        const result = buildPickupLocationPayload({
            selectedLocation,
            selectedState: { id: 's1', title: 'Lagos' },
            selectedCity: { id: 'c1', title: 'Ikeja' },
            pickupDate: '2026-08-26',
            pickupTime: '02:00 PM'
        });

        expect(result).toEqual({
            id: 'loc-1',
            locationId: 'loc-1',
            name: 'Victoria Island Office',
            address: '123 Ahmadu Bello Way',
            state: 'Lagos',
            city: 'Ikeja',
            phoneNumber: '',
            recipientPhone: '',
            email: '',
            recipientEmail: '',
            scheduledPickupDate: '2026-08-26',
            scheduledPickupTime: '02:00 PM',
            date: '2026-08-26',
            time: '02:00 PM'
        });
    });
});


