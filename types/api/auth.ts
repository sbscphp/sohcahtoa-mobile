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

export interface ProfileResponse {
    success: boolean;
    data: {
        user?: {
            id: string;
            name: string;
            email: string;
            phoneNumber?: string;
            nationality?: string;
            isVerified: boolean;
        };
    };
}














