import { z } from 'zod';

// --- Shared field validators ---

export const bvnField = z
    .string()
    .length(11, 'Please enter a valid 11-digit BVN')
    .regex(/^\d+$/, 'BVN must contain only digits');

export const ninField = z
    .string()
    .length(11, 'Please enter a valid 11-digit NIN')
    .regex(/^\d+$/, 'NIN must contain only digits');

export const formAIdField = z.string().min(1, 'Please enter your Form A ID');

export const passportNumberField = z
    .string()
    .regex(/^[A-Za-z]\d{8}$/, 'Please enter a valid International Passport Number');

export const tinField = z
    .string()
    .min(1, 'Please enter your TIN');

// --- Shared step schemas ---

/** Step 0: Credentials (BVN + NIN + Form A + Passport) — used by most flows */
export const baseCredentialSchema = z.object({
    bvn: bvnField,
    nin: ninField,
    formAId: formAIdField,
    passportNumber: passportNumberField,
});

/** Step 3: Location (pickup point) — used by BTA, Touring */
export const locationStepSchema = z.object({
    selectedState: z.any().refine((v) => !!v, { message: 'Please select a state' }),
    selectedCity: z.any().refine((v) => !!v, { message: 'Please select a city' }),
    selectedLocation: z.any().refine((v) => !!v, { message: 'Please select a pickup location' }),
    pickupDate: z.string().min(1, 'Please select a pickup date'),
    pickupTime: z.string().min(1, 'Please select a pickup time'),
});

/** Step 3: Bank Details — used by School, Professional */
export const bankDetailsStepSchema = z.object({
    bankName: z.string().min(1, 'Please enter the bank name'),
    accountNumber: z.string().min(10, 'Please enter a valid account number'),
    accountName: z.string().min(1, 'Please enter the account name'),
    iban: z.string().min(1, 'Please enter the IBAN'),
});

/** Step 3: Medical bank details */
export const medicalBankDetailsStepSchema = z.object({
    beneficiaryName: z.string().min(1, 'Please enter the beneficiary name'),
    beneficiaryAddress: z.string().min(1, 'Please enter the beneficiary address'),
    beneficiaryBank: z.string().min(1, 'Please enter the beneficiary bank'),
    routingNumber: z.string().min(1, 'Please enter the routing number'),
    accountNumber: z.string().min(1, 'Please enter the account number'),
    bankAddress: z.string().min(1, 'Please enter the bank address'),
    swiftCode: z.string().min(1, 'Please enter the SWIFT code'),
    iban: z.string().min(1, 'Please enter the IBAN'),
});

/** Step 2: Exchange amount — parameterised by max amount */
export const amountStepSchema = (max: number, label: string) =>
    z.object({
        amount: z
            .number()
            .positive('Please enter a valid amount')
            .max(max, `Maximum amount for ${label} is $${max.toLocaleString()} per quarter`),
    });
