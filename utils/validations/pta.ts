import { z } from 'zod';

export const ptaStep0Schema = z.object({
    bvn: z.string().length(11, 'Please enter a valid 11-digit BVN').regex(/^\d+$/, 'BVN must contain only digits'),
    nin: z.string().length(11, 'Please enter a valid 11-digit NIN').regex(/^\d+$/, 'NIN must contain only digits'),
    formAId: z.string().min(1, 'Please enter your Form A ID'),
    passportNumber: z.string().regex(/^[A-Za-z]\d{8}$/, 'Please enter a valid International Passport Number'),
});

export const ptaStep1Schema = z.object({
    visaNumber: z.string().min(1, 'Please enter your Visa Number'),
    ticketNumber: z.string().min(1, 'Please enter your Return Ticket Number'),
});

export const ptaStep2Schema = z.object({
    amount: z
        .number()
        .positive('Please enter a valid amount')
        .max(4000, 'Maximum amount for PTA is $4,000 per quarter'),
});

export const ptaStep3Schema = z.object({
    selectedState: z.any().refine((v) => !!v, { message: 'Please select a state' }),
    selectedCity: z.any().refine((v) => !!v, { message: 'Please select a city' }),
    selectedLocation: z.any().refine((v) => !!v, { message: 'Please select a pickup location' }),
    pickupDate: z.string().min(1, 'Please select a pickup date'),
    pickupTime: z.string().min(1, 'Please select a pickup time'),
});
