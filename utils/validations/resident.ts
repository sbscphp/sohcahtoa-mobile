import { z } from 'zod';
import { locationStepSchema, utilityNumberField } from './shared';

/** Step 0: Resident credentials */
export const residentStep0Schema = z.object({
    bvn: z.string().optional(),
    nin: z.string().length(11, 'Please enter a valid 11-digit NIN').regex(/^\d+$/, 'NIN must contain only digits'),
    passportNumber: z.string().regex(/^[A-Za-z]\d{8}$/, 'Please enter a valid International Passport Number'),
});

/** Step 1: Resident documents */
export const residentStep1Schema = z.object({
    passportIssueDate: z.string().min(1, 'Please select Passport Issue Date'),
    passportExpiryDate: z.string().min(1, 'Please select Passport Expiry Date'),
    utilityNumber: utilityNumberField,
});

/** Step 2: Resident amount */
export const residentStep2Schema = z.object({
    amount: z.number().positive('Please enter a valid amount'),
});

/** Step 3: Resident pickup location */
export const residentStep3Schema = locationStepSchema;
