import { z } from 'zod';
import { locationStepSchema } from './shared';

/** Step 0: Tourist credentials */
export const touristStep0Schema = z.object({
    passportNumber: z.string().regex(/^[A-Za-z]\d{8}$/, 'Please enter a valid International Passport Number'),
});

/** Step 1: Tourist documents */
export const touristStep1Schema = z.object({
    passportIssueDate: z.string().min(1, 'Please select Passport Issue Date'),
    passportExpiryDate: z.string().min(1, 'Please select Passport Expiry Date'),
    visaNumber: z.string().min(1, 'Please enter your Visa Number'),
    ticketNumber: z.string().min(1, 'Please enter your Return Ticket Number'),
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
