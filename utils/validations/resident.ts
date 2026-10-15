import { z } from 'zod';
import { locationStepSchema, passportIssueDateField } from './shared';

/** Step 0: Resident credentials */
export const residentStep0Schema = z.object({
    bvn: z.string().optional(),
    nin: z.string().optional().or(z.literal('')),
    tinNumber: z.string().optional().or(z.literal('')),
    passportDocumentNumber: z.string().min(1, 'Please enter your International Passport Number'),
});

/** Step 1: Resident documents */
export const residentStep1Schema = z.object({
    passportIssueDate: passportIssueDateField,
    passportExpiryDate: z.string().min(1, 'Please select Passport Expiry Date'),
});

/** Step 2: Resident amount */
export const residentStep2Schema = z.object({
    amount: z.number().positive('Please enter a valid amount'),
});

/** Step 3: Resident pickup location */
export const residentStep3Schema = locationStepSchema;