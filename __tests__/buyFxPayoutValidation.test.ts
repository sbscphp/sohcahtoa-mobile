import { z } from 'zod';
import {
    buyFxPayoutFieldsSchema,
    refineBuyFxPayoutAndLocation,
    isBuyFxPayoutStepValid,
} from '../utils/validations/buyFxPayoutValidation';
import { buildBuyFxPayload } from '../utils/buyFxPayloads';

describe('Buy FX Payout & Domiciliary Account Validation (BTA & PTA)', () => {
    const mockUser = {
        kyc: { bvn: '12345678901', nin: '12345678901' },
        profile: { firstName: 'John', lastName: 'Doe' },
    };

    const schema = z.object({
        ...buyFxPayoutFieldsSchema.shape,
    }).superRefine((data, ctx) => refineBuyFxPayoutAndLocation(data, ctx, mockUser));

    describe('isBuyFxPayoutStepValid', () => {
        it('should return false if payoutMethod is missing', () => {
            expect(isBuyFxPayoutStepValid({})).toBe(false);
            expect(isBuyFxPayoutStepValid({ payoutMethod: '' })).toBe(false);
        });

        it('should return true for non-electronic methods without domiciliary details', () => {
            expect(isBuyFxPayoutStepValid({ payoutMethod: 'Card (100%)' })).toBe(true);
            expect(isBuyFxPayoutStepValid({ payoutMethod: 'Card (75%) + Cash (25%)' })).toBe(true);
        });

        it('should return true for electronic payout when domiciliary swift, routing, and bank address are empty', () => {
            const validWithoutOptional = {
                payoutMethod: 'Electronic Transfer (100%)',
                domiciliaryAccountNumber: '0123456789',
                domiciliaryBankName: 'Guaranty Trust Bank',
                domiciliaryAccountName: 'John Doe',
                domiciliarySwiftCode: '',
                domiciliaryRoutingNumber: '',
                domiciliaryBankAddress: '',
            };
            expect(isBuyFxPayoutStepValid(validWithoutOptional)).toBe(true);

            const splitMethodWithoutOptional = {
                ...validWithoutOptional,
                payoutMethod: 'Cash (25%) + Electronic Transfer (75%)',
            };
            expect(isBuyFxPayoutStepValid(splitMethodWithoutOptional)).toBe(true);
        });

        it('should return true when valid swift, routing, and bank address are optionally provided', () => {
            const validWithOptional = {
                payoutMethod: 'Electronic Transfer (100%)',
                domiciliaryAccountNumber: '0123456789',
                domiciliaryBankName: 'Guaranty Trust Bank',
                domiciliaryAccountName: 'John Doe',
                domiciliarySwiftCode: 'GTBINGLA',
                domiciliaryRoutingNumber: '123456789',
                domiciliaryBankAddress: '123 Broad Street, Lagos',
            };
            expect(isBuyFxPayoutStepValid(validWithOptional)).toBe(true);
        });

        it('should return false if domiciliary account number, bank name, or account name is missing', () => {
            expect(isBuyFxPayoutStepValid({
                payoutMethod: 'Electronic Transfer (100%)',
                domiciliaryAccountNumber: '123',
                domiciliaryBankName: 'GTBank',
                domiciliaryAccountName: 'John Doe',
            })).toBe(false);

            expect(isBuyFxPayoutStepValid({
                payoutMethod: 'Electronic Transfer (100%)',
                domiciliaryAccountNumber: '0123456789',
                domiciliaryBankName: '',
                domiciliaryAccountName: 'John Doe',
            })).toBe(false);

            expect(isBuyFxPayoutStepValid({
                payoutMethod: 'Electronic Transfer (100%)',
                domiciliaryAccountNumber: '0123456789',
                domiciliaryBankName: 'GTBank',
                domiciliaryAccountName: '',
            })).toBe(false);
        });

        it('should return false if swiftCode is provided but has invalid format', () => {
            expect(isBuyFxPayoutStepValid({
                payoutMethod: 'Electronic Transfer (100%)',
                domiciliaryAccountNumber: '0123456789',
                domiciliaryBankName: 'GTBank',
                domiciliaryAccountName: 'John Doe',
                domiciliarySwiftCode: 'INVALID',
            })).toBe(false);
        });

        it('should return false if routingNumber is provided but is not 9 digits', () => {
            expect(isBuyFxPayoutStepValid({
                payoutMethod: 'Electronic Transfer (100%)',
                domiciliaryAccountNumber: '0123456789',
                domiciliaryBankName: 'GTBank',
                domiciliaryAccountName: 'John Doe',
                domiciliaryRoutingNumber: '12345',
            })).toBe(false);
        });

        it('should return false if bankAddress is provided but shorter than 5 characters', () => {
            expect(isBuyFxPayoutStepValid({
                payoutMethod: 'Electronic Transfer (100%)',
                domiciliaryAccountNumber: '0123456789',
                domiciliaryBankName: 'GTBank',
                domiciliaryAccountName: 'John Doe',
                domiciliaryBankAddress: 'Lagos',
            })).toBe(true); // 'Lagos' has 5 chars -> true

            expect(isBuyFxPayoutStepValid({
                payoutMethod: 'Electronic Transfer (100%)',
                domiciliaryAccountNumber: '0123456789',
                domiciliaryBankName: 'GTBank',
                domiciliaryAccountName: 'John Doe',
                domiciliaryBankAddress: 'Lag',
            })).toBe(false);
        });
    });

    describe('refineBuyFxPayoutAndLocation (Zod refinement)', () => {
        const baseValidData = {
            payoutMethod: 'Electronic Transfer (100%)',
            domiciliaryAccountNumber: '0123456789',
            domiciliaryBankName: 'Guaranty Trust Bank',
            domiciliaryAccountName: 'John Doe',
            domiciliarySwiftCode: '',
            domiciliaryRoutingNumber: '',
            domiciliaryBankAddress: '',
        };

        it('should succeed when swift code, routing number, and bank address are empty strings', () => {
            const result = schema.safeParse(baseValidData);
            expect(result.success).toBe(true);
        });

        it('should succeed when swift code, routing number, and bank address are undefined', () => {
            const { domiciliarySwiftCode, domiciliaryRoutingNumber, domiciliaryBankAddress, ...withoutOptional } = baseValidData;
            const result = schema.safeParse(withoutOptional);
            expect(result.success).toBe(true);
        });

        it('should succeed when valid swift code, routing number, and bank address are provided', () => {
            const result = schema.safeParse({
                ...baseValidData,
                domiciliarySwiftCode: 'GTBINGLA',
                domiciliaryRoutingNumber: '123456789',
                domiciliaryBankAddress: '123 Marina Street, Lagos',
            });
            expect(result.success).toBe(true);
        });

        it('should fail with format error only if invalid swift code is entered', () => {
            const result = schema.safeParse({
                ...baseValidData,
                domiciliarySwiftCode: '12345',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(i => i.path.includes('domiciliarySwiftCode'))).toBe(true);
            }
        });

        it('should fail with length error only if invalid routing number is entered', () => {
            const result = schema.safeParse({
                ...baseValidData,
                domiciliaryRoutingNumber: '12345678', // 8 digits
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(i => i.path.includes('domiciliaryRoutingNumber'))).toBe(true);
            }
        });

        it('should fail with length error only if bank address is less than 5 characters', () => {
            const result = schema.safeParse({
                ...baseValidData,
                domiciliaryBankAddress: 'Abc',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(i => i.path.includes('domiciliaryBankAddress'))).toBe(true);
            }
        });
    });

    describe('buildBuyFxPayload', () => {
        it('should not include empty swiftCode, routingNumber, or bankAddress in beneficiaryDetails', () => {
            const payload = buildBuyFxPayload({
                type: 'PTA',
                purpose: 'Personal Travel Allowance',
                currency: 'USD',
                country: 'United States',
                amount: 1000,
                documents: [],
                payoutMethod: 'Electronic Transfer (100%)',
                needsLocationStep: false,
                data: {
                    payoutMethod: 'Electronic Transfer (100%)',
                    domiciliaryBankName: 'Guaranty Trust Bank',
                    domiciliaryAccountNumber: '0123456789',
                    domiciliaryAccountName: 'John Doe',
                    domiciliarySwiftCode: '',
                    domiciliaryRoutingNumber: '',
                    domiciliaryBankAddress: '',
                    customerBankName: 'Access Bank',
                    customerBankCode: '044',
                    customerAccountNumber: '0123456789',
                    customerAccountName: 'John Doe',
                },
            });

            expect(payload.beneficiaryDetails).toEqual({
                bankName: 'Guaranty Trust Bank',
                accountNumber: '0123456789',
                accountName: 'John Doe',
            });
            expect(payload.beneficiaryDetails?.swiftCode).toBeUndefined();
            expect(payload.beneficiaryDetails?.routingNumber).toBeUndefined();
            expect(payload.beneficiaryDetails?.bankAddress).toBeUndefined();
        });

        it('should include swiftCode, routingNumber, and bankAddress when provided', () => {
            const payload = buildBuyFxPayload({
                type: 'BTA',
                purpose: 'Business Travel Allowance',
                currency: 'USD',
                country: 'United States',
                amount: 2000,
                documents: [],
                payoutMethod: 'Electronic Transfer (100%)',
                needsLocationStep: false,
                data: {
                    payoutMethod: 'Electronic Transfer (100%)',
                    domiciliaryBankName: 'Guaranty Trust Bank',
                    domiciliaryAccountNumber: '0123456789',
                    domiciliaryAccountName: 'John Doe',
                    domiciliarySwiftCode: 'GTBINGLA',
                    domiciliaryRoutingNumber: '123456789',
                    domiciliaryBankAddress: '123 Marina Street, Lagos',
                    customerBankName: 'Access Bank',
                    customerBankCode: '044',
                    customerAccountNumber: '0123456789',
                    customerAccountName: 'John Doe',
                },
            });

            expect(payload.beneficiaryDetails).toEqual({
                bankName: 'Guaranty Trust Bank',
                accountNumber: '0123456789',
                accountName: 'John Doe',
                swiftCode: 'GTBINGLA',
                routingNumber: '123456789',
                bankAddress: '123 Marina Street, Lagos',
            });
        });
    });
});
