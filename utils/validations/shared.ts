import { z } from 'zod';


export const bvnField = z.string().min(1, 'BVN is required');

export const ninField = z.string().optional().or(z.literal(''));

export const formAIdField = z
    .string()
    .length(10, 'Form A ID must be exactly 10 digits')
    .regex(/^\d+$/, 'Form A ID must contain only digits');

export const invoiceNumberField = z
    .string()
    .min(5, 'Please enter a valid Invoice Number')
    .max(20, 'Invoice Number is too long');

export const passportDocumentNumberField = z
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
    .regex(/^\d+$/, 'TIN must contain only digits')
    .refine((val) => val.length === 11 || val.length === 13, {
        message: 'TIN must be either 11 or 13 digits',
    });

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
    passportDocumentNumber: passportDocumentNumberField,
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
    organizationName: z.string().min(1, 'Please enter the name of organization'),
    beneficiaryPhone: z.string().min(1, 'Please enter the phone number'),
    beneficiaryEmail: z.string().email('Please enter a valid email'),
    beneficiaryAddress: z.string().min(1, 'Please enter the address'),
    beneficiaryCity: z.string().min(1, 'Please enter the city'),
    beneficiaryState: z.string().min(1, 'Please enter the state'),
    beneficiaryCountry: z.string().min(1, 'Please enter the country'),
    bankAccountName: z.string().min(1, 'Please enter the bank account name'),
    bankAccountAddress: z.string().min(1, 'Please enter the bank account address'),
    bankAccountIban: z.string().min(1, 'Please enter the bank account IBAN'),
    bankAccountSwiftCode: z.string().min(1, 'Please enter the bank account SWIFT code'),
    bankAccountNumber: z.string().min(1, 'Please enter the bank account number'),
    correspondenceBankName: z.string().optional(),
    correspondenceBankAddress: z.string().optional(),
    correspondenceBankSwiftCode: z.string().optional(),
    bic: z.string().optional(),
    paymentReference: z.string().optional(),
    bsbCode: z.string().optional(),
    routingNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    purposeCode: z.string().optional(),
});

/** Step 2: Exchange amount — parameterised by max amount */
export const amountStepSchema = (max: number, label: string) =>
    z.object({
        amount: z
            .number()
            .positive('Please enter a valid amount')
            .max(max, `Please note that the maximum you can transact is $${max.toLocaleString()} per quarter.`),
    });
/** Step: Customer Bank Details confirmation */
export const customerBankDetailsStepSchema = z.object({
    customerBankName: z.string().min(1, 'Please select your bank'),
    customerBankCode: z.string().min(1, 'Please select your bank'),
    customerAccountNumber: z
        .string()
        .length(10, 'Account number must be 10 digits')
        .regex(/^\d+$/, 'Account number must contain only digits'),
    customerAccountName: z.string().min(1, 'Account name must be resolved'),
});

/** Step 4: Professional Bank Details — similar to medical but with member details */
export const professionalBankDetailsStepSchema = z.object({
    memberName: z.string().min(1, 'Please enter member name'),
    memberNumber: z.string().min(1, 'Please enter member number'),
    organizationName: z.string().min(1, 'Please enter organization name'),
    beneficiaryPhone: z.string().min(1, 'Please enter phone number'),
    beneficiaryEmail: z.string().email('Please enter a valid email address'),
    beneficiaryAddress: z.string().min(1, 'Please enter address'),
    beneficiaryCity: z.string().min(1, 'Please enter city'),
    beneficiaryState: z.string().min(1, 'Please enter state'),
    beneficiaryCountry: z.string().min(1, 'Please enter country'),
    bankAccountName: z.string().min(1, 'Please enter the bank account name'),
    bankAccountAddress: z.string().min(1, 'Please enter the bank account address'),
    bankAccountIban: z.string().min(1, 'Please enter the IBAN'),
    bankAccountSwiftCode: z.string().min(1, 'Please enter the SWIFT code'),
    bankAccountNumber: z.string().min(1, 'Please enter the bank account number'),
    correspondenceBankName: z.string().optional(),
    correspondenceBankAddress: z.string().optional(),
    correspondenceBankSwiftCode: z.string().optional(),
});

/** Step 0: Tourist Credentials (Form A + Passport) — no BVN/NIN for tourists */
export const touristCredentialSchema = z.object({
    formAId: formAIdField,
    passportDocumentNumber: passportDocumentNumberField,
});
