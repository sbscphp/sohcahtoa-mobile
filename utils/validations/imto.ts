import { z } from 'zod';

/** IMTO (MoneyGram / Western Union) validation */
export const imtoSchema = z.object({
    selectedImto: z.string().min(1, 'Please select a transfer provider'),
    referenceNumber: z.string().min(1, 'Please enter a Reference Number'),
    senderName: z.string().min(1, "Please enter the Sender's Name"),
});
