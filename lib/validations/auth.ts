import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// BVN validation
export const bvnValidation = z
    .string()
    .min(1, 'BVN is required')
    .length(11, 'BVN must be exactly 11 digits')
    .regex(/^\d+$/, 'BVN must contain only numbers');

// Passport validation
export const passportValidation = z
    .string()
    .min(1, 'International Passport number is required')
    .length(9, 'International Passport number must be exactly 9 characters')
    .regex(/^[A-Z]\d{8}$/, 'International Passport number must be 1 letter followed by 8 numbers');

// BVN validation schema
export const bvnSchema = z.object({
    bvn: bvnValidation,
});

export type BVNFormData = z.infer<typeof bvnSchema>;

// Passport validation schema
export const passportSchema = z.object({
    passportNumber: passportValidation,
});

export type PassportFormData = z.infer<typeof passportSchema>;

// OTP validation schema
export const otpSchema = z.object({
    otp: z
        .string()
        .min(1, 'OTP is required')
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d+$/, 'OTP must contain only numbers'),
});

export type OTPFormData = z.infer<typeof otpSchema>;

// Secure Account validation schema
export const secureAccountSchema = z.object({
    passcode: z
        .string()
        .min(1, 'Passcode is required')
        .length(6, 'Passcode must be exactly 6 digits')
        .regex(/^\d+$/, 'Passcode must contain only numbers'),
    confirmPasscode: z
        .string()
        .min(1, 'Please confirm your passcode'),
}).refine((data) => data.passcode === data.confirmPasscode, {
    message: 'Passcodes do not match',
    path: ['confirmPasscode'],
});

export type SecureAccountFormData = z.infer<typeof secureAccountSchema>;

// Forget Password validation schema
export const forgetPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
});

export type ForgetPasswordFormData = z.infer<typeof forgetPasswordSchema>;

// Phone number validation schema
export const phoneSchema = z.object({
    phone: z
        .string()
        .min(1, 'Phone number is required')
        .regex(/^(\+?234|0)[789]\d{9}$/, 'Please enter a valid Nigerian phone number'),
});

export type PhoneFormData = z.infer<typeof phoneSchema>;
