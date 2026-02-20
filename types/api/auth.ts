export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
        user: any;
    };
}


export interface VerifyBvnPayload {
    bvn: string;
}

export interface VerifyBvnResponse {
    success: boolean;
    data: {
        verificationToken: string;
        message: string;
    };
    metadata?: {
        timestamp: string;
        requestId: string;
        version: string;
    };
}

export interface SendOtpPayload {
    verificationToken: string;
    verificationType: 'phone' | 'email';
}

export interface SendOtpResponse {
    success: boolean;
    data: {
        message: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender: string;
        otp: string;
        phoneNumber?: string;
        email?: string;
    };
}


export interface ValidateOtpPayload {
    verificationToken: string;
    otp: string;
}

export interface ValidateOtpResponse {
    success: boolean;
    data: {
        message: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender: string;
    };
}

export interface CreateAccountPayload {
    verificationToken: string;
    password: string;
}

export interface CreateAccountResponse {
    success: boolean;
    data: {
        userId: string;
        message: string;
    };
}

export interface VerifyPassportPayload {
    passportDocumentUrl: string;
}

export interface VerifyExpatriatePassportPayload {
    passportDocumentUrl: string;
    passportNumber: string;
}

export interface VerifyPassportResponse {
    success: boolean;
    data: {
        verificationToken: string;
        message: string;
    };
}

export interface SendTouristOtpPayload {
    verificationToken: string;
    verificationType: 'phone' | 'email';
}

export interface SendTouristOtpResponse {
    success: boolean;
    data: {
        message: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        nationality: string;
        otp: string;
    };
}

export interface ValidateTouristOtpPayload {
    verificationToken: string;
    otp: string;
}

export interface ValidateTouristOtpResponse {
    success: boolean;
    data: {
        message: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        nationality: string;
    };
}

export interface CreateTouristAccountPayload {
    verificationToken: string;
    password: string;
}

export interface CreateTouristAccountResponse {
    success: boolean;
    data: {
        userId: string;
        message: string;
    };
}

export interface RefreshPayload {
    refreshToken: string;
}

export interface RefreshResponse {
    success: boolean;
    data: {
        accessToken: string;
    };
}

export interface LogoutPayload {
    refreshToken: string;
}

export interface LogoutResponse {
    success: boolean;
    data: {
        message: string;
    };
}

export interface VerifyKycPayload {
    documentType: string;
    documentNumber: string;
}

export interface VerifyKycResponse {
    success: boolean;
    data: {
        verificationToken: string;
        message: string;
    };
}

export interface UploadPassportResponse {
    success: boolean;
    data: {
        passportDocumentUrl: string;
    };
}

export interface PassportStatusResponse {
    success: boolean;
    data: {
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
    };
}

export interface SendNigerianEmailOtpPayload {
    verificationToken: string;
}

export interface SendEmailOtpResponse {
    success: boolean;
    data: {
        message: string;
        email: string;
        otp: string;
    };
}


export interface ProfileResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        email: string;
        phoneNumber: string;
        role: string;
        customerType: string;
        isActive: boolean;
        emailVerified: boolean;
        phoneVerified: boolean;
        createdAt: string;
        updatedAt: string;
        profile: {
            firstName: string;
            lastName: string;
            dateOfBirth: string;
            address: string;
            city: string;
            state: string;
            country: string;
            postalCode: string;
            avatar: string;
        };
        kyc: {
            status: string;
            bvn: string;
            tin: string;
            passportNumber: string;
            passportDocumentUrl: string;
            bvnVerified: boolean;
            tinVerified: boolean;
            passportVerified: boolean;
            verifiedAt: string;
            rejectedAt: string;
            rejectionReason: string;
        };
        permissions: string[];
        activeSessions: Array<{
            id: string;
            userAgent: string;
            ipAddress: string;
            createdAt: string;
            expiresAt: string;
        }>;
    };
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    data: {
        message: string;
        otp: string;
        verificationToken?: string;
    };
}

export interface ValidateForgotPasswordOtpPayload {
    email: string;
    otp: string;
}

export interface ValidateForgotPasswordOtpResponse {
    success: boolean;
    data: {
        message: string;
        resetToken?: string;
        verificationToken?: string;
    };
}

export interface ResetPasswordPayload {
    resetToken: string;
    newPassword: string;
}












export interface ResendOtpPayload {
    verificationToken: string;
    verificationType: 'phone';
}

export interface ResendOtpResponse {
    success: boolean;
    data: {
        message: string;
        otp: string;
    };
}

export interface ResendEmailOtpPayload {
    verificationToken: string;
}

export interface ResendEmailOtpResponse {
    success: boolean;
    data: {
        message: string;
        email: string;
        otp: string;
    };
}

export interface ResendTouristOtpResponse {
    success: boolean;
    data: {
        message: string;
        otp: string;
    };
}

export interface ValidateNigerianEmailOtpPayload {
    verificationToken: string;
    otp: string;
}

export interface ValidateNigerianEmailOtpResponse {
    success: boolean;
    data: {
        message: string;
    };
}
