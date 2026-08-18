import { btaStep0Schema } from '../utils/validations/bta';
import { tinField } from '../utils/validations/shared';

describe('BTA TIN Validation', () => {
    it('should reject empty TIN', () => {
        const result = tinField.safeParse('');
        expect(result.success).toBe(false);
    });

    it('should reject TIN with fewer than 9 digits', () => {
        const result = tinField.safeParse('12345678');
        expect(result.success).toBe(false);
    });

    it('should accept valid 9-digit TIN', () => {
        const result = tinField.safeParse('123456789');
        expect(result.success).toBe(true);
    });

    it('should accept valid formatted TIN with hyphens', () => {
        const result = tinField.safeParse('08120451-1001');
        expect(result.success).toBe(true);
    });

    it('should reject TIN with more than 13 digits', () => {
        const result = tinField.safeParse('12345678901234');
        expect(result.success).toBe(false);
    });

    it('should reject non-numeric TIN with letters', () => {
        const result = tinField.safeParse('12345ABCDE');
        expect(result.success).toBe(false);
    });

    it('should accept valid 10-digit TIN', () => {
        const result = tinField.safeParse('1234567890');
        expect(result.success).toBe(true);
    });

    it('should accept valid 13-digit TIN', () => {
        const result = tinField.safeParse('1234567890123');
        expect(result.success).toBe(true);
    });

    it('should validate btaStep0Schema with required TIN', () => {
        const validPayload = {
            bvn: '12345678901',
            nin: '12345678901',
            formAId: '1234567890',
            passportDocumentNumber: 'A12345678',
            tinNumber: '1234567890',
        };
        const validResult = btaStep0Schema.safeParse(validPayload);
        expect(validResult.success).toBe(true);

        const invalidPayload = {
            ...validPayload,
            tinNumber: '',
        };
        const invalidResult = btaStep0Schema.safeParse(invalidPayload);
        expect(invalidResult.success).toBe(false);
    });
});
