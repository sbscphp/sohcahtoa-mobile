import api from '../services/api';
import {
    verifyPassport,
    sendTouristOtp,
    resendTouristOtp,
    validateTouristOtp,
    createTouristAccount,
    verifyExpatriatePassport,
    sendExpatriateOtp,
    resendExpatriateOtp,
    validateExpatriateOtp,
    createExpatriateAccount,
} from '../services/auth';

jest.mock('../services/api', () => ({
    post: jest.fn(),
}));

describe('Tourist and Expatriate Auth API Services', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Tourist Endpoints', () => {
        it('verifyPassport calls /auth/signup/tourist/verify-passport', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        verificationToken: 'token-123',
                        message: 'Passport verified',
                    },
                },
            };
            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const payload = {
                passportNumber: 'A12345678',
                firstName: 'John',
                lastName: 'Doe',
                passportDocumentUrl: 'https://example.com/passport.jpg',
            };

            const result = await verifyPassport(payload);

            expect(api.post).toHaveBeenCalledWith('/auth/signup/tourist/verify-passport', payload);
            expect(result).toEqual(mockResponse.data);
        });

        it('sendTouristOtp calls /auth/signup/tourist/send-otp', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        message: 'OTP sent',
                        firstName: 'John',
                        lastName: 'Doe',
                        dateOfBirth: '1990-01-01',
                        nationality: 'US',
                        otp: '123456',
                    },
                },
            };
            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const payload = {
                verificationToken: 'token-123',
                verificationType: 'email' as const,
            };

            const result = await sendTouristOtp(payload);

            expect(api.post).toHaveBeenCalledWith('/auth/signup/tourist/send-otp', payload);
            expect(result).toEqual(mockResponse.data);
        });

        it('resendTouristOtp calls /auth/signup/tourist/resend-otp', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        message: 'OTP resent',
                        otp: '654321',
                    },
                },
            };
            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const payload = {
                verificationToken: 'token-123',
                verificationType: 'email' as const,
            };

            const result = await resendTouristOtp(payload);

            expect(api.post).toHaveBeenCalledWith('/auth/signup/tourist/resend-otp', payload);
            expect(result).toEqual(mockResponse.data);
        });

        it('validateTouristOtp calls /auth/signup/tourist/validate-otp', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        message: 'OTP validated',
                        firstName: 'John',
                        lastName: 'Doe',
                        dateOfBirth: '1990-01-01',
                        nationality: 'US',
                    },
                },
            };
            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const payload = {
                verificationToken: 'token-123',
                otp: '123456',
            };

            const result = await validateTouristOtp(payload);

            expect(api.post).toHaveBeenCalledWith('/auth/signup/tourist/validate-otp', payload);
            expect(result).toEqual(mockResponse.data);
        });

        it('createTouristAccount calls /auth/signup/tourist/create-account', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        userId: 'user-123',
                        message: 'Account created',
                    },
                },
            };
            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const payload = {
                verificationToken: 'token-123',
                password: 'Password123!',
            };

            const result = await createTouristAccount(payload);

            expect(api.post).toHaveBeenCalledWith('/auth/signup/tourist/create-account', payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('Expatriate Endpoints', () => {
        it('verifyExpatriatePassport calls /auth/signup/expatriate/verify-passport', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        verificationToken: 'token-456',
                        message: 'Passport verified',
                        firstName: 'Maria',
                        lastName: 'Garcia',
                    },
                },
            };
            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const payload = {
                passportNumber: 'ES123456',
                firstName: 'Maria',
                lastName: 'Garcia',
                passportDocumentUrl: 'https://example.com/doc.jpg',
            };

            const result = await verifyExpatriatePassport(payload);

            expect(api.post).toHaveBeenCalledWith('/auth/signup/expatriate/verify-passport', payload);
            expect(result).toEqual(mockResponse.data);
        });

        it('sendExpatriateOtp calls /auth/signup/expatriate/send-otp', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        message: 'OTP sent',
                        firstName: 'Maria',
                        lastName: 'Garcia',
                        dateOfBirth: '1985-05-15',
                        nationality: 'ES',
                        otp: '111222',
                    },
                },
            };
            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const payload = {
                verificationToken: 'token-456',
                verificationType: 'email' as const,
            };

            const result = await sendExpatriateOtp(payload);

            expect(api.post).toHaveBeenCalledWith('/auth/signup/expatriate/send-otp', payload);
            expect(result).toEqual(mockResponse.data);
        });

        it('resendExpatriateOtp calls /auth/signup/expatriate/resend-otp', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        message: 'OTP resent',
                        otp: '333444',
                    },
                },
            };
            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const payload = {
                verificationToken: 'token-456',
                verificationType: 'email' as const,
            };

            const result = await resendExpatriateOtp(payload);

            expect(api.post).toHaveBeenCalledWith('/auth/signup/expatriate/resend-otp', payload);
            expect(result).toEqual(mockResponse.data);
        });

        it('validateExpatriateOtp calls /auth/signup/expatriate/validate-otp', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        message: 'OTP validated',
                        firstName: 'Maria',
                        lastName: 'Garcia',
                        dateOfBirth: '1985-05-15',
                        nationality: 'ES',
                    },
                },
            };
            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const payload = {
                verificationToken: 'token-456',
                otp: '111222',
            };

            const result = await validateExpatriateOtp(payload);

            expect(api.post).toHaveBeenCalledWith('/auth/signup/expatriate/validate-otp', payload);
            expect(result).toEqual(mockResponse.data);
        });

        it('createExpatriateAccount calls /auth/signup/expatriate/create-account', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        userId: 'user-456',
                        message: 'Account created',
                    },
                },
            };
            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const payload = {
                verificationToken: 'token-456',
                password: 'Password123!',
            };

            const result = await createExpatriateAccount(payload);

            expect(api.post).toHaveBeenCalledWith('/auth/signup/expatriate/create-account', payload);
            expect(result).toEqual(mockResponse.data);
        });
    });
});
