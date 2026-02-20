export interface User {
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
}
