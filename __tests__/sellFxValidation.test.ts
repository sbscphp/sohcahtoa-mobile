import { residentStep0Schema } from '../utils/validations/resident';
import { touristStep0Schema } from '../utils/validations/tourist';
import { expatriateStep0Schema } from '../utils/validations/expatriate';

describe('Sell FX International Passport Validation', () => {
    describe('residentStep0Schema', () => {
        it('should accept non-standard/international passport formats without regex constraints', () => {
            const formats = [
                '12345678',
                'US99988877',
                'ABC123456789',
                'P123',
                'A12345678',
                'XYZ-99001'
            ];

            for (const passport of formats) {
                const result = residentStep0Schema.safeParse({
                    bvn: '12345678901',
                    nin: '12345678901',
                    tinNumber: '1234567890',
                    passportDocumentNumber: passport
                });
                expect(result.success).toBe(true);
            }
        });

        it('should accept hashed bvn, nin, and tin', () => {
            const result = residentStep0Schema.safeParse({
                bvn: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                nin: 'a1b2c3d4e5f6g7h8i9j0',
                tinNumber: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
                passportDocumentNumber: 'A12345678'
            });
            expect(result.success).toBe(true);
        });

        it('should reject empty passport number', () => {
            const result = residentStep0Schema.safeParse({
                bvn: '12345678901',
                nin: '12345678901',
                tinNumber: '1234567890',
                passportDocumentNumber: ''
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Please enter your International Passport Number');
            }
        });
    });

    describe('touristStep0Schema', () => {
        it('should accept non-standard/international passport formats', () => {
            const formats = [
                '987654321',
                'UK1234567',
                'FR789012',
                'A12345678'
            ];

            for (const passport of formats) {
                const result = touristStep0Schema.safeParse({
                    passportDocumentNumber: passport,
                    nigerianAddress: 'Transcorp Hilton Hotel, Abuja'
                });
                expect(result.success).toBe(true);
            }
        });

        it('should reject empty passport number', () => {
            const result = touristStep0Schema.safeParse({
                passportDocumentNumber: '',
                nigerianAddress: 'Transcorp Hilton Hotel, Abuja'
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Please enter your International Passport Number');
            }
        });
    });

    describe('expatriateStep0Schema', () => {
        it('should accept non-standard/international passport formats', () => {
            const result = expatriateStep0Schema.safeParse({
                bvn: '12345678901',
                nin: '12345678901',
                tinNumber: '1234567890',
                passportDocumentNumber: 'EXP99887766'
            });
            expect(result.success).toBe(true);
        });

        it('should reject empty passport number', () => {
            const result = expatriateStep0Schema.safeParse({
                bvn: '12345678901',
                nin: '12345678901',
                tinNumber: '1234567890',
                passportDocumentNumber: ''
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Please enter your International Passport Number');
            }
        });
    });
});
