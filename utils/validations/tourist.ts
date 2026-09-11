import { z } from 'zod';
import { locationStepSchema, passportIssueDateField } from './shared';

/** Step 0: Tourist credentials */
export const touristStep0Schema = z.object({
    passportDocumentNumber: z.string().min(1, 'Please enter your International Passport Number'),
    nigerianAddress: z.string().min(1, 'Please enter your temporary stay address (e.g. hotel)'),
});

/** Step 1: Tourist documents */
export const touristStep1Schema = z.object({
    passportIssueDate: passportIssueDateField,
    passportExpiryDate: z.string().min(1, 'Please select Passport Expiry Date'),
});

/** Step 2: Tourist amount */
export const touristStep2Schema = z.object({
    amount: z.number().positive('Please enter a valid amount'),
});

/** Step 3 (transfer): Tourist transfer details */
export const touristStep3TransferSchema = z.object({
    accountName: z.string().min(1, 'Please enter the Account Name'),
    bankName: z.string().min(1, 'Please enter the Bank Name'),
});

/** Step 3 (card / pickup): Tourist pickup location */
export const touristStep3LocationSchema = locationStepSchema;