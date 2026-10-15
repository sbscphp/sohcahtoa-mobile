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
    passportDocumentNumber?: string;
    passportNumber?: string;
    firstName?: string;
    lastName?: string;
    passportDocumentUrl?: string;
}

export interface VerifyExpatriatePassportPayload {
    passportNumber: string;
    firstName: string;
    lastName: string;
    passportDocumentUrl: string;
    email?: string;
    phoneNumber?: string;
}

export interface VerifyExpatriatePassportResponse {
    success: boolean;
    data: {
        verificationToken: string;
        message: string;
        firstName: string;
        lastName: string;
        dateOfBirth?: string;
        email?: string;
        phoneNumber?: string;
        nationality?: string;
        address?: string;
        otp?: string;
    };
}

export interface VerifyPassportResponse {
    success: boolean;
    data: {
        verificationToken: string;
        message: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: string;
        dateOfBirth?: string;
        nationality?: string;
        address?: string;
        otp?: string;
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
        verificationToken?: string;
        email?: string;
        phoneNumber?: string;
    };
}

export type SendExpatriateOtpPayload = SendTouristOtpPayload;
export type SendExpatriateOtpResponse = SendTouristOtpResponse;

export type ResendTouristOtpPayload = SendTouristOtpPayload;
export type ResendExpatriateOtpPayload = SendTouristOtpPayload;
export type ResendExpatriateOtpResponse = ResendTouristOtpResponse;

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
        verificationToken?: string;
    };
}

export type ValidateExpatriateOtpPayload = ValidateTouristOtpPayload;
export type ValidateExpatriateOtpResponse = ValidateTouristOtpResponse;

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

export type CreateExpatriateAccountPayload = CreateTouristAccountPayload;
export type CreateExpatriateAccountResponse = CreateTouristAccountResponse;

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
            nin: string;
            tinNumber: string;
            passportDocumentNumber: string;
            passportDocumentUrl: string;
            bvnVerified: boolean;
            ninVerified: boolean;
            tinNumberVerified: boolean;
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
    verificationType: 'phone' | 'email';
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

export interface InitiateIgreePayload {
    bvn: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
    email: string;
}

export interface InitiateIgreeResponse {
    success: boolean;
    data: {
        state: string;
        authUrl: string;
        message: string;
    };
}

export interface IgreeCallbackPayload {
    code: string;
    state: string;
}

export interface IgreeCallbackResponse {
    success: boolean;
    message: string;
}

export interface RetrieveIgreePayload {
    sessionId: string;
}

export interface IgreeCustomer {
    firstName: string;
    lastName: string;
    middleName?: string | null;
    dateOfBirth: string;
    gender: string;
    maritalStatus?: string | null;
    nationality?: string | null;
    stateOfOrigin?: string | null;
    lgaOfOrigin?: string | null;
    nin?: string | null;
    watchlisted?: boolean | null;
    faceImage?: string | null;
    email: string;
    phoneNumber: string;
    bvn: string;
}

export interface RetrieveIgreeResponse {
    success: boolean;
    data: {
        status: 'COMPLETED' | 'PENDING' | 'FAILED' | string;
        verificationToken: string;
        customer: IgreeCustomer;
        message?: string;
    };
}
