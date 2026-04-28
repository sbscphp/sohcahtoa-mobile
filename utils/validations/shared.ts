import { z } from 'zod';


export const bvnField = z.string().min(1, 'BVN is required');

export const ninField = z
    .string()
    .length(11, 'Please enter a valid 11-digit NIN')
    .regex(/^\d+$/, 'NIN must contain only digits');

export const formAIdField = z
    .string()
    .min(5, 'Please enter a valid Form A ID')
    .max(20, 'Form A ID is too long');

export const invoiceNumberField = z
    .string()
    .min(5, 'Please enter a valid Invoice Number')
    .max(20, 'Invoice Number is too long');

export const passportNumberField = z
    .string()
    .regex(/^[A-Za-z]\d{8}$/, 'Please enter a valid International Passport Number');



export const visaNumberField = z
    .string()
    .length(8, 'Visa Number must be exactly 8 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Visa Number must be alphanumeric');

export const ticketNumberField = z
    .string()
    .length(13, 'Ticket Number must be 13 digits')
    .regex(/^\d+$/, 'Ticket Number must contain only digits');

export const utilityNumberField = z
    .string()
    .min(5, 'Please enter a valid utility number')
    .max(20, 'Utility number is too long');

export const workPermitNumberField = z.string().min(1, 'Please enter your Work Permit Number');

/** Tax Identification Number validation (TIN) */
export const tinField = z
    .string()
    .length(11, 'Please enter a valid 11-digit TIN')
    .regex(/^\d+$/, 'TIN must contain only digits');

/** Tax Clearance Certificate Number validation (TCC) */
export const tccNumberField = z.string().min(1, 'Please enter your TCC Number');

/** Passport Issue/Expiry Date validations */
export const passportIssueDateField = z.string().min(1, 'Please select Passport Issue Date');
export const passportExpiryDateField = z.string().min(1, 'Please select Passport Expiry Date');

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
            .max(max, `Please note that the maximum you can transact is $${max.toLocaleString()} per quarter.`),
    });
