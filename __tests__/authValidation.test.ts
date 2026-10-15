import { bvnSchema, dateOfBirthValidation, phoneValidation } from '../lib/validations/auth';

describe('Auth Validations', () => {
    describe('phoneValidation', () => {
        it('should accept valid Nigerian phone numbers with 0 prefix', () => {
            const validNumbers = ['08012345678', '07098765432', '09011223344', '08123456789'];
            for (const phone of validNumbers) {
                const result = phoneValidation.safeParse(phone);
                expect(result.success).toBe(true);
            }
        });

        it('should accept valid Nigerian phone numbers with +234 or 234 prefix', () => {
            const validNumbers = ['+2348012345678', '+2347098765432', '2349011223344'];
            for (const phone of validNumbers) {
                const result = phoneValidation.safeParse(phone);
                expect(result.success).toBe(true);
            }
        });

        it('should accept international E.164 phone numbers with + prefix', () => {
            const validNumbers = ['+14155552671', '+447911123456'];
            for (const phone of validNumbers) {
                const result = phoneValidation.safeParse(phone);
                expect(result.success).toBe(true);
            }
        });

        it('should reject invalid phone numbers', () => {
            const invalidNumbers = ['', '12345', '06012345678', 'abcd'];
            for (const phone of invalidNumbers) {
                const result = phoneValidation.safeParse(phone);
                expect(result.success).toBe(false);
            }
        });
    });

    describe('dateOfBirthValidation', () => {
        it('should accept valid past dates in DD/MM/YYYY format', () => {
            const validDates = ['15/08/1995', '01/01/2000', '31/12/1980'];
            for (const dob of validDates) {
                const result = dateOfBirthValidation.safeParse(dob);
                expect(result.success).toBe(true);
            }
        });

        it('should reject future dates', () => {
            const futureYear = new Date().getFullYear() + 2;
            const result = dateOfBirthValidation.safeParse(`15/08/${futureYear}`);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Date of birth cannot be in the future');
            }
        });

        it('should reject invalid date strings or empty dates', () => {
            const invalidDates = ['', 'not-a-date', '32/01/2000', '15/13/2000', '15/08/1800'];
            for (const dob of invalidDates) {
                const result = dateOfBirthValidation.safeParse(dob);
                expect(result.success).toBe(false);
            }
        });
    });

    describe('bvnSchema', () => {
        const validPayload = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phoneNumber: '08012345678',
            dateOfBirth: '15/08/1995',
            bvn: '12345678901',
        };

        it('should validate complete signup payload successfully', () => {
            const result = bvnSchema.safeParse(validPayload);
            expect(result.success).toBe(true);
        });

        it('should reject payload missing phoneNumber or dateOfBirth', () => {
            const withoutPhone = { ...validPayload, phoneNumber: '' };
            const withoutDob = { ...validPayload, dateOfBirth: '' };

            const resPhone = bvnSchema.safeParse(withoutPhone);
            expect(resPhone.success).toBe(false);

            const resDob = bvnSchema.safeParse(withoutDob);
            expect(resDob.success).toBe(false);
        });

        it('should reject invalid BVN, email, or names', () => {
            expect(bvnSchema.safeParse({ ...validPayload, bvn: '123' }).success).toBe(false);
            expect(bvnSchema.safeParse({ ...validPayload, email: 'bad-email' }).success).toBe(false);
            expect(bvnSchema.safeParse({ ...validPayload, firstName: '' }).success).toBe(false);
            expect(bvnSchema.safeParse({ ...validPayload, lastName: '' }).success).toBe(false);
        });
    });
});
