import {
    bvnField,
    formAIdField,
    passportDocumentNumberField,
    visaNumberField,
    ticketNumberField,
    baseCredentialSchema,
    bankDetailsStepSchema,
    medicalBankDetailsStepSchema,
} from '@/utils/validations/shared';
import { sanitizeFileName } from '@/utils/fileDownload';

describe('Data Validation & Injection Defense (MASVS-PLATFORM / MASVS-CODE)', () => {
    describe('passportDocumentNumberField', () => {
        it('accepts valid Nigerian / International passport numbers (1 letter + 8 digits)', () => {
            expect(passportDocumentNumberField.safeParse('A12345678').success).toBe(true);
            expect(passportDocumentNumberField.safeParse('b98765432').success).toBe(true);
        });

        it('rejects SQL injection, XSS, or malformed passport payloads', () => {
            expect(passportDocumentNumberField.safeParse("A1234'; DROP TABLE users;--").success).toBe(false);
            expect(passportDocumentNumberField.safeParse('<script>alert(1)</script>').success).toBe(false);
            expect(passportDocumentNumberField.safeParse('123456789').success).toBe(false); // missing letter
            expect(passportDocumentNumberField.safeParse('AB1234567').success).toBe(false); // two letters
            expect(passportDocumentNumberField.safeParse('A1234').success).toBe(false); // too short
        });
    });

    describe('formAIdField', () => {
        it('strictly requires exact 10 characters', () => {
            expect(formAIdField.safeParse('FORMA12345').success).toBe(true);
            expect(formAIdField.safeParse('1234567890').success).toBe(true);

            expect(formAIdField.safeParse('123456789').success).toBe(false); // 9 chars
            expect(formAIdField.safeParse('12345678901').success).toBe(false); // 11 chars
            expect(formAIdField.safeParse('').success).toBe(false);
        });
    });

    describe('ticketNumberField', () => {
        it('strictly requires 13 digits with only numbers', () => {
            expect(ticketNumberField.safeParse('1234567890123').success).toBe(true);

            expect(ticketNumberField.safeParse('123456789012').success).toBe(false); // 12 digits
            expect(ticketNumberField.safeParse('12345678901234').success).toBe(false); // 14 digits
            expect(ticketNumberField.safeParse('123456789012A').success).toBe(false); // contains letter
            expect(ticketNumberField.safeParse("1234567' OR 1=1").success).toBe(false); // injection attempt
        });
    });

    describe('visaNumberField', () => {
        it('strictly requires 8 alphanumeric characters', () => {
            expect(visaNumberField.safeParse('VISA1234').success).toBe(true);
            expect(visaNumberField.safeParse('12345678').success).toBe(true);

            expect(visaNumberField.safeParse('VIS1234').success).toBe(false); // 7 chars
            expect(visaNumberField.safeParse('VISA12345').success).toBe(false); // 9 chars
            expect(visaNumberField.safeParse('VISA@123').success).toBe(false); // special char
        });
    });

    describe('baseCredentialSchema', () => {
        it('validates a complete credential bundle', () => {
            const valid = {
                bvn: '22223333444',
                nin: '11112222333',
                formAId: 'FORMA12345',
                passportDocumentNumber: 'A12345678',
            };
            expect(baseCredentialSchema.safeParse(valid).success).toBe(true);
        });

        it('rejects empty BVN', () => {
            const invalid = {
                bvn: '',
                formAId: 'FORMA12345',
                passportDocumentNumber: 'A12345678',
            };
            expect(baseCredentialSchema.safeParse(invalid).success).toBe(false);
        });
    });

    describe('bankDetailsStepSchema', () => {
        it('validates bank details and ensures minimum account number length', () => {
            const valid = {
                bankName: 'Access Bank',
                accountNumber: '0123456789',
                accountName: 'John Doe',
                iban: 'NG00ACCESS0123456789',
            };
            expect(bankDetailsStepSchema.safeParse(valid).success).toBe(true);
        });

        it('rejects short account number', () => {
            const invalid = {
                bankName: 'Access Bank',
                accountNumber: '123',
                accountName: 'John Doe',
                iban: 'NG00ACCESS0123456789',
            };
            expect(bankDetailsStepSchema.safeParse(invalid).success).toBe(false);
        });
    });

    describe('medicalBankDetailsStepSchema', () => {
        it('validates strict email formatting for beneficiary', () => {
            const valid = {
                organizationName: 'City Hospital',
                beneficiaryPhone: '08012345678',
                beneficiaryEmail: 'billing@cityhospital.org',
                beneficiaryAddress: '123 Health Ave',
                beneficiaryCity: 'Lagos',
                beneficiaryState: 'Lagos State',
                beneficiaryCountry: 'Nigeria',
                bankAccountName: 'City Hospital Ltd',
                bankAccountAddress: '45 Bank Road',
                bankAccountIban: 'GB33BUKB20201555555555',
                bankAccountSwiftCode: 'BUKBGB22',
                bankAccountNumber: '1234567890',
            };
            expect(medicalBankDetailsStepSchema.safeParse(valid).success).toBe(true);

            // Invalid email injection attempt
            const invalidEmail = { ...valid, beneficiaryEmail: 'billing@cityhospital.org<script>' };
            expect(medicalBankDetailsStepSchema.safeParse(invalidEmail).success).toBe(false);
        });
    });

    describe('sanitizeFileName (Path Traversal Prevention)', () => {
        it('strips directory traversal prefixes and backslashes', () => {
            expect(sanitizeFileName('../../etc/passwd')).toBe('passwd');
            expect(sanitizeFileName('..\\..\\windows\\system32\\calc.exe')).toBe('calc.exe');
            expect(sanitizeFileName('/root/secret.txt')).toBe('secret.txt');
        });

        it('replaces dangerous and control characters with underscores', () => {
            expect(sanitizeFileName('receipt; rm -rf; .pdf')).toBe('receipt__rm_-rf__.pdf');
            expect(sanitizeFileName('statement $(whoami).pdf')).toBe('statement___whoami_.pdf');
        });

        it('defaults safely if empty or all dots provided', () => {
            expect(sanitizeFileName('...')).toBe('downloaded_file');
            expect(sanitizeFileName('')).toBe('downloaded_file');
        });
    });
});
