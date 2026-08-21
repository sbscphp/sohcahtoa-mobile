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
