import { btaStep0Schema } from '../utils/validations/bta';
import { formAIdField, tinField } from '../utils/validations/shared';

describe('BTA TIN Validation', () => {
    it('should reject empty TIN', () => {
        const result = tinField.safeParse('');
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

    it('should accept hashed/alphanumeric TIN', () => {
        const result = tinField.safeParse('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
        expect(result.success).toBe(true);
    });

    it('should accept alphanumeric TIN with mixed letters and numbers', () => {
        const result = tinField.safeParse('12345ABCDE');
        expect(result.success).toBe(true);
    });

    it('should accept valid 10-digit TIN', () => {
        const result = tinField.safeParse('1234567890');
        expect(result.success).toBe(true);
    });

    it('should accept valid 13-digit TIN', () => {
        const result = tinField.safeParse('1234567890123');
        expect(result.success).toBe(true);
    });

    it('should validate btaStep0Schema with required TIN and hashed credentials', () => {
        const validPayload = {
            bvn: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            nin: 'a1b2c3d4e5f6g7h8i9j0',
            formAId: '1234567890',
            passportDocumentNumber: 'A12345678',
            tinNumber: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
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

describe('Form A ID Validation', () => {
    it('should accept 10-character alphanumeric Form A ID', () => {
        const result = formAIdField.safeParse('AB12345678');
        expect(result.success).toBe(true);
    });

    it('should accept 10-digit numeric Form A ID', () => {
        const result = formAIdField.safeParse('1234567890');
        expect(result.success).toBe(true);
    });

    it('should reject Form A ID with fewer than 10 characters', () => {
        const result = formAIdField.safeParse('123456789');
        expect(result.success).toBe(false);
    });

    it('should reject Form A ID with more than 10 characters', () => {
        const result = formAIdField.safeParse('12345678901');
        expect(result.success).toBe(false);
    });
});

